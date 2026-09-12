const RAW_API_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ?? '/api'
// Strip trailing slashes and a trailing '/api' segment to avoid '/api/api'
// duplication when callers append '/api/...' paths below.
const API_BASE = RAW_API_URL.replace(/\/+$/, '').replace(/\/api$/, '')

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
  return apiRequest<CreateOrderResponse>('/api/orders/create', {
    method: 'POST',
    body: { templateId, customization },
  })
}

export function verifyPaymentApi(
  payload: RazorpayVerificationPayload,
): Promise<VerifyPaymentResponse> {
  return apiRequest<VerifyPaymentResponse>('/api/orders/verify', {
    method: 'POST',
    body: payload,
  })
}

export function fetchExperienceApi(id: string): Promise<ExperienceData> {
  return apiRequest<ExperienceData>(`/api/experiences/${encodeURIComponent(id)}`)
}