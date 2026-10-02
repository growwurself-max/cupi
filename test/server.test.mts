/**
 * End-to-end server tests (npm run test:server)
 *
 * Boots the REAL server/index.ts in-process against a PostgREST-compatible shim,
 * with FamGateway intercepted, and drives the complete product flow over HTTP:
 * checkout -> payment -> webhook -> permanent /x/:id link -> read-only refusal.
 * Also proves the production guard rails around store selection.
 */
import { createHmac } from 'node:crypto'
import { mkdirSync, rmSync } from 'node:fs'
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http'
import path from 'node:path'
import { spawn } from 'node:child_process'

const SHIM_PORT = 5211
const API_PORT = 5212
const API = `http://127.0.0.1:${API_PORT}`
const SHIM = `http://127.0.0.1:${SHIM_PORT}`
const KEY = 'test-service-role-key'
const GW_KEY = 'test-famgateway-key'
const WORK_DIR = path.join('.tmp-server')
mkdirSync(WORK_DIR, { recursive: true })

let failures = 0
function check(label: string, condition: boolean, extra = ''): void {
  if (condition) console.log(`  PASS  ${label}`)
  else {
    failures += 1
    console.log(`  FAIL  ${label} ${extra}`)
  }
}

// ------------------------------------------------------- PostgREST shim ---
type Row = Record<string, unknown>
const orders: Row[] = []
const experiences: Row[] = []
let simDown = false

function tableOf(t: string): Row[] | null {
  if (t === 'cupi_orders') return orders
  if (t === 'cupi_experiences') return experiences
  return null
}
function project(rows: Row[], select: string | null): Row[] {
  if (!select) return rows
  const cols = select.split(',').map((c) => c.trim()).filter(Boolean)
  return rows.map((r) => Object.fromEntries(cols.map((c) => [c, r[c] ?? null])))
}
function applyFilters(rows: Row[], query: URLSearchParams): Row[] {
  let out = rows.slice()
  for (const key of [...query.keys()]) {
    if (['select', 'limit', 'order', 'on_conflict', 'status', 'columns'].includes(key)) continue
    for (const v of query.getAll(key)) {
      const op = v.slice(0, 3)
      const want = v.slice(3)
      out = out.filter((r) => (op === 'eq.' ? r[key] === want : true))
    }
  }
  return out
}

const shim: Server = createServer((req: IncomingMessage, res: ServerResponse) => {
  if (simDown) {
    res.destroy()
    return
  }
  const url = new URL(req.url ?? '/', SHIM)
  const prefer = String(req.headers.prefer ?? '')
  const q = url.searchParams
  const table = url.pathname.replace('/rest/v1/', '')
  const rows = tableOf(table)
  if (!rows) {
    res.writeHead(404, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ code: 'PGRST205' }))
    return
  }
  if (req.method === 'GET') {
    let m = project(applyFilters(rows, q), q.get('select'))
    const limit = q.get('limit')
    if (limit) m = m.slice(0, Number(limit))
    const headers: Record<string, string> = { 'content-type': 'application/json' }
    if (prefer.includes('count=exact')) headers['content-range'] = `0-${Math.max(m.length - 1, 0)}/${rows.length}`
    res.writeHead(200, headers)
    res.end(JSON.stringify(m))
    return
  }
  let raw = ''
  req.on('data', (c) => {
    raw += c
  })
  req.on('end', () => {
    const parsed = raw ? (JSON.parse(raw) as Row | Row[]) : {}
    const incoming = Array.isArray(parsed) ? parsed : [parsed]
    if (table === 'cupi_experiences') {
      for (const row of incoming) {
        if (row.order_id != null && !orders.some((o) => o.id === row.order_id)) {
          res.writeHead(409, { 'content-type': 'application/json' })
          res.end(JSON.stringify({ code: '23503' }))
          return
        }
      }
    }
    if (req.method === 'POST') {
      const onConflict = q.get('on_conflict') ?? 'id'
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
      const matched = applyFilters(rows, q)
      for (const r of matched) Object.assign(r, incoming[0])
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify(prefer.includes('return=representation') ? project(matched, q.get('select')) : []))
      return
    }
    res.writeHead(405).end()
  })
})
await new Promise<void>((r) => shim.listen(SHIM_PORT, '127.0.0.1', r))

