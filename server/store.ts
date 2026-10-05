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

export interface CreateOrderInput {
  // Optional internal Cupi order id, generated in the route handler when the
  // id must be known before the gateway order is created (redirect URLs).
  id?: string
  gatewayOrderId: string
  templateId: string
  amount: number
  currency: string
  customizationPayload: unknown
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
}
