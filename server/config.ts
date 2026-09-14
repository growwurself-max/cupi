import path from 'node:path'
import 'dotenv/config'

const PROJECT_ROOT = process.cwd()

export const PORT = Number(process.env.PORT ?? 5000)
export const HOST = process.env.HOST || '0.0.0.0'

export const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID ?? ''
export const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? ''

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
}

export const DATA_DIR = path.resolve(PROJECT_ROOT, 'server', 'data')
export const DIST_DIR = path.resolve(PROJECT_ROOT, 'dist')