// -------------------------------------------------------- FamGateway stub ---
let gwOrderCounter = 0
let gwStatus: 'pending' | 'success' = 'pending'
const realFetch = globalThis.fetch
globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
  if (url.includes('famgateway.in/api/create-order')) {
    gwOrderCounter += 1
    return new Response(
      JSON.stringify({
        status: 'success',
        data: {
          order_id: `fgw_${gwOrderCounter}`,
          amount: 499,
          payable_amount: 499,
          checkout_url: 'https://pay.example/checkout',
          qr_url: 'https://pay.example/qr.png',
        },
      }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    )
  }
  if (url.includes('famgateway.in/api/verify-order.php')) {
    const id = new URL(url).searchParams.get('order_id')
    return new Response(
      JSON.stringify({
        status: gwStatus,
        data: { order_id: id, amount: 499, payable_amount: 499, utr: 'UTR1', transaction_id: 'txn_1' },
      }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    )
  }
  return realFetch(input as RequestInfo, init)
}) as typeof fetch

// ------------------------------------------------------------ boot server ---
process.env.SUPABASE_URL = SHIM
process.env.SUPABASE_SERVICE_ROLE_KEY = KEY
process.env.FAMGATEWAY_API_KEY = GW_KEY
process.env.PORT = String(API_PORT)
process.env.NODE_ENV = 'production'
process.env.CUPI_DATA_DIR = path.resolve(WORK_DIR)

await import('../server/index.js')

async function waitForApi(): Promise<boolean> {
  for (let i = 0; i < 60; i += 1) {
    try {
      const r = await realFetch(`${API}/api/health`)
      if (r.status === 200) return true
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 100))
  }
  return false
}

console.log('\n=== 1. Boot ===')
check('server started with Supabase configured', await waitForApi())

const health = await (await realFetch(`${API}/api/health`)).json()
console.log('   health:', JSON.stringify(health))
check('health reports the supabase store', health.store === 'supabase-postgres')
check('health reports durable data', health.durableData === true)

const status = await (await realFetch(`${API}/api/store-status`)).json()
check('store-status performs a real query', status.reachable === true, JSON.stringify(status))
check('store-status reports durability', status.durable === true)

// ---------------------------------------------------------------- checkout ---
console.log('\n=== 2. Checkout ===')
// birthday-03 allows photos, so the round trip also proves image payloads.
const CUSTOMIZATION = {
  recipient: { name: 'Ayesha' },
  sender: { name: 'Rahul' },
  content: {
    revealHeading: 'Happy Birthday',
    letterLines: ['Line one', 'Line two'],
    photos: [{ src: 'data:image/jpeg;base64,QUJD', caption: 'us' }],
  },
}
const createRes = await realFetch(`${API}/api/orders/create`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ templateId: 'birthday-03', customization: CUSTOMIZATION }),
})
const created = await createRes.json()
check('checkout returns 201', createRes.status === 201, JSON.stringify(created))
check('checkout returns a checkoutUrl', typeof created.checkoutUrl === 'string')
const orderId = created.orderId as string
check('order persisted BEFORE checkout was handed out', orders.length === 1 && orders[0].id === orderId)
check('order starts PENDING', orders[0].status === 'PENDING')
check('photo data stored intact', JSON.stringify(orders[0].customization_payload).includes('QUJD'))
check('letter text stored intact', JSON.stringify(orders[0].customization_payload).includes('Line two'))

// Nothing is generated before payment.
check('no website exists before payment', experiences.length === 0)

