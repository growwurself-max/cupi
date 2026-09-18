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

export interface ExperienceRecord {
  id: string
  orderId: string
  templateId: string
  config: unknown
  status: 'LOCKED'
  viewCount: number
  createdAt: string
}

interface DatabaseShape {
  orders: OrderRecord[]
  experiences: ExperienceRecord[]
}

function emptyDb(): DatabaseShape {
  return { orders: [], experiences: [] }
}

function loadDb(): DatabaseShape {
  if (!existsSync(DB_FILE)) return emptyDb()
  try {
    const parsed = JSON.parse(readFileSync(DB_FILE, 'utf8')) as Partial<
      DatabaseShape
    >
    return {
      orders: Array.isArray(parsed.orders) ? (parsed.orders as OrderRecord[]) : [],
      experiences: Array.isArray(parsed.experiences)
        ? (parsed.experiences as ExperienceRecord[])
        : [],
    }
  } catch {
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
  gatewayOrderId: string
  templateId: string
  amount: number
  currency: string
  customizationPayload: unknown
}): OrderRecord {
  const db = loadDb()
  const now = new Date().toISOString()
  const record: OrderRecord = {
    id: systemId(),
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

export function incrementViewCount(id: string): void {
  const db = loadDb()
  const experience = db.experiences.find((record) => record.id === id)
  if (!experience) return
  experience.viewCount += 1
  saveDb(db)
}