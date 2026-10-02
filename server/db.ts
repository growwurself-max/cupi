import { randomInt, randomUUID } from 'node:crypto'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from 'node:fs'
import path from 'node:path'
import { DATA_DIR } from './config.js'

const DB_FILE = path.join(DATA_DIR, 'db.json')

// Render's filesystem is ephemeral and may start blank — make sure the data
// directory always exists so saveDb() never crashes on a missing folder.
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true })
}

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

interface DatabaseShape {
  orders: OrderRecord[]
  experiences: ExperienceRecord[]
}

function emptyDb(): DatabaseShape {
  return { orders: [], experiences: [] }
}

/**
 * Backward/forward-compatible read of a stored experience.
 *
 * Records written before the lock model existed have no `lockedAt` and always
 * carried `status: 'LOCKED'`; they are backfilled in place so links that were
 * already handed to customers keep working untouched. Any record that is not
 * explicitly final is treated as LOCKED rather than silently dropped — a
 * missing/!JSON status must never resurrect an editable public record.
 */
function normalizeExperience(raw: unknown): ExperienceRecord | null {
  if (!raw || typeof raw !== 'object') return null
  const record = raw as Partial<ExperienceRecord>
  if (typeof record.id !== 'string' || record.id.length === 0) return null
  return {
    id: record.id,
    orderId: typeof record.orderId === 'string' ? record.orderId : '',
    templateId: typeof record.templateId === 'string' ? record.templateId : '',
    config: record.config ?? null,
    status: 'LOCKED',
    lockedAt: typeof record.lockedAt === 'string' ? record.lockedAt : null,
    viewCount:
      typeof record.viewCount === 'number' && Number.isFinite(record.viewCount)
        ? record.viewCount
        : 0,
    createdAt: typeof record.createdAt === 'string' ? record.createdAt : new Date(0).toISOString(),
  }
}

function loadDb(): DatabaseShape {
  if (!existsSync(DB_FILE)) return emptyDb()
  try {
    // A UTF-8 BOM (left by an editor, a manual edit, or a Windows tool)
    // makes JSON.parse throw. Swallowing that would silently turn the whole
    // database into "not found" and 404 every share link, so strip it.
    const raw = readFileSync(DB_FILE, 'utf8').replace(/^\uFEFF/, '')
    const parsed = JSON.parse(raw) as Partial<DatabaseShape>
    return {
      orders: Array.isArray(parsed.orders) ? (parsed.orders as OrderRecord[]) : [],
      experiences: Array.isArray(parsed.experiences)
        ? (parsed.experiences as unknown[])
            .map(normalizeExperience)
            .filter((record): record is ExperienceRecord => record !== null)
        : [],
    }
  } catch (error) {
    // NEVER do this quietly. An unreadable db.json means every order and every
    // generated website is unreachable, so make it loud and keep the file
    // untouched — an empty read must never be written back over the data.
    console.error(
      `[db] CRITICAL: could not parse ${DB_FILE}. Every order and generated website is currently unreachable. Refusing to overwrite the file.`,
      error,
    )
    return emptyDb()
  }
}

function saveDb(db: DatabaseShape): void {
  mkdirSync(DATA_DIR, { recursive: true })
  const tmpFile = `${DB_FILE}.tmp`
  writeFileSync(tmpFile, JSON.stringify(db, null, 2), 'utf8')
  renameSync(tmpFile, DB_FILE)
}

const ALPHABET =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

export function shortId(length = 8): string {
  let out = ''
  for (let i = 0; i < length; i += 1) {
    out += ALPHABET[randomInt(ALPHABET.length)]
  }
  return out
}

export function systemId(): string {
  return randomUUID()
}

export function createOrder(input: {
  // Optional internal Cupi order id, generated in the route handler when the
  // id must be known before the gateway order is created (redirect URLs).
  id?: string
  gatewayOrderId: string
  templateId: string
  amount: number
  currency: string
  customizationPayload: unknown
}): OrderRecord {
  const db = loadDb()
  const now = new Date().toISOString()
  const record: OrderRecord = {
    id: input.id ?? systemId(),
    gatewayOrderId: input.gatewayOrderId,
    gatewayPaymentId: null,
    templateId: input.templateId,
    amount: input.amount,
    currency: input.currency,
    status: 'PENDING',
    customizationPayload: input.customizationPayload,
    experienceId: null,
    createdAt: now,
    updatedAt: now,
  }
  db.orders.push(record)
  saveDb(db)
  return record
}

export function getOrderByGatewayOrderId(
  gatewayOrderId: string,
): OrderRecord | null {
  const db = loadDb()
  return (
    db.orders.find((order) => order.gatewayOrderId === gatewayOrderId) ?? null
  )
}

export function getOrderById(id: string): OrderRecord | null {
  const db = loadDb()
  return db.orders.find((order) => order.id === id) ?? null
}

/**
 * Finalizes a verified payment by creating the LOCKED experience record and
 * flipping the order to PAID. Runs synchronously (single-threaded, no awaits)
 * so concurrent verify replay is impossible — the second request finds a PAID
 * order with an attached experience and returns the existing instance.
 *
 * Write-once by contract: a generated website is never re-created, overwritten
 * or regenerated. There is no code path in this module that mutates an existing
 * experience's `config`, so the public /x/:id link is permanently read-only
 * once this returns.
 */
export function finalizeOrderForPayment(input: {
  orderId: string
  gatewayPaymentId?: string | null
}): ExperienceRecord {
  const db = loadDb()
  const order = db.orders.find(
    (record) => record.id === input.orderId || record.gatewayOrderId === input.orderId,
  )

  if (!order) {
    throw new Error('Order not found.')
  }

  if (order.status === 'PAID' && order.experienceId) {
    const existing = db.experiences.find(
      (experience) => experience.id === order.experienceId,
    )
    if (existing) return existing
  }

  const now = new Date().toISOString()
  const experience: ExperienceRecord = {
    id: order.gatewayOrderId,
    orderId: order.id,
    templateId: order.templateId,
    config: order.customizationPayload,
    status: 'LOCKED',
    lockedAt: now,
    viewCount: 0,
    createdAt: now,
  }

  order.status = 'PAID'
  order.gatewayPaymentId = input.gatewayPaymentId ?? null
  order.experienceId = experience.id
  order.updatedAt = now

  db.experiences.push(experience)
  saveDb(db)
  return experience
}

export function getExperienceById(id: string): ExperienceRecord | null {
  const db = loadDb()
  return db.experiences.find((experience) => experience.id === id) ?? null
}

/**
 * True when the website is final (paid + generated). Every mutation path in
 * the API consults this before touching a record, so a share token can never
 * edit, regenerate or overwrite a completed website.
 */
export function isExperienceLocked(id: string): boolean {
  return getExperienceById(id)?.status === 'LOCKED'
}

export function incrementViewCount(id: string): void {
  const db = loadDb()
  const experience = db.experiences.find((record) => record.id === id)
  if (!experience) return
  // View counting is the ONLY permitted write against a locked record. It never
  // touches config/templateId/status, so the website stays read-only.
  experience.viewCount += 1
  saveDb(db)
}
