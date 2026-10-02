/**
 * Migration tests (npm run test:server)
 *
 * Runs the REAL `npm run migrate-data` against a PostgREST-compatible shim,
 * using a legacy camelCase db.json containing an old `fg_...` slug, and proves:
 *   • ids and slugs are preserved exactly
 *   • the source file is byte-identical afterwards
 *   • re-running is idempotent (no duplicate rows)
 *   • an already-shared /x/:id link resolves after migration
 */
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http'
import path from 'node:path'

const PORT = 5207
const BASE = `http://127.0.0.1:${PORT}`
const KEY = 'test-service-role-key'
const WORK_DIR = path.join('.tmp-migrate')
mkdirSync(WORK_DIR, { recursive: true })

let failures = 0
function check(label: string, condition: boolean, extra = ''): void {
  if (condition) console.log(`  PASS  ${label}`)
  else {
    failures += 1
    console.log(`  FAIL  ${label} ${extra}`)
  }
}

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

const shim: Server = createServer((req: IncomingMessage, res: ServerResponse) => {
  const url = new URL(req.url ?? '/', BASE)
  const prefer = String(req.headers.prefer ?? '')
  const query = url.searchParams
  const table = url.pathname.replace('/rest/v1/', '')
  const rows = tableOf(table)

  if (req.method === 'GET') {
    let matched = project(applyFilters(rows, query), query.get('select'))
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
  req.on('data', (c) => {
    raw += c
  })
  req.on('end', () => {
    const body = raw ? (JSON.parse(raw) as Row | Row[]) : {}
    const incoming = Array.isArray(body) ? body : [body]
    // Enforce the cupi_experiences.order_id foreign key, exactly as Postgres
    // does. Without this a dangling order_id would slip through unnoticed.
    if (table === 'cupi_experiences') {
      for (const row of incoming) {
        if (row.order_id != null && !orders.some((o) => o.id === row.order_id)) {
          res.writeHead(409, { 'content-type': 'application/json' })
          res.end(
            JSON.stringify({
              code: '23503',
              message: 'insert or update on table "cupi_experiences" violates foreign key constraint',
              details: `Key (order_id)=(${row.order_id}) is not present in table "cupi_orders".`,
            }),
          )
          return
        }
      }
    }
    if (req.method === 'POST') {
      const onConflict = query.get('on_conflict') ?? 'id'
      const out: Row[] = []
      for (const row of incoming) {
        const idx = rows.findIndex((r) => r[onConflict] === row[onConflict])
        if (idx >= 0) {
          if (prefer.includes('ignore-duplicates')) continue
          if (!prefer.includes('merge-duplicates')) {
            res.writeHead(409, { 'content-type': 'application/json' })
            res.end(JSON.stringify({ code: '23505' }))
            return
          }
          rows[idx] = { ...rows[idx], ...row }
          out.push(rows[idx])
        } else {
          rows.push({ ...row, view_count: row.view_count ?? 0 })
          out.push(rows[rows.length - 1])
        }
      }
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify(prefer.includes('return=representation') ? out : []))
      return
    }
    if (req.method === 'PATCH') {
      const matched = applyFilters(rows, query)
      for (const row of matched) Object.assign(row, incoming[0])
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify(prefer.includes('return=representation') ? project(matched, query.get('select')) : []))
      return
    }
    res.writeHead(405).end()
  })
})
await new Promise<void>((r) => shim.listen(PORT, '127.0.0.1', r))

// ---------------------------------------------------------- legacy source ---
// camelCase keys exactly as the old db.json wrote them.
const legacyDb = {
  orders: [
    {
      id: 'ord_abc123',
      gatewayOrderId: 'fgw_legacy_1',
      gatewayPaymentId: 'pay_legacy_1',
      templateId: 'love-01',
      amount: 499,
      currency: 'INR',
      status: 'PAID',
      customizationPayload: { name: 'Ayesha', message: 'forever', photos: ['data:image/jpeg;base64,ZZZZ'] },
      experienceId: 'fg_legacy_abc',
      createdAt: '2026-01-02T03:04:05.000Z',
      updatedAt: '2026-01-02T03:09:09.000Z',
    },
    {
      id: 'ord_pending_1',
      gatewayOrderId: 'fgw_legacy_2',
      gatewayPaymentId: null,
      templateId: 'birthday-03',
      amount: 299,
      currency: 'INR',
      status: 'PENDING',
      customizationPayload: { name: 'Rahul', photos: [] },
      experienceId: null,
      createdAt: '2026-02-02T03:04:05.000Z',
      updatedAt: '2026-02-02T03:04:05.000Z',
    },
  ],
  experiences: [
    {
      id: 'fg_legacy_abc',
      orderId: 'ord_abc123',
      templateId: 'love-01',
      config: { name: 'Ayesha', message: 'forever', photos: ['data:image/jpeg;base64,ZZZZ'] },
      viewCount: 41,
      createdAt: '2026-01-02T03:09:09.000Z',
    },
    {
      // An orphaned website whose order row is missing — must survive anyway.
      id: 'fg_orphan_1',
      orderId: 'ord_deleted_somewhere',
      templateId: 'love-02',
      config: { name: 'Orphan' },
      viewCount: 3,
      createdAt: '2026-01-05T03:09:09.000Z',
    },
  ],
}
const SOURCE = path.join(WORK_DIR, 'db.json')
writeFileSync(SOURCE, JSON.stringify(legacyDb, null, 2))
const SOURCE_BYTES = readFileSync(SOURCE)

