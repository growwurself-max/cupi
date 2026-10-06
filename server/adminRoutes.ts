import express from 'express'
import type { Request, Response } from 'express'
import { ALLOWED_TEMPLATES, PHOTO_LIMITS } from './config.js'
import { requireAdminAuth } from './adminAuth.js'
import { legacyCouponDiscountPercentage, resolvePriceInRupees, wrap } from './index.js'
import {
  countCouponRedemptions,
  createCoupon,
  deleteCoupon,
  getCouponByCode,
  getCouponRedemptionCounts,
  getInfluencerByCode,
  getTemplateAudio,
  listCoupons,
  setTemplateAudio,
  updateCoupon,
  updateProductPrice,
} from './db.js'
import {
  couponState,
  isCouponCodeFormatValid,
  normalizeCouponCode,
  parseCouponInstant,
  parseCouponKind,
  parseCouponStatus,
} from './coupons.js'
import { isValidPercent } from './influencers.js'
import { SupabaseStoreError } from './supabase.js'
import { registerInfluencerRoutes } from './influencerRoutes.js'
import type { CouponKind, CouponRecord, CouponStatus } from './store.js'

/**
 * GET /api/admin/products
 *
 * Returns all available products/themes with their current pricing and configuration.
 * Requires Super Admin authentication.
 */
async function handleGetProducts(_req: Request, res: Response): Promise<void> {
  const products = []
  for (const templateId of ALLOWED_TEMPLATES) {
    const price = await resolvePriceInRupees(templateId)
    const audio = await getTemplateAudio(templateId)
    products.push({
      id: templateId,
      price,
      photoLimit: PHOTO_LIMITS[templateId] ?? 0,
      hasAudioData: !!audio?.audioData,
      audioUrl: audio?.audioUrl || null,
    })
  }

  res.status(200).json({
    success: true,
    products,
  })
}

/**
 * GET /api/admin/stats
 *
 * Returns basic statistics about the Cupi platform.
 * Requires Super Admin authentication.
 */
async function handleGetStats(_req: Request, res: Response): Promise<void> {
  // Import dynamically to avoid circular dependency
  const { countExperiences } = await import('./db.js')

  const experienceCount = await countExperiences()

  res.status(200).json({
    success: true,
    stats: {
      totalTemplates: ALLOWED_TEMPLATES.length,
      totalExperiences: experienceCount,
    },
  })
}

/**
 * PUT /api/admin/products/:templateId/price
 *
 * Updates the price for a specific template.
 * Requires Super Admin authentication.
 */
async function handleUpdateProductPrice(
  req: Request,
  res: Response,
): Promise<void> {
  const { templateId } = req.params
  const { price } = req.body

  if (!templateId || typeof templateId !== 'string') {
    res.status(400).json({ error: 'Invalid template ID' })
    return
  }

  if (!ALLOWED_TEMPLATES.includes(templateId)) {
    res.status(400).json({ error: `Unknown template ID: "${templateId}"` })
    return
  }

  if (typeof price !== 'number' || isNaN(price) || price < 0) {
    res.status(400).json({ error: 'Invalid price. Must be a non-negative number.' })
    return
  }

  try {
    const updatedPrice = await updateProductPrice(templateId, price)
    res.status(200).json({
      success: true,
      templateId,
      price: updatedPrice,
    })
  } catch (error) {
    console.error('[admin] Failed to update product price:', error)
    res.status(500).json({ error: 'Failed to update price' })
  }
}

/**
 * POST /api/admin/audio/:templateId
 *
 * Updates the audio for a specific template.
 * Requires Super Admin authentication.
 */
async function handleUpdateAudio(req: Request, res: Response): Promise<void> {
  const { templateId } = req.params
  const { audioData, audioUrl } = req.body

  if (!templateId || typeof templateId !== 'string') {
    res.status(400).json({ error: 'Invalid template ID' })
    return
  }

  if (!ALLOWED_TEMPLATES.includes(templateId)) {
    res.status(400).json({ error: `Unknown template ID: "${templateId}"` })
    return
  }

  try {
    await setTemplateAudio(
      templateId,
      audioData || null,
      audioUrl || null
    )
    res.status(200).json({ success: true, templateId })
  } catch (error) {
    console.error('[admin] Failed to update audio:', error)
    res.status(500).json({ error: 'Failed to update audio' })
  }
}

