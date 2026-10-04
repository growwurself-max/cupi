import type { Request, Response, NextFunction } from 'express'
import { SUPER_ADMIN_TOKEN } from './config.js'

/**
 * Validates Super Admin authentication via Bearer token.
 *
 * The token must be provided in the Authorization header as:
 *   Authorization: Bearer <token>
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

  if (!SUPER_ADMIN_TOKEN) {
    console.error('[admin-auth] SUPER_ADMIN_TOKEN not configured')
    res.status(500).json({ error: 'Admin authentication not configured' })
    return
  }

  if (token !== SUPER_ADMIN_TOKEN) {
    console.warn('[admin-auth] Invalid admin token attempt')
    res.status(401).json({ error: 'Invalid admin token' })
    return
  }

  next()
}
