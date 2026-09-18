import { existsSync } from 'node:fs'
import path from 'node:path'
import cors from 'cors'
import express, {
  type ErrorRequestHandler,
  type Request,
  type Response,
} from 'express'
import {
  createCashfreeOrder,
  getCashfreeOrderStatus,
} from './cashfree.js'
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
  shortId,
} from './db.js'
import { sanitizeCustomization } from './sanitize.js'

const app = express()

/**
 * Resolves the checkout amount in rupees (INR) for an experience template.
 * Convention: `-03` tiers cost ₹49, `-04` cost ₹69, `-02` tiers cost ₹29,
 * and `-01` tiers cost ₹9.
 */
export function resolvePriceInRupees(templateId: string): number {
  if (templateId === 'birthday-04') return 69.0
  if (templateId === 'birthday-03') return 49.0
  if (templateId.endsWith('-02') || templateId === 'birthday-02') return 29.0
  return 9.0 // All -01 themes
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
// (base64) photos always fits through.
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
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
 * Creates a Cashfree PG order and stores a PENDING order with the sanitized draft.
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
    const orderId = shortId(8)

    if (!process.env.CASHFREE_SECRET_KEY) {
      res.status(500).json({
        message: 'Cashfree credentials not configured',
        error: 'Cashfree credentials not configured',
      })
      return
    }

    const cashfreeData = await createCashfreeOrder({
      orderId,
      amount,
      customerName: sanitizedCustomization.senderName,
    })

    if (!cashfreeData.payment_session_id) {
      console.error('[CASHFREE CREATE] No payment_session_id returned:', cashfreeData)
      res.status(502).json({
        error: 'Payment gateway did not return a payment session.',
      })
      return
    }

    createOrder({
      gatewayOrderId: orderId,
      templateId,
      amount,
      currency: 'INR',
      customizationPayload: sanitized,
    })

    res.status(201).json({
      success: true,
      orderId,
      paymentSessionId: cashfreeData.payment_session_id,
      amount,
      currency: 'INR',
    })
  } catch (error) {
    next(error)
  }
}

/**
 * POST /orders/verify
 * Confirms the payment status with Cashfree PG, then locks the experience.
 * Idempotent: a replayed payment returns the already-locked experience.
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

    const orderData = await getCashfreeOrderStatus(orderId)

    if (orderData.order_status !== 'PAID') {
      console.error('[VERIFY ERROR] Payment not completed:', {
        orderId,
        order_status: orderData.order_status,
      })
      res.status(400).json({ error: 'Payment not completed.' })
      return
    }

    const order = getOrderByGatewayOrderId(orderId) ?? getOrderById(orderId)
    if (!order) {
      res.status(404).json({ error: 'Order not found.' })
      return
    }

    const experience = finalizeOrderForPayment({
      orderId: order.id,
      gatewayPaymentId: orderData.cf_order_id ?? null,
    })

    res.status(200).json({
      success: true,
      experienceId: experience.id,
      id: experience.id,
      sharePath: `/x/${experience.id}`,
      shareUrl: `${process.env.FRONTEND_URL || 'https://cupi-one.vercel.app'}/x/${experience.id}`,
    })
  } catch (error) {
    next(error)
  }
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
  if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
    console.warn(
      '[cupi-api] CASHFREE_APP_ID / CASHFREE_SECRET_KEY not set — checkout will be unavailable until configured in .env',
    )
  }
})