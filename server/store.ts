/**
 * The storage contract Cupi's API depends on.
 *
 * Everything the routes need is expressed here so the production backend can be
 * a real cloud Postgres while local development keeps working against a file.
 * No route or business rule depends on which implementation is active.
 */

export type OrderStatus = 'PENDING' | 'PAID' | 'FAILED'

export interface OrderRecord {
  id: string
  gatewayOrderId: string
  gatewayPaymentId: string | null
  templateId: string
  amount: number
  currency: string
  status: OrderStatus
  customizationPayload: unknown
  experienceId: string | null
  createdAt: string
  updatedAt: string
  /**
   * Referral attribution for this order, exactly as persisted. The defaults
   * describe a direct (unattributed) sale.
   */
  influencerId: string | null
  couponCode: string | null
  originalAmount: number | null
  discountGiven: number
  netRevenue: number
  influencerCommissionEarned: number
  trafficSource: string | null
  customerIp: string | null
}

/**
 * Lifecycle of a generated website.
 *
 *   DRAFT  → built but not yet paid/finalized. Never served publicly, never
 *            reachable through a share link, never mutable via the API.
 *   LOCKED → paid + generated + COMPLETED. This is the terminal state: the
 *            record is write-once and its /x/:id link never expires.
 *
 * `LOCKED` mirrors the COMPLETED stage of the order lifecycle
 * (PENDING → PAID → experience LOCKED).
 */
export type ExperienceStatus = 'DRAFT' | 'LOCKED'

export interface ExperienceRecord {
  /**
   * Permanent, Cupi-owned public identifier — the `/x/:id` share slug.
   *
   * New websites get a 12-character slug from `generateExperienceId()`. Records
   * migrated from `db.json` keep whatever they already had, including legacy
   * FamGateway slugs such as `fg_9f8e7d6c5b4a3210`, so links that were already
   * handed to customers resolve to the exact same record.
   */
  id: string
  orderId: string
  templateId: string
  config: unknown
  status: ExperienceStatus
  /** When the website became final/read-only. Set once, at payment time. */
  lockedAt: string | null
  viewCount: number
  createdAt: string
  /**
   * PERMANENT BY DESIGN — do not add `expiresAt`/`expires`/`ttl` here.
   * A completed Cupi website is viewable forever; the record is only ever
   * removed by an explicit manual deletion, never by age, cron or TTL sweep.
   */
}

/**
 * Operator intent for a partner. 'expired' is deliberately NOT stored: a coupon
 * expires by the passage of time, so it is derived from `expiryDate` at read
 * time rather than relying on a scheduled job to flip a row.
 */
export type InfluencerStatus = 'active' | 'paused' | 'deleted'

/** A partner who promotes Cupi and earns commission on referred sales. */
export interface InfluencerRecord {
  id: string
  name: string
  email: string | null
  phone: string | null
  /** Referral/coupon handle, stored normalized (trimmed, upper-cased). */
  uniqueCode: string
  /** Percentage taken off the buyer's price. 0..100. */
  discountPercentage: number
  /** Percentage of NET revenue owed to the partner. 0..100. */
  commissionPercentage: number
  /** Total commission paid out so far */
  commissionPaid: number
  /** NULL means the code never expires. */
  expiryDate: string | null
  status: InfluencerStatus | 'deleted'
  createdAt: string
  updatedAt: string
}

/** Aggregated performance for one influencer, computed over PAID orders. */
export interface InfluencerMetrics {
  /** Count of PAID orders attributed to this influencer. */
  totalOrders: number
  /** Gross amount those buyers paid (sum of order.amount). */
  totalRevenueGenerated: number
  /** Sum of discount_given across those orders. */
  totalDiscountGiven: number
  /** Commission owed but not yet marked paid (total earned - paid). */
  commissionOwed: number
  /** Total commission earned over all PAID orders. */
  commissionEarned: number
}

export interface CreateOrderInput {
  // Optional internal Cupi order id, generated in the route handler when the
  // id must be known before the gateway order is created (redirect URLs).
  id?: string
  gatewayOrderId: string
  templateId: string
  amount: number
  currency: string
  customizationPayload: unknown
  /**
   * Referral attribution for this order. Written in the SAME insert as the
   * order so a paid sale can never end up silently unattributed.
   */
  attribution?: OrderAttribution
}

/**
 * The money + partner facts for one order, resolved by the server at checkout.
 *
 * Every field is a snapshot: the amounts are what this order actually is, even
 * if the influencer's rate is edited tomorrow.
 */
