/**
 * The production Cupi store: a free, persistent, managed PostgreSQL database
 * (Supabase) reached over PostgREST.
 *
 * Two properties matter most here:
 *
 *  1. PERMANENCE. Nothing touches the local filesystem, so orders and generated
 *     wish websites survive Render deploys, restarts and free-tier spin-downs.
 *
 *  2. ONE PAYMENT = ONE GENERATED WEBSITE, enforced by the database. The
 *     `unique (order_id)` constraint on `cupi_experiences` means that even if a
 *     webhook is delivered twice, or a customer double-taps "Pay", or two verify
 *     requests race, the second insert is rejected by Postgres and both callers
 *     converge on the single row that won. That is strictly stronger than the
 *     old in-process "single-threaded so it can't happen" argument.
 */

import {
  escapePostgrestValue,
  readSupabaseConfig,
  SupabaseRest,
  SupabaseStoreError,
  type SupabaseConfig,
} from './supabase.js'
import { normalizeCode, round2 } from './influencers.js'
import { normalizeCouponCode } from './coupons.js'
import type {
  CouponKind,
  CouponRecord,
  CouponStatus,
  CreateCouponInput,
  CreateInfluencerInput,
  CreateOrderInput,
  ExperienceRecord,
  InfluencerMetrics,
  InfluencerRecord,
  InfluencerStatus,
  OrderRecord,
  OrderStatus,
  Store,
  StoredCoupon,
  StoredExperience,
  StoredInfluencer,
  StoredOrder,
  UpdateCouponInput,
  UpdateInfluencerInput,
} from './store.js'

const ORDERS_TABLE = 'cupi_orders'
const EXPERIENCES_TABLE = 'cupi_experiences'
const PRODUCT_PRICES_TABLE = 'cupi_product_prices'
const INFLUENCERS_TABLE = 'cupi_influencers'
const COUPONS_TABLE = 'cupi_coupons'

/** Warn exactly once if the (newest) coupons table has not been created yet. */
let warnedMissingCouponsTable = false

function toNumber(value: number | string | null | undefined, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  // Postgres `numeric` comes back from PostgREST as a string ("29.00").
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
}

/**
 * Postgres `timestamptz` round-trips as an ISO-8601 string. Always normalize so
 * the API returns one consistent format regardless of backend.
 */
function toIsoString(value: string | null | undefined, fallback: string): string {
  if (typeof value !== 'string' || value.trim() === '') return fallback
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : fallback
}

function normalizeOrderStatus(value: unknown): OrderStatus {
  return value === 'PAID' || value === 'FAILED' ? value : 'PENDING'
}

/**
 * A completed website is final; a DRAFT one is preserved as DRAFT and the API
 * refuses to serve it through a share link. Any other/absent value is treated
 * as LOCKED — a missing status must never resurrect an editable public record,
 * and records written before the lock model existed always meant "final".
 */
function normalizeExperienceStatus(value: unknown): 'DRAFT' | 'LOCKED' {
  return value === 'DRAFT' ? 'DRAFT' : 'LOCKED'
}

function mapOrder(row: StoredOrder): OrderRecord {
  return {
    id: row.id,
    gatewayOrderId: row.gateway_order_id,
    gatewayPaymentId: row.gateway_payment_id ?? null,
    templateId: row.template_id,
    amount: toNumber(row.amount),
    currency: row.currency,
    status: normalizeOrderStatus(row.status),
    customizationPayload: row.customization_payload,
    experienceId: row.experience_id ?? null,
    createdAt: toIsoString(row.created_at, new Date(0).toISOString()),
    updatedAt: toIsoString(row.updated_at, new Date(row.created_at).toISOString()),
    influencerId: row.influencer_id ?? null,
    couponCode: row.coupon_code ?? null,
    originalAmount:
      row.original_amount === null || row.original_amount === undefined
        ? null
        : toNumber(row.original_amount),
    discountGiven: toNumber(row.discount_given),
    netRevenue: toNumber(row.net_revenue),
    influencerCommissionEarned: toNumber(row.influencer_commission_earned),
    trafficSource: row.traffic_source ?? null,
    customerIp: row.customer_ip ?? null,
  }
}

