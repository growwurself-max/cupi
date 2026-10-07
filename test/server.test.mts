/**
 * End-to-end server tests (npm run test:server)
 *
 * Boots the REAL server/index.ts in-process against a PostgREST-compatible shim,
 * with FamGateway intercepted, and drives the complete product flow over HTTP:
 * checkout -> payment -> webhook -> permanent /x/:id link -> read-only refusal.
 * Also proves the production guard rails around store selection.
 */
import { createHash, createHmac } from 'node:crypto'
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
const productPrices: Row[] = []
const templateAudio: Row[] = []
const influencers: Row[] = []
const customers: Row[] = []
const authTokens: Row[] = []
let simDown = false

function tableOf(t: string): Row[] | null {
  if (t === 'cupi_orders') return orders
  if (t === 'cupi_experiences') return experiences
  if (t === 'cupi_product_prices') return productPrices
  if (t === 'cupi_template_audio') return templateAudio
  if (t === 'cupi_influencers') return influencers
  if (t === 'cupi_customers') return customers
  if (t === 'cupi_auth_tokens') return authTokens
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
    // `status` is NOT skipped: the influencer metrics query filters on
    // `status=eq.PAID`, and dropping it here would make pending checkouts look
    // like collected revenue.
    if (['select', 'limit', 'order', 'on_conflict', 'columns', 'group_by'].includes(key)) continue
    for (const v of query.getAll(key)) {
      if (v.startsWith('not.')) {
        if (v.slice(4) === 'is.null') {
          out = out.filter((r) => r[key] !== null && r[key] !== undefined)
        }
        continue
      }
      const op = v.slice(0, 3)
      const want = v.slice(3)
      out = out.filter((r) => (op === 'eq.' ? r[key] === want : true))
    }
  }
  return out
}

/**
 * Minimal stand-in for PostgREST's aggregate selects.
 *
 * Only what the influencer metrics query needs: a grouping column, a count, and
 * coalesce(sum(col)) aliases. Anything else falls through to plain projection,
 * which is what every other endpoint uses.
 */
