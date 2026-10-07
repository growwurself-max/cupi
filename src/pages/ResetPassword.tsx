/**
 * /reset-password?token=<raw>
 *
 * Landing page for the password-reset e-mail. The token is single-use: typing a
 * new password here both rotates it and burns every other outstanding reset
 * link, so a link an attacker requested earlier cannot outlive the owner's.
 * On success the customer signs in with the new password (and any account that
 * can reset a password is implicitly e-mail-verified).
 */
import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Heart, Home, KeyRound, Loader2, Lock } from 'lucide-react'
import { useState } from 'react'
import { resetPassword, ApiError } from '../lib/api.ts'
import { useAuth } from '../lib/authContext.ts'

type State = 'ready' | 'submitting' | 'success' | 'error'

export function ResetPassword({ onExit }: { onExit: () => void }) {
  const { openAuth } = useAuth()
  const [state, setState] = useState<State>('ready')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState('')
  const [token] = useState<string | null>(() =>
    new URLSearchParams(window.location.search).get('token'),
  )
  const tokenMissing = !token

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    setMessage('')

    if (password.length < 8) {
      setState('error')
      setMessage('Password must be at least 8 characters long.')
      return
    }
    if (password !== confirm) {
      setState('error')
      setMessage('Passwords do not match.')
      return
    }

    setState('submitting')
    try {
      const response = await resetPassword(token as string, password)
      if (response.success) {
        setState('success')
        setMessage('Your password has been updated. Sign in with the new one.')
        return
      }
      setState('error')
      setMessage(response.message || 'We could not reset your password.')
    } catch (error) {
      setState('error')
      setMessage(
        error instanceof ApiError && error.message
          ? error.message
          : 'We could not reset your password. The link may have expired.',
      )
    }
  }

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#FFFDFB] bg-gradient-to-b from-[#FFF7F3] via-[#FEFCFB] to-[#FBEDF0] px-5">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[540px] w-[860px] -translate-x-1/2 rounded-full bg-rose-100/40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 -left-44 h-96 w-96 rounded-full bg-violet-100/30 blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 flex w-full max-w-md flex-col items-center gap-5 rounded-3xl border border-rose-100/70 bg-white p-8 text-center shadow-[0_12px_35px_rgba(244,63,94,0.1)]"
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-50 to-pink-50 ring-1 ring-rose-100">
          {state === 'success' ? (
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          ) : state === 'submitting' ? (
            <Loader2 className="h-10 w-10 animate-spin text-rose-400" />
          ) : (
            <KeyRound className="h-10 w-10 text-rose-400" />
          )}
        </span>

        <div>
          <h1 className="font-display text-xl font-semibold text-stone-900">
            {state === 'success' ? 'Password updated' : tokenMissing ? 'Link incomplete' : 'Choose a new password'}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-stone-500">
            {state !== 'success' &&
              (tokenMissing
                ? 'Open the link straight from your e-mail to reset your password.'
                : 'Make it something you’ll remember — 8 characters or more.')}
          </p>
        </div>

        {tokenMissing ? (
          <button
            type="button"
            onClick={() => openAuth('login')}
            className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-rose-100 text-sm font-semibold text-stone-600 transition-colors hover:bg-rose-50"
          >
            <Heart className="h-4 w-4 text-rose-400" /> Back to sign in
          </button>
        ) : state === 'success' ? (
          <div className="flex w-full flex-col gap-2">
            <button
              type="button"
              onClick={() => openAuth('login')}
              className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 text-sm font-bold text-white shadow-lg shadow-rose-200 transition-all duration-200 hover:scale-[1.02] active:scale-95"
            >
              <Lock className="h-4 w-4" /> Sign in
            </button>
            <button
              type="button"
              onClick={onExit}
              className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-rose-100 text-sm font-semibold text-stone-600 transition-colors hover:bg-rose-50"
            >
              <Home className="h-4 w-4" /> Back to Cupi
            </button>
          </div>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)} className="mt-1 flex w-full flex-col gap-3 text-left">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold tracking-wide text-stone-500">New password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8+ characters"
                autoComplete="new-password"
                minLength={8}
                className="w-full rounded-2xl border border-rose-100 bg-white py-2.5 px-4 text-sm text-stone-800 placeholder:text-stone-300 focus:border-rose-300 focus:ring-2 focus:ring-rose-100 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold tracking-wide text-stone-500">Repeat it</span>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="One more time"
                autoComplete="new-password"
                minLength={8}
                className="w-full rounded-2xl border border-rose-100 bg-white py-2.5 px-4 text-sm text-stone-800 placeholder:text-stone-300 focus:border-rose-300 focus:ring-2 focus:ring-rose-100 focus:outline-none"
              />
            </label>

            {state === 'error' && message && (
              <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={state === 'submitting'}
              className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 text-sm font-bold text-white shadow-lg shadow-rose-200 transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {state === 'submitting' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                </>
              ) : (
                'Set new password'
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}