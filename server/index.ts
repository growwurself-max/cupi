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
  PORT,
  PRICE_PAISE,
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

app.use(
  cors({
    origin:
      FRONTEND_ORIGINS.length > 0
        ? FRONTEND_ORIGINS
        : (origin, callback) => callback(null, origin ?? true),
  }),
)
app.use(express.json({ limit: '256kb' }))

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function verifyRazorpaySignature(input: {
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
}): boolean {
  const body = `${input.razorpayOrderId}|${input.razorpayPaymentId}`
  const expected = createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex')
  return expected === input.razorpaySignature
}

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'cupi-api' })
})

/**
 * POST /api/orders/create
 * Creates a Razorpay order and stores a PENDING order with the sanitized draft.
 */
app.post(
  '/api/orders/create',
  async (req: Request, res: Response, next) => {
    try {
      const { templateId, customization } = (req.body ?? {}) as {
        templateId?: unknown
        customization?: unknown
      }

      if (!isNonEmptyString(templateId)) {
        return res.status(400).json({ error: 'A valid template is required.' })
      }
      if (!ALLOWED_TEMPLATES.includes(templateId)) {
        return res
          .status(400)
          .json({ error: 'This template is not available for purchase yet.' })
      }

      const sanitized = sanitizeCustomization(customization)
      if (!sanitized) {
        return res.status(400).json({ error: 'Invalid customization payload.' })
      }

      if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
        return res.status(503).json({
          error: 'Razorpay is not configured on this server yet. Try again soon.',
        })
      }

      const razorpay = new Razorpay({
        key_id: RAZORPAY_KEY_ID,
        key_secret: RAZORPAY_KEY_SECRET,
      })

      const razorpayOrder = await razorpay.orders.create({
        amount: PRICE_PAISE,
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
  },
)

/**
 * POST /api/orders/verify
 * Server-side HMAC-SHA256 signature verification. Idempotent: a replayed
 * signature returns the already-locked experience without creating a duplicate.
 */
app.post('/api/orders/verify', (req: Request, res: Response) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    (req.body ?? {}) as {
      razorpay_order_id?: unknown
      razorpay_payment_id?: unknown
      razorpay_signature?: unknown
    }

  if (
    !isNonEmptyString(razorpay_order_id) ||
    !isNonEmptyString(razorpay_payment_id) ||
    !isNonEmptyString(razorpay_signature)
  ) {
    return res
      .status(400)
      .json({ error: 'Missing Razorpay payment details.' })
  }

  if (!RAZORPAY_KEY_SECRET) {
    return res.status(503).json({
      error: 'Razorpay is not configured on this server yet. Try again soon.',
    })
  }

  const isAuthentic = verifyRazorpaySignature({
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    razorpaySignature: razorpay_signature,
  })

  if (!isAuthentic) {
    return res.status(400).json({ error: 'Invalid Payment Signature' })
  }

  const order = getOrderByRazorpayOrderId(razorpay_order_id)
  if (!order) {
    return res.status(404).json({ error: 'Order not found.' })
  }

  if (order.status === 'PAID' && order.experienceId) {
    const existing = getExperienceById(order.experienceId)
    if (existing) {
      return res.json({
        success: true,
        experienceId: existing.id,
        shareUrl: `/x/${existing.id}`,
      })
    }
  }

  const experience = finalizeOrderForPayment({
    orderId: order.id,
    razorpayPaymentId: razorpay_payment_id,
  })

  return res.status(201).json({
    success: true,
    experienceId: experience.id,
    shareUrl: `/x/${experience.id}`,
  })
})

/**
 * GET /api/experiences/:id
 * Public read of a locked experience (viewed/shared unlimited times).
 */
app.get('/api/experiences/:id', (req: Request, res: Response) => {
  const { id } = req.params as { id: string }

  if (!/^[A-Za-z0-9_-]{6,32}$/.test(id)) {
    return res.status(404).json({ error: 'Surprise not found.' })
  }

  const experience = getExperienceById(id)
  if (!experience) {
    return res.status(404).json({ error: 'Surprise not found.' })
  }

  incrementViewCount(experience.id)

  return res.json({
    id: experience.id,
    templateId: experience.templateId,
    config: experience.config,
    status: experience.status,
    createdAt: experience.createdAt,
  })
})

// Serve the built storefront + SPA fallback for /x/:id in production.
const indexHtml = path.join(DIST_DIR, 'index.html')
if (existsSync(indexHtml)) {
  app.use(express.static(DIST_DIR))
}

app.use((req: Request, res: Response, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not found.' })
  }
  if (existsSync(indexHtml)) {
    return res.sendFile(indexHtml)
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