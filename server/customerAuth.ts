/**
 * Customer authentication for the Cupi storefront.
 *
 * WHAT LIVES HERE
 *   • email + password sign-up and sign-in (scrypt-hashed, never plain text)
 *   • "Continue with Google" (the Google ID token is verified server-side
 *     against Google's public JWKS — no Firebase, no third-party auth service)
 *   • single-use e-mail verification and password-reset links, sent through
 *     the Resend HTTP API
 *   • signed, stateless session tokens handed to the browser as
 *     `Authorization: Bearer <token>`
 *
 * WHY IT IS SHAPED THIS WAY
 *   Everything persists through the existing `db.ts` facade (Supabase in
 *   production, db.json in development), so accounts live in the SAME database
 *   as orders, experiences, coupons and influencers — and future cart / order /
 *   purchase-history features can simply join on `cupi_orders.customer_id`.
 *
 *   Sessions are HMAC-signed rather than stored, exactly like the Superadmin
 *   dashboard session in `adminAuth.ts`: nothing to clean up, nothing to leak,
 *   and a stolen token still dies at its expiry.
 */

import {
  createHash,
  createHmac,
  createPublicKey,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
  verify as verifySignature,
} from 'node:crypto'
import { promisify } from 'node:util'
import express from 'express'
import type { NextFunction, Request, Response } from 'express'
import {
  APP_URL,
  CUSTOMER_AUTH_SECRET,
  EMAIL_FROM,
  GOOGLE_CLIENT_ID,
  RESEND_API_KEY,
} from './config.js'
import {
  createAuthToken,
  createCustomer,
  getAuthTokenByHash,
  getCustomerByEmail,
  getCustomerByGoogleSub,
  getCustomerById,
  invalidateAuthTokens,
  markAuthTokenUsed,
  updateCustomer,
} from './db.js'
import type { CustomerRecord } from './store.js'
import { SupabaseStoreError } from './supabase.js'

declare global {
  namespace Express {
    interface Request {
      /** Set by `requireCustomerAuth` / `optionalCustomerAuth`. */
      customer?: CustomerRecord
    }
  }
}

/** What the browser is told about an account. Never includes a hash. */
function publicCustomer(customer: CustomerRecord): Record<string, unknown> {
  return {
    id: customer.id,
    email: customer.email,
    name: customer.name,
    avatarUrl: customer.avatarUrl,
    emailVerified: customer.emailVerified,
    // Lets the UI explain "this account signs in with Google" / "no password
    // yet" without ever exposing a credential or Google subject.
    hasPassword: customer.passwordHash !== null,
    googleLinked: customer.googleSub !== null,
    createdAt: customer.createdAt,
  }
}

// ------------------------------------------------------------------ crypto --

const scryptAsync = promisify(scryptCallback) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number },
) => Promise<Buffer>

/**
 * scrypt parameters. N=16384 costs ~100ms per hash on a small container,
 * which is the point: it makes offline guessing expensive. The format is
 * self-describing (`scrypt$N$r$p$salt$hash`) so parameters can be raised later
 * without invalidating existing passwords.
 */
const SCRYPT_N = 16384
const SCRYPT_R = 8
const SCRYPT_P = 1
const SCRYPT_KEYLEN = 64
const SCRYPT_MAXMEM = 96 * 1024 * 1024

