/**
 * Influencer & affiliate routes, all behind Super Admin bearer auth.
 *
 * Split out of adminRoutes.ts because the influencer surface is self-contained:
 * storage, pricing and validation live elsewhere, so this file is only HTTP
 * plumbing plus input validation.
 */

import express from 'express'
import type { Request, Response } from 'express'
import {
  createInfluencer,
  deleteInfluencer,
  getInfluencerByCode,
  getInfluencerById,
  getInfluencerMetrics,
  listInfluencers,
  updateInfluencer,
} from './db.js'
import {
  effectiveStatus,
  isValidCodeFormat,
  isValidEmail,
  isValidExpiryDate,
  isValidPercent,
  MAX_CODE_LENGTH,
  normalizeCode,
  priceOrder,
  round2,
  suggestCodeFromName,
} from './influencers.js'
import type {
  CreateInfluencerInput,
  InfluencerRecord,
  UpdateInfluencerInput,
} from './store.js'

/** Shape returned to the dashboard: the record plus derived status and metrics. */
export interface InfluencerView {
  id: string
  name: string
  email: string | null
  phone: string | null
  uniqueCode: string
  discountPercentage: number
  commissionPercentage: number
  expiryDate: string | null
  /** 'expired' is derived from expiryDate; the stored value is never 'expired'. */
  status: 'active' | 'paused' | 'expired'
  createdAt: string
  updatedAt: string
  totalOrders: number
  totalRevenueGenerated: number
  totalDiscountGiven: number
  commissionOwed: number
}

export function toInfluencerView(
  influencer: InfluencerRecord,
  metrics?: { totalOrders: number; totalRevenueGenerated: number; totalDiscountGiven: number; commissionOwed: number },
): InfluencerView {
  // The dashboard's chips know active / paused / expired. 'deleted' happens
  // only the moment a partner is removed, and the operator-facing view treats a
  // removed partner exactly like one whose code ran its course.
  const rawStatus = effectiveStatus(influencer)
  const status: InfluencerView['status'] = rawStatus === 'deleted' ? 'expired' : rawStatus
  return {
    id: influencer.id,
    name: influencer.name,
    email: influencer.email,
    phone: influencer.phone,
    uniqueCode: influencer.uniqueCode,
    discountPercentage: influencer.discountPercentage,
    commissionPercentage: influencer.commissionPercentage,
    expiryDate: influencer.expiryDate,
    status,
    createdAt: influencer.createdAt,
    updatedAt: influencer.updatedAt,
    totalOrders: metrics?.totalOrders ?? 0,
    totalRevenueGenerated: metrics?.totalRevenueGenerated ?? 0,
    totalDiscountGiven: metrics?.totalDiscountGiven ?? 0,
    commissionOwed: metrics?.commissionOwed ?? 0,
  }
}

/** Portfolio-level totals for the summary cards. */
function summarize(views: InfluencerView[]) {
  const active = views.filter((view) => view.status === 'active').length
  return {
    totalInfluencers: views.length,
    activeInfluencers: active,
    pausedInfluencers: views.filter((view) => view.status === 'paused').length,
    expiredInfluencers: views.filter((view) => view.status === 'expired').length,
    totalOrders: views.reduce((sum, view) => sum + view.totalOrders, 0),
    totalRevenueGenerated: round2(
      views.reduce((sum, view) => sum + view.totalRevenueGenerated, 0),
    ),
    totalDiscountGiven: round2(
      views.reduce((sum, view) => sum + view.totalDiscountGiven, 0),
    ),
    // Every commission Cupi has ever accrued to a partner. There is no payout
    // table, so this is "owed" rather than "paid"; see notes in the module header.
    totalCommissionOwed: round2(
      views.reduce((sum, view) => sum + view.commissionOwed, 0),
    ),
  }
}

class ValidationError extends Error {}

function asTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function validateName(value: unknown): string {
  const name = asTrimmedString(value)
  if (!name) throw new ValidationError('Name is required.')
  if (name.length > 120) throw new ValidationError('Name must be 120 characters or fewer.')
  return name
}

function validateEmail(value: unknown): string | null {
  if (value === undefined || value === null || value === '') return null
  const email = asTrimmedString(value)
  if (!isValidEmail(email)) throw new ValidationError('That email address is not valid.')
  if (email.length > 254) throw new ValidationError('Email must be 254 characters or fewer.')
  return email
}

