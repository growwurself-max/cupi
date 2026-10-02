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
import type {
  CreateOrderInput,
  ExperienceRecord,
  OrderRecord,
  OrderStatus,
  Store,
  StoredExperience,
  StoredOrder,
} from './store.js'

const ORDERS_TABLE = 'cupi_orders'
const EXPERIENCES_TABLE = 'cupi_experiences'

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
