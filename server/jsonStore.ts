/**
 * JSON-file store: the original `db.json` backend, kept intact.
 *
 * Its purpose is now narrow and deliberate:
 *   * local development without any cloud credentials, and
 *   * the SOURCE for `npm run migrate-data`.
 *
 * It is NOT used in production. The Cupi API refuses to boot on this store when
 * NODE_ENV=production, because a container filesystem is wiped on every deploy,
 * restart and free-tier spin-down — which is precisely what used to break
 * already-shared /x/:id links.
 */

import { randomInt } from 'node:crypto'
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import path from 'node:path'
import { DATA_DIR } from './config.js'
import { normalizeCode, round2 } from './influencers.js'
import { normalizeCouponCode } from './coupons.js'
import type {
  AuthTokenPurpose,
  AuthTokenRecord,
  CouponRecord,
  CreateAuthTokenInput,
  CreateCouponInput,
  CreateCustomerInput,
  CreateInfluencerInput,
  CreateOrderInput,
  CustomerRecord,
  ExperienceRecord,
  InfluencerMetrics,
  InfluencerRecord,
  InfluencerStatus,
  OrderRecord,
  Store,
  StoredAuthToken,
  StoredCoupon,
  StoredCustomer,
  StoredExperience,
  StoredInfluencer,
  StoredOrder,
  UpdateCouponInput,
  UpdateCustomerInput,
  UpdateInfluencerInput,
} from './store.js'

export const DB_FILE = path.join(DATA_DIR, 'db.json')
/** Every write goes to a temp file first, then a single atomic rename. */
const DB_TMP_FILE = `${DB_FILE}.tmp`
const DB_BACKUP_FILE = `${DB_FILE}.bak`
const DB_BACKUP_TMP_FILE = `${DB_BACKUP_FILE}.tmp`

export interface JsonDatabase {
  orders: StoredOrder[]
  experiences: StoredExperience[]
  product_prices: Record<string, number>
  template_audio?: Record<string, { audio_data?: string; audio_url?: string }>
  influencers?: StoredInfluencer[]
  /** Generic campaign codes. Absent on pre-coupon files, hence optional. */
  coupons?: StoredCoupon[]
  /** Customer accounts. Absent on pre-auth files, hence optional. */
  customers?: StoredCustomer[]
  /** Single-use e-mail verification / password-reset links (hashed). */
  auth_tokens?: StoredAuthToken[]
}

if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true })
}

export function emptyJsonDb(): JsonDatabase {
  return {
    orders: [],
    experiences: [],
    product_prices: {},
    template_audio: {},
    influencers: [],
    coupons: [],
    customers: [],
    auth_tokens: [],
  }
}

type Row = Record<string, unknown>

function pick(row: Row, ...keys: string[]): unknown {
  for (const key of keys) {
    const value = row[key]
    if (value !== undefined) return value
  }
  return undefined
}

function asText(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function asNullableText(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

/**
 * Normalizes a raw order row into the snake_case shape used internally.
 *
 * `db.json` has always stored camelCase keys (`gatewayOrderId`,
 * `customizationPayload`, `experienceId`, …). Both spellings are accepted so
 * that an untouched production db.json — the migration source — is read exactly
 * as it was written, with no field silently dropped.
 */
export function normalizeStoredOrder(raw: unknown): StoredOrder | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Row
  const id = asText(pick(row, 'id'))
  const gatewayOrderId = asText(pick(row, 'gatewayOrderId', 'gateway_order_id'))
  if (!id || !gatewayOrderId) return null
  const createdAt = asText(pick(row, 'createdAt', 'created_at'))
  return {
    id,
    gateway_order_id: gatewayOrderId,
    gateway_payment_id: asNullableText(pick(row, 'gatewayPaymentId', 'gateway_payment_id')),
    template_id: asText(pick(row, 'templateId', 'template_id')),
    amount: Number(pick(row, 'amount')) || 0,
    currency: asText(pick(row, 'currency'), 'INR'),
    status: asText(pick(row, 'status'), 'PENDING'),
    customization_payload: pick(row, 'customizationPayload', 'customization_payload') ?? null,
    experience_id: asNullableText(pick(row, 'experienceId', 'experience_id')),
    created_at: createdAt,
    updated_at: asText(pick(row, 'updatedAt', 'updated_at'), createdAt),
    customer_id: asNullableText(pick(row, 'customerId', 'customer_id')),
  }
}

/** Normalizes a raw experience row; the public slug is taken verbatim. */
export function normalizeStoredExperience(raw: unknown): StoredExperience | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Row
  const id = asText(pick(row, 'id'))
  if (!id) return null
  return {
    id,
    order_id: asText(pick(row, 'orderId', 'order_id')),
    template_id: asText(pick(row, 'templateId', 'template_id')),
    config: pick(row, 'config') ?? null,
    status: asText(pick(row, 'status'), 'LOCKED'),
    locked_at: asNullableText(pick(row, 'lockedAt', 'locked_at')),
    view_count: Number(pick(row, 'viewCount', 'view_count')) || 0,
    created_at: asText(pick(row, 'createdAt', 'created_at')),
  }
}

