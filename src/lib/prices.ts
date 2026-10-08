import { useEffect, useState } from 'react'
import { API_BASE } from './api'

/**
 * Live product prices, sourced from the same backend endpoint the Super Admin
 * price manager writes to (`GET /api/products/prices` → `resolvePriceInRupees`).
 *
 * The catalog in `src/data/catalog.ts` carries default prices as a render
 * fallback only. Every price a customer actually sees must come from here so an
 * admin price change is reflected immediately, without a rebuild or a purchase.
 */
export type ProductPrices = Record<string, number>

let cachedPrices: ProductPrices | null = null
let inflight: Promise<ProductPrices> | null = null
const listeners = new Set<(prices: ProductPrices) => void>()

function emit(prices: ProductPrices) {
  for (const listener of listeners) listener(prices)
}

/**
 * Loads the authoritative price list. Concurrent callers share one request, and
 * the result is cached for the lifetime of the page. Pass `force` to revalidate
 * (e.g. after returning from checkout).
 */
export function loadProductPrices(options: { force?: boolean } = {}): Promise<ProductPrices> {
  if (cachedPrices && !options.force) return Promise.resolve(cachedPrices)
  if (inflight) return inflight

  inflight = (async () => {
    try {
      const response = await fetch(`${API_BASE}/products/prices`, { cache: 'no-store' })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = (await response.json()) as { prices?: ProductPrices }
      const prices = data.prices ?? {}
      cachedPrices = prices
      emit(prices)
      return prices
    } catch (error) {
      // A failed refresh must not blank the storefront: keep whatever we have
      // (or fall back to the catalog defaults) and try again on the next mount.
      console.warn('[prices] could not load live prices, showing catalog defaults:', error)
      return cachedPrices ?? EMPTY_PRICES
    } finally {
      inflight = null
    }
  })()

  return inflight
}

const EMPTY_PRICES: ProductPrices = Object.freeze({})

export function getCachedProductPrices(): ProductPrices {
  return cachedPrices ?? EMPTY_PRICES
}

export function subscribeProductPrices(listener: (prices: ProductPrices) => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Reactive live prices for a component. Fetches once per page load. */
export function useProductPrices(): ProductPrices {
  const [prices, setPrices] = useState<ProductPrices>(getCachedProductPrices)

  useEffect(() => {
    const unsubscribe = subscribeProductPrices(setPrices)
    // Resolves synchronously from cache when it is already warm, otherwise
    // updates the moment the network response lands.
    void loadProductPrices().then((loaded) => {
      setPrices((prev) => (prev === loaded ? prev : loaded))
    })
    return unsubscribe
  }, [])

  return prices
}

/** `87` → `₹87`, `87.5` → `₹87.50`. Matches the storefront's price chip style. */
export function formatRupees(amount: number): string {
  return `₹${Number.isInteger(amount) ? String(amount) : amount.toFixed(2)}`
}

/**
 * Overlays live server prices onto catalog rows. Returns the original array
 * when nothing changed so memoized rendering stays stable while prices load.
 */
export function withLivePrices<
  T extends { id: string; price: string; amountInPaise: number },
>(items: T[], prices: ProductPrices): T[] {
  if (!prices || Object.keys(prices).length === 0) return items

  let changed = false
  const next = items.map((item) => {
    const live = prices[item.id]
    if (typeof live !== 'number') return item
    const price = formatRupees(live)
    const amountInPaise = Math.round(live * 100)
    if (item.price === price && item.amountInPaise === amountInPaise) return item
    changed = true
    return { ...item, price, amountInPaise }
  })

  return changed ? next : items
}