/**
 * GET /api/admin/audio
 *
 * Returns all audio settings for templates.
 */
async function handleGetAudio(_req: Request, res: Response): Promise<void> {
  const { getTemplateAudio } = await import('./db.js')
  const audioMap: Record<string, any> = {}
  for (const templateId of ALLOWED_TEMPLATES) {
    const audio = await getTemplateAudio(templateId)
    if (audio) {
      audioMap[templateId] = {
        hasAudioData: !!audio.audioData,
        audioUrl: audio.audioUrl || null,
      }
    } else {
      audioMap[templateId] = null
    }
  }
  res.status(200).json({ success: true, audio: audioMap })
}

/**
 * Coupon administration.
 *
 * Codes live in their own table/namespace and never touch the partner
 * (influencer) machinery: a campaign coupon pays nobody a commission, so it
 * cannot be created through, or accidentally collide with, an affiliate code.
 */

/** Extracted admin view: the stored record plus its derived, live fields. */
function couponView(coupon: CouponRecord, redemptionsUsed: number): Record<string, unknown> {
  return {
    ...coupon,
    redemptionsUsed,
    state: couponState(coupon, { redemptionsUsed }),
  }
}

type CouponFields = {
  kind?: CouponKind
  value?: number
  appliesTo?: string[]
  minAmount?: number
  maxRedemptions?: number | null
  startsAt?: string | null
  expiresAt?: string | null
  status?: CouponStatus
}

type FieldParse =
  | { ok: true; fields: CouponFields }
  | { ok: false; error: string }

/**
 * Reads coupon fields from an admin body.
 *
 * With `required` (create) the discount itself is mandatory and `kind` defaults
 * to `percent`; without it (update) only the keys present are parsed, so a
 * partial update never overwrites a value the operator did not send. A
 * `null`/empty start or expiry clears it; an unparseable instant is a 400, not
 * a silent null that would turn a campaign permanent.
 */
function parseCouponFields(body: Record<string, unknown>, required: boolean): FieldParse {
  const fields: CouponFields = {}

  if (body.kind !== undefined) {
    const kind = parseCouponKind(body.kind)
    if (!kind) return { ok: false, error: 'kind must be "percent" or "flat".' }
    fields.kind = kind
  } else if (required) {
    fields.kind = 'percent'
  }

  if (body.value !== undefined) {
    const value = Number(body.value)
    if (!Number.isFinite(value) || value <= 0) {
      return { ok: false, error: 'value must be a positive number.' }
    }
    // Cap checked against the kind known here (create always knows it).
    // An update that does not resend `kind` is re-checked against the merged
    // record by the caller, so a flat coupon can still take a large rupee value.
    if (fields.kind === 'percent' && !isValidPercent(value)) {
      return { ok: false, error: 'A percentage discount must be between 0 and 100.' }
    }
    fields.value = value
  } else if (required) {
    return { ok: false, error: 'value is required.' }
  }

  if (body.appliesTo !== undefined) {
    if (body.appliesTo === null) {
      fields.appliesTo = []
    } else if (Array.isArray(body.appliesTo)) {
      const templates: string[] = []
      for (const entry of body.appliesTo) {
        if (typeof entry !== 'string' || !ALLOWED_TEMPLATES.includes(entry)) {
          return { ok: false, error: `appliesTo contains an unknown template ID.` }
        }
        templates.push(entry)
      }
      fields.appliesTo = templates
    } else {
      return { ok: false, error: 'appliesTo must be an array of template IDs.' }
    }
  }

  if (body.minAmount !== undefined) {
    const minAmount = Number(body.minAmount)
    if (!Number.isFinite(minAmount) || minAmount < 0) {
      return { ok: false, error: 'minAmount must be a non-negative number.' }
    }
    fields.minAmount = minAmount
  }

  if (body.maxRedemptions !== undefined) {
    if (body.maxRedemptions === null) {
      fields.maxRedemptions = null
    } else {
      const max = Number(body.maxRedemptions)
      if (!Number.isInteger(max) || max < 1) {
        return { ok: false, error: 'maxRedemptions must be a positive integer or null.' }
      }
      fields.maxRedemptions = max
    }
  }

  for (const [key, endOfDay] of [
    ['startsAt', false],
    ['expiresAt', true],
  ] as const) {
    const raw = body[key]
    if (raw === undefined) continue
    if (raw === null || (typeof raw === 'string' && !raw.trim())) {
      if (key === 'startsAt') fields.startsAt = null
      else fields.expiresAt = null
      continue
    }
    if (typeof raw !== 'string') {
      return { ok: false, error: `${key} must be an ISO date string or null.` }
    }
    const instant = parseCouponInstant(raw, { endOfDay })
    if (!instant) {
      return { ok: false, error: `${key} is not a valid date.` }
    }
    if (key === 'startsAt') fields.startsAt = instant
    else fields.expiresAt = instant
  }

  if (body.status !== undefined) {
    const status = parseCouponStatus(body.status)
    if (!status) return { ok: false, error: 'status must be "active", "paused" or "deleted".' }
    fields.status = status
  }

  return { ok: true, fields }
}