/** Absent/unknown status is treated as active, matching the CHECK constraint. */
function normalizeInfluencerStatus(value: unknown): InfluencerStatus {
  return value === 'paused' ? 'paused' : 'active'
}

function mapInfluencer(row: StoredInfluencer): InfluencerRecord {
  return {
    id: row.id,
    name: row.name,
    email: row.email ?? null,
    phone: row.phone ?? null,
    uniqueCode: normalizeCode(row.unique_code),
    discountPercentage: toNumber(row.discount_percentage),
    commissionPercentage: toNumber(row.commission_percentage),
    // Postgres `date` round-trips as 'YYYY-MM-DD'; anything else is unusable as
    // an expiry comparison, so it is dropped rather than trusted.
    expiryDate:
      typeof row.expiry_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(row.expiry_date)
        ? row.expiry_date
        : null,
    status: normalizeInfluencerStatus(row.status),
    createdAt: toIsoString(row.created_at, new Date(0).toISOString()),
    updatedAt: toIsoString(row.updated_at, new Date(row.created_at).toISOString()),
  }
}

/** Absent/unknown kind is treated as percent, matching the CHECK constraint. */
function normalizeCouponKind(value: unknown): CouponKind {
  return value === 'flat' ? 'flat' : 'percent'
}

/** Absent/unknown status is treated as active, matching the CHECK constraint. */
function normalizeCouponStatus(value: unknown): CouponStatus {
  return value === 'paused' || value === 'deleted' ? value : 'active'
}

function mapCoupon(row: StoredCoupon): CouponRecord {
  return {
    code: normalizeCouponCode(row.code),
    kind: normalizeCouponKind(row.kind),
    value: toNumber(row.value),
    appliesTo: Array.isArray(row.applies_to)
      ? row.applies_to.filter((entry): entry is string => typeof entry === 'string')
      : [],
    minAmount: toNumber(row.min_amount),
    maxRedemptions:
      row.max_redemptions === null || row.max_redemptions === undefined
        ? null
        : toNumber(row.max_redemptions),
    startsAt: row.starts_at ? toIsoString(row.starts_at, row.starts_at) : null,
    expiresAt: row.expires_at ? toIsoString(row.expires_at, row.expires_at) : null,
    status: normalizeCouponStatus(row.status),
    createdAt: toIsoString(row.created_at, new Date(0).toISOString()),
    updatedAt: toIsoString(row.updated_at, new Date(row.created_at).toISOString()),
  }
}

/**
 * Backward/forward-compatible read of a stored experience. Keeps the stored
 * status (so migration is faithful) while defaulting an absent one to LOCKED.
 */
function mapExperience(row: StoredExperience): ExperienceRecord {
  return {
    id: row.id,
    orderId: row.order_id,
    templateId: row.template_id,
    config: row.config ?? null,
    status: normalizeExperienceStatus(row.status),
    lockedAt: typeof row.locked_at === 'string' ? row.locked_at : null,
    viewCount: toNumber(row.view_count),
    createdAt: toIsoString(row.created_at, new Date(0).toISOString()),
  }
}

const AUDIO_TABLE = 'cupi_template_audio'

export class PostgresStore implements Store {
  readonly kind = 'supabase-postgres'
  readonly durable = true

  private readonly rest: SupabaseRest

  constructor(config: SupabaseConfig) {
    this.rest = new SupabaseRest(config)
  }

