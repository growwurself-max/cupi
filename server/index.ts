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
  ALLOWED_TEMPLATES,
  DIST_DIR,
  FRONTEND_ORIGINS,
  HOST,
  PHOTO_LIMITS,
  PORT,
} from './config.js'
import {
  assertStoreReady,
  activeStoreKind,
  countCouponRedemptions,
  countExperiences,
  createOrder,
  finalizeOrderForPayment,
  findOrdersByCustomer,
  getCouponByCode,
  getExperienceById,
  getInfluencerByCode,
  getOrderByGatewayOrderId,
  getOrderById,
  getProductPrice,
  incrementViewCount,
  isStoreDurable,
  systemId,
} from './db.js'
import type { CouponRecord, InfluencerRecord } from './store.js'
import {
  isValidCodeFormat,
  normalizeCode,
  normalizeIp,
  normalizeTrafficSource,
  priceOrder,
  REJECTION_MESSAGES,
  resolveCoupon,
  type CouponRejection as PartnerCouponRejection,
} from './influencers.js'
import {
  COUPON_REJECTION_MESSAGES,
  couponDiscountPercentage,
  isCouponUsable,
  type GenericCouponRejection,
} from './coupons.js'
import { sanitizeCustomization } from './sanitize.js'
import { SupabaseStoreError } from './supabase.js'
import { createAdminRouter } from './adminRoutes.js'
import { createCustomerAuthRouter, requireCustomerAuth } from './customerAuth.js'

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
 * Resolves the default checkout amount in rupees (INR) for an experience template.
 * Convention: `-03` tiers cost ₹147, `-04` cost ₹207, `-02` tiers cost ₹27,
 * and `-01` tiers cost ₹87. Special templates carry their own pricing:
 * special-01 ₹27, special-02 ₹147, special-03 ₹207, special-04 ₹6, special-05 ₹147.
 *
 * IMPORTANT: the trailing `return 87.0` is a catch-all for every remaining
 * `-01` id, so any new template MUST get its own branch above it or it will
 * silently be charged ₹87. The Parents Birthday templates are priced at ₹297.
 *
 * NOTE: This function returns the DEFAULT price. For the actual price used in
 * checkout, use resolvePriceInRupees() which checks for custom prices first.
 */
function getDefaultPriceInRupees(templateId: string): number {
  if (templateId === 'birthday-04') return 207.0
  if (templateId === 'birthday-03') return 147.0
  if (templateId === 'special-03') return 207.0
  if (templateId === 'special-02') return 147.0
  if (templateId === 'special-05') return 147.0
  if (templateId === 'special-04') return 6.0
  if (templateId === 'special-01') return 27.0
  // Parents Birthday templates
  if (templateId === 'parent-01') return 297.0
  if (templateId === 'parent-02') return 297.0
  if (templateId.endsWith('-02') || templateId === 'birthday-02') return 27.0
  return 87.0 // All -01 themes
}

/**
 * Resolves the checkout amount in rupees (INR) for an experience template.
 * This function first checks the database for a custom price set by Super Admin,
 * then falls back to the default hardcoded pricing.
 *
 * The server always calculates the final price - the browser is never trusted.
 * This ensures that when a Super Admin changes a price, all new orders use the
 * new price, while existing orders retain their original recorded price.
 */
export async function resolvePriceInRupees(templateId: string): Promise<number> {
  // First check if there's a custom price in the database
  const customPrice = await getProductPrice(templateId)
  if (customPrice !== null && customPrice > 0) {
    return customPrice
  }

  // Fall back to default pricing
  return getDefaultPriceInRupees(templateId)
}

/**
 * The fixed campaign codes that predate the influencer system. They are kept so
 * links already shared in the wild keep working; a real partner's code is looked
 * up in the database and takes precedence.
 */
const LEGACY_COUPON_DISCOUNT_PERCENTAGE = 100 / 3

const LEGACY_COUPONS = new Map<string, number>([
  ['INFLUENCER33', LEGACY_COUPON_DISCOUNT_PERCENTAGE],
  ['CUPI33', LEGACY_COUPON_DISCOUNT_PERCENTAGE],
  ['SPECIAL33', LEGACY_COUPON_DISCOUNT_PERCENTAGE],
])

export function legacyCouponDiscountPercentage(code: string): number | null {
  return LEGACY_COUPONS.get(normalizeCode(code)) ?? null
}

