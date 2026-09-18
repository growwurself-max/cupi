import { useCallback, useEffect, useState } from 'react'

declare global {
  interface Window {
    Cashfree?: any
  }
}

let scriptPromise: Promise<boolean> | null = null

function loadCashfreeScript(): Promise<boolean> {
  if (typeof window !== 'undefined' && window.Cashfree) {
    return Promise.resolve(true)
  }
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js'
      script.async = true
      script.onload = () => resolve(true)
      script.onerror = () => {
        scriptPromise = null
        resolve(false)
      }
      document.body.appendChild(script)
    })
  }
  return scriptPromise
}

export interface CheckoutOutcome {
  paymentDetails?: unknown
  cancelled?: boolean
}

/**
 * Loads the Cashfree PG v3 SDK once and returns an `openCheckout` helper that
 * opens the native Cashfree popup (UPI, Cards, Netbanking) in a modal.
 */
export function useCashfree() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    loadCashfreeScript().then((loaded) => {
      if (!cancelled) setIsLoaded(loaded)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const openCheckout = useCallback(
    async (paymentSessionId: string): Promise<CheckoutOutcome> => {
      const loaded = await loadCashfreeScript()
      if (!loaded || !window.Cashfree) {
        throw new Error('Cashfree SDK failed to load. Check your connection and try again.')
      }

      const mode =
        import.meta.env.VITE_CASHFREE_MODE === 'production'
          ? 'production'
          : 'sandbox'
      const cashfree = window.Cashfree({ mode })

      return new Promise<CheckoutOutcome>((resolve, reject) => {
        cashfree
          .checkout({
            paymentSessionId,
            redirectTarget: '_modal',
          })
          .then((result: any) => {
            if (result?.error) {
              console.error('[CASHFREE CHECKOUT ERROR]', result.error)
              return reject(
                new Error(result.error.message || 'Payment was not completed.'),
              )
            }
            if (result?.paymentDetails) {
              console.log('[CASHFREE CHECKOUT SUCCESS]', result.paymentDetails)
              return resolve({ paymentDetails: result.paymentDetails })
            }
            resolve({ cancelled: true })
          })
          .catch((error: unknown) => {
            console.error('[CASHFREE CHECKOUT REJECTED]', error)
            reject(
              error instanceof Error
                ? error
                : new Error('Payment was not completed.'),
            )
          })
      })
    },
    [],
  )

  return { openCheckout, isLoaded }
}