/** Normalizes a raw influencer row; missing rates default to 0, never undefined. */
export function normalizeStoredInfluencer(raw: unknown): StoredInfluencer | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Row
  const id = asText(pick(row, 'id'))
  const name = asText(pick(row, 'name'))
  const uniqueCode = asText(pick(row, 'unique_code', 'uniqueCode'))
  if (!id || !name || !uniqueCode) return null
  return {
    id,
    name,
    email: asNullableText(pick(row, 'email')),
    phone: asNullableText(pick(row, 'phone')),
    unique_code: normalizeCode(uniqueCode),
    discount_percentage: Number(pick(row, 'discount_percentage', 'discountPercentage')) || 0,
    commission_percentage: Number(pick(row, 'commission_percentage', 'commissionPercentage')) || 0,
    expiry_date: asNullableText(pick(row, 'expiry_date', 'expiryDate')),
    status: asText(pick(row, 'status'), 'active') === 'paused' ? 'paused' : 'active',
    created_at: asText(pick(row, 'created_at', 'createdAt')),
    updated_at: asText(pick(row, 'updated_at', 'updatedAt'), asText(pick(row, 'created_at', 'createdAt'))),
  }
}

/**
 * Normalizes a raw generic-coupon row. Accepts both the snake_case shape the
 * store writes and a camelCase one, so a hand-edited or migrated db.json loads
 * the same way. A row without a code or a usable value is dropped rather than
 * guessed at: a coupon that silently priced at ₹0 would be a free order.
 */
export function normalizeStoredCoupon(raw: unknown): StoredCoupon | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Row
  const code = asText(pick(row, 'code'))
  const value = Number(pick(row, 'value'))
  if (!code || !Number.isFinite(value) || value <= 0) return null

  const kind = asText(pick(row, 'kind'), 'percent') === 'flat' ? 'flat' : 'percent'
  const statusRaw = asText(pick(row, 'status'), 'active')
  const status = statusRaw === 'paused' || statusRaw === 'deleted' ? statusRaw : 'active'
  const appliesTo = pick(row, 'applies_to', 'appliesTo')
  const maxRaw = pick(row, 'max_redemptions', 'maxRedemptions')
  const maxRedemptions = Number(maxRaw)
  const createdAt = asText(pick(row, 'created_at', 'createdAt'))

  return {
    code: normalizeCouponCode(code),
    kind,
    value,
    applies_to: Array.isArray(appliesTo)
      ? appliesTo.filter((entry): entry is string => typeof entry === 'string')
      : [],
    min_amount: Math.max(0, Number(pick(row, 'min_amount', 'minAmount')) || 0),
    max_redemptions:
      maxRaw === null || maxRaw === undefined || !Number.isFinite(maxRedemptions) || maxRedemptions <= 0
        ? null
        : Math.floor(maxRedemptions),
    starts_at: asNullableText(pick(row, 'starts_at', 'startsAt')),
    expires_at: asNullableText(pick(row, 'expires_at', 'expiresAt')),
    status,
    created_at: createdAt,
    updated_at: asText(pick(row, 'updated_at', 'updatedAt'), createdAt),
  }
}

/**
 * Normalizes a raw customer row. An account without an e-mail cannot log in,
 * so such a row is dropped rather than guessed at. The e-mail is lower-cased on
 * read so a hand-edited file cannot create two spellings of one address.
 */
export function normalizeStoredCustomer(raw: unknown): StoredCustomer | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Row
  const id = asText(pick(row, 'id'))
  const email = asText(pick(row, 'email')).trim().toLowerCase()
  if (!id || !email) return null
  const createdAt = asText(pick(row, 'created_at', 'createdAt'))
  return {
    id,
    email,
    password_hash: asNullableText(pick(row, 'password_hash', 'passwordHash')),
    name: asText(pick(row, 'name')),
    avatar_url: asNullableText(pick(row, 'avatar_url', 'avatarUrl')),
    google_sub: asNullableText(pick(row, 'google_sub', 'googleSub')),
    email_verified: pick(row, 'email_verified', 'emailVerified') === true,
    created_at: createdAt,
    updated_at: asText(pick(row, 'updated_at', 'updatedAt'), createdAt),
  }
}