/**
 * Why a submitted code was refused. The first four are the partner-code
 * reasons that have always existed; the rest belong to generic campaign
 * coupons (schedule, applicability, caps).
 */
export type CheckoutCouponReason = PartnerCouponRejection | GenericCouponRejection

export type CheckoutCouponSource = 'partner' | 'coupon' | 'legacy'

export interface CheckoutCouponResolution {
  applied: boolean
  /** Normalized submitted code, whether or not it was accepted (for logs). */
  code: string
  source: CheckoutCouponSource | null
  /** Null when the code was applied. */
  reason: CheckoutCouponReason | null
  /** Buyer-facing refusal copy. Null when the code was applied. */
  error: string | null
  /** Effective percentage handed to `priceOrder`. 0 when the code was refused. */
  discountPercentage: number
  /** Set only for partner codes; drives commission. */
  influencer: InfluencerRecord | null
  /** Set only for generic campaign coupons. */
  coupon: CouponRecord | null
}

function bareRefusal(code: string, reason: CheckoutCouponReason): CheckoutCouponResolution {
  return {
    applied: false,
    code,
    source: null,
    reason,
    // The shared reasons read identically in both message maps, so a code with
    // no source can still be described accurately.
    error: COUPON_REJECTION_MESSAGES[reason as GenericCouponRejection],
    discountPercentage: 0,
    influencer: null,
    coupon: null,
  }
}

function refusal(
  code: string,
  source: CheckoutCouponSource,
  reason: CheckoutCouponReason,
  extra: { influencer?: InfluencerRecord | null; coupon?: CouponRecord | null } = {},
): CheckoutCouponResolution {
  return {
    applied: false,
    code,
    source,
    reason,
    error:
      source === 'partner'
        ? REJECTION_MESSAGES[reason as PartnerCouponRejection]
        : COUPON_REJECTION_MESSAGES[reason as GenericCouponRejection],
    discountPercentage: 0,
    influencer: extra.influencer ?? null,
    coupon: extra.coupon ?? null,
  }
}

function applied(
  code: string,
  source: CheckoutCouponSource,
  discountPercentage: number,
  extra: { influencer?: InfluencerRecord | null; coupon?: CouponRecord | null } = {},
): CheckoutCouponResolution {
  return {
    applied: true,
    code,
    source,
    reason: null,
    error: null,
    discountPercentage,
    influencer: extra.influencer ?? null,
    coupon: extra.coupon ?? null,
  }
}

/**
 * Resolves ANY submitted code — partner, generic coupon, or legacy campaign —
 * to the discount the BUYER receives, as a percentage.
 *
 * Order of precedence is deliberate and fixed:
 *
 *   1. partner code   — an affiliate's attribution is never lost to an
 *                       operator's campaign code. If the partner exists but is
 *                       paused/expired, that verdict is final: no fallthrough
 *                       to the other namespaces, which could silently credit
 *                       someone else (or nobody) for the same code.
 *   2. generic coupon — a row in `cupi_coupons`. Its verdict is also final.
 *   3. legacy codes   — the hardcoded campaign codes kept for old links.
 *
 * This is the single lookup behind the public quote endpoints and checkout, so
 * the price a buyer is quoted can never differ from the price they are charged.
 *
 * `ctx` carries whatever the caller already knows: with a template and a price,
 * every eligibility rule is enforced (applicability, minimum spend, redemption
 * cap); without them, a bare code is judged on its schedule and status only.
 */