function aggregate(rows: Row[], query: URLSearchParams): Row[] | null {
  const select = query.get('select')
  if (!select || !select.includes('count(*)')) return null
  const groupBy = query.get('group_by')
  if (!groupBy) return null

  const sums = [...select.matchAll(/coalesce\(sum\((\w+)\),\s*0\)\s+as\s+(\w+)/gi)].map(
    (m) => [m[1], m[2]] as const,
  )
  const count = select.match(/count\(\*\)(?:::bigint)?\s+as\s+(\w+)/i)?.[1]
  const buckets = new Map<string, Row[]>()
  for (const row of rows) {
    const key = String(row[groupBy])
    const bucket = buckets.get(key)
    if (bucket) bucket.push(row)
    else buckets.set(key, [row])
  }

  return [...buckets.values()].map((bucket) => {
    const out: Row = { [groupBy]: bucket[0][groupBy] }
    if (count) out[count] = bucket.length
    for (const [column, alias] of sums) {
      out[alias] = bucket.reduce(
        (total, r) => total + (typeof r[column] === 'number' ? (r[column] as number) : Number(r[column] ?? 0)),
        0,
      )
    }
    return out
  })
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
    const filtered = applyFilters(rows, q)
    const aggregated = aggregate(filtered, q)
    let m = aggregated ?? project(filtered, q.get('select'))
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
    if (table === 'cupi_orders') {
      for (const row of incoming) {
        // influencer_id is a foreign key onto cupi_influencers.
        if (row.influencer_id != null && !influencers.some((i) => i.id === row.influencer_id)) {
          res.writeHead(409, { 'content-type': 'application/json' })
          res.end(JSON.stringify({ code: '23503' }))
          return
        }
      }
    }
    if (table === 'cupi_influencers') {
      for (const row of incoming) {
        // unique_code is UNIQUE; a duplicate is a 409 the admin route surfaces.
        if (
          row.unique_code != null &&
          influencers.some((i) => i.unique_code === row.unique_code && i.id !== row.id)
        ) {
          res.writeHead(409, { 'content-type': 'application/json' })
          res.end(JSON.stringify({ code: '23505' }))
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
    if (req.method === 'DELETE') {
      const matched = applyFilters(rows, q)
      const kept = rows.filter((r) => !matched.includes(r))
      rows.length = 0
      rows.push(...kept)
      if (table === 'cupi_influencers') {
        // ON DELETE SET NULL: orders outlive the partner, keeping their code and
        // money snapshots, and only the link is dropped.
        for (const order of orders) {
          if (matched.some((m) => m.id === order.influencer_id)) order.influencer_id = null
        }
      }
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(
        JSON.stringify(prefer.includes('return=representation') ? project(matched, q.get('select')) : []),
      )
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
process.env.SUPER_ADMIN_TOKEN = 'test-admin-token'
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

// --------------------------------------------- the purchase gate (auth) ---
console.log('\n=== 2. The purchase gate (account + verified e-mail) ===')
// Sign sessions exactly like the server: CUSTOMER_AUTH_SECRET falls back to
// SUPER_ADMIN_TOKEN in tests, so the session key derives from 'test-admin-token'.
const sessionKey = createHash('sha256')
  .update('cupi-customer-session-v1:test-admin-token')
  .digest()
const sessionTokenFor = (customerId: string): string => {
  const payload = Buffer.from(
    JSON.stringify({ id: customerId, exp: Date.now() + 60_000 }),
    'utf8',
  ).toString('base64url')
  const signature = createHmac('sha256', sessionKey)
    .update(`customer-session:${payload}`)
    .digest('base64url')
  return `${payload}.${signature}`
}

// One happy customer and one fresh signup who never clicked the link.
const verifiedCustomerId = 'cust-verified-0001'
const unverifiedCustomerId = 'cust-unverified-0001'
const stamp = new Date().toISOString()
customers.push(
  {
    id: verifiedCustomerId,
    email: 'buyer@example.com',
    password_hash: null,
    name: 'Happy Buyer',
    avatar_url: null,
    google_sub: null,
    email_verified: true,
    created_at: stamp,
    updated_at: stamp,
  },
  {
    id: unverifiedCustomerId,
    email: 'fresh@example.com',
    password_hash: null,
    name: 'Fresh Signup',
    avatar_url: null,
    google_sub: null,
    email_verified: false,
    created_at: stamp,
    updated_at: stamp,
  },
)

const GUEST = { 'content-type': 'application/json' }
const BUYER = {
  'content-type': 'application/json',
  Authorization: `Bearer ${sessionTokenFor(verifiedCustomerId)}`,
}
const UNVERIFIED = {
  'content-type': 'application/json',
  Authorization: `Bearer ${sessionTokenFor(unverifiedCustomerId)}`,
}

const guestCreate = await realFetch(`${API}/api/orders/create`, {
  method: 'POST',
  headers: GUEST,
  body: JSON.stringify({ templateId: 'birthday-03', customization: CUSTOMIZATION }),
})
const guestBody = await guestCreate.json()
check('a guest cannot create an order (401)', guestCreate.status === 401, String(guestCreate.status))
check('the guest is told to sign in', guestBody.error === 'Please sign in to continue.', JSON.stringify(guestBody))
check('a guest attempt stored nothing', orders.length === 0)

const junkCreate = await realFetch(`${API}/api/orders/create`, {
  method: 'POST',
  headers: { ...GUEST, Authorization: 'Bearer not.a-real-token' },
  body: JSON.stringify({ templateId: 'birthday-03', customization: CUSTOMIZATION }),
})
check('a forged session token is refused (401)', junkCreate.status === 401, String(junkCreate.status))
check('a forged token stored nothing', orders.length === 0)

const unverifiedCreate = await realFetch(`${API}/api/orders/create`, {
  method: 'POST',
  headers: UNVERIFIED,
  body: JSON.stringify({ templateId: 'birthday-03', customization: CUSTOMIZATION }),
})
const unverifiedBody = await unverifiedCreate.json()
check('an unverified account cannot pay (403)', unverifiedCreate.status === 403, String(unverifiedCreate.status))
check('the blocker says to verify the e-mail', unverifiedBody.error === 'Please verify your e-mail address before purchasing.', JSON.stringify(unverifiedBody))
check('the blocked checkout stored nothing', orders.length === 0)

// ---------------------------------------------------------------- checkout ---
console.log('\n=== 3. Checkout (signed-in, verified buyer) ===')
const createRes = await realFetch(`${API}/api/orders/create`, {
  method: 'POST',
  headers: BUYER,
  body: JSON.stringify({ templateId: 'birthday-03', customization: CUSTOMIZATION }),
})
const created = await createRes.json()
check('checkout returns 201', createRes.status === 201, JSON.stringify(created))
check('checkout returns a checkoutUrl', typeof created.checkoutUrl === 'string')
const orderId = created.orderId as string
check('order persisted BEFORE checkout was handed out', orders.length === 1 && orders[0].id === orderId)
check('order belongs to the signed-in buyer', orders[0].customer_id === verifiedCustomerId, String(orders[0].customer_id))
check('order starts PENDING', orders[0].status === 'PENDING')
check('photo data stored intact', JSON.stringify(orders[0].customization_payload).includes('QUJD'))
check('letter text stored intact', JSON.stringify(orders[0].customization_payload).includes('Line two'))

// Nothing is generated before payment.
check('no website exists before payment', experiences.length === 0)

// A template that does not exist must be rejected.
const badTemplate = await realFetch(`${API}/api/orders/create`, {
  method: 'POST',
  headers: BUYER,
  body: JSON.stringify({ templateId: 'nope-99', customization: CUSTOMIZATION }),
})
check('unknown template rejected', badTemplate.status === 400, String(badTemplate.status))
check('rejected checkout stored nothing', orders.length === 1)

// ----------------------------------------------------------------- payment ---
console.log('\n=== 4. Payment confirmation (webhook) ===')
const paidAmount = Number(orders[0].amount)
check('order recorded the amount actually charged', Number.isFinite(paidAmount) && paidAmount > 0, String(paidAmount))
const webhookBody = JSON.stringify({
  order_id: created.gatewayOrderId,
  status: 'success',
  amount: paidAmount,
})
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
console.log('\n=== 5. The permanent /x/:id link ===')
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
console.log('\n=== 6. Read-only enforcement ===')
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

// ------------------------------------------------------- influencers ---
console.log('\n=== 7. Influencers, coupons and referral attribution ===')
const ADMIN = { Authorization: 'Bearer test-admin-token' }

const adminGet = (path: string, headers: Record<string, string> = ADMIN) =>
  realFetch(`${API}${path}`, { headers })

const noAuth = await realFetch(`${API}/api/admin/influencers`)
check('influencer list requires auth', noAuth.status === 401, String(noAuth.status))

const makeInfluencer = async (body: Record<string, unknown>) => {
  const res = await realFetch(`${API}/api/admin/influencers`, {
    method: 'POST',
    headers: { ...ADMIN, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  return { res, data: await res.json() }
}

const priya = await makeInfluencer({
  name: 'Priya Sharma',
  email: 'priya@example.com',
  uniqueCode: 'PRIYA20',
  discountPercentage: 20,
  commissionPercentage: 10,
})
check('influencer created', priya.res.status === 201, JSON.stringify(priya.data))
check('code stored normalized', priya.data?.influencer?.uniqueCode === 'PRIYA20')

const generated = await makeInfluencer({ name: 'Rahul Verma', discountPercentage: 5, commissionPercentage: 8 })
check('code auto-generated from name', typeof generated.data?.influencer?.uniqueCode === 'string' && generated.data.influencer.uniqueCode.length > 0, JSON.stringify(generated.data))

const dupe = await makeInfluencer({ name: 'Copycat', uniqueCode: 'PRIYA20' })
check('duplicate code is de-duplicated, not rejected', dupe.data?.influencer?.uniqueCode !== 'PRIYA20', JSON.stringify(dupe.data))

const badRate = await makeInfluencer({ name: 'Too Greedy', discountPercentage: 500 })
check('out-of-range discount rejected with 400', badRate.res.status === 400, String(badRate.res.status))

const badCode = await makeInfluencer({ name: 'Bad Code', uniqueCode: 'no spaces allowed!' })
check('malformed code rejected with 400', badCode.res.status === 400, String(badCode.res.status))

// A code with no digits is still a legitimate code; only format is enforced.
const alpha = await makeInfluencer({ name: 'Alpha Creator', uniqueCode: 'ALPHA', discountPercentage: 30, commissionPercentage: 10 })
check('alphabetic-only code accepted', alpha.res.status === 201, JSON.stringify(alpha.data))

// Public coupon quoting: the amount a buyer is shown must be the amount charged.
const quote = await realFetch(`${API}/api/checkout/apply-coupon`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ code: 'priya20', templateId: 'birthday-03' }),
})
const quoteBody = await quote.json()
check('public apply-coupon accepts lowercase codes', quoteBody.valid === true, JSON.stringify(quoteBody))
check('apply-coupon quotes the discounted price', typeof quoteBody.amount === 'number' && quoteBody.amount < quoteBody.originalAmount, JSON.stringify(quoteBody))
check('apply-coupon discount equals original minus amount', Math.abs(quoteBody.discountGiven - (quoteBody.originalAmount - quoteBody.amount)) < 0.01, JSON.stringify(quoteBody))

const unknownCode = await realFetch(`${API}/api/checkout/apply-coupon`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ code: 'NOPE', templateId: 'birthday-03' }),
})
check('unknown code is not valid', (await unknownCode.json()).valid === false)

const legacyQuote = await realFetch(`${API}/api/checkout/apply-coupon`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ code: 'INFLUENCER33', templateId: 'birthday-03' }),
})
const legacyBody = await legacyQuote.json()
check('legacy campaign code still works', legacyBody.valid === true && legacyBody.legacy === true, JSON.stringify(legacyBody))

