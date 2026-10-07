/**
 * Customer authentication for the Cupi storefront.
 *
 * WHAT LIVES HERE
 *   • email + password sign-up and sign-in (scrypt-hashed, never plain text)
 *   • "Continue with Google" (Firebase verifies the Google identity and its
 *     ID token is verified server-side with the Firebase Admin SDK)
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
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from 'node:crypto'
import { promisify } from 'node:util'
import express from 'express'
import type { NextFunction, Request, Response } from 'express'
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth, type DecodedIdToken } from 'firebase-admin/auth'
import {
  CUSTOMER_AUTH_SECRET,
  FIREBASE_SERVICE_ACCOUNT_JSON,
} from './config.js'
import {
  createCustomer,
  getCustomerByEmail,
  getCustomerByGoogleSub,
  getCustomerById,
  updateCustomer,
} from './db.js'
import type { CustomerRecord } from './store.js'
import { SupabaseStoreError } from './supabase.js'

declare global {
  namespace Express {
    interface Request {
      /** Set by `requireCustomerAuth`. */
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
    // This indicates a Firebase-linked Google sign-in without exposing its UID.
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
/** Account creation: 5 attempts per address per hour. */
const SIGNUP_MAX_FAILURES = 5
const SIGNUP_WINDOW_MS = 60 * 60 * 1000

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

// ------------------------------------------------------------------ Firebase --

interface FirebaseIdentity {
  uid: string
  email: string
  name: string
  avatarUrl: string | null
}

function firebaseAdminAuth() {
  if (!FIREBASE_SERVICE_ACCOUNT_JSON) return null

  const serviceAccount = JSON.parse(FIREBASE_SERVICE_ACCOUNT_JSON) as Record<string, unknown>
  const projectId = serviceAccount.project_id
  const clientEmail = serviceAccount.client_email
  const privateKey = serviceAccount.private_key
  if (
    typeof projectId !== 'string' ||
    typeof clientEmail !== 'string' ||
    typeof privateKey !== 'string'
  ) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is missing required service-account fields.')
  }

  const appName = 'cupi-customer-auth'
  const app =
    getApps().find((candidate) => candidate.name === appName) ??
    initializeApp(
      {
        credential: cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      },
      appName,
    )
  return getAuth(app)
}

async function verifyFirebaseGoogleIdToken(idToken: string): Promise<FirebaseIdentity | null> {
  const auth = firebaseAdminAuth()
  if (!auth) return null

  let claims: DecodedIdToken
  try {
    claims = await auth.verifyIdToken(idToken, true)
  } catch (error) {
    const code =
      error && typeof error === 'object' && 'code' in error && typeof error.code === 'string'
        ? error.code
        : ''
    if (
      code === 'auth/argument-error' ||
      code === 'auth/invalid-id-token' ||
      code === 'auth/id-token-expired' ||
      code === 'auth/id-token-revoked'
    ) {
      return null
    }
    throw error
  }

  const email = normalizeEmail(claims.email)
  if (
    claims.firebase?.sign_in_provider !== 'google.com' ||
    claims.email_verified !== true ||
    typeof claims.uid !== 'string' ||
    !claims.uid ||
    !isValidEmail(email)
  ) {
    return null
  }

  return {
    uid: claims.uid,
    email,
    name: cleanName(claims.name, email),
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
  if (isThrottled(key, SIGNUP_MAX_FAILURES, SIGNUP_WINDOW_MS, now)) {
    res.status(429).json({ error: 'Too many attempts for this address. Try again later.' })
    return
  }

  try {
    const existing = await getCustomerByEmail(email)
    if (existing) {
      recordFailure(key, SIGNUP_MAX_FAILURES, SIGNUP_WINDOW_MS, now)
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
    const session = issueSessionToken(customer.id)

    res.status(201).json({
      success: true,
      token: session.token,
      expiresAt: session.expiresAt,
      customer: publicCustomer(customer),
      message: 'Account created. You can now continue to checkout.',
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
  const idToken = typeof body.idToken === 'string' ? body.idToken : ''

  if (!FIREBASE_SERVICE_ACCOUNT_JSON) {
    res.status(503).json({ error: 'Firebase Google Sign-In is not configured on this server.' })
    return
  }
  if (!idToken) {
    res.status(400).json({ error: 'Missing Firebase ID token.' })
    return
  }

  const identity = await verifyFirebaseGoogleIdToken(idToken)
  if (!identity) {
    res.status(401).json({ error: 'That Firebase Google sign-in could not be verified. Please try again.' })
    return
  }

  let customer = await getCustomerByGoogleSub(identity.uid)

  if (!customer) {
    // A verified provider email safely links to the existing Cupi customer row.
    customer = await getCustomerByEmail(identity.email)
    if (customer) {
      const linked = await updateCustomer(customer.id, {
        googleSub: identity.uid,
        avatarUrl: customer.avatarUrl ?? identity.avatarUrl,
        emailVerified: true,
      })
      customer = linked ?? customer
    } else {
      customer = await createCustomer({
        email: identity.email,
        name: identity.name,
        avatarUrl: identity.avatarUrl,
        googleSub: identity.uid,
        emailVerified: true,
      })
    }
  } else if (!customer.emailVerified) {
    customer = (await updateCustomer(customer.id, { emailVerified: true })) ?? customer
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
  router.post('/google', wrap(handleGoogle))

  // A missing cupi_customers table (supabase/schema.sql not
  // re-run) surfaces as a PostgREST 404. Report it as "not available yet"
  // instead of a bare 500, and say what to do about it in the log.
  router.use((error: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (isMissingAuthTables(error)) {
      console.error(
        '[auth] cupi_customers is missing — run supabase/schema.sql ' +
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