/** Bounds so a corrupted row can never ask the server for an unbounded hash. */
const SCRYPT_MIN_N = 1024
const SCRYPT_MAX_N = 1 << 18

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const derived = await scryptAsync(password, salt, SCRYPT_KEYLEN, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
    maxmem: SCRYPT_MAXMEM,
  })
  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt.toString('base64')}$${derived.toString('base64')}`
}

/** Constant-time verification. A malformed stored hash simply never matches. */
async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$')
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false

  const n = Number(parts[1])
  const r = Number(parts[2])
  const p = Number(parts[3])
  if (
    !Number.isInteger(n) || n < SCRYPT_MIN_N || n > SCRYPT_MAX_N ||
    !Number.isInteger(r) || r < 1 || r > 32 ||
    !Number.isInteger(p) || p < 1 || p > 4
  ) {
    return false
  }

  const salt = Buffer.from(parts[4], 'base64')
  const expected = Buffer.from(parts[5], 'base64')
  if (salt.length === 0 || expected.length === 0) return false

  const derived = await scryptAsync(password, salt, expected.length, {
    N: n,
    r,
    p,
    maxmem: SCRYPT_MAXMEM,
  })
  return derived.length === expected.length && timingSafeEqual(derived, expected)
}

// ----------------------------------------------------------------- sessions --

/** A month covers a returning gift-buyer without staying valid for a year. */
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000

/**
 * Keyed from a dedicated secret when configured, so rotating it invalidates
 * every customer session at once. Without one, a random per-process key keeps
 * local development working (sessions simply die on restart) and says so.
 */
let ephemeralSessionKey: Buffer | null = null

function sessionKey(): Buffer {
  if (CUSTOMER_AUTH_SECRET) {
    return createHash('sha256')
      .update(`cupi-customer-session-v1:${CUSTOMER_AUTH_SECRET}`)
      .digest()
  }
  if (!ephemeralSessionKey) {
    ephemeralSessionKey = randomBytes(32)
    console.warn(
      '[auth] CUSTOMER_AUTH_SECRET is not set — using a random per-process key. ' +
        'Sessions will not survive a server restart. Set it in the environment for production.',
    )
  }
  return createHash('sha256')
    .update(`cupi-customer-session-v1:${ephemeralSessionKey.toString('hex')}`)
    .digest()
}

function sessionSignature(payload: string): string {
  return createHmac('sha256', sessionKey())
    .update(`customer-session:${payload}`)
    .digest('base64url')
}

/** Mints `<base64url payload>.<signature>`; the payload carries id + expiry. */
function issueSessionToken(customerId: string): { token: string; expiresAt: string } {
  const expiresAtMs = Date.now() + SESSION_TTL_MS
  const payload = Buffer.from(
    JSON.stringify({ id: customerId, exp: expiresAtMs }),
    'utf8',
  ).toString('base64url')
  return {
    token: `${payload}.${sessionSignature(payload)}`,
    expiresAt: new Date(expiresAtMs).toISOString(),
  }
}

/** Returns the customer id behind a session token, or null if it is not one. */
function parseSessionToken(token: string): string | null {
  const separator = token.lastIndexOf('.')
  if (separator <= 0) return null

  const payload = token.slice(0, separator)
  const signature = token.slice(separator + 1)

  const expected = Buffer.from(sessionSignature(payload))
  const received = Buffer.from(signature)
  if (expected.length !== received.length) return null
  if (!timingSafeEqual(expected, received)) return null

  try {
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      id?: unknown
      exp?: unknown
    }
    if (typeof claims.id !== 'string' || typeof claims.exp !== 'number') return null
    if (claims.exp <= Date.now()) return null
    return claims.id
  } catch {
    return null
  }
}

function bearerToken(req: Request): string | null {
  const header = req.get('Authorization')
  if (!header) return null
  const parts = header.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null
  return parts[1] || null
}

/**
 * Best-effort resolution of the signed-in buyer. Never throws: an unreachable
 * store must not be able to break a checkout, which has always worked signed
 * out. The order is simply recorded without a customer link.
 */
export async function resolveCustomerFromRequest(
  req: Request,
): Promise<CustomerRecord | null> {
  const token = bearerToken(req)
  if (!token) return null
  const customerId = parseSessionToken(token)
  if (!customerId) return null
  try {
    return await getCustomerById(customerId)
  } catch (error) {
    console.warn('[auth] could not resolve the signed-in customer:', error)
    return null
  }
}

/** Auth middleware for routes that require a signed-in customer. */
export async function requireCustomerAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = bearerToken(req)
    const customerId = token ? parseSessionToken(token) : null
    if (!customerId) {
      res.status(401).json({ error: 'Please sign in to continue.' })
      return
    }
    const customer = await getCustomerById(customerId)
    if (!customer) {
      res.status(401).json({ error: 'Please sign in to continue.' })
      return
    }
    req.customer = customer
    next()
  } catch (error) {
    next(error)
  }
}

// -------------------------------------------------------------- rate limits --

const failureLog = new Map<string, { count: number; resetAt: number }>()

function throttleKey(kind: string, identifier: string): string {
  return `${kind}:${identifier.trim().toLowerCase()}`
}

function isThrottled(key: string, max: number, windowMs: number, now: number): boolean {
  const entry = failureLog.get(key)
  if (!entry) return false
  if (entry.resetAt <= now) {
    failureLog.delete(key)
    return false
  }
  return entry.count >= max
}

function recordFailure(key: string, max: number, windowMs: number, now: number): void {
  const entry = failureLog.get(key)
  if (!entry || entry.resetAt <= now) {
    failureLog.set(key, { count: 1, resetAt: now + windowMs })
    return
  }
  entry.count += 1
  if (entry.count > max) entry.count = max
}

function clearFailures(key: string): void {
  failureLog.delete(key)
}

/** e-mail + password login: 10 bad tries per address per 15 minutes. */
const LOGIN_MAX_FAILURES = 10
const LOGIN_WINDOW_MS = 15 * 60 * 1000
/** Account creation / e-mail sending: 5 per address per hour. */
const MAIL_MAX_FAILURES = 5
const MAIL_WINDOW_MS = 60 * 60 * 1000

// ---------------------------------------------------------------- validation --

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MAX_EMAIL_LENGTH = 254
const MIN_PASSWORD_LENGTH = 8
const MAX_PASSWORD_LENGTH = 200

function normalizeEmail(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

function isValidEmail(email: string): boolean {
  return email.length <= MAX_EMAIL_LENGTH && EMAIL_PATTERN.test(email)
}

function cleanName(value: unknown, email: string): string {
  const raw = typeof value === 'string' ? value.trim().slice(0, 80) : ''
  if (raw) return raw
  // A sign-up with no name still gets something human for the header.
  return email.split('@')[0].slice(0, 40) || 'Cupi friend'
}

function passwordError(password: unknown): string | null {
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return `Password must be at most ${MAX_PASSWORD_LENGTH} characters long.`
  }
  return null
}

// -------------------------------------------------------------------- e-mail --

export interface EmailMessage {
  to: string
  subject: string
  text: string
  html: string
}

/**
 * Sends through Resend's HTTP API. No npm dependency and no hard failure: an
 * unconfigured or unreachable e-mail provider must never block sign-up, login
 * or a password reset, so the caller is simply told whether it went out.
 */
async function sendEmail(message: EmailMessage): Promise<boolean> {
  if (!RESEND_API_KEY) return false
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [message.to],
        subject: message.subject,
        text: message.text,
        html: message.html,
      }),
      signal: AbortSignal.timeout(15_000),
    })
    if (!response.ok) {
      const detail = await response.text().catch(() => '')
      console.error('[auth] Resend rejected the e-mail:', response.status, detail.slice(0, 300))
      return false
    }
    return true
  } catch (error) {
    console.error('[auth] could not send e-mail:', error)
    return false
  }
}

function mailFooter(): string {
  return '\n\n— Cupi\ncupi-one.vercel.app'
}

// ------------------------------------------------------------ one-use links --

const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000

/** The raw token is never stored: only this digest can look it up. */
function hashToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('base64url')
}

interface IssuedLink {
  url: string
  emailSent: boolean
}

/**
 * Mints a single-use link and e-mails it. Retires any outstanding link of the
 * same purpose first, so only the newest e-mail in a inbox can ever work.
 *
 * The link is ALWAYS logged: with no RESEND_API_KEY configured that log line
 * is the only way to complete verification or a reset during local testing.
 */
async function issueAuthLink(
  customer: CustomerRecord,
  purpose: 'verify_email' | 'reset_password',
): Promise<IssuedLink> {
  await invalidateAuthTokens(customer.id, purpose)

  const rawToken = randomBytes(32).toString('base64url')
  const ttl = purpose === 'verify_email' ? VERIFY_TOKEN_TTL_MS : RESET_TOKEN_TTL_MS
  await createAuthToken({
    customerId: customer.id,
    purpose,
    tokenHash: hashToken(rawToken),
    expiresAt: new Date(Date.now() + ttl).toISOString(),
  })

  const url =
    purpose === 'verify_email'
      ? `${APP_URL}/verify-email?token=${encodeURIComponent(rawToken)}`
      : `${APP_URL}/reset-password?token=${encodeURIComponent(rawToken)}`

  const isVerify = purpose === 'verify_email'
  const subject = isVerify ? 'Verify your Cupi e-mail address' : 'Reset your Cupi password'
  const intro = isVerify
    ? `Hi ${customer.name}, one quick step: confirm this address so we can keep your account and orders reachable.`
    : `Hi ${customer.name}, we received a request to reset the password for ${customer.email}.`
  const outro = isVerify
    ? 'This link expires in 24 hours. If you did not create a Cupi account, you can ignore this e-mail.'
    : 'This link expires in 1 hour and can only be used once. If you did not ask for this, ignore this e-mail — your password stays unchanged.'

  const emailSent = await sendEmail({
    to: customer.email,
    subject,
    text: `${intro}\n\nOpen this link to continue:\n${url}\n\n${outro}${mailFooter()}`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;padding:28px;color:#3f3a37">
        <p style="font-size:15px;line-height:1.6">${intro}</p>
        <p style="margin:28px 0">
          <a href="${url}"
             style="display:inline-block;background:linear-gradient(90deg,#f43f5e,#ec4899);color:#fff;text-decoration:none;font-weight:700;padding:13px 26px;border-radius:999px">
            ${isVerify ? 'Verify my e-mail' : 'Reset my password'}
          </a>
        </p>
        <p style="font-size:13px;color:#78716c;line-height:1.6">Or paste this link into your browser:<br/>${url}</p>
        <p style="font-size:13px;color:#78716c;line-height:1.6">${outro}</p>
      </div>`.trim(),
  })

  // Always visible in the server log, so an operator can complete a flow (or
  // debug a customer) without an e-mail provider being configured.
  console.log(`[auth] ${purpose} link for ${customer.email}: ${url}`)
  return { url, emailSent }
}

