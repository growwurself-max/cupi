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
  'love-01',
  'anniversary-01',
  'proposal-01',
  'friendship-01',
  'graduation-01',
]

export const DATA_DIR = path.resolve(PROJECT_ROOT, 'server', 'data')
export const DIST_DIR = path.resolve(PROJECT_ROOT, 'dist')