// ------------------------------------------------------------------ runs ---
/** Must be async: a synchronous spawn would block this process's event loop and
 *  the in-process PostgREST shim would never be able to answer the request. */
function runMigration(extraArgs: string[] = []) {
  return new Promise<{ code: number | null; out: string }>((resolve) => {
    const child = spawn(
      'node',
      ['node_modules/tsx/dist/cli.mjs', 'server/migrate.ts', '--source', SOURCE, ...extraArgs],
      {
        cwd: process.cwd(),
        env: {
          ...process.env,
          SUPABASE_URL: BASE,
          SUPABASE_SERVICE_ROLE_KEY: KEY,
          CUPI_DATA_DIR: path.resolve(WORK_DIR),
          NODE_ENV: 'production',
        },
      },
    )
    let out = ''
    child.stdout.on('data', (d) => {
      out += String(d)
    })
    child.stderr.on('data', (d) => {
      out += String(d)
    })
    child.on('close', (code) => resolve({ code, out }))
  })
}

function runWithoutCredentials() {
  return new Promise<{ code: number | null; out: string }>((resolve) => {
    const child = spawn(
      'node',
      ['node_modules/tsx/dist/cli.mjs', 'server/migrate.ts', '--source', SOURCE],
      {
        cwd: process.cwd(),
        env: { ...process.env, SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '', NODE_ENV: 'production' },
      },
    )
    let out = ''
    child.stdout.on('data', (d) => {
      out += String(d)
    })
    child.stderr.on('data', (d) => {
      out += String(d)
    })
    child.on('close', (code) => resolve({ code, out }))
  })
}

console.log('\n=== 1. Dry run writes nothing ===')
const dry = await runMigration(['--dry-run'])
console.log(dry.out.split('\n').filter((l) => l.includes('DRY RUN') || l.includes('orders found') || l.includes('experiences found')).join('\n'))
check('dry run exits 0', dry.code === 0)
check('dry run wrote no rows', orders.length === 0 && experiences.length === 0)

console.log('\n=== 2. Real migration ===')
const first = await runMigration()
console.log(
  first.out
    .split('\n')
    .filter((l) => /migrated|preserved|missing|broken|VERIFIED|FAILED|!/.test(l))
    .join('\n'),
)
check('migration exits 0', first.code === 0, first.out.slice(-400))
check('2 orders migrated', orders.length === 2, `got ${orders.length}`)
check('2 websites migrated', experiences.length === 2, `got ${experiences.length}`)
check('legacy fg_ slug preserved exactly', experiences.some((e) => e.id === 'fg_legacy_abc'))
check('camelCase payload became snake_case jsonb', JSON.stringify(orders[0].customization_payload).includes('Ayesha'))
check('photo data survived intact', JSON.stringify(orders[0].customization_payload).includes('ZZZZ'))
check('timestamps preserved', orders[0].created_at === '2026-01-02T03:04:05.000Z')
check('payment id preserved', orders[0].gateway_payment_id === 'pay_legacy_1')
check('view count preserved', experiences.find((e) => e.id === 'fg_legacy_abc')?.view_count === 41)
check('absent status became LOCKED (never served as DRAFT)', experiences.find((e) => e.id === 'fg_legacy_abc')?.status === 'LOCKED')
check('locked_at null is allowed for a statusless legacy row', experiences.find((e) => e.id === 'fg_legacy_abc')?.locked_at === null)
check('orphan website kept with a null order_id', experiences.find((e) => e.id === 'fg_orphan_1')?.order_id === null)
check('source file untouched (byte-identical)', readFileSync(SOURCE).equals(SOURCE_BYTES))
check('backup written to migration-backups', existsSync(path.join(WORK_DIR, 'migration-backups')))

console.log('\n=== 3. Idempotency: run it again ===')
const second = await runMigration()
check('second run exits 0', second.code === 0)
check('no duplicate orders', orders.length === 2, `got ${orders.length}`)
check('no duplicate websites', experiences.length === 2, `got ${experiences.length}`)
check('second run reports VERIFIED', second.out.includes('MIGRATION VERIFIED'))

console.log('\n=== 4. The shared link resolves after migration ===')
const { PostgresStore } = await import('../server/postgresStore.js')
const store = new PostgresStore({ url: BASE, serviceRoleKey: KEY })
const resolved = await store.getExperienceById('fg_legacy_abc')
check('old /x/:id link resolves', resolved?.id === 'fg_legacy_abc')
check('resolved website still LOCKED', resolved?.status === 'LOCKED')
check('resolved config is byte-identical', JSON.stringify(resolved?.config) === JSON.stringify(legacyDb.experiences[0].config))
check('resolves via the order id too', (await store.getExperienceById('ord_abc123'))?.id === 'fg_legacy_abc')

console.log('\n=== 5. Migration refuses to run without credentials ===')
const noCreds = await runWithoutCredentials()
check('exits non-zero without credentials', noCreds.code !== 0)
check('explains what is missing', noCreds.out.includes('SUPABASE_URL'))
check('wrote nothing', orders.length === 2 && experiences.length === 2)

await new Promise<void>((r) => shim.close(() => r()))
rmSync(WORK_DIR, { recursive: true, force: true })

console.log(failures === 0 ? '\nALL CHECKS PASSED\n' : `\n${failures} CHECK(S) FAILED\n`)
process.exit(failures === 0 ? 0 : 1)