/** The payload the client needs to finish a link-based flow by hand in dev. */
function devLink(url: string): string | undefined {
  return process.env.NODE_ENV === 'production' ? undefined : url
}

// ------------------------------------------------------------------ Google --

interface GoogleIdentity {
  sub: string
  email: string
  emailVerified: boolean
  name: string
  avatarUrl: string | null
}

interface GoogleJwk {
  kty?: string
  kid?: string
  alg?: string
  use?: string
}

const GOOGLE_JWKS_URL = 'https://www.googleapis.com/oauth2/v3/certs'
const GOOGLE_ISSUERS = new Set(['https://accounts.google.com', 'accounts.google.com'])
const JWKS_TTL_MS = 10 * 60 * 1000

let jwksCache: { fetchedAt: number; keys: GoogleJwk[] } | null = null

async function googleKeys(): Promise<GoogleJwk[]> {
  if (jwksCache && Date.now() - jwksCache.fetchedAt < JWKS_TTL_MS) {
    return jwksCache.keys
  }
  const response = await fetch(GOOGLE_JWKS_URL, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(10_000),
  })
  if (!response.ok) {
    throw new Error(`Google JWKS responded ${response.status}`)
  }
  const body = (await response.json()) as { keys?: GoogleJwk[] }
  const keys = Array.isArray(body.keys) ? body.keys : []
  jwksCache = { fetchedAt: Date.now(), keys }
  return keys
}

