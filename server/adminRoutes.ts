import express from 'express'
import type { Request, Response } from 'express'
import { ALLOWED_TEMPLATES, PHOTO_LIMITS } from './config.js'
import { requireAdminAuth } from './adminAuth.js'
import { wrap } from './index.js'
import { resolvePriceInRupees } from './index.js'
import { updateProductPrice } from './db.js'

/**
 * GET /api/admin/products
 *
 * Returns all available products/themes with their current pricing and configuration.
 * Requires Super Admin authentication.
 */
async function handleGetProducts(_req: Request, res: Response): Promise<void> {
  const products = []
  for (const templateId of ALLOWED_TEMPLATES) {
    const price = await resolvePriceInRupees(templateId)
    products.push({
      id: templateId,
      price,
      photoLimit: PHOTO_LIMITS[templateId] ?? 0,
    })
  }

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
 * PUT /api/admin/products/:templateId/price
 *
 * Updates the price for a specific template.
 * Requires Super Admin authentication.
 */
async function handleUpdateProductPrice(
  req: Request,
  res: Response,
): Promise<void> {
  const { templateId } = req.params
  const { price } = req.body

  if (!templateId || typeof templateId !== 'string') {
    res.status(400).json({ error: 'Invalid template ID' })
    return
  }

  if (!ALLOWED_TEMPLATES.includes(templateId)) {
    res.status(400).json({ error: `Unknown template ID: "${templateId}"` })
    return
  }

  if (typeof price !== 'number' || isNaN(price) || price < 0) {
    res.status(400).json({ error: 'Invalid price. Must be a non-negative number.' })
    return
  }

  try {
    const updatedPrice = await updateProductPrice(templateId, price)
    res.status(200).json({
      success: true,
      templateId,
      price: updatedPrice,
    })
  } catch (error) {
    console.error('[admin] Failed to update product price:', error)
    res.status(500).json({ error: 'Failed to update price' })
  }
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
  router.put('/products/:templateId/price', wrap(handleUpdateProductPrice))

  return router
}