/** Normalizes a raw single-use auth link row. */
export function normalizeStoredAuthToken(raw: unknown): StoredAuthToken | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Row
  const id = asText(pick(row, 'id'))
  const customerId = asText(pick(row, 'customer_id', 'customerId'))
  const tokenHash = asText(pick(row, 'token_hash', 'tokenHash'))
  const expiresAt = asText(pick(row, 'expires_at', 'expiresAt'))
  if (!id || !customerId || !tokenHash || !expiresAt) return null
  const purpose = asText(pick(row, 'purpose')) === 'reset_password' ? 'reset_password' : 'verify_email'
  const createdAt = asText(pick(row, 'created_at', 'createdAt'))
  return {
    id,
    customer_id: customerId,
    purpose,
    token_hash: tokenHash,
    expires_at: expiresAt,
    used_at: asNullableText(pick(row, 'used_at', 'usedAt')),
    created_at: createdAt,
  }
}

/**
 * Reads and parses db.json without touching or repairing anything. Shared by the
 * store and by the migration script so both see identical bytes.
 *
 * A UTF-8 BOM (left by an editor, a manual edit, or a Windows tool) makes
 * JSON.parse throw, and swallowing that would silently turn the whole database
 * into "not found", so the BOM is stripped and a parse failure is reported.
 */
export function readJsonDbFile(file: string = DB_FILE): JsonDatabase {
  if (!existsSync(file)) return emptyJsonDb()
  const raw = readFileSync(file, 'utf8').replace(/^\uFEFF/, '')
  const parsed = JSON.parse(raw) as Partial<JsonDatabase> & Record<string, unknown>
  return {
    orders: Array.isArray(parsed.orders)
      ? (parsed.orders as unknown[])
          .map(normalizeStoredOrder)
          .filter((row): row is StoredOrder => row !== null)
      : [],
    experiences: Array.isArray(parsed.experiences)
      ? (parsed.experiences as unknown[])
          .map(normalizeStoredExperience)
          .filter((row): row is StoredExperience => row !== null)
      : [],
    product_prices:
      typeof parsed.product_prices === 'object' && parsed.product_prices !== null
        ? (parsed.product_prices as Record<string, number>)
        : {},
    template_audio:
      typeof parsed.template_audio === 'object' && parsed.template_audio !== null
        ? (parsed.template_audio as Record<string, { audio_data?: string; audio_url?: string }>)
        : {},
    influencers: Array.isArray(parsed.influencers)
      ? (parsed.influencers as unknown[])
          .map(normalizeStoredInfluencer)
          .filter((row): row is StoredInfluencer => row !== null)
      : [],
    coupons: Array.isArray(parsed.coupons)
      ? (parsed.coupons as unknown[])
          .map(normalizeStoredCoupon)
          .filter((row): row is StoredCoupon => row !== null)
      : [],
    customers: Array.isArray(parsed.customers)
      ? (parsed.customers as unknown[])
          .map(normalizeStoredCustomer)
          .filter((row): row is StoredCustomer => row !== null)
      : [],
    auth_tokens: Array.isArray(parsed.auth_tokens)
      ? (parsed.auth_tokens as unknown[])
          .map(normalizeStoredAuthToken)
          .filter((row): row is StoredAuthToken => row !== null)
      : [],
  }
}

type StoreRead =
  | { kind: 'ok'; db: JsonDatabase }
  | { kind: 'missing' }
  | { kind: 'corrupt' }

function readStoreFile(file: string): StoreRead {
  if (!existsSync(file)) return { kind: 'missing' }
  try {
    return { kind: 'ok', db: readJsonDbFile(file) }
  } catch (error) {
    console.error(
      `[db] CRITICAL: could not parse ${file}. Refusing to overwrite the file.`,
      error,
    )
    return { kind: 'corrupt' }
  }
}

/**
 * Identifies the on-disk store cheaply so repeated public GETs do not re-parse
 * a multi-megabyte JSON (a single customization can carry several MB of
 * base64 photos) on every page view.
 */
function storeVersion(): string {
  try {
    const stat = statSync(DB_FILE)
    return `${stat.mtimeMs}:${stat.size}`
  } catch {
    return 'missing'
  }
}

let cache: { version: string; db: JsonDatabase } | null = null
/**
 * Set when the store file exists but cannot be parsed and no usable backup
 * exists. While true, save() refuses to write: writing an empty database over a
 * file we merely failed to read would permanently destroy live share links.
 */
let storeUnreadable = false

