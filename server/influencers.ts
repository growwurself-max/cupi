/**
 * Influencer & affiliate domain rules.
 *
 * Kept free of Express and of the storage layer so the money arithmetic can be
 * unit-tested directly, and so there is exactly ONE place where a discount or a
 * commission is computed — the checkout path, the public coupon check and the
 * admin preview must never disagree about what a code is worth.
 */

import type { InfluencerRecord, InfluencerStatus } from './store.js'

/** Longest accepted referral code. Short enough to type on a phone. */
export const MAX_CODE_LENGTH = 24

/** Discount/commission are percentages; a nonsensical value is rejected, not clamped. */
export const MAX_PERCENT = 100

/**
 * Normalizes a referral code for comparison and storage.
 *
 * Upper-casing is what makes `shafey20`, `ShafEY20` and ` SHAFEY20 ` the same
 * code. Without it a buyer could be credited to a different partner than the
 * one whose link they clicked.
 */
export function normalizeCode(code: string): string {
  return code.trim().toUpperCase()
}

const CODE_ALLOWED = /^[A-Z0-9_-]+$/

export function isValidCodeFormat(code: string): boolean {
  return (
    code.length >= 3 &&
    code.length <= MAX_CODE_LENGTH &&
    CODE_ALLOWED.test(code)
  )
}

/**
 * Produces a readable code from a name: "Shafey Rahman" -> "SHAFEY20".
 *
 * Only used when the operator does not supply a code of their own. It may
 * collide with an existing one; `uniqueCodeIsTaken` lets the caller retry.
 */
export function suggestCodeFromName(name: string, suffix = '20'): string {
  const letters = normalizeCode(name).replace(/[^A-Z]/g, '')
  // Ambiguous characters are dropped rather than substituted: "SHAFEY" is a far
  // better handle than "5HAFEY", and the numeric suffix keeps it unique.
  const cleaned = letters.replace(/[OIL]/g, '')
  const stem = (cleaned || letters || 'CUPI').slice(0, MAX_CODE_LENGTH - suffix.length - 1)
  return `${stem}${suffix}`
}

export function isValidPercent(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= MAX_PERCENT
}

/** `YYYY-MM-DD`, the only date format accepted for an expiry. */
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

export function isValidExpiryDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false
  const parsed = Date.parse(`${value}T00:00:00.000Z`)
  if (!Number.isFinite(parsed)) return false
  // Reject impossible calendar dates that Date.parse silently rolls over.
  return new Date(parsed).toISOString().slice(0, 10) === value
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function isValidEmail(value: string): boolean {
  return EMAIL.test(value)
}

/**
 * Whether a code can still be redeemed right now.
 *
 * Expiry is inclusive of the whole day: a coupon that expires "2026-03-01" is
 * still good at 23:59 on the 1st, which is what an operator means by it.
 */
export function isRedeemable(
  influencer: Pick<InfluencerRecord, 'status' | 'expiryDate'>,
  now: Date = new Date(),
): boolean {
  if (influencer.status !== 'active') return false
  if (!influencer.expiryDate) return true
  const expiry = Date.parse(`${influencer.expiryDate}T23:59:59.999Z`)
  if (!Number.isFinite(expiry)) return false
  return now.getTime() <= expiry
}

/** Operator-facing status: 'expired' is derived, never stored. */
export type EffectiveInfluencerStatus = InfluencerStatus | 'expired'

export function effectiveStatus(
  influencer: Pick<InfluencerRecord, 'status' | 'expiryDate'>,
  now: Date = new Date(),
): EffectiveInfluencerStatus {
  if (influencer.status !== 'active') return influencer.status
  if (!influencer.expiryDate) return 'active'
  const expiry = Date.parse(`${influencer.expiryDate}T23:59:59.999Z`)
  if (Number.isFinite(expiry) && now.getTime() > expiry) return 'expired'
  return 'active'
}

export interface PricedOrder {
  /** Price before discount. */
  originalAmount: number
  /** Amount actually charged to the buyer. */
  amount: number
  discountGiven: number
  /** Commission owed to the partner. */
  commissionEarned: number
  /** What Cupi keeps after both the discount and the commission. */
  netRevenue: number
}