// Checkout with a referral code: the order must record the partner and the money.
const refOrderRes = await realFetch(`${API}/api/orders/create`, {
  method: 'POST',
  headers: BUYER,
  body: JSON.stringify({
    templateId: 'birthday-03',
    customization: CUSTOMIZATION,
    couponCode: 'PRIYA20',
    trafficSource: 'instagram',
  }),
})
check('referral checkout accepted', refOrderRes.status === 201, String(refOrderRes.status))
const refOrder = orders[orders.length - 1]
check('referral order belongs to the signed-in buyer', refOrder.customer_id === verifiedCustomerId, String(refOrder.customer_id))
check('order attributed to the influencer', refOrder.influencer_id === priya.data.influencer.id, String(refOrder.influencer_id))
check('coupon code snapshotted on the order', refOrder.coupon_code === 'PRIYA20')
check('original amount snapshotted', Number(refOrder.original_amount) > 0)
check('commission snapshotted', Number(refOrder.influencer_commission_earned) > 0)
check('commission equals rate on the discounted amount', Math.abs(Number(refOrder.influencer_commission_earned) - Math.round(Number(refOrder.amount) * 0.1 * 100) / 100) < 0.02, `${refOrder.influencer_commission_earned} vs ${refOrder.amount}`)
check('net revenue is the remainder after commission', Math.abs(Number(refOrder.net_revenue) - (Number(refOrder.amount) - Number(refOrder.influencer_commission_earned))) < 0.02)
check('gateway charge equals the discounted amount', Number(refOrder.amount) === quoteBody.amount, `${refOrder.amount} vs ${quoteBody.amount}`)
check('traffic source recorded', refOrder.traffic_source === 'instagram', String(refOrder.traffic_source))