export async function resolveCheckoutCoupon(
  submittedCode: string,
  ctx: { templateId?: string; baseAmount?: number; redemptionsUsed?: number } = {},
): Promise<CheckoutCouponResolution> {
  const code = normalizeCode(submittedCode)
  if (!code) return bareRefusal(code, 'NOT_FOUND')
  if (!isValidCodeFormat(code)) return bareRefusal(code, 'INVALID_FORMAT')

  // ------------------------------------------------------------- 1. partner --
  const influencer = await getInfluencerByCode(code)
  if (influencer) {
    const resolution = resolveCoupon(code, influencer)
    if (resolution.valid && resolution.influencer) {
      return applied(code, 'partner', resolution.influencer.discountPercentage, {
        influencer: resolution.influencer,
      })
    }
    return refusal(code, 'partner', resolution.reason ?? 'NOT_FOUND', { influencer })
  }

  // -------------------------------------------------- 2. generic coupon row --
  const coupon = await getCouponByCode(code)
  if (coupon) {
    // The cap is checked against PAID orders, so an abandoned PENDING checkout
    // never burns one. Counted lazily: codes without a cap cost no extra query.
    const redemptionsUsed =
      coupon.maxRedemptions !== null && ctx.redemptionsUsed === undefined
        ? await countCouponRedemptions(code)
        : ctx.redemptionsUsed

    const verdict = isCouponUsable(coupon, {
      templateId: ctx.templateId,
      baseAmount: ctx.baseAmount,
      redemptionsUsed,
    })
    if (!verdict.ok) return refusal(code, 'coupon', verdict.reason, { coupon })

    return applied(
      code,
      'coupon',
      couponDiscountPercentage(coupon, ctx.baseAmount ?? 0),
      { coupon },
    )
  }

  // ------------------------------------------------------- 3. legacy codes --
  const legacyPercentage = legacyCouponDiscountPercentage(code)
  if (legacyPercentage !== null) return applied(code, 'legacy', legacyPercentage)

  return bareRefusal(code, 'NOT_FOUND')
}

/**
 * GET /api/validate-coupon
 *
 * Validates a coupon and reports the discount it applies. `discountMultiplier`
 * is kept for the existing checkout UI; `discountPercentage` and the resolved
 * amounts are what variable-rate codes actually need.
 */
async function handleValidateCoupon(req: Request, res: Response): Promise<void> {
  const code = typeof req.query.code === 'string' ? req.query.code : ''

  if (!code.trim()) {
    res.status(400).json({ valid: false, error: 'Coupon code is required' })
    return
  }

  const templateId = typeof req.query.templateId === 'string' ? req.query.templateId : ''
  const quoted = ALLOWED_TEMPLATES.includes(templateId)
  const baseAmount = quoted ? await resolvePriceInRupees(templateId) : undefined

  const resolution = await resolveCheckoutCoupon(code, {
    templateId: quoted ? templateId : undefined,
    baseAmount,
  })

  if (!resolution.applied) {
    res.json({
      valid: false,
      reason: resolution.reason ?? undefined,
      error: resolution.error ?? 'Invalid coupon code',
    })
    return
  }

  const discountPercentage = resolution.discountPercentage
  const multiplier = 1 - discountPercentage / 100
  const response: Record<string, unknown> = {
    valid: true,
    discountMultiplier: multiplier,
    discountPercentage,
  }

  // Quote the real price when a template is supplied, so the checkout button
  // never shows an amount the server would then refuse.
  if (quoted && baseAmount !== undefined) {
    const priced = priceOrder({
      baseAmount,
      discountPercentage,
      commissionPercentage: 0,
    })
    response.originalAmount = priced.originalAmount
    response.amount = priced.amount
    response.discountGiven = priced.discountGiven
  }

  res.json(response)
}

/**
 * POST /api/checkout/apply-coupon
 *
 * Public. Validates a code and returns exactly what the buyer will be charged
 * for a given template. The checkout button and the order itself both come from
 * `priceOrder`, so a quote can never disagree with the charge.
 */
