import { AnimatePresence, motion } from 'framer-motion'
import { Heart, Home, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { OrderSuccessModal } from '../components/store/OrderSuccessModal'
import { verifyOrder } from '../lib/api'

const MAX_ATTEMPTS = 5
const POLL_DELAY_MS = 3000

interface PaymentResultProps {
  onExit: () => void
}

type PaymentState =
  | { phase: 'checking' }
  | { phase: 'waiting'; attempts: number }
  | { phase: 'success'; experienceId: string; sharePath: string }
  | { phase: 'failed'; message: string }
  | { phase: 'missing' }

/**
 * /payment-result?orderId=<cupiOrderId>
 *
 * Landing page after FamGateway's hosted checkout redirects the customer
 * back. This page never trusts the redirect alone — it calls
 * /api/orders/verify, which authoritatively checks the payment with the
 * FamGateway API (or returns the already-webhook-confirmed experience) before
 * the success modal is ever shown. Pending payments are polled briefly.
 */
export function PaymentResult({ onExit }: PaymentResultProps) {
  const [state, setState] = useState<PaymentState>({ phase: 'checking' })
  const [showSuccessModal, setShowSuccessModal] = useState(true)
  const [retryKey, setRetryKey] = useState(0)

  const orderIdRef = useRef<string | null>(null)
  if (orderIdRef.current === null) {
    orderIdRef.current = new URLSearchParams(window.location.search).get('orderId')
  }

  useEffect(() => {
    let cancelled = false
    const orderId = orderIdRef.current
    if (!orderId) {
      setState({ phase: 'missing' })
      return () => {
        cancelled = true
      }
    }

    let attempts = 0
    let timer: ReturnType<typeof setTimeout> | null = null

    const attempt = async (): Promise<void> => {
      if (cancelled) return
      attempts += 1
      setState({ phase: attempts > 1 ? 'waiting' : 'checking', attempts })
      try {
        const res = await verifyOrder({ orderId })
        if (cancelled) return

        if (res.success && res.experienceId) {
          const sharePath = res.sharePath || `/x/${res.experienceId}`
          setState({
            phase: 'success',
            experienceId: res.experienceId,
            sharePath,
          })
          return
        }

        if (res.status === 'pending' && attempts < MAX_ATTEMPTS) {
          timer = setTimeout(attempt, POLL_DELAY_MS)
          return
        }

        setState({
          phase: 'failed',
          message: "We couldn't confirm your payment yet. It may still be processing.",
        })
      } catch {
        if (cancelled) return
        if (attempts < MAX_ATTEMPTS) {
          timer = setTimeout(attempt, POLL_DELAY_MS)
          return
        }
        setState({
          phase: 'failed',
          message: "We couldn't reach the payment service. Please check again.",
        })
      }
    }

    void attempt()

    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [retryKey])

  const retry = useCallback(() => {
    setState({ phase: 'checking' })
    setRetryKey((key) => key + 1)
  }, [])

  const openSharePath = useCallback(
    (sharePath: string) => {
      window.location.assign(sharePath)
    },
    [],
  )

  if (state.phase === 'success') {
    return (
      <>
        <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#FFFDFB] bg-gradient-to-b from-[#FFF7F3] via-[#FEFCFB] to-[#FBEDF0] px-5">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[520px] -translate-x-1/2 rounded-full bg-rose-100/35 blur-3xl"
          />
          <div className="relative z-10 flex flex-col items-center gap-5 rounded-3xl border border-rose-100/70 bg-white p-8 text-center shadow-[0_12px_35px_rgba(244,63,94,0.1)]">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-4xl ring-1 ring-emerald-100">
              ✅
            </span>
            <h1 className="font-display text-2xl font-bold text-stone-900">
              Payment Verified
            </h1>
            <button
              type="button"
              onClick={() => openSharePath(state.sharePath)}
              className="flex min-h-12 items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 px-6 text-sm font-bold text-white shadow-lg shadow-rose-200 transition-all duration-200 hover:scale-[1.03] active:scale-95"
            >
              Open Your Surprise
            </button>
          </div>
        </div>
        <AnimatePresence>
          {showSuccessModal && (
            <OrderSuccessModal
              key="success"
              experienceId={state.experienceId}
              onClose={() => setShowSuccessModal(false)}
              onOpen={() => openSharePath(state.sharePath)}
            />
          )}
        </AnimatePresence>
      </>
    )
  }

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#FFFDFB] bg-gradient-to-b from-[#FFF7F3] via-[#FEFCFB] to-[#FBEDF0] px-5">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[520px] -translate-x-1/2 rounded-full bg-rose-100/35 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 -right-24 h-80 w-80 rounded-full bg-violet-100/30 blur-3xl"
      />

      {state.phase === 'checking' || state.phase === 'waiting' ? (
        <div className="relative z-10 flex flex-col items-center gap-6 text-center">
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="relative"
          >
            <span
              aria-hidden
              className="absolute -inset-6 rounded-full bg-rose-200/60 blur-2xl"
            />
            <span
              aria-hidden
              className="absolute inline-flex h-14 w-14 animate-ping rounded-full bg-rose-300/50 [animation-duration:1.6s]"
            />
            <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-500 shadow-xl shadow-rose-200">
              <Heart className="h-7 w-7 text-white" fill="currentColor" />
            </span>
          </motion.div>
          <div>
            <p className="font-display text-lg font-semibold text-stone-900">
              {state.phase === 'checking'
                ? 'Verifying your payment…'
                : 'Still waiting for confirmation…'}
            </p>
            <p className="mt-1 text-sm text-stone-500">
              {state.phase === 'checking'
                ? 'Please don’t close this window.'
                : `Checking with the payment gateway (attempt ${state.attempts}/${MAX_ATTEMPTS})…`}
            </p>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative z-10 flex max-w-md flex-col items-center gap-5 rounded-3xl border border-rose-100/70 bg-white p-8 text-center shadow-[0_12px_35px_rgba(244,63,94,0.1)]"
        >
          {state.phase === 'missing' ? (
            <>
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-4xl ring-1 ring-rose-100">
                💔
              </span>
              <h1 className="font-display text-2xl font-bold text-stone-900">
                We couldn’t find your order
              </h1>
              <p className="text-sm leading-relaxed text-stone-500">
                This payment link is missing an order reference. Head back to
                the store to start again.
              </p>
            </>
          ) : (
            <>
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-4xl ring-1 ring-amber-100">
                ⏳
              </span>
              <h1 className="font-display text-2xl font-bold text-stone-900">
                Payment not confirmed
              </h1>
              <p className="text-sm leading-relaxed text-stone-500">
                {state.phase === 'failed' ? state.message : 'This order was not completed.'}
              </p>
            </>
          )}

          <div className="grid w-full gap-2.5">
            {state.phase === 'failed' && (
              <button
                type="button"
                onClick={retry}
                className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 text-sm font-bold text-white shadow-lg shadow-rose-200 transition-all duration-200 hover:scale-[1.03] active:scale-95"
              >
                <RefreshCw className="h-4 w-4" />
                Check Again
              </button>
            )}
            <button
              type="button"
              onClick={onExit}
              className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-stone-200 bg-white px-5 text-sm font-semibold text-stone-700 transition-colors hover:border-rose-200 hover:text-rose-600"
            >
              <Home className="h-4 w-4" />
              Back to Cupi Store
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}