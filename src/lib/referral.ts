/**
 * Referral capture for the storefront.
 *
 * A partner shares a link like `https://cupi…/?ref=PRIYA20`. The code is stored
 * in localStorage so the discount and the attribution survive the buyer leaving
 * and coming back — which is the norm, not the exception, for a gift site they
 * will build later.
 *
 * The browser is treated as untrusted: it only ever *suggests* a code. Checkout
 * re-validates it on the server, so a hand-edited localStorage entry cannot grant
 * a discount or credit commission to anyone.
 */

/** Attribute codes are strings, not tokens, so a leaked one is low value — but
 *  there is no reason to keep one forever. */
const REFERRAL_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

const STORAGE_KEY = 'cupi_referral'

/** Mirrors the server's accepted format so we never store something unusable. */
const CODE_PATTERN = /^[A-Z0-9_-]{3,24}$/

export interface ReferralCapture {
  /** Normalized referral code from the link. */
  code: string
  /** Where the click came from: `utm_source`, `utm_campaign`, or "link". */
  trafficSource: string | null
  /** Epoch ms, used for the 30-day window. */
  capturedAt: number
}

function normalizeCode(code: string): string {
  return code.trim().toUpperCase()
}

function readStored(): ReferralCapture | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<ReferralCapture>
    if (typeof parsed?.code !== 'string') return null
    const code = normalizeCode(parsed.code)
    if (!CODE_PATTERN.test(code)) return null
    const capturedAt = typeof parsed.capturedAt === 'number' ? parsed.capturedAt : 0
    // Expired captures are dropped rather than returned, so a stale code can
    // never be silently re-attributed on a later visit.
    if (Date.now() - capturedAt > REFERRAL_TTL_MS) return null
    return {
      code,
      trafficSource:
        typeof parsed.trafficSource === 'string' ? parsed.trafficSource.slice(0, 200) : null,
      capturedAt,
    }
  } catch {
    // Private browsing, disabled storage or corrupt JSON: treat as "no referral"
    // rather than breaking the page for a non-essential feature.
    return null
  }
}

/** The referral to credit for this visit, if any. */
export function getStoredReferral(): ReferralCapture | null {
  if (typeof window === 'undefined') return null
  return readStored()
}

/**
 * Records a referral from the current URL, if it carries a usable one.
 *
 * A later click deliberately overwrites an earlier one (last partner touched
 * gets the credit, matching last-click attribution), but a visit with no code
 * never clears an existing capture.
 *
 * Called once at app start. Also captures UTM parameters on their own so a link
 * without a `ref` still records where the buyer came from.
 */
export function captureReferralFromUrl(): ReferralCapture | null {
  if (typeof window === 'undefined') return null

  let params: URLSearchParams
  try {
    params = new URLSearchParams(window.location.search)
  } catch {
    return null
  }

  const rawCode = params.get('ref') ?? params.get('referral')
  const existing = readStored()

  // A visit with no (or an unusable) code must not clear a capture made
  // earlier: a buyer clicking through to the store again keeps their discount.
  if (!rawCode) return existing

  const code = normalizeCode(rawCode)
  if (!CODE_PATTERN.test(code)) return existing

  const capture: ReferralCapture = {
    code,
    trafficSource: readTrafficSource(params),
    capturedAt: Date.now(),
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(capture))
  } catch {
    // Storage unavailable: the referral still applies to this page load.
  }

  return capture
}

/** First available UTM field, so analytics rows carry something meaningful. */
function readTrafficSource(params: URLSearchParams): string | null {
  const candidates = [params.get('utm_source'), params.get('utm_campaign'), params.get('ref')]
  for (const candidate of candidates) {
    if (candidate && candidate.trim()) return candidate.trim().slice(0, 200)
  }
  return null
}

/** Lets the checkout UI show "referral applied" without reading storage twice. */
export function referralCode(): string | null {
  return readStored()?.code ?? null
}