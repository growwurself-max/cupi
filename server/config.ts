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
 * Directory holding db.json (orders + generated experiences).
 *
 * PERMANENT LINKS: the public /x/:id link resolves against a record in this
 * file, so this directory MUST live on durable storage in production. A
 * container filesystem (Render free/standard instances, any ephemeral host) is
 * wiped on every deploy, config change, crash-restart and free-tier spin-down,
 * which silently deleted every order and generated website — the reason
 * previously-issued share links used to "expire" a while after being created.
 *
 * Point CUPI_DATA_DIR at a mounted persistent volume (e.g. a Render persistent
 * disk mounted at /var/data → CUPI_DATA_DIR=/var/data) to make generated
 * websites permanent. Unset, it falls back to the in-repo path for local dev.
 */
function resolveDataDir(): string {
  const configured = (process.env.CUPI_DATA_DIR ?? '').trim()
  if (!configured) return path.resolve(PROJECT_ROOT, 'server', 'data')
  return path.isAbsolute(configured)
    ? path.normalize(configured)
    : path.resolve(PROJECT_ROOT, configured)
}

export const DATA_DIR = resolveDataDir()
export const DIST_DIR = path.resolve(PROJECT_ROOT, 'dist')

/**
 * True when the data directory has NOT been pointed at a durable volume. Only
 * ever a warning signal — local dev is fine — but in production it means every
 * generated website lives on an ephemeral disk and its share link will break on
 * the next restart. Surfaced on /api/health so it is impossible to miss.
 */
export const USING_EPHEMERAL_DATA_DIR =
  !process.env.CUPI_DATA_DIR || process.env.CUPI_DATA_DIR.trim() === ''