export interface OrderAttribution {
  influencerId: string | null
  /** The code the buyer used, normalized. Retained even if the row was deleted. */
  couponCode: string | null
  /** Price before any discount. */
  originalAmount: number | null
  discountGiven: number
  /** What Cupi keeps: amount - discount - commission. */
  netRevenue: number
  commissionEarned: number
  trafficSource: string | null
  customerIp: string | null
}

/** Rows exactly as they sit in `db.json` / Postgres, before normalization. */
export interface StoredOrder {
  id: string
  gateway_order_id: string
  gateway_payment_id: string | null
  template_id: string
  amount: number | string
  currency: string
  status: string
  customization_payload: unknown
  experience_id: string | null
  created_at: string
  updated_at: string
  // Referral attribution. Present on every row after the columns were added;
  // read defensively because orders written earlier have no such columns.
  influencer_id?: string | null
  coupon_code?: string | null
  original_amount?: number | string | null
  discount_given?: number | string | null
  net_revenue?: number | string | null
  influencer_commission_earned?: number | string | null
  traffic_source?: string | null
  customer_ip?: string | null
}

/** Row shape of `cupi_influencers`, before normalization. */
export interface StoredInfluencer {
  id: string
  name: string
  email: string | null
  phone: string | null
  unique_code: string
  discount_percentage: number | string
  commission_percentage: number | string
  commission_paid?: number | string | null
  expiry_date: string | null
  status: string
  created_at: string
  updated_at: string
}

export interface CreateInfluencerInput {
  name: string
  email?: string | null
  phone?: string | null
  uniqueCode?: string | null
  discountPercentage: number
  commissionPercentage: number
  expiryDate?: string | null
  status?: InfluencerStatus | 'deleted'
}

export interface UpdateInfluencerInput {
  name?: string
  email?: string | null
  phone?: string | null
  uniqueCode?: string
  discountPercentage?: number
  commissionPercentage?: number
  expiryDate?: string | null
  status?: InfluencerStatus
}

/**
 * How a generic coupon takes money off.
 *
 *   percent → `value` is a percentage of the price (100 = free).
 *   flat    → `value` is a flat amount in rupees, capped at the price itself.
 */
export type CouponKind = 'percent' | 'flat'

/**
 * Operator intent for a generic coupon. Like influencers, there is no derived
 * 'expired'/'exhausted' state stored: those are functions of time and of how
 * many PAID orders already used the code, so they are computed at read time.
 */
export type CouponStatus = 'active' | 'paused' | 'deleted'

/**
 * A campaign code an operator creates directly, unrelated to any partner.
 *
 * `code` is BOTH the public handle and the primary key, stored normalized
 * (trimmed, upper-cased) — so "diwali20" and "DIWALI20" can never both exist,
 * and a checkout lookup is a single primary-key hit.
 *
 * Commission is deliberately absent: only partner codes earn commission
 * (`influencer_id` on the order stays NULL), so a generic coupon is a pure
 * discount against Cupi's own revenue.
 */
export interface CouponRecord {
  /** Normalized (trimmed, upper-cased). Primary key. */
  code: string
  kind: CouponKind
  /** Percentage (percent) or rupees (flat). Always > 0. */
  value: number
  /** Template ids this code applies to. Empty = every template. */
  appliesTo: string[]
  /** Minimum pre-discount price, in rupees, for the code to apply. 0 = none. */
  minAmount: number
  /** Total PAID orders the code may be used on. null = unlimited. */
  maxRedemptions: number | null
  /** ISO timestamp; null = starts immediately. */
  startsAt: string | null
  /** ISO timestamp; null = never expires. */
  expiresAt: string | null
  status: CouponStatus
  createdAt: string
  updatedAt: string
}

/** Row shape of `cupi_coupons`, before normalization. */
export interface StoredCoupon {
  code: string
  kind: string
  value: number | string
  applies_to: string[] | null
  min_amount: number | string
  max_redemptions: number | null
  starts_at: string | null
  expires_at: string | null
  status: string
  created_at: string
  updated_at: string
}

export interface CreateCouponInput {
  /** Normalized before insert; the caller validates the format. */
  code: string
  kind: CouponKind
  value: number
  appliesTo?: string[]
  minAmount?: number
  maxRedemptions?: number | null
  startsAt?: string | null
  expiresAt?: string | null
  status?: CouponStatus
}

export interface UpdateCouponInput {
  kind?: CouponKind
  value?: number
  appliesTo?: string[]
  minAmount?: number
  maxRedemptions?: number | null
  startsAt?: string | null
  expiresAt?: string | null
  status?: CouponStatus
}

export interface StoredExperience {
  id: string
  order_id: string
  template_id: string
  config: unknown
  status: string
  locked_at: string | null
  view_count: number | string
  created_at: string
}

