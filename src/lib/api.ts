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

import { getCustomerToken } from './authToken.ts'

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
}

/**
 * Carries the HTTP status (and whether the request never reached the API at
 * all) so a caller can tell a genuinely missing record apart from a temporary
 * failure. The share page depends on this: a 404 means the website does not
 * exist, while a network error / 502 usually means the host is merely waking
 * up — treating the second as "expired" is what made live, permanent links
 * look broken.
 */
export class ApiError extends Error {
  readonly status: number
  readonly isNetworkError: boolean

  constructor(message: string, status: number, isNetworkError = false) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.isNetworkError = isNetworkError
  }
}

export async function apiRequest<T>(path: string, options?: RequestOptions): Promise<T> {
  let response: Response
  // A signed-in customer is attached to every storefront call it makes; the
  // server uses it to link an order to the buyer and (soon) pull their history.
  const token = getCustomerToken()
  const headers: Record<string, string> = {}
  if (options?.body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers['Authorization'] = `Bearer ${token}`
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: options?.method ?? 'GET',
      headers,
      body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
    })
  } catch (error) {
    // fetch only rejects when the request never completed (offline, DNS, CORS,
    // connection reset) — never a verdict about the record itself.
    throw new ApiError(
      error instanceof Error ? error.message : 'Network request failed.',
      0,
      true,
    )
  }

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
    console.error('[API CALL FAILED 400/500]', {
      status: response.status,
      statusText: response.statusText,
      errorData: errorBody,
      fullError: JSON.stringify(errorBody, null, 2),
    })
    throw new ApiError(message || `Request failed (${response.status})`, response.status)
  }

  return data as T
}

export interface CreateOrderResponse {
  success: boolean
  /** Cupi internal order id — used for the redirect URL and verify calls. */
  orderId: string
  /** FamGateway order id (`fg_...`) — never used for redirect/verify by name. */
  gatewayOrderId: string
  checkoutUrl: string
  qrUrl: string | null
  upiIntent: string | null
  amount: number
  currency: string
}

export interface ValidateCouponResponse {
  valid: boolean
  discountMultiplier?: number
  /** Percentage taken off the buyer's price (0-100). Variable per influencer. */
  discountPercentage?: number
  /** Priced quote, present when a templateId was supplied. */
  originalAmount?: number
  amount?: number
  discountGiven?: number
  error?: string
}

/** Result of asking the server what a coupon actually costs. */
export interface ApplyCouponResponse {
  valid: boolean
  code?: string
  /** Set when a real partner code matched; legacy campaign codes are flagged. */
  legacy?: boolean
  discountPercentage?: number
  discountMultiplier?: number
  /** Price before the discount. */
  originalAmount?: number
  /** What the buyer is actually charged. */
  amount?: number
  /** originalAmount - amount. */
  discountGiven?: number
  /** Why a real code was refused, when valid is false. */
  reason?: string
  error?: string
}

export interface VerifyOrderResponse {
  success: boolean
  experienceId?: string
  id?: string
  sharePath?: string
  shareUrl?: string
  /** Gateway lifecycle when not paid yet: pending | expired | failed | error. */
  status?: string
  error?: string
}

export interface VerifyOrderPayload {
  orderId: string
}

export interface ExperienceData {
  id: string
  templateId: string
  config: unknown
  status: string
  createdAt: string
}

export function createOrder(
  templateId: string,
  customization: unknown,
  couponCode?: string,
  attribution?: { referralCode?: string; trafficSource?: string | null },
): Promise<CreateOrderResponse> {
  // referralCode is a captured link (?ref=CODE) rather than something the buyer
  // typed; the server still re-validates both before crediting anyone.
  const payload = {
    templateId,
    customization,
    ...(couponCode && { couponCode }),
    ...(attribution?.referralCode && { referralCode: attribution.referralCode }),
    ...(attribution?.trafficSource && { trafficSource: attribution.trafficSource }),
  }
  console.log('[API CALL] Sending createOrder payload:', payload)

  return apiRequest<CreateOrderResponse>('/orders/create', {
    method: 'POST',
    body: payload,
  })
}

/**
 * Quotes a coupon for a specific template.
 *
 * The amount returned here is what checkout will charge, so the button price can
 * never disagree with the order. Falls back to the generic validation endpoint
 * if the server has no dedicated apply-coupon route.
 */
export async function applyCoupon(
  code: string,
  templateId: string,
): Promise<ApplyCouponResponse> {
  return apiRequest<ApplyCouponResponse>('/checkout/apply-coupon', {
    method: 'POST',
    body: { code, templateId },
  })
}

export function validateCoupon(code: string): Promise<ValidateCouponResponse> {
  return apiRequest<ValidateCouponResponse>(`/validate-coupon?code=${encodeURIComponent(code)}`)
}

export function verifyOrder(
  payload: VerifyOrderPayload,
): Promise<VerifyOrderResponse> {
  return apiRequest<VerifyOrderResponse>('/orders/verify', {
    method: 'POST',
    body: payload,
  })
}

export function fetchExperienceApi(id: string): Promise<ExperienceData> {
  return apiRequest<ExperienceData>(`/experiences/${encodeURIComponent(id)}`)
}

// -------------------------------------------------------------------- auth --

/** The account shape the server is willing to hand back. Never a hash. */
export interface CustomerPublic {
  id: string
  email: string
  name: string
  avatarUrl: string | null
  emailVerified: boolean
  hasPassword: boolean
  googleLinked: boolean
  createdAt: string
}

export interface AuthResponse {
  success: boolean
  /** Present for signup/login/google: the session token to store. */
  token?: string
  expiresAt?: string
  customer?: CustomerPublic
  /** True when the verification/reset e-mail actually went out. */
  emailSent?: boolean
  /** The raw link, returned only in development so a flow is testable. */
  devLink?: string
  message?: string
  error?: string
}

export interface MeResponse {
  success: boolean
  customer: CustomerPublic
}

export function signup(input: {
  name: string
  email: string
  password: string
}): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/signup', { method: 'POST', body: input })
}

export function login(input: { email: string; password: string }): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/login', { method: 'POST', body: input })
}

export function loginWithGoogle(credential: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/google', {
    method: 'POST',
    body: { credential },
  })
}

/** Ends the signed-in session client-side; the token is simply dropped. */
export function logout(): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>('/auth/logout', { method: 'POST' })
}

export function fetchMe(): Promise<MeResponse> {
  return apiRequest<MeResponse>('/auth/me')
}

export function verifyEmail(token: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/verify-email', { method: 'POST', body: { token } })
}

export function resendVerification(email?: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/resend-verification', {
    method: 'POST',
    body: email ? { email } : {},
  })
}

export function forgotPassword(email: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/forgot-password', { method: 'POST', body: { email } })
}

export function resetPassword(token: string, password: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/reset-password', {
    method: 'POST',
    body: { token, password },
  })
}