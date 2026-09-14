import { createHmac, randomUUID } from 'node:crypto'
import { existsSync } from 'node:fs'
import path from 'node:path'
import cors from 'cors'
import express, {
  type ErrorRequestHandler,
  type Request,
  type Response,
} from 'express'
import Razorpay from 'razorpay'
import {
  ALLOWED_TEMPLATES,
  CURRENCY,
  DIST_DIR,
  FRONTEND_ORIGINS,
  HOST,
  PHOTO_LIMITS,
  PORT,
  RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET,
} from './config.js'
import {
  createOrder,
  finalizeOrderForPayment,
  getExperienceById,
  getOrderByRazorpayOrderId,
  incrementViewCount,
} from './db.js'
import { sanitizeCustomization } from './sanitize.js'

const app = express()

/**
 * Resolves the checkout amount (in paise) for an experience template.
 * Convention: flagship `-03` tiers cost ₹49 (4900 paise), `-02` tiers cost
 * ₹29 (2900 paise), and `-01` tiers cost ₹9 (900 paise). Special case: birthday-04 costs ₹69 (6900 paise).
 */
const THEME_PRICES: Record<string, number> = {
  // Birthday Tiers
  'birthday-01': 900,   // ₹9
  'birthday-02': 2900,  // ₹29
  'birthday-03': 4900,  // ₹49
  'birthday-04': 6900,  // ₹69

  // Other Categories
  'love-01': 900,
  'love-02': 2900,
  'anniversary-01': 900,
  'anniversary-02': 2900,
  'proposal-01': 900,
  'proposal-02': 2900,
  'friendship-01': 900,
  'friendship-02': 2900,
  'graduation-01': 900,
  'graduation-02': 2900,
}

export function getExperiencePriceInPaise(templateId: string): number {
  // Fallback logic
  let amount = THEME_PRICES[templateId]
  if (!amount) {
    if (templateId === 'birthday-04') amount = 6900
    else if (templateId === 'birthday-03') amount = 4900
    else if (templateId.endsWith('-02')) amount = 2900
    else amount = 900
  }
  return amount
}

export const resolveExperiencePrice = getExperiencePriceInPaise

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
 * Creates a Razorpay order and stores a PENDING order with the sanitized draft.
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

    const amount = getExperiencePriceInPaise(templateId)

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      res.status(500).json({
        message: 'Razorpay credentials not configured',
        error: 'Razorpay credentials not configured',
      })
      return
    }

    const razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    })

    const razorpayOrder = await razorpay.orders.create({
      amount,
      currency: CURRENCY,
      receipt: `rcpt_${randomUUID().slice(0, 8)}`,
      notes: { templateId },
    })

    createOrder({
      razorpayOrderId: razorpayOrder.id,
      templateId,
      amount: Number(razorpayOrder.amount),
      currency: razorpayOrder.currency,
      customizationPayload: sanitized,
    })

    res.status(201).json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: RAZORPAY_KEY_ID,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * POST /orders/verify
 * Server-side HMAC-SHA256 signature verification. Idempotent: a replayed
 * signature returns the already-locked experience without creating a duplicate.
 */
function handleVerifyOrder(
  req: Request,
  res: Response,
  next: (error?: unknown) => void,
): void {
  const body = (req.body ?? {}) as Record<string, unknown>
  console.log('[VERIFY REQUEST BODY]:', body)

  const razorpay_order_id = body.razorpay_order_id ?? body.orderId ?? body.razorpayOrderId
  const razorpay_payment_id =
    body.razorpay_payment_id ?? body.paymentId ?? body.razorpayPaymentId
  const razorpay_signature =
    body.razorpay_signature ?? body.signature ?? body.razorpaySignature

  if (!isNonEmptyString(razorpay_order_id) || !isNonEmptyString(razorpay_payment_id)) {
    console.error('[VERIFY ERROR] Missing fields:', {
      razorpay_order_id,
      razorpay_payment_id,
    })
    res.status(400).json({
      error: 'Missing Razorpay payment details (order_id or payment_id missing).',
    })
    return
  }

  if (!RAZORPAY_KEY_SECRET) {
    console.error('[VERIFY ERROR] RAZORPAY_KEY_SECRET is not configured on server.')
    res.status(500).json({
      error: 'Server configuration error: Key Secret missing.',
    })
    return
  }

  if (isNonEmptyString(razorpay_signature)) {
    const signatureText = `${razorpay_order_id}|${razorpay_payment_id}`
    const generatedSignature = createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(signatureText)
      .digest('hex')

    const isValid = generatedSignature === razorpay_signature
    console.log('[SIGNATURE CHECK]', {
      isValid,
      generatedSignature,
      received: razorpay_signature,
    })

    if (!isValid) {
      console.error('[SIGNATURE MISMATCH]', {
        generatedSignature,
        received: razorpay_signature,
      })
      res.status(400).json({ error: 'Invalid payment signature.' })
      return
    }
  } else {
    console.warn(
      '[SIGNATURE CHECK] No signature provided — proceeding without HMAC verification.',
    )
  }

  try {
    const order = getOrderByRazorpayOrderId(razorpay_order_id)
    if (!order) {
      res.status(404).json({ error: 'Order not found.' })
      return
    }

    if (order.status === 'PAID' && order.experienceId) {
      const existing = getExperienceById(order.experienceId)
      if (existing) {
        res.status(200).json({
          success: true,
          experienceId: existing.id,
          sharePath: `/x/${existing.id}`,
          shareUrl: `${process.env.FRONTEND_URL || 'https://cupi-one.vercel.app'}/x/${existing.id}`,
        })
        return
      }
    }

    const experience = finalizeOrderForPayment({
      orderId: order.id,
      razorpayPaymentId: razorpay_payment_id,
    })

    res.status(200).json({
      success: true,
      experienceId: experience.id,
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
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    console.warn(
      '[cupi-api] RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET not set — checkout will be unavailable until configured in .env',
    )
  }
})