  /**
   * Persists a new PENDING order.
   *
   * Idempotent on `gateway_order_id`: if this checkout has already been recorded
   * the existing order is returned UNCHANGED. It is deliberately never
   * updated, because
   *   • `id` is referenced by cupi_experiences.order_id, so rewriting it would
   *     orphan an already-generated website, and
   *   • the order may have progressed to PAID, which an upsert from a retried
   *     request would silently reset to PENDING.
   * A blind `resolution=merge-duplicates` upsert would do exactly that, and
   * would in any case miss the conflict (it infers the primary key, which is a
   * fresh uuid per request) and fail on the gateway_order_id unique index
   * instead — surfacing as an error rather than the order the buyer already has.
   */
  async createOrder(input: CreateOrderInput): Promise<OrderRecord> {
    const existing = await this.getOrderByGatewayOrderId(input.gatewayOrderId)
    if (existing) return existing

    const id = input.id ?? crypto.randomUUID()
    const now = new Date().toISOString()
    const attribution = input.attribution
    const row: StoredOrder = {
      id,
      gateway_order_id: input.gatewayOrderId,
      gateway_payment_id: null,
      template_id: input.templateId,
      amount: input.amount,
      currency: input.currency,
      status: 'PENDING',
      customization_payload: input.customizationPayload,
      experience_id: null,
      created_at: now,
      updated_at: now,
      influencer_id: attribution?.influencerId ?? null,
      coupon_code: attribution?.couponCode ?? null,
      original_amount: attribution?.originalAmount ?? null,
      discount_given: attribution?.discountGiven ?? 0,
      // A direct sale keeps the full charge as net revenue.
      net_revenue: attribution?.netRevenue ?? input.amount,
      influencer_commission_earned: attribution?.commissionEarned ?? 0,
      traffic_source: attribution?.trafficSource ?? null,
      customer_ip: attribution?.customerIp ?? null,
    }

    const { data } = await this.rest.request<StoredOrder[]>({
      method: 'POST',
      path: ORDERS_TABLE,
      prefer: 'return=representation',
      body: row,
    })

    const saved = Array.isArray(data) && data.length > 0 ? data[0] : row
    return mapOrder({ ...row, ...saved })
  }

  async getOrderById(id: string): Promise<OrderRecord | null> {
    const { data } = await this.rest.request<StoredOrder[]>({
      method: 'GET',
      path: ORDERS_TABLE,
      query: { id: `eq.${escapePostgrestValue(id)}`, limit: 1 },
    })
    return data && data.length > 0 ? mapOrder(data[0]) : null
  }

  async getOrderByGatewayOrderId(gatewayOrderId: string): Promise<OrderRecord | null> {
    const { data } = await this.rest.request<StoredOrder[]>({
      method: 'GET',
      path: ORDERS_TABLE,
      query: { gateway_order_id: `eq.${escapePostgrestValue(gatewayOrderId)}`, limit: 1 },
    })
    return data && data.length > 0 ? mapOrder(data[0]) : null
  }

  /** Accepts either a Cupi order id or a gateway order id, like before. */
  private async findOrder(idOrGatewayId: string): Promise<OrderRecord | null> {
    return (
      (await this.getOrderById(idOrGatewayId)) ??
      (await this.getOrderByGatewayOrderId(idOrGatewayId))
    )
  }

  /** Direct primary-key lookup, with no legacy fallbacks. */
  private async findExperienceById(id: string): Promise<ExperienceRecord | null> {
    const { data } = await this.rest.request<StoredExperience[]>({
      method: 'GET',
      path: EXPERIENCES_TABLE,
      query: { id: `eq.${escapePostgrestValue(id)}`, limit: 1 },
    })
    return data && data.length > 0 ? mapExperience(data[0]) : null
  }

  private async findExperienceByOrderId(orderId: string): Promise<ExperienceRecord | null> {
    const { data } = await this.rest.request<StoredExperience[]>({
      method: 'GET',
      path: EXPERIENCES_TABLE,
      query: { order_id: `eq.${escapePostgrestValue(orderId)}`, limit: 1 },
    })
    return data && data.length > 0 ? mapExperience(data[0]) : null
  }

