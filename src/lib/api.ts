const PRODUCTION_BACKEND_URL = 'https://cupi-psmr.onrender.com'

// In dev (vite serve) fall back to the same-origin '/api' dev proxy. In a
// production build default to the Render backend so the static bundle never
// calls its own domain (which 404s on the SPA host).
const DEFAULT_API_URL = import.meta.env.PROD ? PRODUCTION_BACKEND_URL : '/api'

const RAW_URL =
  (import.meta.env.VITE_API_URL as string | undefined) || DEFAULT_API_URL

// Clean trailing slashes and a trailing '/api' segment to avoid duplicate
// '/api/api' when API_BASE below is re-appended.
const BASE_URL = RAW_URL.replace(/\/+$/, '').replace(/\/api$/, '')

export const API_BASE = `${BASE_URL}/api`

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
}

export async function apiRequest<T>(path: string, options?: RequestOptions): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: options?.method ?? 'GET',
    headers:
      options?.body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
  })

  let data: unknown = null
  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    const errorBody = data as { error?: unknown; message?: unknown } | null
    const message =
      errorBody && typeof errorBody === 'object'
        ? String(errorBody.error ?? errorBody.message ?? '')
        : ''
    throw new Error(message || `Request failed (${response.status})`)
  }

  return data as T
}

export interface CreateOrderResponse {
  orderId: string
  amount: number
  currency: string
  keyId: string
}

export interface VerifyPaymentResponse {
  success: boolean
  experienceId: string
  shareUrl: string
}

export interface RazorpayVerificationPayload {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export interface ExperienceData {
  id: string
  templateId: string
  config: unknown
  status: string
  createdAt: string
}

export function createOrderApi(
  templateId: string,
  customization: unknown,
): Promise<CreateOrderResponse> {
  return apiRequest<CreateOrderResponse>('/orders/create', {
    method: 'POST',
    body: { templateId, customization },
  })
}

export function verifyPaymentApi(
  payload: RazorpayVerificationPayload,
): Promise<VerifyPaymentResponse> {
  return apiRequest<VerifyPaymentResponse>('/orders/verify', {
    method: 'POST',
    body: payload,
  })
}

export function fetchExperienceApi(id: string): Promise<ExperienceData> {
  return apiRequest<ExperienceData>(`/experiences/${encodeURIComponent(id)}`)
}