function base64UrlJson(part: string): unknown {
  return JSON.parse(Buffer.from(part, 'base64url').toString('utf8'))
}

/**
 * Verifies a Google Identity Services ID token with the built-in crypto:
 * RS256 signature against Google's published JWKS, then issuer, audience,
 * expiry and e-mail checks. Returns null for anything that does not hold —
 * a token from another client, another Google project, or a forged one.
 */
async function verifyGoogleCredential(credential: string): Promise<GoogleIdentity | null> {
  if (!GOOGLE_CLIENT_ID) return null

  const parts = credential.split('.')
  if (parts.length !== 3) return null

  let header: { alg?: unknown; kid?: unknown }
  let claims: {
    sub?: unknown
    email?: unknown
    email_verified?: unknown
    name?: unknown
    picture?: unknown
    iss?: unknown
    aud?: unknown
    exp?: unknown
  }
  try {
    header = base64UrlJson(parts[0]) as typeof header
    claims = base64UrlJson(parts[1]) as typeof claims
  } catch {
    return null
  }

  if (header.alg !== 'RS256' || typeof header.kid !== 'string') return null
  if (typeof claims.sub !== 'string' || !claims.sub) return null
  if (typeof claims.email !== 'string' || !isValidEmail(claims.email.toLowerCase())) return null
  if (typeof claims.iss !== 'string' || !GOOGLE_ISSUERS.has(claims.iss)) return null
  const audience = Array.isArray(claims.aud) ? claims.aud : [claims.aud]
  if (!audience.some((entry) => entry === GOOGLE_CLIENT_ID)) return null
  if (typeof claims.exp !== 'number' || claims.exp * 1000 <= Date.now()) return null

  const input = Buffer.from(`${parts[0]}.${parts[1]}`, 'utf8')
  const signature = Buffer.from(parts[2], 'base64url')

  const verifyWith = async (keys: GoogleJwk[]): Promise<boolean> => {
    const jwk = keys.find((entry) => entry.kid === header.kid && entry.kty === 'RSA')
    if (!jwk) return false
    const key = createPublicKey({
      key: jwk,
      format: 'jwk',
    } as unknown as Parameters<typeof createPublicKey>[0])
    return verifySignature('RSA-SHA256', input, key, signature)
  }

  let valid = await verifyWith(await googleKeys())
  if (!valid && jwksCache) {
    // A key rotation within our cache window: one forced refresh, then stop.
    jwksCache = null
    valid = await verifyWith(await googleKeys())
  }
  if (!valid) return null

  return {
    sub: claims.sub,
    email: claims.email.trim().toLowerCase(),
    emailVerified: claims.email_verified !== false,
    name: cleanName(claims.name, claims.email),
    avatarUrl: typeof claims.picture === 'string' && claims.picture ? claims.picture : null,
  }
}

