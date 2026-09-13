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
      console.log('[RAZORPAY ORDER DATA]', {
        orderId: order.orderId,
        amount: order.amount,
        keyId: order.keyId,
      })

      const razorpay = new RazorpayCtor({
        key:
          order.keyId ||
          (import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined) ||
          '',
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'Cupi',
        description: 'Personalized Experience',
        order_id: order.orderId,
        prefill: { name: payload.buyerName },
        theme: { color: '#FB7185', backdrop_color: '#FFFDFB' },
        modal: { ondismiss: () => resolve({ kind: 'cancelled' }) },
        handler: async (response) => {
          console.log('[RAZORPAY SUCCESS CALLBACK RAW RESPONSE]:', response)

          const paymentId =
            response.razorpay_payment_id || response.paymentId
          const orderId =
            response.razorpay_order_id ||
            response.orderId ||
            order.orderId
          const signature =
            response.razorpay_signature || response.signature

          if (!paymentId) {
            const msg = 'Missing Razorpay payment ID from payment modal.'
            console.error('[RAZORPAY CALLBACK ERROR]', msg, response)
            resolve({ kind: 'failed', message: msg })
            return
          }

          const verification: RazorpayVerificationPayload = {
            razorpay_order_id: orderId,
            razorpay_payment_id: paymentId,
            razorpay_signature: signature || '',
          }

          try {
            const verifyResult = await verifyPaymentApi(verification)
            console.log('[VERIFY RESULT SUCCESS]', verifyResult)

            const generatedId = verifyResult.experienceId || verifyResult.id
            if (!generatedId) {
              throw new Error('No experience ID returned from verification server')
            }

            resolve({
              kind: 'verified',
              experienceId: generatedId,
              shareUrl: verifyResult.sharePath || `/x/${generatedId}`,
            })
          } catch (error) {
            console.error('[VERIFICATION FAILED]', error)
            const message =
              error instanceof Error
                ? error.message
                : 'Payment verification failed. Please contact support.'
            alert(`Payment completed, but link creation failed: ${message}`)
            resolve({ kind: 'failed', message })
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