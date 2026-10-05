/**
 * schema-and-store tests (npm run test:server)
 *
 * 1. Applies supabase/schema.sql to a real PostgreSQL engine (PGlite) and checks
 *    the tables, the RLS lockdown and the ONE PAYMENT = ONE WEBSITE constraint.
 * 2. Drives the real PostgresStore through a minimal PostgREST-compatible HTTP
 *    shim, so the actual runtime code paths are exercised — idempotent payment
 *    finalisation, permanent-link resolution, and the store-outage behaviour.
 */
import { mkdirSync, readFileSync, rmSync } from 'node:fs'
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http'
import path from 'node:path'
import { PGlite } from '@electric-sql/pglite'

const SCHEMA = readFileSync('supabase/schema.sql', 'utf8')
const WORK_DIR = path.join('.tmp-verify')
const PORT = 5199
const BASE = `http://127.0.0.1:${PORT}`
const KEY = 'test-service-role-key'
mkdirSync(WORK_DIR, { recursive: true })

let failures = 0
function check(label: string, condition: boolean, extra = ''): void {
  if (condition) console.log(`  PASS  ${label}`)
  else {
    failures += 1
    console.log(`  FAIL  ${label} ${extra}`)
  }
}

// ---------------------------------------------------------------- PGlite ---
console.log('\n=== 1. Schema applies to a real PostgreSQL engine ===')
const db = await PGlite.create({ dataDir: path.join(WORK_DIR, 'pg') })
await db.exec(`create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;`)
await db.exec(SCHEMA)
await db.exec(SCHEMA) // idempotent
console.log('  PASS  schema.sql applies cleanly and is idempotent')

const tables = await db.query<{ table_name: string }>(
  `select table_name from information_schema.tables where table_schema = 'public' order by table_name`,
)
const tableNames = tables.rows.map((r) => r.table_name).join(',')
check('tables created', tableNames.includes('cupi_experiences') && tableNames.includes('cupi_orders') && tableNames.includes('cupi_template_audio'), JSON.stringify(tables.rows))

const rls = await db.query<{ relname: string; relrowsecurity: boolean }>(
  `select relname, relrowsecurity from pg_class where relname in ('cupi_orders','cupi_experiences') order by relname`,
)
check('RLS enabled on both tables', rls.rows.every((r) => r.relrowsecurity), JSON.stringify(rls.rows))

const priv = await db.query<{ has_table_privilege: boolean }>(
  `select has_table_privilege('anon','public.cupi_orders','select') as has_table_privilege`,
)
check('anon has no table access', priv.rows[0].has_table_privilege === false)

await db.exec(`insert into cupi_orders (id, gateway_order_id, template_id, amount, customization_payload)
  values ('ord_1','fgw_1','love-01',499,'{"a":1}')`)
let dupBlocked = false
try {
  await db.exec(`insert into cupi_experiences (id, order_id, template_id, config) values ('fg_x','ord_1','love-01','{}')`)
  await db.exec(`insert into cupi_experiences (id, order_id, template_id, config) values ('fg_y','ord_1','love-01','{}')`)
} catch {
  dupBlocked = true
}
check('ONE PAYMENT = ONE WEBSITE is enforced by the DB', dupBlocked)

// Null order_id is allowed so an orphaned migrated row is still preservable.
await db.exec(`insert into cupi_experiences (id, order_id, template_id, config) values ('orphan_1', null,'love-01','{}')`)
check('nullable order_id accepted for orphaned migrated rows', true)

// ------------------------------------------------- PostgREST-like shim ---
console.log('\n=== 2. PostgresStore over a PostgREST-compatible shim ===')

type Row = Record<string, unknown>
const orders: Row[] = []
const experiences: Row[] = []

function tableOf(p: string): Row[] {
  if (p === 'cupi_orders') return orders
  if (p === 'cupi_experiences') return experiences
  return []
}