  /**
   * Creates the one LOCKED website for a verified payment and marks the order
   * PAID.
   *
   * Order of operations is deliberate:
   *   1. Already PAID with a website? Return it. (Fast path for verify replay.)
   *   2. INSERT the website with `ON CONFLICT DO NOTHING` on `order_id`. A
   *      duplicate or concurrent delivery loses the race here and inserts
   *      nothing.
   *   3. SELECT the website back BY ORDER. This is what makes concurrent
   *      callers converge: both end up with whichever row actually exists, so a
   *      loser never returns a slug that was never created.
   *   4. PATCH the order to PAID. Idempotent, so a crash between steps 3 and 4
   *      self-heals on the next delivery.
   *
   * There is no code path anywhere in Cupi that updates an existing website's
   * `config`, so the public /x/:id link is permanently read-only once this
   * returns.
   */
  async finalizeOrderForPayment(input: {
    orderId: string
    gatewayPaymentId?: string | null
  }): Promise<ExperienceRecord> {
    const order = await this.findOrder(input.orderId)
    if (!order) {
      throw new SupabaseStoreError('Order not found.', 404, 'PGRST116')
    }

    if (order.status === 'PAID' && order.experienceId) {
      const existing = await this.getExperienceById(order.experienceId)
      if (existing) return existing
    }

    const now = new Date().toISOString()

    // Step 2 — best-effort insert. A conflict means the website already exists,
    // which is a success for us, not an error.
    try {
      await this.rest.request({
        method: 'POST',
        path: EXPERIENCES_TABLE,
        query: { on_conflict: 'order_id' },
        prefer: 'resolution=ignore-duplicates',
        body: {
          id: generateExperienceId(),
          order_id: order.id,
          template_id: order.templateId,
          config: order.customizationPayload,
          status: 'LOCKED',
          locked_at: now,
          view_count: 0,
          created_at: now,
        },
      })
    } catch (error) {
      // Only a genuine connectivity/schema failure matters here; the "row
      // already exists" case is handled by reading the winner back below.
      const isDuplicate = error instanceof SupabaseStoreError && error.status === 409
      if (!isDuplicate) {
        console.error('[store] could not insert generated website:', error)
        throw error
      }
    }

    // Step 3 — read back whatever actually exists for this order.
    const experience = await this.findExperienceByOrderId(order.id)
    if (!experience) {
      throw new SupabaseStoreError(
        'Payment was confirmed but the generated website could not be persisted. No share link was issued.',
        500,
        'CUPI_EXPERIENCE_WRITE_FAILED',
      )
    }

    // Step 4 — mark the order PAID and attach the winning slug.
    await this.rest.request<StoredOrder[]>({
      method: 'PATCH',
      path: ORDERS_TABLE,
      query: { id: `eq.${escapePostgrestValue(order.id)}` },
      prefer: 'return=representation',
      body: {
        status: 'PAID',
        gateway_payment_id: input.gatewayPaymentId ?? null,
        experience_id: experience.id,
        updated_at: now,
      },
    })

    return experience
  }

  /**
   * Resolves a public share slug.
   *
   * The primary lookup is the primary key, which covers every identifier ever
   * issued: Cupi slugs and legacy `fg_...` slugs alike. The extra fallbacks only
   * run when that misses, and they exist so a link that was shared before this
   * migration still resolves even if the slug on it maps to an order rather than
   * to a website row directly.
   */
  async getExperienceById(id: string): Promise<ExperienceRecord | null> {
    const direct = await this.findExperienceById(id)
    if (direct) return direct

    // Legacy shape: the slug may be an order id, or the gateway order id whose
    // website lives under the order's experience_id.
    const order = await this.findOrder(id)
    if (order?.experienceId) {
      const viaOrder = await this.findExperienceById(order.experienceId)
      if (viaOrder) return viaOrder
    }

    return null
  }

  /**
   * Resolves through the SAME lookup as getExperienceById, so the answer can
   * never disagree with it. A direct primary-key-only check used to report
   * "not locked" for a legacy /x/<orderId> link even though the website it
   * points at was perfectly readable, which surfaced as a 423 on a live link.
   */
  async isExperienceLocked(id: string): Promise<boolean> {
    const experience = await this.getExperienceById(id)
    return experience?.status === 'LOCKED'
  }