async function handleApplyCoupon(req: Request, res: Response): Promise<void> {
  const body = req.body as { code?: unknown; templateId?: unknown }
  const code = typeof body?.code === 'string' ? body.code : ''
  const templateId = typeof body?.templateId === 'string' ? body.templateId : ''

  if (!code.trim()) {
    res.status(400).json({ valid: false, error: 'Coupon code is required' })
    return
  }
  if (!ALLOWED_TEMPLATES.includes(templateId)) {
    res.status(400).json({ valid: false, error: 'Unknown template ID' })
    return
  }

  const baseAmount = await resolvePriceInRupees(templateId)
  const resolution = await resolveCheckoutCoupon(code, { templateId, baseAmount })

  if (!resolution.applied) {
    res.json({
      valid: false,
      reason: resolution.reason ?? undefined,
      error: resolution.error ?? 'Invalid coupon code',
    })
    return
  }

  const priced = priceOrder({
    baseAmount,
    discountPercentage: resolution.discountPercentage,
    // Commission belongs to partner codes only: a campaign coupon and a legacy
    // code pay nobody, so a buyer's discount never quietly costs Cupi extra.
    commissionPercentage: resolution.influencer?.commissionPercentage ?? 0,
  })

  const response: Record<string, unknown> = {
    valid: true,
    code: resolution.code,
    // The partner's name is not returned: this endpoint is public and the
    // dashboard owns who a code belongs to.
    discountPercentage: resolution.discountPercentage,
    discountMultiplier: 1 - resolution.discountPercentage / 100,
    originalAmount: priced.originalAmount,
    amount: priced.amount,
    discountGiven: priced.discountGiven,
  }
  // Legacy campaign codes are flagged so the checkout UI can keep its copy.
  if (resolution.source === 'legacy') response.legacy = true

  res.json(response)
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
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
)
// 2. JSON body parser — 50mb so a full customization with compressed
// (base64) photos and audio always fits through. The verify() hook preserves the raw
// request body so the FamGateway webhook can be HMAC-verified verbatim.
app.use(
  express.json({
    limit: '50mb',
    verify: (req: RawBodyRequest, _res, buf) => {
      req.rawBody = buf
    },
  }),
)
app.use(express.urlencoded({ extended: true, limit: '50mb', verify: (req: RawBodyRequest, _res, buf) => { req.rawBody = buf } }))
// 3. Request logger (visibility in Render logs)
app.use((req: Request, _res: Response, next) => {
  console.log(`[HTTP] ${req.method} ${req.originalUrl}`)
  next()
})

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function handleHealth(_req: Request, res: Response): void {
  res.status(200).json({
    status: 'ok',
    service: 'cupi-api',
    // Which backend is live, and whether it survives a redeploy. Orders and
    // generated-website share links live in `store`.
    store: activeStoreKind(),
    durableData: isStoreDurable(),
  })
}

/**
 * Readiness detail, kept off /api/health so the public health probe stays cheap.
 * Never exposes credentials — only the backend name and a row count.
 */
