import { useCallback } from 'react'

/**
 * FamGateway frontend flow.
 *
 * FamGateway's documented API returns a `checkout_url` hosted checkout page —
 * no browser SDK exists and none should be invented. The primary (and only)
 * implementation here is a full-page redirect to that hosted checkout, which
 * is reliable on both desktop and mobile browsers and never blocks popups.
 * The API key never touches this hook; the backend keeps it server-side.
 */
export function useFamGateway() {
  const openCheckout = useCallback((checkoutUrl: string) => {
    window.location.assign(checkoutUrl)
  }, [])

  return { openCheckout }
}