import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import type { Request, Response, NextFunction } from 'express'
import {
  SUPER_ADMIN_EMAIL,
  SUPER_ADMIN_PASSWORD,
  SUPER_ADMIN_TOKEN,
} from './config.js'

/**
 * Dashboard sessions expire so a stolen token cannot outlive a password
 * rotation. Twelve hours covers a working session without staying valid for
 * days on an unattended browser.
 */
const SESSION_TTL_MS = 12 * 60 * 60 * 1000

/** Failed logins allowed per identifier inside one window. */
const LOGIN_MAX_FAILURES = 10
const LOGIN_WINDOW_MS = 15 * 60 * 1000

/**
 * Hashing both sides first makes the comparison constant time AND of equal
 * length, so a longer secret can never leak its size or position through
 * timingSafeEqual's length requirement.
 */
function secretsMatch(provided: string, expected: string): boolean {
  if (!expected) return false
  return timingSafeEqual(digest(provided), digest(expected))
}

/**
 * Login identifiers are compared case-insensitively (an email typed in any
 * case still matches) while the password stays an exact, constant-time match.
 */
function identifierMatches(provided: string, expected: string): boolean {
  return secretsMatch(provided.toLowerCase(), expected.toLowerCase())
}

function digest(value: string): Buffer {
  return createHash('sha256').update(value).digest()
}

/**
 * Key used to sign dashboard sessions.
 *
 * Falls back to the Superadmin password when no SUPER_ADMIN_TOKEN is set, so
 * login works with only the two credential variables configured. Deriving from
 * an existing secret keeps a third variable out of Render while still making
 * sessions unforgeable without it.
 */
function sessionKey(): Buffer {
  const secret = SUPER_ADMIN_TOKEN || SUPER_ADMIN_PASSWORD
  return createHash('sha256').update(`cupi-admin-session-v1:${secret}`).digest()
}

function sessionSignature(payload: string): string {
  return createHmac('sha256', sessionKey())
    .update(`admin-session:${payload}`)
    .digest('base64url')
}

/** Mints `<expiry>.<signature>`; the signature covers the expiry byte for byte. */
function issueSessionToken(): { token: string; expiresAt: string } {
  const expiresAtMs = Date.now() + SESSION_TTL_MS
  const payload = String(expiresAtMs)
  return {
    token: `${payload}.${sessionSignature(payload)}`,
    expiresAt: new Date(expiresAtMs).toISOString(),
  }
}

function isUnexpiredSessionToken(token: string): boolean {
  const separator = token.indexOf('.')
  if (separator <= 0) return false

  const payload = token.slice(0, separator)
  const signature = token.slice(separator + 1)
  if (!/^\d{1,15}$/.test(payload)) return false

  const expected = Buffer.from(sessionSignature(payload))
  const received = Buffer.from(signature)
  if (expected.length !== received.length) return false
  if (!timingSafeEqual(expected, received)) return false

  return Number(payload) > Date.now()
}

/**
 * Per-identifier throttle for POST /api/admin/login.
 *
 * Keyed on the submitted identifier (not the IP) because every Render request
 * arrives from the same proxy hop: an IP key would let anyone lock the
 * Superadmin out of their own login. Ten failures per 15 minutes per
 * identifier blocks online guessing; a successful login clears the counter.
 */
const failedLogins = new Map<string, { count: number; resetAt: number }>()

function isLoginThrottled(identifier: string, now: number): boolean {
  const entry = failedLogins.get(identifier)
  if (!entry) return false
  if (entry.resetAt <= now) {
    failedLogins.delete(identifier)
    return false
  }
  return entry.count >= LOGIN_MAX_FAILURES
}

function recordLoginFailure(identifier: string, now: number): void {
  const entry = failedLogins.get(identifier)
  if (!entry || entry.resetAt <= now) {
    failedLogins.set(identifier, { count: 1, resetAt: now + LOGIN_WINDOW_MS })
    return
  }
  entry.count += 1
}

/**
 * POST /api/admin/login
 *
 * Exchanges the Superadmin username/email + password for a signed session
 * token used as `Authorization: Bearer <token>` on every admin route. Both
 * credentials come from the environment; nothing is stored in the repository.
 *
 * Failures are deliberately indistinguishable: "wrong identifier" and "wrong
 * password" return the same message and take the same constant-time path.
 */
export async function handleAdminLogin(req: Request, res: Response): Promise<void> {
  const body = (req.body ?? {}) as Record<string, unknown>

  const rawIdentifier =
    typeof body.email === 'string'
      ? body.email
      : typeof body.username === 'string'
        ? body.username
        : ''
  const identifier = rawIdentifier.trim()
  const password = typeof body.password === 'string' ? body.password : ''

  if (!SUPER_ADMIN_EMAIL || !SUPER_ADMIN_PASSWORD) {
    console.error('[admin-auth] SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD not configured')
    res.status(503).json({ error: 'Superadmin login is not configured on this server.' })
    return
  }

  if (!identifier || !password) {
    res.status(400).json({ error: 'Username/email and password are required.' })
    return
  }

  const throttleKey = identifier.toLowerCase()
  const now = Date.now()

  if (isLoginThrottled(throttleKey, now)) {
    console.warn('[admin-auth] Throttled superadmin login attempt')
    res.status(429).json({
      error: 'Too many failed attempts. Try again in 15 minutes.',
    })
    return
  }

  const identifierOk = identifierMatches(identifier, SUPER_ADMIN_EMAIL)
  const passwordOk = secretsMatch(password, SUPER_ADMIN_PASSWORD)

  if (!identifierOk || !passwordOk) {
    recordLoginFailure(throttleKey, now)
    console.warn('[admin-auth] Failed superadmin login attempt')
    res.status(401).json({ error: 'Invalid username/email or password.' })
    return
  }

  failedLogins.delete(throttleKey)

  const session = issueSessionToken()
  res.status(200).json({
    success: true,
    token: session.token,
    expiresAt: session.expiresAt,
  })
}

/**
 * Validates Super Admin authentication via Bearer token.
 *
 * The token must be provided in the Authorization header as:
 *   Authorization: Bearer <token>
 *
 * Two token forms are accepted:
 *   1. The static SUPER_ADMIN_TOKEN secret (existing integrations, scripts).
 *   2. A signed session minted by POST /api/admin/login.
 *
 * Returns 401 if the token is missing or invalid.
 */
export function requireAdminAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.get('Authorization')

  if (!authHeader) {
    res.status(401).json({ error: 'Authorization header required' })
    return
  }

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    res.status(401).json({ error: 'Invalid authorization format. Use: Bearer <token>' })
    return
  }

  const token = parts[1]

  if (!SUPER_ADMIN_TOKEN && !SUPER_ADMIN_PASSWORD) {
    console.error('[admin-auth] No Superadmin credential configured')
    res.status(500).json({ error: 'Admin authentication not configured' })
    return
  }

  if (SUPER_ADMIN_TOKEN && secretsMatch(token, SUPER_ADMIN_TOKEN)) {
    next()
    return
  }

  if (SUPER_ADMIN_PASSWORD && isUnexpiredSessionToken(token)) {
    next()
    return
  }

  console.warn('[admin-auth] Invalid admin token attempt')
  res.status(401).json({ error: 'Invalid admin token' })
}