export function loadJsonDb(): JsonDatabase {
  const version = storeVersion()
  if (cache && cache.version === version) return cache.db

  const primary = readStoreFile(DB_FILE)
  if (primary.kind === 'ok') {
    storeUnreadable = false
    cache = { version, db: primary.db }
    return primary.db
  }

  if (primary.kind === 'missing') {
    storeUnreadable = false
    const db = emptyJsonDb()
    cache = { version, db }
    return db
  }

  // The primary file is present but unreadable. Fall back to the last known-good
  // copy so a single truncated/garbled write degrades to "as of the previous
  // write" instead of taking every live share link offline.
  const backup = readStoreFile(DB_BACKUP_FILE)
  if (backup.kind === 'ok') {
    console.error(`[db] RECOVERED from ${DB_BACKUP_FILE}.`)
    storeUnreadable = false
    cache = { version, db: backup.db }
    return backup.db
  }

  storeUnreadable = true
  cache = null
  return emptyJsonDb()
}

export function saveJsonDb(db: JsonDatabase): void {
  if (storeUnreadable) {
    throw new Error(
      `Refusing to write ${DB_FILE}: the existing store could not be parsed and no usable backup exists. ` +
        'Move the file aside to start a new database, otherwise this write would delete every existing order and generated website.',
    )
  }

  mkdirSync(DATA_DIR, { recursive: true })
  const serialized = JSON.stringify(db, null, 2)

  // Preserve the current file as the recovery copy before replacing it.
  if (existsSync(DB_FILE)) {
    try {
      copyFileSync(DB_FILE, DB_BACKUP_TMP_FILE)
      renameSync(DB_BACKUP_TMP_FILE, DB_BACKUP_FILE)
    } catch (error) {
      console.warn('[db] could not refresh the recovery copy:', error)
    }
  }

  writeFileSync(DB_TMP_FILE, serialized, 'utf8')
  renameSync(DB_TMP_FILE, DB_FILE)
  cache = { version: storeVersion(), db }
}

/** Lowercase so a hand-typed or re-copied share link always matches. */
const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz'

export function shortId(length = 8): string {
  let out = ''
  for (let i = 0; i < length; i += 1) out += ALPHABET[randomInt(ALPHABET.length)]
  return out
}

const EXPERIENCE_ID_LENGTH = 12

function generateExperienceId(db: JsonDatabase): string {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const candidate = shortId(EXPERIENCE_ID_LENGTH)
    const taken =
      db.experiences.some((experience) => experience.id === candidate) ||
      db.orders.some((order) => order.experience_id === candidate)
    if (!taken) return candidate
  }
  throw new Error('Could not allocate a unique share-link id.')
}

/** Inverts `StoredOrder` into the app-facing shape. */
export function mapOrder(row: StoredOrder): OrderRecord {
  return {
    id: row.id,
    gatewayOrderId: row.gateway_order_id,
    gatewayPaymentId: row.gateway_payment_id ?? null,
    templateId: row.template_id,
    amount: typeof row.amount === 'number' ? row.amount : Number(row.amount),
    currency: row.currency,
    status: row.status === 'PAID' || row.status === 'FAILED' ? row.status : 'PENDING',
    customizationPayload: row.customization_payload,
    experienceId: row.experience_id ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    influencerId: row.influencer_id ?? null,
    couponCode: row.coupon_code ?? null,
    originalAmount:
      row.original_amount === null || row.original_amount === undefined
        ? null
        : Number(row.original_amount),
    discountGiven: Number(row.discount_given ?? 0) || 0,
    netRevenue: Number(row.net_revenue ?? 0) || 0,
    influencerCommissionEarned: Number(row.influencer_commission_earned ?? 0) || 0,
    trafficSource: row.traffic_source ?? null,
    customerIp: row.customer_ip ?? null,
    customerId: row.customer_id ?? null,
  }
}