  /**
   * Best-effort view counter.
   *
   * The ONLY write ever performed against a completed website, and it never
   * touches `config`, `template_id` or `status`, so the website stays
   * read-only. PostgREST cannot express `view_count = view_count + 1`, so this
   * is a read-modify-write; the counter is diagnostic only, so a lost update
   * under concurrency is harmless. It must never be able to break a share
   * link, so every failure is swallowed after being logged.
   */
  async incrementViewCount(id: string): Promise<void> {
    try {
      const { data } = await this.rest.request<StoredExperience[]>({
        method: 'GET',
        path: EXPERIENCES_TABLE,
        query: { id: `eq.${escapePostgrestValue(id)}`, select: 'view_count', limit: 1 },
      })
      if (!data || data.length === 0) return
      const current = toNumber(data[0].view_count)
      await this.rest.request({
        method: 'PATCH',
        path: EXPERIENCES_TABLE,
        query: { id: `eq.${escapePostgrestValue(id)}` },
        body: { view_count: current + 1 },
      })
    } catch (error) {
      console.warn(`[store] view count not recorded for ${id}:`, error)
    }
  }

  async countExperiences(): Promise<number> {
    const { headers } = await this.rest.request<StoredExperience[]>({
      method: 'GET',
      path: EXPERIENCES_TABLE,
      query: { select: 'id', limit: 1 },
      prefer: 'count=exact',
    })
    return SupabaseRest.parseExactCount(headers) ?? 0
  }

  async healthCheck(): Promise<{ ok: boolean; detail: string }> {
    try {
      const count = await this.countExperiences()
      return { ok: true, detail: `supabase reachable, ${count} generated website(s)` }
    } catch (error) {
      return { ok: false, detail: (error as Error).message }
    }
  }

  async getProductPrice(templateId: string): Promise<number | null> {
    const { data } = await this.rest.request<{ price: number }[]>({
      method: 'GET',
      path: PRODUCT_PRICES_TABLE,
      query: { template_id: `eq.${escapePostgrestValue(templateId)}`, select: 'price', limit: 1 },
    })
    if (!data || data.length === 0) return null
    const price = toNumber(data[0].price)
    return price > 0 ? price : null
  }

  async updateProductPrice(templateId: string, price: number): Promise<number> {
    if (price < 0) {
      throw new Error('Price cannot be negative')
    }
    const now = new Date().toISOString()
    await this.rest.request<{ price: number }[]>({
      method: 'POST',
      path: PRODUCT_PRICES_TABLE,
      query: { on_conflict: 'template_id' },
      prefer: 'resolution=merge-duplicates',
      body: {
        template_id: templateId,
        price,
        updated_at: now,
      },
    })
    return price
  }

  async getTemplateAudio(templateId: string): Promise<{ audioData?: string; audioUrl?: string } | null> {
    const { data } = await this.rest.request<Array<{ template_id: string; audio_data: string | null; audio_url: string | null }>>({
      method: 'GET',
      path: AUDIO_TABLE,
      query: { template_id: `eq.${escapePostgrestValue(templateId)}`, limit: 1 },
    })
    if (!data || data.length === 0) return null
    const row = data[0]
    if (!row.audio_data && !row.audio_url) return null
    return {
      audioData: row.audio_data ?? undefined,
      audioUrl: row.audio_url ?? undefined,
    }
  }

  async setTemplateAudio(templateId: string, audioData: string | null, audioUrl: string | null): Promise<void> {
    const now = new Date().toISOString()
    await this.rest.request<Array<{ template_id: string }>>({
      method: 'POST',
      path: AUDIO_TABLE,
      query: { on_conflict: 'template_id' },
      prefer: 'resolution=merge-duplicates',
      body: {
        template_id: templateId,
        audio_data: audioData,
        audio_url: audioUrl,
        updated_at: now,
      },
    })
  }

  // ------------------------------------------------------------- influencers --

  async listInfluencers(): Promise<InfluencerRecord[]> {
    const { data } = await this.rest.request<StoredInfluencer[]>({
      method: 'GET',
      path: INFLUENCERS_TABLE,
      query: { order: 'created_at.desc' },
    })
    return (data ?? []).map(mapInfluencer)
  }

  async getInfluencerById(id: string): Promise<InfluencerRecord | null> {
    const { data } = await this.rest.request<StoredInfluencer[]>({
      method: 'GET',
      path: INFLUENCERS_TABLE,
      query: { id: `eq.${escapePostgrestValue(id)}`, limit: 1 },
    })
    return data && data.length > 0 ? mapInfluencer(data[0]) : null
  }