function applyFilters(rows: Row[], query: URLSearchParams): Row[] {
  let out = rows.slice()
  for (const key of [...query.keys()]) {
    if (['select', 'limit', 'order', 'on_conflict', 'status', 'columns'].includes(key)) continue
    for (const value of query.getAll(key)) {
      const op = value.slice(0, 3)
      const want = value.slice(3)
      out = out.filter((row) => {
        if (op === 'eq.') return row[key] === want
        if (op === 'neq.') return row[key] !== want
        if (op === 'is.null') return row[key] === null || row[key] === undefined
        return true
      })
    }
  }
  return out
}

function project(rows: Row[], select: string | null): Row[] {
  if (!select) return rows
  const cols = select.split(',').map((c) => c.trim()).filter(Boolean)
  return rows.map((row) => Object.fromEntries(cols.map((c) => [c, row[c] ?? null])))
}

function httpError(res: ServerResponse, status: number, code: string): void {
  res.writeHead(status, { 'content-type': 'application/json' })
  res.end(JSON.stringify({ code, message: code, details: null, hint: null }))
}

let requests = 0
const shim: Server = createServer((req: IncomingMessage, res: ServerResponse) => {
  requests += 1
  const url = new URL(req.url ?? '/', BASE)
  const prefer = String(req.headers.prefer ?? '')
  const query = url.searchParams
  const path = url.pathname.replace('/rest/v1/', '')
  const rows = tableOf(path)
  if (!rows.length && !['cupi_orders', 'cupi_experiences'].includes(path)) {
    httpError(res, 404, 'PGRST205')
    return
  }

  if (req.method === 'GET') {
    let matched = applyFilters(rows, query)
    matched = project(matched, query.get('select'))
    const limit = query.get('limit')
    if (limit) matched = matched.slice(0, Number(limit))
    const headers: Record<string, string> = { 'content-type': 'application/json' }
    if (prefer.includes('count=exact')) {
      headers['content-range'] = `0-${Math.max(matched.length - 1, 0)}/${rows.length}`
    }
    res.writeHead(200, headers)
    res.end(JSON.stringify(matched))
    return
  }

  let raw = ''
  req.on('data', (chunk) => {
    raw += chunk
  })
  req.on('end', () => {
    const body = raw ? (JSON.parse(raw) as Row | Row[]) : {}
    const incoming = Array.isArray(body) ? body : [body]

    if (req.method === 'POST') {
      const onConflict = query.get('on_conflict') ?? 'id'
      const ignoreDuplicates = prefer.includes('ignore-duplicates')
      const out: Row[] = []
      for (const row of incoming) {
        const existingIndex = rows.findIndex((r) => r[onConflict] === row[onConflict])
        if (existingIndex >= 0) {
          if (ignoreDuplicates) continue
          if (!prefer.includes('merge-duplicates')) {
            httpError(res, 409, '23505')
            return
          }
          rows[existingIndex] = { ...rows[existingIndex], ...row }
          out.push(rows[existingIndex])
        } else {
          rows.push({ ...row, view_count: row.view_count ?? 0 })
          out.push(rows[rows.length - 1])
        }
      }
      const wantsRows = prefer.includes('return=representation')
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify(wantsRows ? out : []))
      return
    }

    if (req.method === 'PATCH') {
      const matched = applyFilters(rows, query)
      const patch = incoming[0]
      for (const row of matched) Object.assign(row, patch)
      const wantsRows = prefer.includes('return=representation')
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify(wantsRows ? project(matched, query.get('select')) : []))
      return
    }

    httpError(res, 405, 'method_not_allowed')
  })
})

await new Promise<void>((resolve) => shim.listen(PORT, '127.0.0.1', resolve))

process.env.SUPABASE_URL = BASE
process.env.SUPABASE_SERVICE_ROLE_KEY = KEY

const { PostgresStore } = await import('../server/postgresStore.js')
const store = new PostgresStore({ url: BASE, serviceRoleKey: KEY })