// ----------------------------------------------------------------- handlers --

async function handleSignup(req: Request, res: Response): Promise<void> {
  const body = (req.body ?? {}) as Record<string, unknown>
  const email = normalizeEmail(body.email)
  const password = body.password
  const name = cleanName(body.name, email)

  if (!isValidEmail(email)) {
    res.status(400).json({ error: 'Please enter a valid e-mail address.' })
    return
  }
  const invalidPassword = passwordError(password)
  if (invalidPassword) {
    res.status(400).json({ error: invalidPassword })
    return
  }

  const key = throttleKey('signup', email)
  const now = Date.now()
  if (isThrottled(key, MAIL_MAX_FAILURES, MAIL_WINDOW_MS, now)) {
    res.status(429).json({ error: 'Too many attempts for this address. Try again later.' })
    return
  }

  try {
    const existing = await getCustomerByEmail(email)
    if (existing) {
      recordFailure(key, MAIL_MAX_FAILURES, MAIL_WINDOW_MS, now)
      res.status(409).json({
        error: 'An account with this e-mail already exists. Try signing in instead.',
      })
      return
    }

    const customer = await createCustomer({
      email,
      name,
      passwordHash: await hashPassword(password as string),
      emailVerified: false,
    })

    clearFailures(key)
    const link = await issueAuthLink(customer, 'verify_email')
    const session = issueSessionToken(customer.id)

    res.status(201).json({
      success: true,
      token: session.token,
      expiresAt: session.expiresAt,
      customer: publicCustomer(customer),
      emailSent: link.emailSent,
      devLink: devLink(link.url),
      message: link.emailSent
        ? 'Account created. Check your inbox to verify your e-mail.'
        : 'Account created. Verify your e-mail from the link we send you.',
    })
  } catch (error) {
    // Two simultaneous sign-ups for one address race on the unique index.
    if (error instanceof SupabaseStoreError && (error.status === 409 || error.code === '23505')) {
      res.status(409).json({
        error: 'An account with this e-mail already exists. Try signing in instead.',
      })
      return
    }
    throw error
  }
}