  /**
   * Case-insensitive lookup. The functional unique index on upper(unique_code)
   * makes this an index scan rather than a table scan, and guarantees the
   * "one code, one partner" rule holds at the database level too.
   */
  async getInfluencerByCode(code: string): Promise<InfluencerRecord | null> {
    const normalized = normalizeCode(code)
    if (!normalized) return null
    const { data } = await this.rest.request<StoredInfluencer[]>({
      method: 'GET',
      path: INFLUENCERS_TABLE,
      query: { unique_code: `eq.${escapePostgrestValue(normalized)}`, limit: 1 },
    })
    return data && data.length > 0 ? mapInfluencer(data[0]) : null
  }

  async createInfluencer(input: CreateInfluencerInput): Promise<InfluencerRecord> {
    const now = new Date().toISOString()
    const row: StoredInfluencer = {
      id: crypto.randomUUID(),
      name: input.name.trim(),
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      unique_code: normalizeCode(input.uniqueCode ?? ''),
      discount_percentage: input.discountPercentage,
      commission_percentage: input.commissionPercentage,
      expiry_date: input.expiryDate ?? null,
      status: input.status ?? 'active',
      created_at: now,
      updated_at: now,
    }
    const { data } = await this.rest.request<StoredInfluencer[]>({
      method: 'POST',
      path: INFLUENCERS_TABLE,
      prefer: 'return=representation',
      body: row,
    })
    return mapInfluencer(Array.isArray(data) && data.length > 0 ? data[0] : row)
  }

  async updateInfluencer(
    id: string,
    input: UpdateInfluencerInput,
  ): Promise<InfluencerRecord | null> {
    const existing = await this.getInfluencerById(id)
    if (!existing) return null

    const patch: Record<string, unknown> = {}
    if (input.name !== undefined) patch.name = input.name.trim()
    if (input.email !== undefined) patch.email = input.email?.trim() || null
    if (input.phone !== undefined) patch.phone = input.phone?.trim() || null
    if (input.uniqueCode !== undefined) patch.unique_code = normalizeCode(input.uniqueCode)
    if (input.discountPercentage !== undefined) {
      patch.discount_percentage = input.discountPercentage
    }
    if (input.commissionPercentage !== undefined) {
      patch.commission_percentage = input.commissionPercentage
    }
    if (input.expiryDate !== undefined) patch.expiry_date = input.expiryDate ?? null
    if (input.status !== undefined) patch.status = input.status

    if (Object.keys(patch).length === 0) return existing

    const { data } = await this.rest.request<StoredInfluencer[]>({
      method: 'PATCH',
      path: INFLUENCERS_TABLE,
      query: { id: `eq.${escapePostgrestValue(id)}` },
      prefer: 'return=representation',
      body: patch,
    })
    if (!data || data.length === 0) return null
    return mapInfluencer(data[0])
  }

  /**
   * `cupi_orders.influencer_id` is declared ON DELETE SET NULL, so the FK does
   * the retention work: past orders keep their coupon_code and money snapshots
   * and simply lose the partner link.
   */
  async deleteInfluencer(id: string): Promise<boolean> {
    const { data } = await this.rest.request<StoredInfluencer[]>({
      method: 'DELETE',
      path: INFLUENCERS_TABLE,
      query: { id: `eq.${escapePostgrestValue(id)}` },
      prefer: 'return=representation',
    })
    return Array.isArray(data) && data.length > 0
  }