// A paused partner earns nothing, even with a valid code.
await realFetch(`${API}/api/admin/influencers/${priya.data.influencer.id}`, {
  method: 'PUT',
  headers: { ...ADMIN, 'content-type': 'application/json' },
  body: JSON.stringify({ status: 'paused' }),
})
const pausedQuote = await realFetch(`${API}/api/checkout/apply-coupon`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ code: 'PRIYA20', templateId: 'birthday-03' }),
})
const pausedBody = await pausedQuote.json()
check('paused code is refused', pausedBody.valid === false && pausedBody.reason === 'PAUSED', JSON.stringify(pausedBody))

const pausedOrderRes = await realFetch(`${API}/api/orders/create`, {
  method: 'POST',
  headers: BUYER,
  body: JSON.stringify({ templateId: 'birthday-03', customization: CUSTOMIZATION, couponCode: 'PRIYA20' }),
})
check('paused code still allows checkout at full price', pausedOrderRes.status === 201)
const pausedOrder = orders[orders.length - 1]
check('paused code earns no commission', Number(pausedOrder.influencer_commission_earned) === 0)
check('paused code attributes nobody', pausedOrder.influencer_id === null)

// Metrics must count only PAID orders.
const listed = await adminGet('/api/admin/influencers')
const listedBody = await listed.json()
check('influencer list returns rows and a summary', listed.status === 200 && Array.isArray(listedBody.influencers) && !!listedBody.summary, JSON.stringify(listedBody).slice(0, 200))
const priyaRow = listedBody.influencers.find((i: { id: string }) => i.id === priya.data.influencer.id)
check('created influencer appears in the list', priyaRow !== undefined, JSON.stringify(listedBody).slice(0, 300))
check('unpaid orders are NOT counted as revenue', priyaRow.totalOrders === 0, JSON.stringify(priyaRow))