async function handleStoreStatus(_req: Request, res: Response): Promise<void> {
  try {
    const count = await countExperiences()
    res.status(200).json({
      store: activeStoreKind(),
      durable: isStoreDurable(),
      reachable: true,
      generatedWebsites: count,
    })
  } catch (error) {
    res.status(503).json({
      store: activeStoreKind(),
      durable: isStoreDurable(),
      reachable: false,
      error: (error as Error).message,
    })
  }
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
        error: `Invalid template ID: "${templateId}". Expected format like "birthday-03" or "birthday-04".`,
      })
      return
    }

    // The shape regex above is not enough: any `word-99` matches it, which let a
    // request create a paid order for a template that does not exist (and fall
    // through to the ₹29 catch-all price). The server, not the client, decides
    // which templates exist.
    if (!ALLOWED_TEMPLATES.includes(templateId)) {
      console.error('[ORDER CREATE REJECTED] Unknown templateId:', templateId)
      res.status(400).json({ error: `Unknown template ID: "${templateId}".` })
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

    // Fixed headlines are part of the product itself: which template was
    // bought decides what the big line says, not the buyer's wording. Re-applied
    // here so a hand-crafted request can never change what the recipient sees.
    if (templateId === 'special-01') {
      sanitized.content.finalMessage = 'Happy Birthday'
    }

    // Paying is a purchase, so a signed-in customer whose e-mail is not yet
    // verified is blocked here — before any gateway order is created or money
    // can be taken. requireCustomerAuth only proves the account exists.
    if (req.customer && !req.customer.emailVerified) {
      res.status(403).json({
        error: 'Please verify your e-mail address before purchasing.',
      })
      return
    }

    // Resolve base price
    const basePrice = await resolvePriceInRupees(templateId)

    // Resolve attribution: an explicit coupon wins, otherwise a referral code
    // captured from the landing URL is used. Both are re-validated here, on the
    // server — a code that has since been paused or has expired earns nothing,
    // however recently it was captured in the browser.
    const requestedCoupon =
      typeof req.body.couponCode === 'string' ? req.body.couponCode.trim() : ''
    const referralCode =
      typeof req.body.referralCode === 'string' ? req.body.referralCode.trim() : ''
    const submittedCode = requestedCoupon || referralCode

    let influencer: InfluencerRecord | null = null
    let discountPercentage = 0
    let couponCode: string | null = null

    if (submittedCode) {
      const resolution = await resolveCheckoutCoupon(submittedCode, {
        templateId,
        baseAmount: basePrice,
      })

      if (resolution.applied) {
        influencer = resolution.influencer
        discountPercentage = resolution.discountPercentage
        couponCode = resolution.code
        console.log(
          `[COUPON APPLIED] ${resolution.code} via ${resolution.source} ` +
            `(${discountPercentage}% off) for ${templateId}`,
        )
      } else if (resolution.reason === 'INVALID_FORMAT') {
        console.log(`[COUPON MALFORMED] ${resolution.code}`)
      } else if (resolution.source === 'partner') {
        console.log(
          `[COUPON REFUSED] ${resolution.code}: influencer exists but is not redeemable (${resolution.reason})`,
        )
      } else {
        // A refused code never blocks checkout: the buyer simply proceeds at
        // the full price, exactly as an unknown code would.
        console.log(`[COUPON INVALID] ${resolution.code}: ${resolution.reason}`)
      }
    }

    // One pricing function decides every amount, so the gateway charge, the
    // buyer's receipt and the affiliate payout can never disagree.
    const priced = priceOrder({
      baseAmount: basePrice,
      discountPercentage,
      commissionPercentage: influencer?.commissionPercentage ?? 0,
    })
    const amount = priced.amount

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

    // The buyer was resolved by requireCustomerAuth before this handler ran,
    // so the order is always linked to their account.
    const customerId = req.customer?.id ?? null

    // The order MUST be persisted before the customer is given a way to pay.
    // If this write fails we abort here: the checkout URL is never returned, so
    // a payment can never be taken for an order that does not exist (which the
    // webhook would then silently ignore).
    try {
      // Attribution is written in the same insert as the order. A separate
      // "transactions" row would need a second write, and a crash between the
      // two would record a real paid sale that no influencer is credited for.
      await createOrder({
        id: cupiOrderId,
        gatewayOrderId: famOrder.orderId,
        templateId,
        amount,
        currency: 'INR',
        customizationPayload: sanitized,
        customerId,
        attribution: {
          influencerId: influencer?.id ?? null,
          couponCode,
          originalAmount: priced.originalAmount,
          discountGiven: priced.discountGiven,
          netRevenue: priced.netRevenue,
          commissionEarned: priced.commissionEarned,
          trafficSource: normalizeTrafficSource(
            req.body.trafficSource ?? req.query.utm_source ?? req.query.ref,
          ),
          // req.ip, not a raw x-forwarded-for chain, which a caller can forge.
          customerIp: normalizeIp(req.ip),
        },
      })
    } catch (error) {
      console.error('[ORDER CREATE] could not persist the order:', cupiOrderId, error)
      res.status(503).json({
        error: 'We could not start your checkout right now. Please try again in a moment.',
        detail: 'The order could not be saved, so payment was not started.',
      })
      return
    }

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

    const order = (await getOrderById(orderId)) ?? (await getOrderByGatewayOrderId(orderId))
    if (!order) {
      res.status(404).json({ error: 'Order not found.' })
      return
    }

    // Ownership gate for recovery requests: when the caller claims a customer
    // id, it must be the id the order was created with. The normal post-payment
    // redirect does not send one and is unaffected; this only stops one device
    // from finishing (and reading) another's order through the "Store" page.
    if (body.customerId != null && order.customerId !== body.customerId) {
      res.status(403).json({ error: 'This order does not belong to this device.' })
      return
    }

    // Already finalized (typically by the webhook): return the existing
    // experience/share URL without creating anything new.
    if (order.status === 'PAID' && order.experienceId) {
      const existing = await getExperienceById(order.experienceId)
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

    // Idempotent end to end: `finalizeOrderForPayment` is safe under duplicate
    // and concurrent delivery (the database rejects a second website for the
    // same order), so a replayed verify returns the one existing website.
    let experience
    try {
      experience = await finalizeOrderForPayment({
        orderId: order.gatewayOrderId,
        gatewayPaymentId: statusData.utr || statusData.transactionId || null,
      })
    } catch (error) {
      // The payment IS confirmed but the website could not be persisted. Report
      // it as a failure so the customer retries rather than being handed a
      // share link that does not exist.
      console.error('[FamGateway] Payment confirmed but website not saved:', order.id, error)
      res.status(503).json({
        success: false,
        error: 'Payment received. We are still saving your website — please check again in a moment.',
      })
      return
    }

    console.log('[FamGateway] Payment confirmed via verify:', order.id)
    sendExperiencePayload(res, experience)
  } catch (error) {
    next(error)
  }
}