// A template that does not exist must be rejected.
const badTemplate = await realFetch(`${API}/api/orders/create`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ templateId: 'nope-99', customization: CUSTOMIZATION }),
})
check('unknown template rejected', badTemplate.status === 400, String(badTemplate.status))
check('rejected checkout stored nothing', orders.length === 1)

// ----------------------------------------------------------------- payment ---
console.log('\n=== 3. Payment confirmation (webhook) ===')
const webhookBody = JSON.stringify({ order_id: created.gatewayOrderId, status: 'success', amount: 49 })
const signature = createHmac('sha256', GW_KEY).update(webhookBody).digest('hex')
const hookRes = await realFetch(`${API}/api/famgateway/webhook`, {
  method: 'POST',
  headers: { 'content-type': 'application/json', 'X-FamGateway-Signature': signature },
  body: webhookBody,
})
check('signed webhook accepted', hookRes.status === 200, await hookRes.text())
check('exactly one website created', experiences.length === 1)
check('website belongs to the paid order', experiences[0].order_id === orderId)
const slug = experiences[0].id as string
check('slug is a Cupi-style id', /^[a-z0-9]{4,64}$/.test(slug), slug)

// Replayed webhook (FamGateway retries) must not create a second website.
const hookAgain = await realFetch(`${API}/api/famgateway/webhook`, {
  method: 'POST',
  headers: { 'content-type': 'application/json', 'X-FamGateway-Signature': signature },
  body: webhookBody,
})
check('replayed webhook accepted', hookAgain.status === 200)
check('STILL exactly one website', experiences.length === 1, `got ${experiences.length}`)

// Unsigned webhook must be refused.
const unsigned = await realFetch(`${API}/api/famgateway/webhook`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ order_id: created.gatewayOrderId, status: 'success' }),
})
check('unsigned webhook refused', unsigned.status === 401, String(unsigned.status))

// Webhook for an order that does not exist must never invent one.
const unknownBody = JSON.stringify({ order_id: 'fgw_does_not_exist', status: 'success' })
const unknownRes = await realFetch(`${API}/api/famgateway/webhook`, {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'X-FamGateway-Signature': createHmac('sha256', GW_KEY).update(unknownBody).digest('hex'),
  },
  body: unknownBody,
})
check('unknown-order webhook ignored, not fatal', unknownRes.status === 200, String(unknownRes.status))
check('no order invented', orders.length === 1)

// ------------------------------------------------------------- the link ---
console.log('\n=== 4. The permanent /x/:id link ===')
const shareRes = await realFetch(`${API}/api/experiences/${slug}`)
const share = await shareRes.json()
check('share link returns 200', shareRes.status === 200)
check('website content is exact', JSON.stringify(share.config).includes('Ayesha'))
check('photo survived the whole round trip', JSON.stringify(share.config).includes('QUJD'))
check('website is read-only in the payload', share.readOnly === true)
check('status is LOCKED', share.status === 'LOCKED')
check('no expiresAt is ever returned', share.expiresAt === undefined)
check('marked as a permanent link', shareRes.headers.get('x-cupi-link') === 'permanent')
check('cache header present', (shareRes.headers.get('cache-control') ?? '').includes('max-age'))
check('the response id matches the requested slug', share.id === slug)

// It must resolve identically every time.
const again = await (await realFetch(`${API}/api/experiences/${slug}`)).json()
check('resolves identically on repeat', JSON.stringify(again.config) === JSON.stringify(share.config))

// The legacy order id still resolves to the same website.
const viaOrder = await realFetch(`${API}/api/experiences/${orderId}`)
check('legacy lookup by order id resolves to the same website', (await viaOrder.json()).id === slug)

// A nonsense id is a 404, not a 200 and not a 500.
const missing = await realFetch(`${API}/api/experiences/definitely_not_here`)
check('unknown slug returns 404', missing.status === 404, String(missing.status))