async function handleLogin(req: Request, res: Response): Promise<void> {
  const body = (req.body ?? {}) as Record<string, unknown>
  const email = normalizeEmail(body.email)
  const password = typeof body.password === 'string' ? body.password : ''

  if (!email || !password) {
    res.status(400).json({ error: 'E-mail and password are required.' })
    return
  }

  const key = throttleKey('login', email)
  const now = Date.now()
  if (isThrottled(key, LOGIN_MAX_FAILURES, LOGIN_WINDOW_MS, now)) {
    res.status(429).json({
      error: 'Too many failed attempts. Try again in 15 minutes.',
    })
    return
  }

  const customer = await getCustomerByEmail(email)

  // Failures are deliberately indistinguishable from a missing account, except
  // for the one case a customer genuinely cannot resolve any other way: an
  // account that has only ever used Google.
  if (!customer || !customer.passwordHash) {
    recordFailure(key, LOGIN_MAX_FAILURES, LOGIN_WINDOW_MS, now)
    if (customer && customer.googleSub && !customer.passwordHash) {
      res.status(401).json({
        error: 'This account signs in with Google. Use "Continue with Google" instead.',
      })
      return
    }
    console.warn('[auth] failed login attempt for', email)
    res.status(401).json({ error: 'Invalid e-mail or password.' })
    return
  }

  const ok = await verifyPassword(password, customer.passwordHash)
  if (!ok) {
    recordFailure(key, LOGIN_MAX_FAILURES, LOGIN_WINDOW_MS, now)
    console.warn('[auth] failed login attempt for', email)
    res.status(401).json({ error: 'Invalid e-mail or password.' })
    return
  }

  clearFailures(key)
  const session = issueSessionToken(customer.id)
  res.status(200).json({
    success: true,
    token: session.token,
    expiresAt: session.expiresAt,
    customer: publicCustomer(customer),
  })
}

async function handleGoogle(req: Request, res: Response): Promise<void> {
  const body = (req.body ?? {}) as Record<string, unknown>
  const credential = typeof body.credential === 'string' ? body.credential : ''

  if (!GOOGLE_CLIENT_ID) {
    res.status(503).json({ error: 'Google sign-in is not configured on this server.' })
    return
  }
  if (!credential) {
    res.status(400).json({ error: 'Missing Google credential.' })
    return
  }

  const identity = await verifyGoogleCredential(credential)
  if (!identity) {
    res.status(401).json({ error: 'That Google sign-in could not be verified. Please try again.' })
    return
  }

  let customer = await getCustomerByGoogleSub(identity.sub)

  if (!customer) {
    // Same person, signed in before with a password: link the Google account to
    // the row they already own instead of creating a second one.
    customer = await getCustomerByEmail(identity.email)
    if (customer) {
      const linked = await updateCustomer(customer.id, {
        googleSub: identity.sub,
        avatarUrl: customer.avatarUrl ?? identity.avatarUrl,
        // Google only reports a verified address for a verified account.
        emailVerified: customer.emailVerified || identity.emailVerified,
      })
      customer = linked ?? customer
    } else {
      customer = await createCustomer({
        email: identity.email,
        name: identity.name,
        avatarUrl: identity.avatarUrl,
        googleSub: identity.sub,
        emailVerified: identity.emailVerified,
      })
    }
  }

  const session = issueSessionToken(customer.id)
  res.status(200).json({
    success: true,
    token: session.token,
    expiresAt: session.expiresAt,
    customer: publicCustomer(customer),
  })
}