/**
 * POST /orders/mine
 * Lists every order placed by the signed-in customer, newest first, so the
 * buyer can recover their purchases and unfinished payments on their own
 * "Store" page. The buyer is resolved from Authorization by requireCustomerAuth,
 * never from the URL or body. Only public summary fields are returned — the
 * personalization payload stays server-side.
 */
async function handleGetMyOrders(
  req: Request,
  res: Response,
  next: (error?: unknown) => void,
): Promise<void> {
  try {
    const customerId = req.customer?.id ?? null
    if (!customerId) {
      res.status(401).json({ error: 'Please sign in to continue.' })
      return
    }

    const orders = await findOrdersByCustomer(customerId)
    res.status(200).json({
      success: true,
      orders: orders.map((order) => ({
        orderId: order.id,
        gatewayOrderId: order.gatewayOrderId,
        templateId: order.templateId,
        amount: order.amount,
        currency: order.currency,
        status: order.status,
        experienceId: order.experienceId,
        sharePath: order.experienceId ? `/x/${order.experienceId}` : null,
        createdAt: order.createdAt,
      })),
    })
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

  let order
  try {
    order = await getOrderByGatewayOrderId(gatewayOrderId)
  } catch (error) {
    // The store is unreachable. Answer 503 so FamGateway RETRIES the delivery
    // instead of treating it as handled — acknowledging a webhook we could not
    // fulfil would lose the customer's paid-for website.
    console.error('[FamGateway] Webhook could not read the store:', gatewayOrderId, error)
    res.status(503).json({ status: 'retry', reason: 'store_unavailable' })
    return
  }

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
  let experience
  try {
    experience = await finalizeOrderForPayment({
      orderId: order.gatewayOrderId,
      gatewayPaymentId,
    })
  } catch (error) {
    // 503 makes the gateway retry, which is what we want: the payment is real and
    // the website must exist. Never acknowledge a fulfilment we could not store.
    console.error('[FamGateway] Webhook fulfilment failed:', order.id, error)
    res.status(503).json({ status: 'retry', reason: 'fulfilment_failed' })
    return
  }

  console.log('[FamGateway] Payment confirmed:', order.id, 'experience:', experience.id)
  res.status(200).json({ status: 'ok' })
}

/**
 * READ-ONLY ENFORCEMENT for generated websites.
 *
 * A completed experience (status LOCKED) is a permanent, view-only artifact.
 * The public share link is read-only at the API level, not merely in the UI:
 * any non-safe HTTP method aimed at an experience id — or at any path
 * underneath it — is rejected here before a handler ever runs, so hiding the
 * Edit button is never the only protection.
 *
 * Rejection contract:
 *   423 Locked  — the target website exists and is finalized. This is the
 *                 answer to "edit / customize / regenerate / overwrite".
 *   404         — no such website (so probing cannot confirm existence).
 *   405         — a mutation verb on the collection with no id.
 * GET/HEAD/OPTIONS pass straight through to handleGetExperience.
 *
 * There is no expiry dimension anywhere in this guard: the link is valid
 * indefinitely, so 404 only ever means "never existed / already removed".
 */
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])
// Must stay in sync with the SPA router's /x/:id matcher in src/App.tsx. Any id
// the share page accepts has to be accepted here too, otherwise a link that was
// already handed to a customer could 404 forever on an over-strict pattern.
const EXPERIENCE_ID_PATTERN = /^[A-Za-z0-9_-]{4,64}$/

/**
 * `app.use('/api/experiences', …)` does not populate `req.params`, so the id is
 * the first path segment relative to the mount — e.g. `/FGK3PZ9A/config` → the
 * first segment identifies the website, the rest is the attempted action.
 */
function experienceIdFromRequest(req: Request): string | undefined {
  return req.path.split('/').filter(Boolean)[0]
}