// Pay the referred order, then the numbers must move.
const refPaidBody = JSON.stringify({ order_id: refOrder.gateway_order_id, status: 'success', amount: refOrder.amount })
const refSig = createHmac('sha256', GW_KEY).update(refPaidBody).digest('hex')
await realFetch(`${API}/api/famgateway/webhook`, {
  method: 'POST',
  headers: { 'content-type': 'application/json', 'X-FamGateway-Signature': refSig },
  body: refPaidBody,
})

const afterPaid = await (await adminGet('/api/admin/influencers')).json()
const priyaPaid = afterPaid.influencers.find((i: { id: string }) => i.id === priya.data.influencer.id)
check('paid order counted', priyaPaid.totalOrders === 1, JSON.stringify(priyaPaid))
check('revenue equals the amount charged', Math.abs(priyaPaid.totalRevenueGenerated - Number(refOrder.amount)) < 0.01, JSON.stringify(priyaPaid))
check('commission owed equals the snapshot', Math.abs(priyaPaid.commissionOwed - Number(refOrder.influencer_commission_earned)) < 0.02, JSON.stringify(priyaPaid))
check('summary totals exist', afterPaid.summary && afterPaid.summary.totalOrders >= 1, JSON.stringify(afterPaid.summary))

// Editing the rate must not rewrite history.
await realFetch(`${API}/api/admin/influencers/${priya.data.influencer.id}`, {
  method: 'PUT',
  headers: { ...ADMIN, 'content-type': 'application/json' },
  body: JSON.stringify({ status: 'active', commissionPercentage: 50, discountPercentage: 5 }),
})
const afterRateChange = await (await adminGet('/api/admin/influencers')).json()
const priyaRepriced = afterRateChange.influencers.find((i: { id: string }) => i.id === priya.data.influencer.id)
check('past commission unchanged after a rate edit', Math.abs(priyaRepriced.commissionOwed - Number(refOrder.influencer_commission_earned)) < 0.02, JSON.stringify(priyaRepriced))

// Deleting keeps the order's snapshots for the audit trail.
const delRes = await realFetch(`${API}/api/admin/influencers/${priya.data.influencer.id}`, {
  method: 'DELETE',
  headers: ADMIN,
})
check('delete succeeds', delRes.status === 200, String(delRes.status))
const delOrder = orders.find((o) => o.id === refOrder.id)
check('deleted partner is unlinked from the order', delOrder.influencer_id === null)
check('deleted partner leaves the coupon code on the order', delOrder.coupon_code === 'PRIYA20')
check('deleted partner leaves the money snapshots', Number(delOrder.influencer_commission_earned) > 0)

const deletedList = await (await adminGet('/api/admin/influencers')).json()
check('deleted partner is gone from the list', !deletedList.influencers.some((i: { id: string }) => i.id === priya.data.influencer.id))

// ------------------------------------------------------- store is down ---
console.log('\n=== 8. A database outage is never shown as "link expired" ===')
simDown = true
const outage = await realFetch(`${API}/api/experiences/${slug}`)
const outageBody = await outage.json()
check('share link returns 503 during an outage', outage.status === 503, String(outage.status))
check('the client is told to retry, not that it expired', outageBody.retryable === true && !JSON.stringify(outageBody).toLowerCase().includes('expire'))

const guardDuringOutage = await realFetch(`${API}/api/experiences/${slug}`, { method: 'DELETE' })
check('read-only guard fails closed during an outage', guardDuringOutage.status === 503, String(guardDuringOutage.status))

const createDuringOutage = await realFetch(`${API}/api/orders/create`, {
  method: 'POST',
  headers: BUYER,
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
console.log('\n=== 9. Production refuses to run on an ephemeral disk ===')
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