async function handleMe(req: Request, res: Response): Promise<void> {
  const customer = req.customer
  if (!customer) {
    res.status(401).json({ error: 'Please sign in to continue.' })
    return
  }
  res.status(200).json({ success: true, customer: publicCustomer(customer) })
}

/**
 * Stateless sessions are ended by the browser dropping the token; this exists
 * so the client has an explicit, auditable endpoint (and so a future server-side
 * session store has a place to hook in).
 */
async function handleLogout(_req: Request, res: Response): Promise<void> {
  res.status(200).json({ success: true })
}

async function handleVerifyEmail(req: Request, res: Response): Promise<void> {
  const body = (req.body ?? {}) as Record<string, unknown>
  const rawToken = typeof body.token === 'string' ? body.token.trim() : ''
  if (!rawToken) {
    res.status(400).json({ error: 'This verification link is incomplete.' })
    return
  }

  const linkError = 'This verification link is invalid or has expired. Request a new one.'

  const record = await getAuthTokenByHash(hashToken(rawToken))
  if (
    !record ||
    record.purpose !== 'verify_email' ||
    record.usedAt ||
    Date.parse(record.expiresAt) <= Date.now()
  ) {
    res.status(400).json({ error: linkError })
    return
  }

  const customer = await getCustomerById(record.customerId)
  if (!customer) {
    res.status(400).json({ error: linkError })
    return
  }

  // Redeemed even if the flag was already set, so a replay can never re-fire.
  await markAuthTokenUsed(record.id)
  const updated = customer.emailVerified
    ? customer
    : ((await updateCustomer(customer.id, { emailVerified: true })) ?? customer)

  res.status(200).json({
    success: true,
    customer: publicCustomer(updated),
    message: 'Your e-mail is verified.',
  })
}

async function handleResendVerification(req: Request, res: Response): Promise<void> {
  const body = (req.body ?? {}) as Record<string, unknown>

  // A signed-in customer resending from the account banner needs no e-mail
  // field; signed-out callers must supply one. Resolution is best-effort — a
  // stale token simply falls through to the e-mail form below.
  let customer = await resolveCustomerFromRequest(req)
  if (!customer) {
    const email = normalizeEmail(body.email)
    if (!isValidEmail(email)) {
      res.status(400).json({ error: 'Please enter a valid e-mail address.' })
      return
    }
    const key = throttleKey('resend', email)
    const now = Date.now()
    if (isThrottled(key, MAIL_MAX_FAILURES, MAIL_WINDOW_MS, now)) {
      res.status(429).json({ error: 'Too many attempts for this address. Try again later.' })
      return
    }
    // Never confirm whether the address exists.
    customer = await getCustomerByEmail(email)
    if (!customer) {
      res.status(200).json({
        success: true,
        message: 'If that address has an account, a verification link is on its way.',
      })
      return
    }
  }

  if (customer.emailVerified) {
    res.status(200).json({ success: true, message: 'That e-mail is already verified.' })
    return
  }

  const key = throttleKey('resend', customer.email)
  const now = Date.now()
  if (isThrottled(key, MAIL_MAX_FAILURES, MAIL_WINDOW_MS, now)) {
    res.status(429).json({ error: 'Too many attempts. Try again later.' })
    return
  }

  const link = await issueAuthLink(customer, 'verify_email')
  res.status(200).json({
    success: true,
    emailSent: link.emailSent,
    devLink: devLink(link.url),
    message: link.emailSent
      ? 'Verification link sent.'
      : 'A verification link was generated. Check the server log if no e-mail arrives.',
  })
}

