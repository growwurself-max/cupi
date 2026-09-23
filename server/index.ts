import { existsSync } from 'node:fs'
import path from 'node:path'
import cors from 'cors'
import express, {
  type ErrorRequestHandler,
  type Request,
  type Response,
} from 'express'
import {
  createFamGatewayOrder,
  getFamGatewayOrderStatus,
  verifyFamGatewayWebhookSignature,
} from './famgateway.js'
import {
  DIST_DIR,
  FRONTEND_ORIGINS,
  HOST,
  PHOTO_LIMITS,
  PORT,
} from './config.js'
import {
  createOrder,
  finalizeOrderForPayment,
  getExperienceById,
  getOrderByGatewayOrderId,
  getOrderById,
  incrementViewCount,
  systemId,
} from './db.js'
import { sanitizeCustomization } from './sanitize.js'

// Public backend origin used to build the FamGateway webhook URL. Override
// with BACKEND_URL when deploying the API somewhere other than Render.
export const PUBLIC_API_URL =
  process.env.BACKEND_URL || 'https://cupi-psmr.onrender.com'

interface RawBodyRequest extends Request {
  rawBody?: Buffer
}

export function buildFamGatewayWebhookUrl(): string {
  return `${PUBLIC_API_URL}/api/famgateway/webhook`
}

export function buildPaymentResultUrl(cupiOrderId: string): string {
  const origin = process.env.FRONTEND_URL || 'https://cupi-one.vercel.app'
  return `${origin}/payment-result?orderId=${encodeURIComponent(cupiOrderId)}`
}

const app = express()

/**
 * Resolves the checkout amount in rupees (INR) for an experience template.
 * Convention: `-03` tiers cost ₹49, `-04` cost ₹69, `-02` tiers cost ₹9,
 * and `-01` tiers cost ₹29. Special templates carry their own pricing:
 * special-01 ₹9, special-02 ₹49, special-03 ₹69, special-04 ₹2.
 */
export function resolvePriceInRupees(templateId: string): number {
  if (templateId === 'birthday-04') return 69.0
  if (templateId === 'birthday-03') return 49.0
  if (templateId === 'special-03') return 69.0
  if (templateId === 'special-02') return 49.0
  if (templateId === 'special-04') return 2.0
  if (templateId === 'special-01') return 9.0
  if (templateId.endsWith('-02') || templateId === 'birthday-02') return 9.0
  return 29.0 // All -01 themes
}

// 1. CORS
const allowedOrigins = ['https://cupi-one.vercel.app', ...FRONTEND_ORIGINS]
  .filter(Boolean)

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps/curl) or from allowed
      // origins. Also allow everything in non-production for local dev.
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        process.env.NODE_ENV !== 'production'
      ) {
        callback(null, true)
      } else {
        callback(null, true) // Fallback to allow during launch testing
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
)
// 2. JSON body parser — 10mb so a full customization with compressed
// (base64) photos always fits through. The verify() hook preserves the raw
// request body so the FamGateway webhook can be HMAC-verified verbatim.
app.use(
  express.json({
    limit: '10mb',
    verify: (req: RawBodyRequest, _res, buf) => {
      req.rawBody = buf
    },
  }),
)
app.use(express.urlencoded({ extended: true, limit: '10mb', verify: (req: RawBodyRequest, _res, buf) => { req.rawBody = buf } }))
// 3. Request logger (visibility in Render logs)
app.use((req: Request, _res: Response, next) => {
  console.log(`[HTTP] ${req.method} ${req.originalUrl}`)
  next()
})

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function handleHealth(_req: Request, res: Response): void {
  res.status(200).json({ status: 'ok', service: 'cupi-api' })
}

/**
 * POST /orders/create
 * Creates a FamGateway payment order and stores a PENDING Cupi order with the
 * sanitized draft. Returns the hosted FamGateway checkout URL (plus optional
 * QR / UPI-intent fallbacks) and the Cupi order id used for redirect/verify.
 */
