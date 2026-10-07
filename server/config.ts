import path from 'node:path'
import 'dotenv/config'

const PROJECT_ROOT = process.cwd()

export const PORT = Number(process.env.PORT ?? 5000)
export const HOST = process.env.HOST || '0.0.0.0'

export const FRONTEND_ORIGINS = (
  process.env.FRONTEND_URL ?? 'http://localhost:5173'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

export const CURRENCY = 'INR'
export const ALLOWED_TEMPLATES = [
  'birthday-01',
  'birthday-02',
  'birthday-03',
  'love-01',
  'love-02',
  'anniversary-01',
  'anniversary-02',
  'proposal-01',
  'proposal-02',
  'friendship-01',
  'friendship-02',
  'graduation-01',
  'graduation-02',
  'birthday-04',
  'special-01',
  'special-02',
  'special-03',
  'special-04',
  'parent-01',
  'parent-02',
]

/**
 * Photo limits per template. Set to 0 for templates that don't support photos.
 * Flagship templates accept more user photos than the standard 3. The value
 * replaces the client-side cap AND the server-side sanitize slice for that
 * template, keeping the stored customization within the 10mb JSON limit.
 */
export const PHOTO_LIMITS: Record<string, number> = {
  'birthday-01': 0,
  'birthday-02': 0,
  'birthday-03': 6,
  'birthday-04': 0,
  'love-01': 3,
  'love-02': 0,
  'anniversary-01': 3,
  'anniversary-02': 3,
  'proposal-01': 0,
  'proposal-02': 0,
  'friendship-01': 3,
  'friendship-02': 0,
  'graduation-01': 3,
  'graduation-02': 0,
  'special-01': 0,
  'special-02': 3,
  'special-03': 3,
  'special-04': 0,
  'parent-01': 6,
  'parent-02': 6,
}

/**
 * Directory holding db.json.
 *
 * This is now the LOCAL DEVELOPMENT store only. Production data lives in the
 * free, persistent Supabase Postgres database (see server/supabase.ts), which
 * is what makes /x/:id links survive deploys, restarts and free-tier spin-downs.
 * db.json is kept as the migration source of truth — see `npm run migrate-data`
 * — and `server/db.ts` refuses to start on it when NODE_ENV=production.
 *
 * Resolution order:
 *   1. `CUPI_DATA_DIR` when set (absolute, or relative to the project root).
 *   2. The in-repo server/data path, for local dev and for reading a db.json
 *      handed over from an older deployment.
 *
 * Nothing here is relied on for durability: the store reports whether it is
 * durable through `isStoreDurable()`, and /api/health exposes that.
 */
function resolveDataDir(): string {
  const configured = (process.env.CUPI_DATA_DIR ?? '').trim()
  if (configured) {
    return path.isAbsolute(configured)
      ? path.normalize(configured)
      : path.resolve(PROJECT_ROOT, configured)
  }
  return path.resolve(PROJECT_ROOT, 'server', 'data')
}

export const DATA_DIR = resolveDataDir()
export const DIST_DIR = path.resolve(PROJECT_ROOT, 'dist')

/**
 * Super Admin authentication token.
 *
 * Accepted as `Authorization: Bearer <token>` on every /api/admin route, and
 * used to sign the short-lived session issued by POST /api/admin/login.
 * Set a strong, random secret in production. Never commit this to version
 * control.
 */
export const SUPER_ADMIN_TOKEN = process.env.SUPER_ADMIN_TOKEN || ''

/**
 * Superadmin dashboard login credentials (POST /api/admin/login).
 *
 * SUPER_ADMIN_EMAIL holds the login identifier — a username or an email
 * address, whichever you prefer to type. SUPER_ADMIN_PASSWORD is compared in
 * constant time and never leaves the server. Both are read from the
 * environment (Render dashboard) so no credential ever lands in the repo.
 */
export const SUPER_ADMIN_EMAIL = (
  process.env.SUPER_ADMIN_EMAIL || process.env.SUPER_ADMIN_USERNAME || ''
).trim()

export const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || ''

/**
 * Customer authentication (POST /api/auth/*).
 *
 * GOOGLE_CLIENT_ID is the OAuth client the "Continue with Google" ID token is
 * verified against. It is PUBLIC (it ships to the browser too, as
 * VITE_GOOGLE_CLIENT_ID); it is a client identity, not a secret — the security
 * comes from verifying the token's signature and audience server-side.
 */
export const GOOGLE_CLIENT_ID = (process.env.GOOGLE_CLIENT_ID ?? '').trim()

/**
 * Key that signs customer session tokens.
 *
 * Preferred, dedicated secret. Falls back to other server-side secrets so a
 * deployment can sign sessions without adding a third variable, exactly like
 * the Superadmin session does. Never commit this value.
 */
export const CUSTOMER_AUTH_SECRET = (
  process.env.CUSTOMER_AUTH_SECRET ||
  process.env.SUPER_ADMIN_TOKEN ||
  ''
).trim()

/**
 * Outgoing e-mail (verification links, password resets) via the Resend HTTP
 * API. No npm dependency: it is one authenticated POST, so a missing key only
 * disables e-mail — signup, login and Google sign-in keep working, and the
 * links are logged server-side instead.
 */
export const RESEND_API_KEY = (process.env.RESEND_API_KEY ?? '').trim()
export const EMAIL_FROM = (process.env.EMAIL_FROM ?? 'Cupi <onboarding@resend.dev>').trim()

/** Where verification/reset links point back to. First allowed origin wins. */
export const APP_URL = FRONTEND_ORIGINS[0] || 'http://localhost:5173'