/** Rejects a schedule that could never run (end at or before its start). */
function scheduleError(startsAt: string | null, expiresAt: string | null): string | null {
  if (!startsAt || !expiresAt) return null
  return Date.parse(startsAt) >= Date.parse(expiresAt)
    ? 'expiresAt must be after startsAt.'
    : null
}

/**
 * GET /api/admin/coupons
 *
 * Lists every campaign coupon, newest first, each with its live redemption
 * count and derived state — paused/scheduled/expired/exhausted — so the
 * dashboard never has to re-derive them client-side.
 */
async function handleListCoupons(_req: Request, res: Response): Promise<void> {
  const [coupons, counts] = await Promise.all([
    listCoupons(),
    getCouponRedemptionCounts(),
  ])

  res.status(200).json({
    success: true,
    coupons: coupons.map((coupon) => couponView(coupon, counts.get(coupon.code) ?? 0)),
  })
}

/**
 * POST /api/admin/coupons
 *
 * Creates a campaign coupon. The code is the primary key, so a duplicate is a
 * 409 rather than an overwrite — silently reusing a code would reprice orders
 * an operator thought were finished.
 */
async function handleCreateCoupon(req: Request, res: Response): Promise<void> {
  const body = (req.body ?? {}) as Record<string, unknown>

  const code = typeof body.code === 'string' ? normalizeCouponCode(body.code) : ''
  if (!code) {
    res.status(400).json({ error: 'code is required.' })
    return
  }
  if (!isCouponCodeFormatValid(code)) {
    res.status(400).json({
      error: 'A code must be 3-24 characters using only letters, numbers, "_" or "-".',
    })
    return
  }

  const parsed = parseCouponFields(body, true)
  if (!parsed.ok) {
    res.status(400).json({ error: parsed.error })
    return
  }
  const fields = parsed.fields

  const scheduleProblem = scheduleError(fields.startsAt ?? null, fields.expiresAt ?? null)
  if (scheduleProblem) {
    res.status(400).json({ error: scheduleProblem })
    return
  }

  // The three namespaces share one input box, so a collision is refused here
  // rather than shadowing a partner's attribution at checkout.
  if (await getCouponByCode(code)) {
    res.status(409).json({ error: `The code "${code}" already exists.` })
    return
  }
  if (await getInfluencerByCode(code)) {
    res.status(409).json({ error: `The code "${code}" is already used by a partner referral code.` })
    return
  }
  if (legacyCouponDiscountPercentage(code) !== null) {
    res.status(409).json({ error: `The code "${code}" is a reserved campaign code.` })
    return
  }

  try {
    const coupon = await createCoupon({
      code,
      kind: fields.kind ?? 'percent',
      value: fields.value as number,
      appliesTo: fields.appliesTo ?? [],
      minAmount: fields.minAmount ?? 0,
      maxRedemptions: fields.maxRedemptions ?? null,
      startsAt: fields.startsAt ?? null,
      expiresAt: fields.expiresAt ?? null,
      status: fields.status ?? 'active',
    })
    res.status(201).json({ success: true, coupon: couponView(coupon, 0) })
  } catch (error) {
    // The primary key (and, on Postgres, the same check re-run server-side)
    // makes this a race between two simultaneous creates of one code.
    if (error instanceof SupabaseStoreError && (error.status === 409 || error.code === '23505')) {
      res.status(409).json({ error: `The code "${code}" already exists.` })
      return
    }
    throw error
  }
}