/**
 * Every operation is async because the production implementation is a network
 * call. Implementations must never resolve unless the data is genuinely
 * persisted.
 */
export interface Store {
  /** Human-readable name for logs and /api/health. */
  readonly kind: string
  /** False when data lives on an ephemeral disk (local dev only). */
  readonly durable: boolean

  createOrder(input: CreateOrderInput): Promise<OrderRecord>
  getOrderById(id: string): Promise<OrderRecord | null>
  getOrderByGatewayOrderId(gatewayOrderId: string): Promise<OrderRecord | null>

  /**
   * Creates the single LOCKED website for a verified payment and marks the order
   * PAID. MUST be idempotent and safe under concurrent duplicate delivery
   * (double webhook, replayed verify): repeated or racing calls return the one
   * existing website and never create a second one.
   */
  finalizeOrderForPayment(input: {
    orderId: string
    gatewayPaymentId?: string | null
  }): Promise<ExperienceRecord>

  /** Resolves a public share slug. Never null for a link that was handed out. */
  getExperienceById(id: string): Promise<ExperienceRecord | null>
  isExperienceLocked(id: string): Promise<boolean>
  /** Best-effort; must never throw and never affect website content. */
  incrementViewCount(id: string): Promise<void>
  countExperiences(): Promise<number>

  /** Fails fast at boot when the backing store is unreachable or misconfigured. */
  healthCheck(): Promise<{ ok: boolean; detail: string }>

  /**
   * Product price management.
   * Returns the current price for a template, or null if not set (falls back to default).
   */
  getProductPrice(templateId: string): Promise<number | null>

  /**
   * Updates the price for a template.
   * Returns the updated price.
   */
  updateProductPrice(templateId: string, price: number): Promise<number>

  /**
   * Gets the audio settings for a template.
   * Returns an object with audioData or audioUrl, or null if neither exists.
   */
  getTemplateAudio(templateId: string): Promise<{ audioData?: string; audioUrl?: string } | null>

  /**
   * Sets the audio settings for a template.
   */
  setTemplateAudio(templateId: string, audioData: string | null, audioUrl: string | null): Promise<void>

  // ------------------------------------------------------------- influencers --

  listInfluencers(): Promise<InfluencerRecord[]>
  getInfluencerById(id: string): Promise<InfluencerRecord | null>
  /** Case-insensitive lookup by referral code. The checkout hot path. */
  getInfluencerByCode(code: string): Promise<InfluencerRecord | null>
  createInfluencer(input: CreateInfluencerInput): Promise<InfluencerRecord>
  updateInfluencer(id: string, input: UpdateInfluencerInput): Promise<InfluencerRecord | null>
  /**
   * Retains historical order attribution: deleting a partner nulls the
   * influencer_id on their orders (ON DELETE SET NULL) but the coupon_code and
   * the money snapshots stay, so past payouts remain auditable.
   */
  deleteInfluencer(id: string): Promise<boolean>

  /**
   * Aggregates PAID orders per influencer. Returns a map keyed by influencer id;
   * an influencer with no paid orders is simply absent.
   */
  getInfluencerMetrics(): Promise<Map<string, InfluencerMetrics>>

  // --------------------------------------------------------------- coupons --

  /** Every generic coupon, newest first. */
  listCoupons(): Promise<CouponRecord[]>
  /** Primary-key lookup on the normalized code. The checkout hot path. */
  getCouponByCode(code: string): Promise<CouponRecord | null>
  /**
   * Creates a coupon. Uniqueness on `code` is enforced by the primary key;
   * a duplicate rejects rather than overwriting an existing code.
   */
  createCoupon(input: CreateCouponInput): Promise<CouponRecord>
  /** Partial update by code. Returns null when the code does not exist. */
  updateCoupon(code: string, input: UpdateCouponInput): Promise<CouponRecord | null>
  /**
   * Hard-deletes a coupon. Orders keep their `coupon_code` and money snapshots,
   * exactly as they do when a partner is deleted — attribution is a text
   * snapshot, never a live foreign key.
   */
  deleteCoupon(code: string): Promise<boolean>

  /**
   * How many PAID orders were placed with this code — the redemption count
   * `max_redemptions` is checked against.
   *
   * Derived from the orders table rather than stored on the coupon, so the
   * number can never drift from reality: there is no second write to forget,
   * lose or race. PENDING (abandoned) checkouts are deliberately excluded —
   * there is no order-expiry lifecycle yet, so counting them would let a
   * half-finished checkout permanently burn a redemption.
   */
  countCouponRedemptions(code: string): Promise<number>
  /** Redemption counts for every code that has at least one PAID order. */
  getCouponRedemptionCounts(): Promise<Map<string, number>>
}