function validatePhone(value: unknown): string | null {
  if (value === undefined || value === null || value === '') return null
  const phone = asTrimmedString(value)
  if (phone.length > 32) throw new ValidationError('Phone must be 32 characters or fewer.')
  return phone
}

function validateCode(value: unknown): string {
  const code = normalizeCode(asTrimmedString(value))
  if (!isValidCodeFormat(code)) {
    throw new ValidationError(
      `Code must be 3-${MAX_CODE_LENGTH} characters using letters, numbers, dashes or underscores.`,
    )
  }
  return code
}

function validatePercent(value: unknown, field: string): number {
  if (!isValidPercent(value)) {
    throw new ValidationError(`${field} must be a number between 0 and 100.`)
  }
  // Two decimals match numeric(5,2) in the schema, so the dashboard and the
  // database cannot disagree on a stored rate.
  return round2(value)
}

function validateExpiry(value: unknown): string | null {
  if (value === undefined || value === null || value === '') return null
  const expiry = asTrimmedString(value)
  if (!isValidExpiryDate(expiry)) {
    throw new ValidationError('Expiry date must be a valid YYYY-MM-DD date.')
  }
  return expiry
}

function validateStatus(value: unknown): 'active' | 'paused' {
  if (value === 'active' || value === 'paused') return value
  throw new ValidationError('Status must be "active" or "paused".')
}

/**
 * Picks a code that is not already taken.
 *
 * Uniqueness is enforced by the database too; this only avoids a pointless 409
 * on the common case where an operator has not typed a code of their own.
 */
async function pickAvailableCode(desired: string): Promise<string> {
  if (!(await getInfluencerByCode(desired))) return desired

  for (let suffix = 2; suffix <= 50; suffix += 1) {
    const suffixText = String(suffix)
    const base = desired.slice(0, MAX_CODE_LENGTH - suffixText.length - 1)
    const candidate = `${base}${suffixText}`
    if (!(await getInfluencerByCode(candidate))) return candidate
  }
  throw new ValidationError('Could not allocate a unique code. Please enter one manually.')
}

/**
 * Wraps a handler so a rejected field becomes a 400 with a readable message,
 * while anything unexpected still reaches the global error handler as a 500.
 */
function handle(
  handler: (req: Request, res: Response) => Promise<void>,
): (req: Request, res: Response, next: (error?: unknown) => void) => void {
  return (req, res, next) => {
    handler(req, res).catch((error: unknown) => {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message })
        return
      }
      next(error)
    })
  }
}

/**
 * GET /api/admin/influencers
 *
 * Every influencer with aggregated metrics over their PAID orders.
 */
async function handleListInfluencers(_req: Request, res: Response): Promise<void> {
  const [influencers, metrics] = await Promise.all([
    listInfluencers(),
    getInfluencerMetrics(),
  ])

  const views = influencers.map((influencer) =>
    toInfluencerView(influencer, metrics.get(influencer.id)),
  )

  res.status(200).json({
    success: true,
    influencers: views,
    summary: summarize(views),
  })
}

/**
 * GET /api/admin/influencers/:id
 */
async function handleGetInfluencer(req: Request, res: Response): Promise<void> {
  const { id } = req.params
  const influencer = await getInfluencerById(id)
  if (!influencer) {
    res.status(404).json({ error: 'Influencer not found.' })
    return
  }

  const metrics = await getInfluencerMetrics()
  res.status(200).json({
    success: true,
    influencer: toInfluencerView(influencer, metrics.get(influencer.id)),
  })
}

/**
 * POST /api/admin/influencers
 *
 * Creates a partner. A blank code is generated from the name and de-duplicated.
 */
async function handleCreateInfluencer(req: Request, res: Response): Promise<void> {
  const body = req.body as Record<string, unknown>

  const name = validateName(body.name)
  const email = validateEmail(body.email)
  const phone = validatePhone(body.phone)
  const discountPercentage = validatePercent(body.discountPercentage ?? 0, 'Discount')
  const commissionPercentage = validatePercent(
    body.commissionPercentage ?? 0,
    'Commission',
  )
  const expiryDate = validateExpiry(body.expiryDate)
  const status = body.status === undefined ? 'active' : validateStatus(body.status)

  const rawCode = asTrimmedString(body.uniqueCode)
  const desired = rawCode ? validateCode(rawCode) : suggestCodeFromName(name)
  const uniqueCode = await pickAvailableCode(desired)

  const input: CreateInfluencerInput = {
    name,
    email,
    phone,
    uniqueCode,
    discountPercentage,
    commissionPercentage,
    expiryDate,
    status,
  }

  const created = await createInfluencer(input)
  res.status(201).json({
    success: true,
    influencer: toInfluencerView(created),
  })
}