/**
 * PUT /api/admin/coupons/:code
 * PATCH /api/admin/coupons/:code
 *
 * Partial update of an existing coupon. The code itself is immutable: renaming
 * it would leave past orders pointing at a code that no longer resolves.
 */
async function handleUpdateCoupon(req: Request, res: Response): Promise<void> {
  const rawCode = typeof req.params.code === 'string' ? req.params.code : ''
  const code = normalizeCouponCode(rawCode)

  const existing = await getCouponByCode(code)
  if (!existing) {
    res.status(404).json({ error: `No coupon with the code "${code}".` })
    return
  }

  const body = (req.body ?? {}) as Record<string, unknown>
  if (typeof body.code === 'string' && normalizeCouponCode(body.code) !== existing.code) {
    res.status(400).json({ error: 'A coupon code cannot be renamed. Create a new coupon instead.' })
    return
  }

  const parsed = parseCouponFields(body, false)
  if (!parsed.ok) {
    res.status(400).json({ error: parsed.error })
    return
  }
  const fields = parsed.fields

  // Validate the MERGED record: an update that only changes `value` must still
  // satisfy the cap of the kind it already has (e.g. a percent coupon cannot
  // become 150% off through two individually-plausible edits).
  const mergedKind = fields.kind ?? existing.kind
  const mergedValue = fields.value ?? existing.value
  if (mergedKind === 'percent' && !isValidPercent(mergedValue)) {
    res.status(400).json({ error: 'A percentage discount must be between 0 and 100.' })
    return
  }

  const mergedStart = fields.startsAt !== undefined ? fields.startsAt : existing.startsAt
  const mergedExpiry = fields.expiresAt !== undefined ? fields.expiresAt : existing.expiresAt
  const scheduleProblem = scheduleError(mergedStart, mergedExpiry)
  if (scheduleProblem) {
    res.status(400).json({ error: scheduleProblem })
    return
  }

  const coupon = await updateCoupon(existing.code, fields)
  if (!coupon) {
    res.status(404).json({ error: `No coupon with the code "${code}".` })
    return
  }

  const redemptionsUsed = await countCouponRedemptions(coupon.code)
  res.status(200).json({ success: true, coupon: couponView(coupon, redemptionsUsed) })
}

/**
 * DELETE /api/admin/coupons/:code
 *
 * Hard delete. Orders keep their `coupon_code` and money snapshots, exactly as
 * they do when a partner is deleted: attribution is a text snapshot, never a
 * live foreign key.
 */
async function handleDeleteCoupon(req: Request, res: Response): Promise<void> {
  const code = normalizeCouponCode(typeof req.params.code === 'string' ? req.params.code : '')
  const deleted = await deleteCoupon(code)
  if (!deleted) {
    res.status(404).json({ error: `No coupon with the code "${code}".` })
    return
  }
  res.status(200).json({ success: true, code })
}

/**
 * Create and return the admin router with all protected routes.
 */
export function createAdminRouter() {
  const router = express.Router()

  // Apply auth middleware to all admin routes
  router.use(requireAdminAuth)

  router.get('/products', wrap(handleGetProducts))
  router.get('/stats', wrap(handleGetStats))
  router.put('/products/:templateId/price', wrap(handleUpdateProductPrice))
  router.get('/audio', wrap(handleGetAudio))
  router.post('/audio/:templateId', wrap(handleUpdateAudio))

  // Generic campaign coupons. PATCH and PUT are the same partial-update
  // handler; DELETE is a hard delete (orders keep their snapshots).
  router.get('/coupons', wrap(handleListCoupons))
  router.post('/coupons', wrap(handleCreateCoupon))
  router.put('/coupons/:code', wrap(handleUpdateCoupon))
  router.patch('/coupons/:code', wrap(handleUpdateCoupon))
  router.delete('/coupons/:code', wrap(handleDeleteCoupon))

  // Every influencer route is mounted under the same router, which already has
  // requireAdminAuth applied, so none of them can be reached unauthenticated.
  registerInfluencerRoutes(router)

  return router
}