async function handleForgotPassword(req: Request, res: Response): Promise<void> {
  const body = (req.body ?? {}) as Record<string, unknown>
  const email = normalizeEmail(body.email)

  if (!isValidEmail(email)) {
    res.status(400).json({ error: 'Please enter a valid e-mail address.' })
    return
  }

  const key = throttleKey('forgot', email)
  const now = Date.now()
  if (isThrottled(key, MAIL_MAX_FAILURES, MAIL_WINDOW_MS, now)) {
    res.status(429).json({ error: 'Too many attempts for this address. Try again later.' })
    return
  }

  const customer = await getCustomerByEmail(email)
  if (customer) {
    clearFailures(key)
    const link = await issueAuthLink(customer, 'reset_password')
    res.status(200).json({
      success: true,
      emailSent: link.emailSent,
      devLink: devLink(link.url),
      message: 'If that address has an account, a password reset link is on its way.',
    })
    return
  }

  // Same answer either way: this endpoint must never confirm existence.
  recordFailure(key, MAIL_MAX_FAILURES, MAIL_WINDOW_MS, now)
  res.status(200).json({
    success: true,
    message: 'If that address has an account, a password reset link is on its way.',
  })
}

async function handleResetPassword(req: Request, res: Response): Promise<void> {
  const body = (req.body ?? {}) as Record<string, unknown>
  const rawToken = typeof body.token === 'string' ? body.token.trim() : ''
  const invalidPassword = passwordError(body.password)

  if (!rawToken) {
    res.status(400).json({ error: 'This reset link is incomplete.' })
    return
  }
  if (invalidPassword) {
    res.status(400).json({ error: invalidPassword })
    return
  }

  const record = await getAuthTokenByHash(hashToken(rawToken))
  const invalidResponse = () =>
    res.status(400).json({ error: 'This reset link is invalid or has expired. Request a new one.' })
  if (
    !record ||
    record.purpose !== 'reset_password' ||
    record.usedAt ||
    Date.parse(record.expiresAt) <= Date.now()
  ) {
    invalidResponse()
    return
  }

  const customer = await getCustomerById(record.customerId)
  if (!customer) {
    invalidResponse()
    return
  }

  await markAuthTokenUsed(record.id)
  // Every outstanding reset link dies with the password: a link an attacker
  // requested before the legitimate reset must not outlive it.
  await invalidateAuthTokens(customer.id, 'reset_password')

  await updateCustomer(customer.id, {
    passwordHash: await hashPassword(body.password as string),
    // Proving control of the mailbox is exactly what verification asks for.
    emailVerified: true,
  })

  res.status(200).json({
    success: true,
    message: 'Your password has been updated. Sign in with your new password.',
  })
}

// ------------------------------------------------------------------- router --

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>

/**
 * Local wrapper: Express 4 does not catch async rejections, and importing
 * `wrap` from index.ts would close an import cycle at module-evaluation time.
 */
function wrap(handler: AsyncHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, next).catch(next)
  }
}

/** True when the store has not been migrated for accounts yet. */
function isMissingAuthTables(error: unknown): boolean {
  return error instanceof SupabaseStoreError && error.status === 404
}

export function createCustomerAuthRouter() {
  const router = express.Router()

  router.post('/signup', wrap(handleSignup))
  router.post('/login', wrap(handleLogin))
  router.post('/logout', wrap(handleLogout))
  router.get('/me', requireCustomerAuth, wrap(handleMe))
  router.post('/verify-email', wrap(handleVerifyEmail))
  router.post('/resend-verification', wrap(handleResendVerification))
  router.post('/forgot-password', wrap(handleForgotPassword))
  router.post('/reset-password', wrap(handleResetPassword))
  router.post('/google', wrap(handleGoogle))

  // A missing cupi_customers / cupi_auth_tokens table (supabase/schema.sql not
  // re-run) surfaces as a PostgREST 404. Report it as "not available yet"
  // instead of a bare 500, and say what to do about it in the log.
  router.use((error: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (isMissingAuthTables(error)) {
      console.error(
        '[auth] cupi_customers / cupi_auth_tokens are missing — run supabase/schema.sql ' +
          'to enable customer accounts.',
      )
      res.status(503).json({
        error: 'Accounts are not available on this server yet. Please try again shortly.',
      })
      return
    }
    next(error)
  })

  return router
}
