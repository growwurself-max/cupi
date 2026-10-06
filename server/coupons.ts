/**
 * Generic customer coupon rules (campaign codes in `cupi_coupons`).
 *
 * Partner/referral codes are a different species and stay in `influencers.ts`;
 * this module owns only the codes an operator creates directly. It is kept free
 * of Express and of the storage layer, exactly like the influencer module, so
 * that checkout, the public quote endpoints and the admin dashboard can never
 * disagree about what a code is worth.
 *
 * Resolution order when a buyer types ANY code lives in `index.ts`:
 *   partner code  ->  generic coupon  ->  legacy campaign code
 * A partner always wins, because dropping a real affiliate's attribution in
 * favour of an operator's campaign code would silently cost someone money.
 */

import { isValidCodeFormat, normalizeCode, round2 } from './influencers.js'
import type { CouponKind, CouponRecord, CouponStatus } from './store.js'

/** Why a generic code was refused, so the public endpoints can say something useful. */
export type GenericCouponRejection =
  | 'INVALID_FORMAT'
  | 'NOT_FOUND'
  | 'PAUSED'
  | 'DELETED'
  | 'NOT_STARTED'
  | 'EXPIRED'
  | 'NOT_APPLICABLE'
  | 'MIN_AMOUNT'
  | 'MAX_REDEMPTIONS'

/**
 * Buyer-facing wording. The four messages shared with partner codes
 * (INVALID_FORMAT / NOT_FOUND / PAUSED / EXPIRED) are byte-identical to
 * `REJECTION_MESSAGES` in `influencers.ts`: the same words have always been
 * shown for those outcomes and a code's source should not change the copy.
 */
export const COUPON_REJECTION_MESSAGES: Record<GenericCouponRejection, string> = {
  INVALID_FORMAT: 'That code does not look right.',
  NOT_FOUND: 'That code is not valid.',
  PAUSED: 'That code has been paused.',
  DELETED: 'That code is no longer available.',
  NOT_STARTED: 'That code is not active yet.',
  EXPIRED: 'That code has expired.',
  NOT_APPLICABLE: 'That code cannot be used for this surprise.',
  MIN_AMOUNT: 'That code needs a higher order total.',
  MAX_REDEMPTIONS: 'That code has already been used the maximum number of times.',
}

/** Normalizes a coupon code for comparison and storage (trim + upper-case). */
export function normalizeCouponCode(code: string): string {
  return normalizeCode(code)
}

/** Same format rules as partner codes: 3..24 chars of A-Z 0-9 _ -. */
export function isCouponCodeFormatValid(code: string): boolean {
  return isValidCodeFormat(code)
}

/**
 * Operator-facing, derived status. Stored status answers "did I switch it off?";
 * this answers "would a buyer be able to use it right now?".
 *
 * NOT_APPLICABLE / MIN_AMOUNT are cart-dependent and cannot be known without a
 * template and a price, so a bare coupon is reported as active for them.
 */
export type CouponState = 'active' | 'paused' | 'deleted' | 'scheduled' | 'expired' | 'exhausted'

export function couponState(
  coupon: CouponRecord,
  ctx: { redemptionsUsed?: number; now?: Date } = {},
): CouponState {
  const verdict = isCouponUsable(coupon, ctx)
  if (verdict.ok) return 'active'
  switch (verdict.reason) {
    case 'PAUSED':
      return 'paused'
    case 'DELETED':
      return 'deleted'
    case 'NOT_STARTED':
      return 'scheduled'
    case 'EXPIRED':
      return 'expired'
    case 'MAX_REDEMPTIONS':
      return 'exhausted'
    default:
      return 'active'
  }
}

export interface CouponEligibility {
  /** Template being bought, when the caller knows it. */
  templateId?: string
  /** Pre-discount price in rupees, when the caller knows it. */
  baseAmount?: number
  /** PAID orders already made with this code. */
  redemptionsUsed?: number
  now?: Date
}

/**
 * Whether a code can still be redeemed right now.
 *
 * Every check is skipped when its input is unknown: a caller that has no price
 * yet is not asking about the minimum spend, and passing no template must not
 * make an all-templates coupon look inapplicable.
 */