async function rejectExperienceMutation(
  req: Request,
  res: Response,
  next: () => void,
): Promise<void> {
  // Safe methods fall through to handleGetExperience. Returning without
  // calling next() here would stall the request until the client times out.
  if (SAFE_METHODS.has(req.method)) {
    next()
    return
  }

  const id = experienceIdFromRequest(req)

  if (!id) {
    res.setHeader('Allow', 'GET, HEAD, OPTIONS')
    res.status(405).json({
      error: 'Method not allowed.',
      detail: 'Generated websites are read-only and are only served over GET.',
    })
    return
  }

  // Unreachable store: fail closed. An unknown answer must never be mistaken
  // for "not locked", so this returns 503 instead of trying to serve or modify.
  let exists = false
  try {
    exists = EXPERIENCE_ID_PATTERN.test(id) && (await getExperienceById(id)) !== null
  } catch (error) {
    console.error('[experiences] read-only guard could not reach the store:', error)
    res.status(503).json({
      error: 'Temporarily unavailable.',
      detail: 'Generated websites are read-only and are only served over GET.',
    })
    return
  }

  if (!exists) {
    res.status(404).json({ error: 'Surprise not found.' })
    return
  }

  // The website exists. Whether or not it is already LOCKED, the answer is the
  // same: a finalized Cupi website can never be modified through the API.
  res.setHeader('Allow', 'GET, HEAD, OPTIONS')
  res.status(423).json({
    error: 'This website is locked and read-only.',
    status: 'LOCKED',
    locked: true,
    detail:
      'Completed websites are permanent and view-only. They cannot be edited, customized, regenerated or overwritten.',
  })
}

/**
 * GET /experiences/:id
 *
 * The permanent share link. Read-only by contract and served straight from the
 * durable record — there is no TTL, no session, no cookie and no per-request
 * state involved, so the same URL resolves identically forever, from any device
 * or browser, for anyone holding it.
 */
async function handleGetExperience(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string }

  if (!EXPERIENCE_ID_PATTERN.test(id)) {
    res.status(404).json({ error: 'Surprise not found.' })
    return
  }

  // A store outage must be reported as temporary, never as "this website does
  // not exist" — that is exactly what used to make a permanent link look dead.
  let experience
  try {
    experience = await getExperienceById(id)
  } catch (error) {
    console.error('[experiences] could not reach the store:', error)
    res.status(503).json({
      error: 'Temporarily unavailable.',
      detail: 'This website is permanent. Please try again in a moment.',
      retryable: true,
    })
    return
  }

  if (!experience) {
    res.status(404).json({ error: 'Surprise not found.' })
    return
  }

  // Only a finalized website is ever served publicly. An unlocked record is
  // not readable through the share link at all. The record itself is the source
  // of truth here: a second lookup by id would disagree for the legacy
  // order-id form of the URL, where the row is keyed by the slug but the
  // request carries the order id.
  if (experience.status !== 'LOCKED') {
    res.status(423).json({ error: 'This website is not available yet.' })
    return
  }

  // A completed website is immutable, so it is safe to let browsers and proxies
  // hold on to it briefly. This also keeps a cold-starting API from being hit
  // again for the same recipient on every refresh.
  res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=600')
  res.setHeader('X-Cupi-Link', 'permanent')

  res.json({
    id: experience.id,
    templateId: experience.templateId,
    config: experience.config,
    status: experience.status,
    readOnly: true,
    // No `expiresAt` is returned or stored: this link never expires.
    createdAt: experience.createdAt,
    lockedAt: experience.lockedAt,
  })

  // Counted AFTER the website has been delivered, and never awaited: a view
  // counter must not be able to break a share link.
  void incrementViewCount(experience.id)
}

// 4. API routes — mounted both with and without the /api prefix so a client
// base-URL mismatch can never fall through to a 404 / SPA catch-all.
const orderRoutes = express.Router()

// No order row and no FamGateway payment session may exist until the buyer is
// signed in. The middleware resolves the customer from Authorization; the
// handler below uses req.customer and never re-resolves it.
orderRoutes.post('/create', requireCustomerAuth, wrap(handleCreateOrder))
orderRoutes.post('/verify', wrap(handleVerifyOrder))
// The same signed-in buyer as /orders/create; their Store page only ever sees
// orders they placed. A guest gets 401 rather than an empty list.
orderRoutes.post('/mine', requireCustomerAuth, wrap(handleGetMyOrders))