  /**
   * Aggregates PAID orders per influencer.
   *
   * PENDING orders are excluded on purpose: commission is owed on money that was
   * actually collected, so an abandoned checkout must never appear as revenue.
   * Grouping happens in Postgres, not in Node, so the dashboard never pulls
   * every order into memory to total a handful of columns.
   */
  async getInfluencerMetrics(): Promise<Map<string, InfluencerMetrics>> {
    const { data } = await this.rest.request<
      Array<{
        influencer_id: string | null
        total_orders: number | string
        total_revenue: number | string
        total_discount: number | string
        total_commission: number | string
      }>
    >({
      method: 'GET',
      path: ORDERS_TABLE,
      query: {
        select: [
          'influencer_id',
          'count(*)::bigint as total_orders',
          'coalesce(sum(amount), 0) as total_revenue',
          'coalesce(sum(discount_given), 0) as total_discount',
          'coalesce(sum(influencer_commission_earned), 0) as total_commission',
        ].join(','),
        status: 'eq.PAID',
        influencer_id: 'not.is.null',
        group_by: 'influencer_id',
      },
    })

    const metrics = new Map<string, InfluencerMetrics>()
    for (const row of data ?? []) {
      if (!row.influencer_id) continue
      metrics.set(row.influencer_id, {
        totalOrders: toNumber(row.total_orders),
        totalRevenueGenerated: round2(toNumber(row.total_revenue)),
        totalDiscountGiven: round2(toNumber(row.total_discount)),
        commissionOwed: round2(toNumber(row.total_commission)),
      })
    }
    return metrics
  }

  // ---------------------------------------------------------------- coupons --

  async listCoupons(): Promise<CouponRecord[]> {
    const { data } = await this.rest.request<StoredCoupon[]>({
      method: 'GET',
      path: COUPONS_TABLE,
      query: { order: 'created_at.desc' },
    })
    return (data ?? []).map(mapCoupon)
  }

  /**
   * Primary-key lookup: `code` IS the primary key, stored normalized.
   *
   * A 404 from PostgREST means the cupi_coupons table itself does not exist
   * yet (an operator who has not re-run supabase/schema.sql). Checkout must
   * keep working through that deployment window — partner and legacy codes are
   * unaffected — so a missing table is reported once and read as "no coupon"
   * rather than failing every quote and every order create with a 500.
   */
  async getCouponByCode(code: string): Promise<CouponRecord | null> {
    const normalized = normalizeCouponCode(code)
    if (!normalized) return null
    try {
      const { data } = await this.rest.request<StoredCoupon[]>({
        method: 'GET',
        path: COUPONS_TABLE,
        query: { code: `eq.${escapePostgrestValue(normalized)}`, limit: 1 },
      })
      return data && data.length > 0 ? mapCoupon(data[0]) : null
    } catch (error) {
      if (error instanceof SupabaseStoreError && error.status === 404) {
        if (!warnedMissingCouponsTable) {
          warnedMissingCouponsTable = true
          console.warn(
            '[db] cupi_coupons table is missing — campaign coupons are disabled until ' +
              'supabase/schema.sql is run. Checkout continues with partner and legacy codes.',
          )
        }
        return null
      }
      throw error
    }
  }

  async createCoupon(input: CreateCouponInput): Promise<CouponRecord> {
    const now = new Date().toISOString()
    const row: StoredCoupon = {
      code: normalizeCouponCode(input.code),
      kind: input.kind,
      value: input.value,
      applies_to: input.appliesTo ?? [],
      min_amount: input.minAmount ?? 0,
      max_redemptions: input.maxRedemptions ?? null,
      starts_at: input.startsAt ?? null,
      expires_at: input.expiresAt ?? null,
      status: input.status ?? 'active',
      created_at: now,
      updated_at: now,
    }
    const { data } = await this.rest.request<StoredCoupon[]>({
      method: 'POST',
      path: COUPONS_TABLE,
      prefer: 'return=representation',
      body: row,
    })
    return mapCoupon(Array.isArray(data) && data.length > 0 ? data[0] : row)
  }