/**
 * PUT /api/admin/influencers/:id
 *
 * Partial update: only the keys present in the body are changed, so a caller can
 * toggle status without resending rates.
 *
 * Editing a commission rate affects only FUTURE orders. Past orders keep the
 * snapshot they were created with, so the books cannot change retroactively under
 * a partner who has already been paid.
 */
async function handleUpdateInfluencer(req: Request, res: Response): Promise<void> {
  const { id } = req.params
  const body = req.body as Record<string, unknown>

  const existing = await getInfluencerById(id)
  if (!existing) {
    res.status(404).json({ error: 'Influencer not found.' })
    return
  }

  const input: UpdateInfluencerInput = {}

  if (body.name !== undefined) input.name = validateName(body.name)
  if (body.email !== undefined) input.email = validateEmail(body.email)
  if (body.phone !== undefined) input.phone = validatePhone(body.phone)
  if (body.discountPercentage !== undefined) {
    input.discountPercentage = validatePercent(body.discountPercentage, 'Discount')
  }
  if (body.commissionPercentage !== undefined) {
    input.commissionPercentage = validatePercent(body.commissionPercentage, 'Commission')
  }
  if (body.expiryDate !== undefined) input.expiryDate = validateExpiry(body.expiryDate)
  if (body.status !== undefined) input.status = validateStatus(body.status)

  if (body.uniqueCode !== undefined && asTrimmedString(body.uniqueCode)) {
    const code = validateCode(body.uniqueCode)
    if (code !== existing.uniqueCode) {
      const owner = await getInfluencerByCode(code)
      if (owner && owner.id !== existing.id) {
        res.status(409).json({ error: `Code "${code}" is already used by another influencer.` })
        return
      }
      input.uniqueCode = code
    }
  }

  const updated = await updateInfluencer(id, input)
  if (!updated) {
    res.status(404).json({ error: 'Influencer not found.' })
    return
  }

  const metrics = await getInfluencerMetrics()
  res.status(200).json({
    success: true,
    influencer: toInfluencerView(updated, metrics.get(updated.id)),
  })
}

/**
 * DELETE /api/admin/influencers/:id
 *
 * Removes the partner. Past orders keep their coupon_code and money snapshots
 * (the FK nulls only the link), so past payouts stay auditable. A partner with
 * recorded sales can instead be paused, which stops new attributions while
 * keeping their history intact.
 */
async function handleDeleteInfluencer(req: Request, res: Response): Promise<void> {
  const { id } = req.params
  const deleted = await deleteInfluencer(id)
  if (!deleted) {
    res.status(404).json({ error: 'Influencer not found.' })
    return
  }
  res.status(200).json({ success: true, id })
}

/**
 * POST /api/admin/influencers/preview
 *
 * Prices an order the way checkout would, for the dashboard to confirm a change
 * before it goes live. Reads the same rules as the checkout path, so what an
 * operator sees here is what a buyer will be charged.
 */
async function handlePreviewInfluencer(req: Request, res: Response): Promise<void> {
  const body = req.body as Record<string, unknown>
  const amount = Number(body.amount)
  if (!Number.isFinite(amount) || amount <= 0) {
    res.status(400).json({ error: 'Amount must be a positive number.' })
    return
  }

  const discountPercentage = validatePercent(body.discountPercentage ?? 0, 'Discount')
  const commissionPercentage = validatePercent(body.commissionPercentage ?? 0, 'Commission')

  res.json({
    success: true,
    ...priceOrder({ baseAmount: amount, discountPercentage, commissionPercentage }),
  })
}

export function registerInfluencerRoutes(router: express.Router): void {
  // Declared before '/:id' so the literal path is not captured as an id.
  router.post('/influencers/preview', handle(handlePreviewInfluencer))
  router.get('/influencers', handle(handleListInfluencers))
  router.post('/influencers', handle(handleCreateInfluencer))
  router.get('/influencers/:id', handle(handleGetInfluencer))
  router.put('/influencers/:id', handle(handleUpdateInfluencer))
  router.delete('/influencers/:id', handle(handleDeleteInfluencer))
}
