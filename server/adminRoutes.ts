import express from 'express'
import type { Request, Response } from 'express'
import { ALLOWED_TEMPLATES, PHOTO_LIMITS } from './config.js'
import { requireAdminAuth } from './adminAuth.js'
import { wrap } from './index.js'
import { resolvePriceInRupees } from './index.js'

/**
 * GET /api/admin/products
 *
 * Returns all available products/themes with their current pricing and configuration.
 * Requires Super Admin authentication.
 */
async function handleGetProducts(_req: Request, res: Response): Promise<void> {
  const products = ALLOWED_TEMPLATES.map((templateId) => ({
    id: templateId,
    price: resolvePriceInRupees(templateId),
    photoLimit: PHOTO_LIMITS[templateId] ?? 0,
  }))

  res.status(200).json({
    success: true,
    products,
  })
}

/**
 * GET /api/admin/stats
 *
 * Returns basic statistics about the Cupi platform.
 * Requires Super Admin authentication.
 */
async function handleGetStats(_req: Request, res: Response): Promise<void> {
  // Import dynamically to avoid circular dependency
  const { countExperiences } = await import('./db.js')

  const experienceCount = await countExperiences()

  res.status(200).json({
    success: true,
    stats: {
      totalTemplates: ALLOWED_TEMPLATES.length,
      totalExperiences: experienceCount,
    },
  })
}

/**
 * Create and return the admin router with all protected routes.
 */
export function createAdminRouter() {
  const router = express.Router()

  // Apply auth middleware to all admin routes
  router.use(requireAdminAuth)

  router.get('/products', wrap(handleGetProducts))
  router.get('/stats', wrap(handleGetStats))

  return router
}
