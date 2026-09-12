import { useCallback } from 'react'
import {
  createOrderApi,
  verifyPaymentApi,
  type RazorpayVerificationPayload,
} from '../lib/api'

let scriptPromise: Promise<boolean> | null = null

function loadRazorpayScript(): Promise<boolean> {
  if (typeof window !== 'undefined' && window.Razorpay) {
    return Promise.resolve(true)
  }
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
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

export type CheckoutOutcome =
  | { kind: 'verified'; experienceId: string; shareUrl: string }
  | { kind: 'cancelled' }
  | { kind: 'failed'; message: string }

export interface CheckoutPayload {
  templateId: string
  customization: unknown
  buyerName: string
}

/**
 * Runs the full Razorpay flow: creates the order server-side, opens the native
 * checkout, then verifies the payment signature with the backend.
 */
export function useRazorpay() {
  return useCallback(async (payload: CheckoutPayload): Promise<CheckoutOutcome> => {
    let order: Awaited<ReturnType<typeof createOrderApi>>
    try {
      order = await createOrderApi(payload.templateId, payload.customization)
    } catch (error) {
      return {
        kind: 'failed',
        message:
          error instanceof Error
            ? error.message
            : 'Could not start checkout. Is the server running?',
      }
    }

    const loaded = await loadRazorpayScript()
    const RazorpayCtor = typeof window !== 'undefined' ? window.Razorpay : undefined
    if (!loaded || !RazorpayCtor) {
      return {
        kind: 'failed',
        message: "Razorpay checkout couldn't be loaded. Check your connection and try again.",
      }
    }

    return new Promise<CheckoutOutcome>((resolve) => {
      const razorpay = new RazorpayCtor({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Cupi',
        description: 'Lock in your personalized surprise ✨',
        prefill: { name: payload.buyerName },
        theme: { color: '#FB7185', backdrop_color: '#FFF9F6' },
        modal: { ondismiss: () => resolve({ kind: 'cancelled' }) },
        handler: async (response) => {
          const verification: RazorpayVerificationPayload = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }
          try {
            const result = await verifyPaymentApi(verification)
            resolve({
              kind: 'verified',
              experienceId: result.experienceId,
              shareUrl: result.shareUrl,
            })
          } catch (error) {
            resolve({
              kind: 'failed',
              message:
                error instanceof Error
                  ? error.message
                  : 'Payment verification failed. Please contact support.',
            })
          }
        },
      })

      razorpay.on('payment.failed', () => {
        resolve({ kind: 'failed', message: 'The payment could not be completed. Please try again.' })
      })

      razorpay.open()
    })
  }, [])
}