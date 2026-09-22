import { createHmac, timingSafeEqual } from 'node:crypto'

// Official FamGateway API — https://famgateway.in/docs.php
const FAMGATEWAY_BASE_URL = 'https://famgateway.in'
const FAMGATEWAY_CREATE_ORDER_URL = `${FAMGATEWAY_BASE_URL}/api/create-order`
const FAMGATEWAY_VERIFY_ORDER_URL = `${FAMGATEWAY_BASE_URL}/api/verify-order.php`

// All requests authenticate with the merchant API key server-side.
// Never expose this value to the React frontend.
function getApiKey(): string {
  return process.env.FAMGATEWAY_API_KEY ?? ''
}

interface JsonRecord {
  status?: unknown
  message?: unknown
  data?: Record<string, unknown> | null
}

export interface FamGatewayCreateOrderInput {
  amount: number
  redirectUrl: string
  webhookUrl: string
  customerName?: string
  customerEmail?: string
  customerPhone?: string
}

export interface FamGatewayOrder {
  orderId: string
  amount: number
  payableAmount: number
  checkoutUrl: string
  qrUrl?: string
  upiIntent?: string
}

export interface FamGatewayOrderStatus {
  orderId: string
  status: string
  amount: number | null
  payableAmount: number | null
  utr: string | null
  transactionId: string | null
}

interface FamGatewayResponse {
  json: JsonRecord | null
  ok: boolean
  status: number
}

async function famGatewayRequest(
  url: string,
  init: RequestInit = {},
): Promise<FamGatewayResponse> {
  const apiKey = getApiKey()
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(apiKey ? { 'X-Api-Key': apiKey } : {}),
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  })

  let json: JsonRecord | null = null
  try {
    const parsed: unknown = await response.json()
    if (parsed && typeof parsed === 'object') {
      json = parsed as JsonRecord
    }
  } catch {
    json = null
  }

  return { json, ok: response.ok, status: response.status }
}

/**
 * Creates a FamGateway payment order and normalizes the documented
 * `data.*` response (`order_id`, `amount`, `payable_amount`, `qr_url`,
 * `checkout_url`, `upi_intent`) into an internal shape. Throws on
 * non-2xx or malformed responses — nothing is trusted blindly.
 */
export async function createFamGatewayOrder({
  amount,
  redirectUrl,
  webhookUrl,
  customerName,
  customerEmail,
  customerPhone,
}: FamGatewayCreateOrderInput): Promise<FamGatewayOrder> {
  console.log('[FamGateway] Creating order')

  const payload: Record<string, unknown> = {
    amount,
    redirect_url: redirectUrl,
    webhook_url: webhookUrl,
  }
  if (customerName) payload.customer_name = customerName
  if (customerEmail) payload.customer_email = customerEmail
  if (customerPhone) payload.customer_phone = customerPhone

  const { json, ok, status } = await famGatewayRequest(FAMGATEWAY_CREATE_ORDER_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  if (!ok || !json || json.status !== 'success' || !json.data) {
    const message =
      (typeof json?.message === 'string' && json.message) ||
      `FamGateway create-order failed (HTTP ${status})`
    console.error('[FamGateway] create-order failed:', message)
    throw new Error(message)
  }

  const data = json.data
  const orderId = data.order_id
  const checkoutUrl = data.checkout_url
  if (typeof orderId !== 'string' || orderId.length === 0 || typeof checkoutUrl !== 'string' || checkoutUrl.length === 0) {
    console.error('[FamGateway] Malformed create-order response:', JSON.stringify(data))
    throw new Error('FamGateway returned a malformed order response.')
  }

  console.log('[FamGateway] Order created:', orderId)

  const normalizedAmount = toNumber(data.amount, amount)
  const normalizedPayable = toNumber(data.payable_amount, data.amount, amount)

  return {
    orderId,
    amount: normalizedAmount ?? amount,
    payableAmount: normalizedPayable ?? amount,
    checkoutUrl,
    qrUrl: typeof data.qr_url === 'string' ? data.qr_url : undefined,
    upiIntent: typeof data.upi_intent === 'string' ? data.upi_intent : undefined,
  }
}

/**
 * Authoritative server-to-server status check using the documented
 * `GET /api/verify-order.php?order_id=...` endpoint with the API key.
 * Returns normalized `{ orderId, status, amount, payableAmount, utr,
 * transactionId }`. Status reflects the gateway lifecycle:
 * `success` (paid), `pending`, `expired`, or an error name.
 */
export async function getFamGatewayOrderStatus(
  orderId: string,
): Promise<FamGatewayOrderStatus> {
  const url = `${FAMGATEWAY_VERIFY_ORDER_URL}?order_id=${encodeURIComponent(orderId)}`
  const { json, ok } = await famGatewayRequest(url)

  const data = json?.data
  const gatewayStatus =
    typeof json?.status === 'string' ? json.status : ok ? 'error' : 'error'

  console.log('[FamGateway] Status check:', orderId, '->', gatewayStatus)

  return {
    orderId: typeof data?.order_id === 'string' ? data.order_id : orderId,
    status: gatewayStatus,
    amount: toNumber(data?.amount, null),
    payableAmount: toNumber(data?.payable_amount, null),
    utr: typeof data?.utr === 'string' ? data.utr : null,
    transactionId: typeof data?.transaction_id === 'string' ? data.transaction_id : null,
  }
}

/**
 * Timing-safe HMAC-SHA256 verification of the `X-FamGateway-Signature`
 * header against the raw request body, using the API key as the secret.
 */
export function verifyFamGatewayWebhookSignature(
  rawBody: Buffer | string | undefined,
  signature: unknown,
): boolean {
  if (typeof signature !== 'string' || signature.length === 0) return false
  if (!rawBody || rawBody.length === 0) return false

  const apiKey = getApiKey()
  if (!apiKey) return false

  const expected = createHmac('sha256', apiKey).update(rawBody).digest('hex')
  const received = Buffer.from(signature, 'utf8')
  const computed = Buffer.from(expected, 'utf8')
  if (received.length !== computed.length) return false
  return timingSafeEqual(received, computed)
}

function toNumber(value: unknown, ...fallbacks: unknown[]): number | null {
  for (const candidate of [value, ...fallbacks]) {
    if (typeof candidate === 'number' && Number.isFinite(candidate)) return candidate
    if (typeof candidate === 'string' && candidate.trim() !== '') {
      const parsed = Number(candidate)
      if (Number.isFinite(parsed)) return parsed
    }
  }
  return null
}