async function handleCreateOrder(
  req: Request,
  res: Response,
  next: (error?: unknown) => void,
): Promise<void> {
  try {
    console.log('[ORDER CREATE INCOMING BODY]:', JSON.stringify(req.body, null, 2))

    const templateId = req.body.templateId || req.body.template_id || req.body.themeId

    if (!templateId || typeof templateId !== 'string' || !/^[a-z]+-\d+$/.test(templateId)) {
      console.error('[ORDER CREATE REJECTED] Invalid templateId format:', templateId)
      res.status(400).json({
        error: `Invalid template ID: "${templateId}". Expected format like "birthday-03" or "birthday-04".`
      })
      return
    }

    const rawData = req.body.customization || req.body.draftData || req.body.config || req.body

    const sanitizedCustomization = {
      recipientName: rawData.recipientName || rawData.recipient?.name || 'Someone Special',
      senderName: rawData.senderName || rawData.sender?.name || 'A Friend',
      message: rawData.message || rawData.content?.letterLines || '',
      bouquetNotes: Array.isArray(rawData.bouquetNotes) ? rawData.bouquetNotes : [],
      ...rawData
    }

    const sanitized = sanitizeCustomization(
      sanitizedCustomization,
      PHOTO_LIMITS[templateId] ?? 0,
    )
    if (!sanitized) {
      console.error('[VALIDATION FAILED] Invalid customization payload:', JSON.stringify(sanitizedCustomization, null, 2))
      res.status(400).json({ error: 'Invalid customization payload.' })
      return
    }

    const amount = resolvePriceInRupees(templateId)

    if (!process.env.FAMGATEWAY_API_KEY) {
      res.status(500).json({
        message: 'FamGateway credentials not configured',
        error: 'FamGateway credentials not configured',
      })
      return
    }

    // The Cupi order id is generated first so the FamGateway redirect_url can
    // point the customer back to a payment-result page that identifies this
    // exact Cupi order (never the gateway order id).
    const cupiOrderId = systemId()

    const famOrder = await createFamGatewayOrder({
      amount,
      redirectUrl: buildPaymentResultUrl(cupiOrderId),
      webhookUrl: buildFamGatewayWebhookUrl(),
      customerName: sanitizedCustomization.senderName,
    })

    createOrder({
      id: cupiOrderId,
      gatewayOrderId: famOrder.orderId,
      templateId,
      amount,
      currency: 'INR',
      customizationPayload: sanitized,
    })

    console.log('[FamGateway] Cupi order stored as PENDING:', cupiOrderId)

    res.status(201).json({
      success: true,
      orderId: cupiOrderId,
      gatewayOrderId: famOrder.orderId,
      checkoutUrl: famOrder.checkoutUrl,
      qrUrl: famOrder.qrUrl ?? null,
      upiIntent: famOrder.upiIntent ?? null,
      amount: famOrder.payableAmount ?? amount,
      currency: 'INR',
    })
  } catch (error) {
    next(error)
  }
}

function sendExperiencePayload(res: Response, experience: { id: string }): void {
  res.status(200).json({
    success: true,
    experienceId: experience.id,
    id: experience.id,
    sharePath: `/x/${experience.id}`,
    shareUrl: `${process.env.FRONTEND_URL || 'https://cupi-one.vercel.app'}/x/${experience.id}`,
  })
}

/**
 * POST /orders/verify
 * Final authoritative confirmation used by the frontend after the customer
 * returns from FamGateway's hosted checkout. The server checks payment status
 * with the FamGateway API (never trusting the browser) and, only when the
 * amount matches a confirmed payment, locks the experience via the existing
 * idempotent finalizeOrderForPayment(). A webhook that already marked the
 * order PAID short-circuits here to the existing experience.
 */
async function handleVerifyOrder(
  req: Request,
  res: Response,
  next: (error?: unknown) => void,
): Promise<void> {
  try {
    const body = (req.body ?? {}) as Record<string, unknown>
    console.log('[VERIFY REQUEST BODY]:', body)

    const orderId = body.orderId ?? body.order_id

    if (!isNonEmptyString(orderId)) {
      res.status(400).json({ error: 'Missing orderId.' })
      return
    }

    const order = getOrderById(orderId) ?? getOrderByGatewayOrderId(orderId)
    if (!order) {
      res.status(404).json({ error: 'Order not found.' })
      return
    }

    // Already finalized (typically by the webhook): return the existing
    // experience/share URL without creating anything new.
    if (order.status === 'PAID' && order.experienceId) {
      const existing = getExperienceById(order.experienceId)
      if (existing) {
        console.log('[FamGateway] Order already PAID:', order.id)
        sendExperiencePayload(res, existing)
        return
      }
    }

    if (!process.env.FAMGATEWAY_API_KEY) {
      res.status(500).json({ error: 'FamGateway credentials not configured' })
      return
    }

    let statusData
    try {
      statusData = await getFamGatewayOrderStatus(order.gatewayOrderId)
    } catch (error) {
      console.error('[FamGateway] Status check failed:', order.id, error)
      res.status(502).json({ success: false, error: 'Payment status check failed.' })
      return
    }

    if (statusData.status !== 'success') {
      console.log('[FamGateway] Verify not confirmed:', order.id, statusData.status)
      res.status(200).json({
        success: false,
        status: statusData.status,
        error:
          statusData.status === 'pending'
            ? 'Payment is still pending.'
            : 'Payment not completed.',
      })
      return
    }

    // Authoritative amount validation — never unlock on a mismatched amount.
    if (
      statusData.amount != null &&
      Math.abs(statusData.amount - order.amount) > 0.001
    ) {
      console.error('[FamGateway] Amount mismatch on verify:', {
        orderId: order.id,
        expected: order.amount,
        received: statusData.amount,
      })
      res.status(200).json({ success: false, status: 'failed', error: 'Payment amount mismatch.' })
      return
    }

    const experience = finalizeOrderForPayment({
      orderId: order.gatewayOrderId,
      gatewayPaymentId: statusData.utr || statusData.transactionId || null,
    })

    console.log('[FamGateway] Payment confirmed via verify:', order.id)
    sendExperiencePayload(res, experience)
  } catch (error) {
    next(error)
  }
}

