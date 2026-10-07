/**
 * /verify-email?token=<raw>
 *
 * Landing page for the verification link in the sign-up e-mail. It spends the
 * single-use token, marks the account verified, and (when the caller is already
 * signed in) updates the header in place. Everything after that — the "you're
 * verified" banner, resending a fresh link — lives on the normal storefront.
 */
import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Heart, Home, Loader2, ShieldCheck } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { verifyEmail } from '../lib/api.ts'
import { useAuth } from '../lib/authContext.ts'

type State = 'verifying' | 'success' | 'error' | 'missing'

export function VerifyEmail({ onExit }: { onExit: () => void }) {
  const { refreshMe, openAuth } = useAuth()
  const [token] = useState<string | null>(() =>
    new URLSearchParams(window.location.search).get('token'),
  )
  const [state, setState] = useState<State>(token ? 'verifying' : 'missing')
  const [message, setMessage] = useState(() =>
    token
      ? 'Verifying your e-mail…'
      : 'This link is incomplete — open it straight from your e-mail.',
  )

  const goHome = useCallback(() => onExit(), [onExit])

  useEffect(() => {
    if (!token) return
    let cancelled = false

    verifyEmail(token)
      .then(async (response) => {
        if (cancelled) return
        if (response.success) {
          setState('success')
          setMessage(response.message || 'Your e-mail is verified.')
          // A signed-in customer gets their verified badge instantly.
          await refreshMe().catch(() => undefined)
          return
        }
        setState('error')
        setMessage(response.message || 'We could not verify that e-mail.')
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setState('error')
        setMessage(
          error instanceof Error && error.message
            ? error.message
            : 'We could not verify that e-mail. The link may have expired.',
        )
      })

    return () => {
      cancelled = true
    }
  }, [token, refreshMe])

  const icon =
    state === 'verifying' ? (
      <Loader2 className="h-10 w-10 animate-spin text-rose-400" />
    ) : state === 'success' ? (
      <CheckCircle2 className="h-10 w-10 text-emerald-500" />
    ) : (
      <AlertCircle className="h-10 w-10 text-rose-400" />
    )

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#FFFDFB] bg-gradient-to-b from-[#FFF7F3] via-[#FEFCFB] to-[#FBEDF0] px-5">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[540px] w-[860px] -translate-x-1/2 rounded-full bg-rose-100/40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 -right-44 h-96 w-96 rounded-full bg-violet-100/30 blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 flex max-w-md flex-col items-center gap-5 rounded-3xl border border-rose-100/70 bg-white p-8 text-center shadow-[0_12px_35px_rgba(244,63,94,0.1)]"
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-50 to-pink-50 ring-1 ring-rose-100">
          {icon}
        </span>

        <div>
          <h1 className="font-display text-xl font-semibold text-stone-900">
            {state === 'success' ? 'You’re all set!' : 'Verify your e-mail'}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-stone-500">{message}</p>
        </div>

        {state === 'success' && (
          <div className="flex w-full flex-col gap-2">
            <button
              type="button"
              onClick={goHome}
              className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 text-sm font-bold text-white shadow-lg shadow-rose-200 transition-all duration-200 hover:scale-[1.02] active:scale-95"
            >
              <Home className="h-4 w-4" /> Continue exploring
            </button>
            <p className="flex items-center justify-center gap-1.5 text-xs text-stone-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              Orders on this account now belong to your verified address.
            </p>
          </div>
        )}

        {(state === 'error' || state === 'missing') && (
          <div className="flex w-full flex-col gap-2">
            <button
              type="button"
              onClick={() => openAuth('login')}
              className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 text-sm font-bold text-white shadow-lg shadow-rose-200 transition-all duration-200 hover:scale-[1.02] active:scale-95"
            >
              Request a new link
            </button>
            <button
              type="button"
              onClick={goHome}
              className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-rose-100 text-sm font-semibold text-stone-600 transition-colors hover:bg-rose-50"
            >
              <Heart className="h-4 w-4 text-rose-400" /> Back to Cupi
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}