/**
 * The single pricing function for the whole platform.
 *
 * Money is rounded to whole paise-and-rupees at each step (see `round2`) and
 * every derived amount is computed from the ROUNDED charge, not from the list
 * price. Otherwise the three numbers could fail to reconcile — e.g. an
 * influencer could be credited commission on money that no buyer ever paid,
 * which is precisely the kind of rounding leak an affiliate dispute is about.
 *
 * Commission is a share of NET revenue (post-discount), never of gross:
 * paying 20% of the pre-discount total on a 40%-off order would cost Cupi
 * margin on revenue it never received.
 */
export function priceOrder(input: {
  baseAmount: number
  discountPercentage: number
  commissionPercentage: number
}): PricedOrder {
  const base = round2(input.baseAmount)
  if (!Number.isFinite(base) || base < 0) {
    throw new Error('baseAmount must be a non-negative number')
  }

  const discount = clampPercent(input.discountPercentage)
  const commission = clampPercent(input.commissionPercentage)

  const discountGiven = round2((base * discount) / 100)
  // A 100% discount would make the order free; the gateway rejects ₹0 orders,
  // so the charge floors at one rupee.
  const amount = Math.max(1, round2(base - discountGiven))

  // Commission is computed on what was actually charged.
  const commissionEarned = round2((amount * commission) / 100)
  const netRevenue = round2(amount - commissionEarned)

  return { originalAmount: base, amount, discountGiven, commissionEarned, netRevenue }
}

/**
 * Two-decimal rounding. Rupee amounts are floats here (the store stores
 * numeric(12,2)), so every value that leaves this module passes through this to
 * avoid values like 88.79999999999998 reaching the gateway.
 */
export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0
  return Math.min(value, MAX_PERCENT)
}

/** Why a code was refused, so the public endpoint can say something useful. */
export type CouponRejection =
  | 'INVALID_FORMAT'
  | 'NOT_FOUND'
  | 'PAUSED'
  | 'EXPIRED'

export interface CouponResolution {
  valid: boolean
  reason?: CouponRejection
  influencer?: InfluencerRecord
  /** True when the code is real but not currently redeemable. */
  knownButUnavailable?: boolean
}

export function resolveCoupon(
  code: string,
  influencer: InfluencerRecord | null,
  now: Date = new Date(),
): CouponResolution {
  const normalized = normalizeCode(code)
  if (!isValidCodeFormat(normalized)) {
    return { valid: false, reason: 'INVALID_FORMAT' }
  }
  if (!influencer) {
    return { valid: false, reason: 'NOT_FOUND' }
  }
  if (influencer.status !== 'active') {
    return { valid: false, reason: 'PAUSED', influencer, knownButUnavailable: true }
  }
  if (!isRedeemable(influencer, now)) {
    return { valid: false, reason: 'EXPIRED', influencer, knownButUnavailable: true }
  }
  return { valid: true, influencer }
}

export const REJECTION_MESSAGES: Record<CouponRejection, string> = {
  INVALID_FORMAT: 'That code does not look right.',
  NOT_FOUND: 'That code is not valid.',
  PAUSED: 'That code has been paused.',
  EXPIRED: 'That code has expired.',
}

/**
 * UTM/ref parameters worth persisting. Everything else in a query string is
 * dropped: it is unbounded, attacker-controlled, and has no reporting use here.
 */
const TRACKED_SOURCE_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
] as const

export const MAX_TRAFFIC_SOURCE_LENGTH = 200

export function normalizeTrafficSource(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const trimmed = raw.trim()
  if (!trimmed) return null

  try {
    const params = new URLSearchParams(
      trimmed.includes('?') ? trimmed.slice(trimmed.indexOf('?') + 1) : trimmed,
    )
    const parts = TRACKED_SOURCE_KEYS.map((key) => {
      const value = params.get(key)?.trim()
      return value ? `${key}=${value}` : null
    }).filter((part): part is string => part !== null)

    if (parts.length > 0) return truncate(parts.join('&'))
  } catch {
    // Fall through and store the raw (bounded) string.
  }

  return truncate(trimmed)
}

function truncate(value: string): string {
  return value.length > MAX_TRAFFIC_SOURCE_LENGTH
    ? value.slice(0, MAX_TRAFFIC_SOURCE_LENGTH)
    : value
}

/**
 * Stores only the client IP as reported by Express, never a raw `x-forwarded-for`
 * chain, which a caller can set to any value.
 */
export function normalizeIp(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const trimmed = raw.trim()
  if (!trimmed) return null
  return trimmed.length <= 45 ? trimmed : trimmed.slice(0, 45)
}