/**
 * POST /api/famgateway/webhook
 * Signed server-to-server notification from FamGateway when a payment
 * succeeds. The raw request body is HMAC-SHA256 verified before anything is
 * parsed or fulfilled. Unknown orders and amount mismatches are acknowledged
 * but never fulfilled; already-PAID orders short-circuit idempotently.
 */
async function handleFamGatewayWebhook(
  req: Request,
  res: Response,
): Promise<void> {
  console.log('[FamGateway] Webhook received')

  const rawBody = (req as RawBodyRequest).rawBody
  const signature = req.get('X-FamGateway-Signature')

  if (!process.env.FAMGATEWAY_API_KEY) {
    res.status(500).json({ error: 'FamGateway credentials not configured' })
    return
  }

  if (!verifyFamGatewayWebhookSignature(rawBody, signature)) {
    console.log('[FamGateway] Invalid webhook signature')
    res.status(401).json({ error: 'Invalid webhook signature' })
    return
  }

  console.log('[FamGateway] Webhook verified')

  let payload: Record<string, unknown> = {}
  try {
    payload = JSON.parse((rawBody as Buffer).toString('utf8')) as Record<string, unknown>
  } catch {
    res.status(400).json({ error: 'Malformed webhook payload' })
    return
  }

  // FamGateway only dispatches confirmed-success events. Anything else is
  // acknowledged without fulfilling anything.
  if (payload.status !== 'success') {
    console.log('[FamGateway] Webhook ignored (status != success):', payload.status)
    res.status(200).json({ status: 'ignored' })
    return
  }

  const gatewayOrderId = payload.order_id
  if (!isNonEmptyString(gatewayOrderId)) {
    res.status(200).json({ status: 'ignored' })
    return
  }

  const order = getOrderByGatewayOrderId(gatewayOrderId)
  if (!order) {
    // Unknown order — never create a Cupi order from a webhook.
    console.log('[FamGateway] Webhook for unknown order:', gatewayOrderId)
    res.status(200).json({ status: 'ignored' })
    return
  }

  const gatewayAmount = Number(payload.amount)
  if (!Number.isFinite(gatewayAmount) || Math.abs(gatewayAmount - order.amount) > 0.001) {
    console.error('[FamGateway] Amount mismatch', {
      orderId: order.id,
      expected: order.amount,
      received: payload.amount,
    })
    res.status(200).json({ status: 'ignored', reason: 'amount_mismatch' })
    return
  }

  const gatewayPaymentId =
    (typeof payload.utr === 'string' && payload.utr) ||
    (typeof payload.transaction_id === 'string' && payload.transaction_id) ||
    null

  // Idempotent: already-PAID orders return the existing experience, so a
  // replayed/delivered-again webhook never creates a second experience.
  const experience = finalizeOrderForPayment({
    orderId: order.gatewayOrderId,
    gatewayPaymentId,
  })

  console.log('[FamGateway] Payment confirmed:', order.id, 'experience:', experience.id)
  res.status(200).json({ status: 'ok' })
}

/**
 * GET /experiences/:id
 * Public read of a locked experience (viewed/shared unlimited times).
 */
function handleGetExperience(req: Request, res: Response): void {
  const { id } = req.params as { id: string }

  if (!/^[A-Za-z0-9_-]{6,32}$/.test(id)) {
    res.status(404).json({ error: 'Surprise not found.' })
    return
  }

  const experience = getExperienceById(id)
  if (!experience) {
    res.status(404).json({ error: 'Surprise not found.' })
    return
  }

  incrementViewCount(experience.id)

  res.json({
    id: experience.id,
    templateId: experience.templateId,
    config: experience.config,
    status: experience.status,
    createdAt: experience.createdAt,
  })
}

// 4. API routes — mounted both with and without the /api prefix so a client
// base-URL mismatch can never fall through to a 404 / SPA catch-all.
const orderRoutes = express.Router()

orderRoutes.post('/create', handleCreateOrder)
orderRoutes.post('/verify', handleVerifyOrder)

app.use('/api/orders', orderRoutes)
app.use('/orders', orderRoutes)

app.post('/api/famgateway/webhook', handleFamGatewayWebhook)

app.get('/api/experiences/:id', handleGetExperience)
app.get('/experiences/:id', handleGetExperience)

app.get('/api/health', handleHealth)
app.get('/health', handleHealth)

// 5. Static frontend + SPA catch-all (never intercepts /api routes).
const indexHtml = path.join(DIST_DIR, 'index.html')
if (existsSync(indexHtml)) {
  app.use(express.static(DIST_DIR))
}

app.use((req: Request, res: Response, next) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ error: 'Not found.' })
    return
  }
  if (existsSync(indexHtml)) {
    res.sendFile(indexHtml)
    return
  }
  next()
})

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error('[cupi-api]', err)
  res.status(500).json({ error: 'Internal server error.' })
}
app.use(errorHandler)

app.listen(PORT, HOST, () => {
  console.log(`[cupi-api] listening on http://${HOST}:${PORT}`)
  if (!process.env.FAMGATEWAY_API_KEY) {
    console.warn(
      '[cupi-api] FAMGATEWAY_API_KEY not set — checkout will be unavailable until configured in .env',
    )
  }
})