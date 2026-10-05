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
import type {
  CreateOrderInput,
  ExperienceRecord,
  OrderRecord,
  Store,
  StoredExperience,
  StoredOrder,
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
}

if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true })
}

export function emptyJsonDb(): JsonDatabase {
  return { orders: [], experiences: [], product_prices: {}, template_audio: {} }
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

export class JsonFileStore implements Store {
  readonly kind = 'json-file'
  readonly durable = false

  async createOrder(input: CreateOrderInput): Promise<OrderRecord> {
    const db = loadJsonDb()
    const now = new Date().toISOString()
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
}