// -------------------------------------------------------------- read-only ---
console.log('\n=== 5. Read-only enforcement ===')
for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
  const res = await realFetch(`${API}/api/experiences/${slug}`, {
    method,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ evil: true }),
  })
  check(`${method} on an existing website is refused with 423`, res.status === 423, String(res.status))
}
const subPath = await realFetch(`${API}/api/experiences/${slug}/regenerate`, { method: 'POST' })
check('unknown sub-path cannot mutate either', subPath.status === 423 || subPath.status === 404, String(subPath.status))
check('content was not modified by any attempt', JSON.stringify((await (await realFetch(`${API}/api/experiences/${slug}`)).json()).config).includes('QUJD'))

// ------------------------------------------------------- store is down ---
console.log('\n=== 6. A database outage is never shown as "link expired" ===')
simDown = true
const outage = await realFetch(`${API}/api/experiences/${slug}`)
const outageBody = await outage.json()
check('share link returns 503 during an outage', outage.status === 503, String(outage.status))
check('the client is told to retry, not that it expired', outageBody.retryable === true && !JSON.stringify(outageBody).toLowerCase().includes('expire'))

const guardDuringOutage = await realFetch(`${API}/api/experiences/${slug}`, { method: 'DELETE' })
check('read-only guard fails closed during an outage', guardDuringOutage.status === 503, String(guardDuringOutage.status))

const createDuringOutage = await realFetch(`${API}/api/orders/create`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ templateId: 'birthday-03', customization: CUSTOMIZATION }),
})
check('checkout refused during an outage (no payment taken)', createDuringOutage.status === 503, String(createDuringOutage.status))

const hookDuringOutage = await realFetch(`${API}/api/famgateway/webhook`, {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'X-FamGateway-Signature': createHmac('sha256', GW_KEY).update(webhookBody).digest('hex'),
  },
  body: webhookBody,
})
check('webhook returns 503 so the gateway RETRIES instead of dropping it', hookDuringOutage.status === 503, String(hookDuringOutage.status))
check('the 503 body tells the gateway to retry', (await hookDuringOutage.json()).status === 'retry')

simDown = false
check('the link recovers once the database is back', (await realFetch(`${API}/api/experiences/${slug}`)).status === 200)

// ----------------------------------------------- production guard rails ---
console.log('\n=== 7. Production refuses to run on an ephemeral disk ===')
function bootChild(env: Record<string, string>): Promise<{ code: number | null; out: string }> {
  return new Promise((resolve) => {
    const child = spawn('node', ['node_modules/tsx/dist/cli.mjs', 'server/index.ts'], {
      cwd: process.cwd(),
      env: { ...process.env, ...env, PORT: '5299', NODE_ENV: 'production' },
    })
    let out = ''
    child.stdout.on('data', (d) => {
      out += String(d)
    })
    child.stderr.on('data', (d) => {
      out += String(d)
    })
    setTimeout(() => {
      child.kill()
      resolve({ code: null, out })
    }, 6000)
    child.on('close', (code) => resolve({ code, out }))
  })
}

const noSupabase = await bootChild({ SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '' })
check('refuses to start without Supabase in production', noSupabase.code === 1, `code=${noSupabase.code}`)
check('says why', noSupabase.out.includes('refusing to start'), noSupabase.out.slice(0, 300))
check('never mentions a persistent disk as the fix', !noSupabase.out.toLowerCase().includes('attach a persistent disk'))

const deadSupabase = await bootChild({ SUPABASE_URL: 'http://127.0.0.1:5999', SUPABASE_SERVICE_ROLE_KEY: KEY })
check('refuses to start when Supabase is unreachable', deadSupabase.code === 1, `code=${deadSupabase.code}`)

await new Promise<void>((r) => shim.close(() => r()))
rmSync(WORK_DIR, { recursive: true, force: true })

console.log(failures === 0 ? '\nALL CHECKS PASSED\n' : `\n${failures} CHECK(S) FAILED\n`)
process.exit(failures === 0 ? 0 : 1)
