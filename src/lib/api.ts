const API_BASE = ((import.meta.env.VITE_API_URL as string | undefined) ?? '')
  .replace(/\/+$/, '')

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
    const message =
      data && typeof data === 'object' && 'error' in data
        ? String((data as { error: unknown }).error)
        : `Request failed (${response.status})`
    throw new Error(message)
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