export function isCouponUsable(
  coupon: CouponRecord,
  ctx: CouponEligibility = {},
): { ok: true } | { ok: false; reason: GenericCouponRejection } {
  const now = ctx.now ?? new Date()

  if (coupon.status === 'deleted') return { ok: false, reason: 'DELETED' }
  if (coupon.status !== 'active') return { ok: false, reason: 'PAUSED' }

  if (coupon.startsAt) {
    const start = Date.parse(coupon.startsAt)
    if (Number.isFinite(start) && now.getTime() < start) {
      return { ok: false, reason: 'NOT_STARTED' }
    }
  }
  if (coupon.expiresAt) {
    const expiry = Date.parse(coupon.expiresAt)
    if (Number.isFinite(expiry) && now.getTime() > expiry) {
      return { ok: false, reason: 'EXPIRED' }
    }
  }

  const appliesTo = coupon.appliesTo ?? []
  if (
    ctx.templateId !== undefined &&
    appliesTo.length > 0 &&
    !appliesTo.includes(ctx.templateId)
  ) {
    return { ok: false, reason: 'NOT_APPLICABLE' }
  }

  if (
    ctx.baseAmount !== undefined &&
    coupon.minAmount > 0 &&
    round2(ctx.baseAmount) < round2(coupon.minAmount)
  ) {
    return { ok: false, reason: 'MIN_AMOUNT' }
  }

  if (
    coupon.maxRedemptions !== null &&
    ctx.redemptionsUsed !== undefined &&
    ctx.redemptionsUsed >= coupon.maxRedemptions
  ) {
    return { ok: false, reason: 'MAX_REDEMPTIONS' }
  }

  return { ok: true }
}

/**
 * The percentage `priceOrder` must be handed to produce this coupon's discount.
 *
 * Flat coupons are converted to their effective percentage rather than being
 * priced by a second code path: `priceOrder` stays the ONE place money is
 * computed, which is what keeps the checkout button, the gateway charge and the
 * order snapshot in agreement. The conversion is exact at two decimals — for a
 * base of ₹297 and a flat ₹50 off the effective rate is 16.8350…%, and
 * 297 × that ÷ 100 rounds back to exactly 50.00.
 *
 * Returns 0 when there is no price to convert against; callers that do not know
 * the base amount yet must not quote a flat coupon.
 */
export function couponDiscountPercentage(coupon: CouponRecord, baseAmount: number): number {
  if (coupon.kind === 'flat') {
    if (!Number.isFinite(baseAmount) || baseAmount <= 0) return 0
    const discount = Math.min(coupon.value, baseAmount)
    return Math.min(100, (discount * 100) / baseAmount)
  }
  return Math.min(100, Math.max(0, coupon.value))
}

/** `YYYY-MM-DD` or any `Date.parse`-able instant. */
const ISO_DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

/**
 * Parses an admin-supplied instant into an ISO timestamp, or null when it is
 * unusable.
 *
 * A bare date is expanded deliberately: an expiry becomes the END of that day
 * (a code that expires "2026-03-01" is still good at 23:59 on the 1st, which is
 * what an operator means by it) and a start becomes the BEGINNING of it.
 * Impossible calendar dates such as 2026-02-31 are rejected rather than
 * silently rolled into March, the same way `isValidExpiryDate` does it.
 */
export function parseCouponInstant(raw: string, options: { endOfDay?: boolean } = {}): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null

  const expanded = ISO_DATE_ONLY.test(trimmed)
    ? `${trimmed}${options.endOfDay ? 'T23:59:59.999Z' : 'T00:00:00.000Z'}`
    : trimmed

  const parsed = Date.parse(expanded)
  if (!Number.isFinite(parsed)) return null

  const iso = new Date(parsed).toISOString()
  if (ISO_DATE_ONLY.test(trimmed) && iso.slice(0, 10) !== trimmed) return null
  return iso
}

/** Valid stored statuses for an operator-supplied value. */
export function parseCouponStatus(value: unknown): CouponStatus | null {
  return value === 'active' || value === 'paused' || value === 'deleted' ? value : null
}

/** Valid kinds for an operator-supplied value. */
export function parseCouponKind(value: unknown): CouponKind | null {
  return value === 'percent' || value === 'flat' ? value : null
}