/** Inverts `StoredInfluencer` into the app-facing shape. */
export function mapInfluencer(row: StoredInfluencer): InfluencerRecord {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    uniqueCode: row.unique_code,
    discountPercentage: Number(row.discount_percentage) || 0,
    commissionPercentage: Number(row.commission_percentage) || 0,
    commissionPaid: Number(row.commission_paid ?? 0) || 0,
    expiryDate: row.expiry_date,
    status: row.status === 'paused' ? 'paused' : 'active',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/** Inverts `StoredCoupon` into the app-facing shape. */
export function mapCoupon(row: StoredCoupon): CouponRecord {
  return {
    code: row.code,
    kind: row.kind === 'flat' ? 'flat' : 'percent',
    value: Number(row.value) || 0,
    appliesTo: Array.isArray(row.applies_to)
      ? row.applies_to.filter((entry): entry is string => typeof entry === 'string')
      : [],
    minAmount: Number(row.min_amount) || 0,
    maxRedemptions:
      row.max_redemptions === null || row.max_redemptions === undefined
        ? null
        : Number(row.max_redemptions),
    startsAt: row.starts_at ?? null,
    expiresAt: row.expires_at ?? null,
    status: row.status === 'paused' || row.status === 'deleted' ? row.status : 'active',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapExperience(row: StoredExperience): ExperienceRecord {
  return {
    id: row.id,
    orderId: row.order_id,
    templateId: row.template_id,
    config: row.config ?? null,
    // Records written before the lock model existed have no status and always
    // meant "final", so an absent/unknown value is LOCKED. A DRAFT that really
    // was stored as one is preserved, and the API refuses to serve it publicly.
    status: row.status === 'DRAFT' ? 'DRAFT' : 'LOCKED',
    lockedAt: asNullableText(row.locked_at),
    viewCount: Number(row.view_count) || 0,
    createdAt: row.created_at,
  }
}

/** Inverts `StoredCustomer` into the app-facing shape. */
export function mapCustomer(row: StoredCustomer): CustomerRecord {
  return {
    id: row.id,
    email: (row.email ?? '').trim().toLowerCase(),
    name: (row.name ?? '').trim(),
    passwordHash: row.password_hash ?? null,
    avatarUrl: row.avatar_url ?? null,
    googleSub: row.google_sub ?? null,
    emailVerified: row.email_verified === true,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? row.created_at,
  }
}

/** Inverts `StoredAuthToken` into the app-facing shape. */
export function mapAuthToken(row: StoredAuthToken): AuthTokenRecord {
  return {
    id: row.id,
    customerId: row.customer_id,
    purpose: row.purpose === 'reset_password' ? 'reset_password' : 'verify_email',
    tokenHash: row.token_hash,
    expiresAt: row.expires_at,
    usedAt: row.used_at ?? null,
    createdAt: row.created_at,
  }
}

export class JsonFileStore implements Store {
  readonly kind = 'json-file'
  readonly durable = false

  async createOrder(input: CreateOrderInput): Promise<OrderRecord> {
    const db = loadJsonDb()
    const now = new Date().toISOString()
    const attribution = input.attribution
    const row: StoredOrder = {
      id: input.id ?? crypto.randomUUID(),
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
      net_revenue: attribution?.netRevenue ?? input.amount,
      influencer_commission_earned: attribution?.commissionEarned ?? 0,
      traffic_source: attribution?.trafficSource ?? null,
      customer_ip: attribution?.customerIp ?? null,
      customer_id: input.customerId ?? null,
    }
    db.orders.push(row)
    saveJsonDb(db)
    return mapOrder(row)
  }

  async getOrderById(id: string): Promise<OrderRecord | null> {
    const row = loadJsonDb().orders.find((order) => order.id === id)
    return row ? mapOrder(row) : null
  }

  async getOrderByGatewayOrderId(gatewayOrderId: string): Promise<OrderRecord | null> {
    const row = loadJsonDb().orders.find((order) => order.gateway_order_id === gatewayOrderId)
    return row ? mapOrder(row) : null
  }

  async findOrdersByCustomer(customerId: string): Promise<OrderRecord[]> {
    const rows = loadJsonDb().orders.filter((order) => order.customer_id === customerId)
    return rows
      .map(mapOrder)
      .sort(
        (a, b) =>
          a.createdAt === b.createdAt
            ? b.gatewayOrderId.localeCompare(a.gatewayOrderId)
            : a.createdAt > b.createdAt
              ? -1
              : 1,
      )
  }

  private async findOrder(idOrGatewayId: string): Promise<OrderRecord | null> {
    const db = loadJsonDb()
    const row =
      db.orders.find((order) => order.id === idOrGatewayId) ??
      db.orders.find((order) => order.gateway_order_id === idOrGatewayId)
    return row ? mapOrder(row) : null
  }

  async finalizeOrderForPayment(input: {
    orderId: string
    gatewayPaymentId?: string | null
  }): Promise<ExperienceRecord> {
    const db = loadJsonDb()
    const orderRow =
      db.orders.find((order) => order.id === input.orderId) ??
      db.orders.find((order) => order.gateway_order_id === input.orderId)

    if (!orderRow) throw new Error('Order not found.')

    if (orderRow.status === 'PAID' && orderRow.experience_id) {
      const existing = db.experiences.find((experience) => experience.id === orderRow.experience_id)
      if (existing) return mapExperience(existing)
    }

    const now = new Date().toISOString()
    const experience: StoredExperience = {
      id: generateExperienceId(db),
      order_id: orderRow.id,
      template_id: orderRow.template_id,
      config: orderRow.customization_payload,
      status: 'LOCKED',
      locked_at: now,
      view_count: 0,
      created_at: now,
    }

    orderRow.status = 'PAID'
    orderRow.gateway_payment_id = input.gatewayPaymentId ?? null
    orderRow.experience_id = experience.id
    orderRow.updated_at = now

    db.experiences.push(experience)
    saveJsonDb(db)
    return mapExperience(experience)
  }

  async getExperienceById(id: string): Promise<ExperienceRecord | null> {
    const db = loadJsonDb()
    const direct = db.experiences.find((experience) => experience.id === id)
    if (direct) return mapExperience(direct)

    const order =
      db.orders.find((order) => order.id === id) ??
      db.orders.find((order) => order.gateway_order_id === id)
    if (order?.experience_id) {
      const viaOrder = db.experiences.find((experience) => experience.id === order.experience_id)
      if (viaOrder) return mapExperience(viaOrder)
    }
    return null
  }

  async isExperienceLocked(id: string): Promise<boolean> {
    const db = loadJsonDb()
    return db.experiences.some((experience) => experience.id === id && experience.status === 'LOCKED')
  }

  async incrementViewCount(id: string): Promise<void> {
    // Best-effort only: a full disk, a read-only mount or a failed write must
    // never be able to break a share link that has already been delivered.
    try {
      const db = loadJsonDb()
      const experience = db.experiences.find((record) => record.id === id)
      if (!experience) return
      experience.view_count = (Number(experience.view_count) || 0) + 1
      saveJsonDb(db)
    } catch (error) {
      console.warn(`[db] view count not recorded for ${id}:`, error)
    }
  }

  async countExperiences(): Promise<number> {
    return loadJsonDb().experiences.length
  }

  async healthCheck(): Promise<{ ok: boolean; detail: string }> {
    try {
      return { ok: true, detail: `local db.json, ${loadJsonDb().experiences.length} website(s)` }
    } catch (error) {
      return { ok: false, detail: (error as Error).message }
    }
  }

  async getProductPrice(templateId: string): Promise<number | null> {
    const db = loadJsonDb()
    const price = db.product_prices[templateId]
    return typeof price === 'number' && price > 0 ? price : null
  }

  async updateProductPrice(templateId: string, price: number): Promise<number> {
    if (price < 0) {
      throw new Error('Price cannot be negative')
    }
    const db = loadJsonDb()
    db.product_prices[templateId] = price
    saveJsonDb(db)
    return price
  }

  async getTemplateAudio(templateId: string): Promise<{ audioData?: string; audioUrl?: string } | null> {
    const db = loadJsonDb()
    const audio = db.template_audio?.[templateId]
    if (!audio) return null
    return {
      audioData: audio.audio_data,
      audioUrl: audio.audio_url,
    }
  }

  async setTemplateAudio(templateId: string, audioData: string | null, audioUrl: string | null): Promise<void> {
    const db = loadJsonDb()
    if (!db.template_audio) {
      db.template_audio = {}
    }
    db.template_audio[templateId] = {
      audio_data: audioData ?? undefined,
      audio_url: audioUrl ?? undefined,
    }
    saveJsonDb(db)
  }

  // ------------------------------------------------------------- influencers --

  async listInfluencers(): Promise<InfluencerRecord[]> {
    const rows = loadJsonDb().influencers ?? []
    // Newest first so a freshly created partner is visible at the top.
    return [...rows]
      .sort((a, b) => (a.created_at < b.created_at ? 1 : a.created_at > b.created_at ? -1 : 0))
      .map(mapInfluencer)
  }

  async getInfluencerById(id: string): Promise<InfluencerRecord | null> {
    const row = (loadJsonDb().influencers ?? []).find((entry) => entry.id === id)
    return row ? mapInfluencer(row) : null
  }

  async getInfluencerByCode(code: string): Promise<InfluencerRecord | null> {
    const normalized = normalizeCode(code)
    const row = (loadJsonDb().influencers ?? []).find(
      (entry) => normalizeCode(entry.unique_code) === normalized,
    )
    return row ? mapInfluencer(row) : null
  }

  async createInfluencer(input: CreateInfluencerInput): Promise<InfluencerRecord> {
    const db = loadJsonDb()
    if (!db.influencers) db.influencers = []
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
    db.influencers.push(row)
    saveJsonDb(db)
    return mapInfluencer(row)
  }

  async updateInfluencer(
    id: string,
    input: UpdateInfluencerInput,
  ): Promise<InfluencerRecord | null> {
    const db = loadJsonDb()
    const row = (db.influencers ?? []).find((entry) => entry.id === id)
    if (!row) return null

    if (input.name !== undefined) row.name = input.name.trim()
    if (input.email !== undefined) row.email = input.email?.trim() || null
    if (input.phone !== undefined) row.phone = input.phone?.trim() || null
    if (input.uniqueCode !== undefined) row.unique_code = normalizeCode(input.uniqueCode)
    if (input.discountPercentage !== undefined) {
      row.discount_percentage = input.discountPercentage
    }
    if (input.commissionPercentage !== undefined) {
      row.commission_percentage = input.commissionPercentage
    }
    if (input.expiryDate !== undefined) row.expiry_date = input.expiryDate ?? null
    if (input.status !== undefined) row.status = input.status
    row.updated_at = new Date().toISOString()

    saveJsonDb(db)
    return mapInfluencer(row)
  }

  async deleteInfluencer(id: string): Promise<boolean> {
    const db = loadJsonDb()
    const rows = db.influencers ?? []
    const index = rows.findIndex((entry) => entry.id === id)
    if (index === -1) return false
    rows.splice(index, 1)
    // Mirrors the FK's ON DELETE SET NULL: the partner is gone, but the money
    // snapshots on their past orders survive so payouts stay auditable.
    for (const order of db.orders) {
      if (order.influencer_id === id) order.influencer_id = null
    }
    saveJsonDb(db)
    return true
  }

  async getInfluencerMetrics(): Promise<Map<string, InfluencerMetrics>> {
    const metrics = new Map<string, InfluencerMetrics>()
    // PENDING orders are deliberately excluded: an influencer has not earned
    // anything until the buyer's payment is actually confirmed.
    for (const order of loadJsonDb().orders) {
      if (order.status !== 'PAID' || !order.influencer_id) continue
      const current = metrics.get(order.influencer_id) ?? {
        totalOrders: 0,
        totalRevenueGenerated: 0,
        totalDiscountGiven: 0,
        commissionEarned: 0,
        commissionOwed: 0,
      }
      current.totalOrders += 1
      current.totalRevenueGenerated = round2(
        current.totalRevenueGenerated + (Number(order.amount) || 0),
      )
      current.totalDiscountGiven = round2(
        current.totalDiscountGiven + (Number(order.discount_given) || 0),
      )
      current.commissionEarned = round2(
        current.commissionEarned + (Number(order.influencer_commission_earned) || 0),
      )
      // Cupi has no payout table yet: nothing ever marks a commission as paid,
      // so everything earned is still owed. postgresStore reports the same
      // figure, and the dashboard reads it as "total commission owed".
      current.commissionOwed = current.commissionEarned
      metrics.set(order.influencer_id, current)
    }
    return metrics
  }

  // ---------------------------------------------------------------- coupons --

  async listCoupons(): Promise<CouponRecord[]> {
    const rows = loadJsonDb().coupons ?? []
    return rows
      .map(mapCoupon)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  async getCouponByCode(code: string): Promise<CouponRecord | null> {
    const normalized = normalizeCouponCode(code)
    if (!normalized) return null
    const row = (loadJsonDb().coupons ?? []).find((entry) => entry.code === normalized)
    return row ? mapCoupon(row) : null
  }

  async createCoupon(input: CreateCouponInput): Promise<CouponRecord> {
    const db = loadJsonDb()
    const rows = (db.coupons ??= [])
    const code = normalizeCouponCode(input.code)
    if (rows.some((entry) => entry.code === code)) {
      throw new Error(`coupon code already exists: ${code}`)
    }
    const now = new Date().toISOString()
    const row: StoredCoupon = {
      code,
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
    rows.push(row)
    saveJsonDb(db)
    return mapCoupon(row)
  }

  async updateCoupon(
    code: string,
    input: UpdateCouponInput,
  ): Promise<CouponRecord | null> {
    const db = loadJsonDb()
    const normalized = normalizeCouponCode(code)
    const row = (db.coupons ?? []).find((entry) => entry.code === normalized)
    if (!row) return null

    if (input.kind !== undefined) row.kind = input.kind
    if (input.value !== undefined) row.value = input.value
    if (input.appliesTo !== undefined) row.applies_to = input.appliesTo
    if (input.minAmount !== undefined) row.min_amount = input.minAmount
    if (input.maxRedemptions !== undefined) row.max_redemptions = input.maxRedemptions
    if (input.startsAt !== undefined) row.starts_at = input.startsAt
    if (input.expiresAt !== undefined) row.expires_at = input.expiresAt
    if (input.status !== undefined) row.status = input.status
    row.updated_at = new Date().toISOString()

    saveJsonDb(db)
    return mapCoupon(row)
  }

  async deleteCoupon(code: string): Promise<boolean> {
    const db = loadJsonDb()
    const normalized = normalizeCouponCode(code)
    const rows = db.coupons ?? []
    const index = rows.findIndex((entry) => entry.code === normalized)
    if (index < 0) return false
    rows.splice(index, 1)
    saveJsonDb(db)
    return true
  }

  /**
   * PAID orders only: an abandoned PENDING checkout must not burn a
   * redemption, since nothing expires pending orders yet.
   */
  async countCouponRedemptions(code: string): Promise<number> {
    const normalized = normalizeCouponCode(code)
    if (!normalized) return 0
    return loadJsonDb().orders.filter(
      (order) =>
        order.status === 'PAID' &&
        normalizeCouponCode(order.coupon_code ?? '') === normalized,
    ).length
  }

  async getCouponRedemptionCounts(): Promise<Map<string, number>> {
    const counts = new Map<string, number>()
    for (const order of loadJsonDb().orders) {
      if (order.status !== 'PAID') continue
      const code = normalizeCouponCode(order.coupon_code ?? '')
      if (!code) continue
      counts.set(code, (counts.get(code) ?? 0) + 1)
    }
    return counts
  }

  // -------------------------------------------------------------- customers --

  async getCustomerById(id: string): Promise<CustomerRecord | null> {
    const row = (loadJsonDb().customers ?? []).find((entry) => entry.id === id)
    return row ? mapCustomer(row) : null
  }

  /** Case-insensitive, matching the lower-cased e-mail every write path stores. */
  async getCustomerByEmail(email: string): Promise<CustomerRecord | null> {
    const normalized = email.trim().toLowerCase()
    if (!normalized) return null
    const row = (loadJsonDb().customers ?? []).find((entry) => entry.email === normalized)
    return row ? mapCustomer(row) : null
  }

  async getCustomerByGoogleSub(sub: string): Promise<CustomerRecord | null> {
    if (!sub) return null
    const row = (loadJsonDb().customers ?? []).find((entry) => entry.google_sub === sub)
    return row ? mapCustomer(row) : null
  }

  async createCustomer(input: CreateCustomerInput): Promise<CustomerRecord> {
    const db = loadJsonDb()
    const rows = (db.customers ??= [])
    const email = input.email.trim().toLowerCase()
    if (rows.some((entry) => entry.email === email)) {
      throw new Error(`customer already exists: ${email}`)
    }
    const now = new Date().toISOString()
    const row: StoredCustomer = {
      id: crypto.randomUUID(),
      email,
      password_hash: input.passwordHash ?? null,
      name: input.name.trim(),
      avatar_url: input.avatarUrl ?? null,
      google_sub: input.googleSub ?? null,
      email_verified: input.emailVerified ?? false,
      created_at: now,
      updated_at: now,
    }
    rows.push(row)
    saveJsonDb(db)
    return mapCustomer(row)
  }

  async updateCustomer(
    id: string,
    input: UpdateCustomerInput,
  ): Promise<CustomerRecord | null> {
    const db = loadJsonDb()
    const row = (db.customers ?? []).find((entry) => entry.id === id)
    if (!row) return null

    if (input.name !== undefined) row.name = input.name.trim()
    if (input.passwordHash !== undefined) row.password_hash = input.passwordHash
    if (input.avatarUrl !== undefined) row.avatar_url = input.avatarUrl
    if (input.googleSub !== undefined) row.google_sub = input.googleSub
    if (input.emailVerified !== undefined) row.email_verified = input.emailVerified
    row.updated_at = new Date().toISOString()

    saveJsonDb(db)
    return mapCustomer(row)
  }

  async createAuthToken(input: CreateAuthTokenInput): Promise<AuthTokenRecord> {
    const db = loadJsonDb()
    const rows = (db.auth_tokens ??= [])
    const now = new Date().toISOString()
    const row: StoredAuthToken = {
      id: crypto.randomUUID(),
      customer_id: input.customerId,
      purpose: input.purpose,
      token_hash: input.tokenHash,
      expires_at: input.expiresAt,
      used_at: null,
      created_at: now,
    }
    rows.push(row)
    saveJsonDb(db)
    return mapAuthToken(row)
  }

  async getAuthTokenByHash(tokenHash: string): Promise<AuthTokenRecord | null> {
    if (!tokenHash) return null
    const row = (loadJsonDb().auth_tokens ?? []).find(
      (entry) => entry.token_hash === tokenHash,
    )
    return row ? mapAuthToken(row) : null
  }

  async markAuthTokenUsed(id: string): Promise<void> {
    const db = loadJsonDb()
    const row = (db.auth_tokens ?? []).find((entry) => entry.id === id)
    if (!row || row.used_at) return
    row.used_at = new Date().toISOString()
    saveJsonDb(db)
  }

  async invalidateAuthTokens(customerId: string, purpose: AuthTokenPurpose): Promise<void> {
    const db = loadJsonDb()
    const now = new Date().toISOString()
    let changed = false
    for (const row of db.auth_tokens ?? []) {
      if (row.customer_id !== customerId || row.purpose !== purpose || row.used_at) continue
      row.used_at = now
      changed = true
    }
    if (changed) saveJsonDb(db)
  }
}