// The real client must send the key and use the right table paths.
const probe = await fetch(`${BASE}/rest/v1/cupi_orders?select=id&limit=1`, {
  headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
})
check('shim reachable', probe.status === 200)

// 1. Create order
const created = await store.createOrder({
  gatewayOrderId: 'fgw_A1',
  templateId: 'love-01',
  amount: 499,
  currency: 'INR',
  customizationPayload: { name: 'Ayesha', photos: ['data:image/jpeg;base64,AAAA'] },
})
check('order created', created.status === 'PENDING' && created.gatewayOrderId === 'fgw_A1')
check('order lookup by gateway id works', (await store.getOrderByGatewayOrderId('fgw_A1'))?.id === created.id)

// 2. Same checkout twice -> still one order (gateway_order_id is unique)
const dup = await store.createOrder({
  gatewayOrderId: 'fgw_A1',
  templateId: 'love-01',
  amount: 499,
  currency: 'INR',
  customizationPayload: { name: 'Ayesha' },
})
check('duplicate checkout reuses the same order', dup.id === created.id)
check('duplicate checkout does not clobber the payload',
  JSON.stringify((await store.getOrderByGatewayOrderId('fgw_A1'))?.customizationPayload).includes('AAAA'))

// 3. Fulfil the payment
const experience = await store.finalizeOrderForPayment({ orderId: 'fgw_A1', gatewayPaymentId: 'pay_1' })
check('payment creates a website', experience.status === 'LOCKED' && experience.templateId === 'love-01')
check('website carries the full customization payload',
  JSON.stringify(experience.config).includes('AAAA'))
check('order is marked PAID', (await store.getOrderById(created.id))?.status === 'PAID')

// 4. Replayed webhook must NOT create a second website
const replay = await store.finalizeOrderForPayment({ orderId: 'fgw_A1', gatewayPaymentId: 'pay_1' })
check('replayed webhook is idempotent', replay.id === experience.id)
check('still exactly one website for the order', experiences.filter((e) => e.order_id === created.id).length === 1)

// 5. Permanent link resolution
check('share link resolves by id', (await store.getExperienceById(experience.id))?.id === experience.id)
check('share link resolves by order id (legacy)', (await store.getExperienceById(created.id))?.id === experience.id)
check('share link resolves by gateway order id (legacy)', (await store.getExperienceById('fgw_A1'))?.id === experience.id)
check('website is locked', await store.isExperienceLocked(experience.id))
check('unknown id resolves to null', (await store.getExperienceById('does_not_exist')) === null)

// 6. View counting
const before = Number((await store.getExperienceById(experience.id))?.viewCount ?? 0)
await store.incrementViewCount(experience.id)
const after = Number((await store.getExperienceById(experience.id))?.viewCount ?? 0)
check('view count increments', after === before + 1, `${before} -> ${after}`)

// 7. Failure path: the server must not hide an outage as "not found"
await new Promise<void>((resolve) => shim.close(() => resolve()))
const deadStore = new PostgresStore({ url: BASE, serviceRoleKey: KEY })
let threw = false
try {
  await deadStore.getExperienceById(experience.id)
} catch (error) {
  threw = (error as { status?: number }).status === 0
}
check('an unreachable database THROWS (never returns "not found")', threw)

// 8. Health / readiness
await new Promise<void>((resolve) => shim.listen(PORT, '127.0.0.1', resolve))
const health = await store.healthCheck()
check('healthCheck reports ok with a row count', health.ok && health.detail.includes('1'), health.detail)

console.log(`\n  (${requests} PostgREST requests issued)`)

await new Promise<void>((resolve) => shim.close(() => resolve()))
await db.close()
rmSync(WORK_DIR, { recursive: true, force: true })

console.log(failures === 0 ? '\nALL CHECKS PASSED\n' : `\n${failures} CHECK(S) FAILED\n`)
process.exit(failures === 0 ? 0 : 1)