  async updateCoupon(
    code: string,
    input: UpdateCouponInput,
  ): Promise<CouponRecord | null> {
    const existing = await this.getCouponByCode(code)
    if (!existing) return null

    const patch: Record<string, unknown> = {}
    if (input.kind !== undefined) patch.kind = input.kind
    if (input.value !== undefined) patch.value = input.value
    if (input.appliesTo !== undefined) patch.applies_to = input.appliesTo
    if (input.minAmount !== undefined) patch.min_amount = input.minAmount
    if (input.maxRedemptions !== undefined) patch.max_redemptions = input.maxRedemptions
    if (input.startsAt !== undefined) patch.starts_at = input.startsAt
    if (input.expiresAt !== undefined) patch.expires_at = input.expiresAt
    if (input.status !== undefined) patch.status = input.status

    if (Object.keys(patch).length === 0) return existing

    const { data } = await this.rest.request<StoredCoupon[]>({
      method: 'PATCH',
      path: COUPONS_TABLE,
      query: { code: `eq.${escapePostgrestValue(existing.code)}` },
      prefer: 'return=representation',
      body: patch,
    })
    if (!data || data.length === 0) return null
    return mapCoupon(data[0])
  }

  async deleteCoupon(code: string): Promise<boolean> {
    const normalized = normalizeCouponCode(code)
    if (!normalized) return false
    const { data } = await this.rest.request<StoredCoupon[]>({
      method: 'DELETE',
      path: COUPONS_TABLE,
      query: { code: `eq.${escapePostgrestValue(normalized)}` },
      prefer: 'return=representation',
    })
    return Array.isArray(data) && data.length > 0
  }

  /**
   * PAID orders only. An abandoned PENDING checkout must not burn a
   * redemption, because nothing expires it (order lifecycle is out of scope).
   * Uses the `cupi_orders(coupon_code)` index, not a counter column, so the
   * number cannot drift from the orders it is supposed to describe.
   */
  async countCouponRedemptions(code: string): Promise<number> {
    const normalized = normalizeCouponCode(code)
    if (!normalized) return 0
    const { headers } = await this.rest.request<unknown[]>({
      method: 'GET',
      path: ORDERS_TABLE,
      query: {
        select: 'id',
        coupon_code: `eq.${escapePostgrestValue(normalized)}`,
        status: 'eq.PAID',
        limit: 1,
      },
      prefer: 'count=exact',
    })
    return SupabaseRest.parseExactCount(headers) ?? 0
  }

  /** One grouped query for the admin list, mirroring `getInfluencerMetrics`. */
  async getCouponRedemptionCounts(): Promise<Map<string, number>> {
    const { data } = await this.rest.request<
      Array<{ coupon_code: string | null; redemptions: number | string }>
    >({
      method: 'GET',
      path: ORDERS_TABLE,
      query: {
        select: ['coupon_code', 'count(*)::bigint as redemptions'].join(','),
        status: 'eq.PAID',
        coupon_code: 'not.is.null',
        group_by: 'coupon_code',
      },
    })

    const counts = new Map<string, number>()
    for (const row of data ?? []) {
      if (!row.coupon_code) continue
      counts.set(normalizeCouponCode(row.coupon_code), toNumber(row.redemptions))
    }
    return counts
  }
}

/**
 * Lowercase on purpose. Share links are typed by hand and re-copied from chat
 * apps that sometimes capitalise the first letter; a mixed-case slug makes an
 * otherwise identical URL 404. Lowercase is also what the frontend router and
 * the pre-migration `fg_...` ids look like.
 */
const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz'

/**
 * Length of the public /x/:id slug. 12 characters over a 36-symbol alphabet is
 * ~62 bits of entropy: unguessable, comfortable in a chat message, and well
 * inside the share-link charset accepted by both the API and the SPA router.
 */
const EXPERIENCE_ID_LENGTH = 12

/**
 * Mints the permanent public identifier for a generated website.
 *
 * Cupi owns this value on purpose: it must not be derived from the payment
 * gateway's order id, because a gateway-side format or length change would 404
 * links that customers have already shared. Uniqueness is guaranteed by the
 * `id` primary key, so a collision surfaces immediately as a rejected insert
 * rather than silently shadowing an existing link.
 */
function generateExperienceId(): string {
  const bytes = new Uint8Array(EXPERIENCE_ID_LENGTH)
  crypto.getRandomValues(bytes)
  let out = ''
  for (const byte of bytes) out += ALPHABET[byte % ALPHABET.length]
  return out
}

export function createPostgresStoreFromEnv(): PostgresStore | null {
  const config = readSupabaseConfig()
  return config ? new PostgresStore(config) : null
}