app.use('/api/orders', orderRoutes)
app.use('/orders', orderRoutes)

app.post('/api/famgateway/webhook', wrap(handleFamGatewayWebhook))

// The share-link surface is GET-only. The guard is mounted on the prefix (not
// per-route) so every current and future /experiences sub-path — /:id/config,
// /:id/regenerate, /:id/photos — is covered automatically.
app.use('/api/experiences', wrap(rejectExperienceMutation))
app.use('/experiences', wrap(rejectExperienceMutation))

app.get('/api/experiences/:id', wrap(handleGetExperience))
app.get('/experiences/:id', wrap(handleGetExperience))

app.get('/api/health', handleHealth)
app.get('/health', handleHealth)
app.get('/api/store-status', wrap(handleStoreStatus))

// Public product prices endpoint (read-only for customer-facing website)
async function handleGetProductPrices(_req: Request, res: Response): Promise<void> {
  const prices: Record<string, number> = {}
  for (const templateId of ALLOWED_TEMPLATES) {
    prices[templateId] = await resolvePriceInRupees(templateId)
  }
  res.status(200).json({ prices })
}
app.get('/api/products/prices', wrap(handleGetProductPrices))
app.get('/api/validate-coupon', wrap(handleValidateCoupon))

// Public coupon check for the storefront: quotes the exact amount a buyer will
// be charged. Distinct from the legacy GET above, which the existing checkout UI
// calls and which only reports a multiplier.
app.post('/api/checkout/apply-coupon', wrap(handleApplyCoupon))

// Public audio endpoint
async function handleGetTemplateAudio(req: Request, res: Response): Promise<void> {
  const { templateId } = req.params
  
  if (!ALLOWED_TEMPLATES.includes(templateId)) {
    res.status(404).json({ error: 'Template not found' })
    return
  }

  const audio = await import('./db.js').then(m => m.getTemplateAudio(templateId))
  
  if (!audio || (!audio.audioData && !audio.audioUrl)) {
    res.status(404).json({ error: 'No audio configured for this template' })
    return
  }

  res.status(200).json(audio)
}
app.get('/api/templates/:templateId/audio', wrap(handleGetTemplateAudio))
app.get('/api/audio/:templateId', wrap(handleGetTemplateAudio))

// Super Admin routes - protected by authentication
const adminRouter = createAdminRouter()
app.use('/api/admin', adminRouter)

// Customer authentication is mounted before the static + SPA catch-all, and
// both with and without the /api prefix like the other API routers.
const customerAuthRouter = createCustomerAuthRouter()
app.use('/api/auth', customerAuthRouter)
app.use('/auth', customerAuthRouter)

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

/**
 * Express 4 does not catch rejections from async handlers, so every async route
 * is wrapped. Without this a rejected promise (a database timeout, for example)
 * would hang the request until the client gave up.
 */
export function wrap(
  handler: (req: Request, res: Response, next: (error?: unknown) => void) => Promise<void>,
): (req: Request, res: Response, next: (error?: unknown) => void) => void {
  return (req, res, next) => {
    handler(req, res, next).catch(next)
  }
}

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // Log the real cause server-side; return something safe to the client so a
  // database message (which can carry row contents) never leaks out.
  console.error('[cupi-api]', err)
  if (err instanceof SupabaseStoreError && err.status === 0) {
    res.status(503).json({
      error: 'We could not reach our database. Nothing was saved — please try again.',
      retryable: true,
    })
    return
  }
  res.status(500).json({ error: 'Internal server error.' })
}
app.use(errorHandler)

// 6. Boot. The store is verified BEFORE the server accepts traffic, so a
//    misconfigured or unreachable database can never accept an order or hand
//    out a share link that will not resolve.
void (async () => {
  try {
    await assertStoreReady()
  } catch (error) {
    console.error('[cupi-api] refusing to start:', (error as Error).message)
    process.exit(1)
  }

  app.listen(PORT, HOST, () => {
    console.log(`[cupi-api] listening on http://${HOST}:${PORT}`)
    console.log(`[cupi-api] store: ${activeStoreKind()} (durable: ${isStoreDurable()})`)
    if (!process.env.FAMGATEWAY_API_KEY) {
      console.warn(
        '[cupi-api] FAMGATEWAY_API_KEY not set — checkout will be unavailable until configured in .env',
      )
    }
  })
})()
