/**
 * Login / Sign up dialog for the Cupi storefront.
 */
import { motion } from 'framer-motion'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { AlertCircle, CheckCircle2, Heart, Loader2, Lock, Mail, Sparkles, User, X } from 'lucide-react'
import { useCallback, useState } from 'react'
import {
  login,
  loginWithGoogle,
  signup,
  type AuthResponse,
} from '../../lib/api.ts'
import { useAuth, type AuthModalMode } from '../../lib/authContext.ts'
import { firebaseAuth, firebaseConfigured } from '../../lib/firebase.ts'

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback
}

export function AuthModal() {
  const { modalMode, closeAuth, applyAuthResponse } = useAuth()
  const [mode, setMode] = useState<AuthModalMode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const open = modalMode !== null

  // Switching between "Log in" and "Sign up" resets the per-form helpers but
  // keeps the e-mail address (the one thing people hate to retype).
  const switchMode = useCallback((next: AuthModalMode) => {
    setMode(next)
    setError(null)
    setNotice(null)
  }, [])

  const handleClose = useCallback(() => {
    if (submitting) return
    closeAuth()
    setError(null)
    setNotice(null)
    setSubmitting(false)
  }, [closeAuth, submitting])

  async function handleGoogleSignIn(): Promise<void> {
    if (!firebaseAuth) return
    setError(null)
    setSubmitting(true)
    try {
      const credential = await signInWithPopup(firebaseAuth, new GoogleAuthProvider())
      const idToken = await credential.user.getIdToken()
      const response = await loginWithGoogle(idToken)
      applyAuthResponse(response)
      closeAuth()
    } catch (cause) {
      setError(errorMessage(cause, 'Google sign-in did not work. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    setError(null)
    setNotice(null)

    if (mode === 'signup' && !name.trim()) {
      setError('Please tell us your name.')
      return
    }
    if (!email.trim()) {
      setError('Please enter your e-mail address.')
      return
    }
    if (!password) {
      setError(mode === 'signup' ? 'Please choose a password.' : 'Please enter your password.')
      return
    }

    setSubmitting(true)
    try {
      const response: AuthResponse =
        mode === 'signup' ? await signup({ name, email, password }) : await login({ email, password })
      applyAuthResponse(response)
      if (mode === 'signup') {
        setNotice(response.message || 'Your account is ready. You can now continue to checkout.')
      } else {
        closeAuth()
        setPassword('')
      }
    } catch (cause) {
      setError(errorMessage(cause, 'Something went wrong. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  const googleDisabled = !firebaseConfigured

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={mode === 'signup' ? 'Create a Cupi account' : 'Sign in to Cupi'}
    >
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={handleClose} aria-hidden />

      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="relative w-full max-w-md rounded-3xl border border-rose-100/70 bg-ivory p-6 shadow-[0_24px_70px_rgba(30,15,20,0.22)] sm:p-8"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-rose-200/80 to-transparent"
        />

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-500 shadow-lg shadow-rose-200">
              <Heart className="h-4.5 w-4.5 text-white" strokeWidth={2.2} />
              <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-rose-300" />
            </span>
            <h2 className="font-display text-lg font-semibold text-stone-900">
              {mode === 'signup' ? 'Create your account' : 'Welcome back'}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close sign-in dialog"
            className="flex h-9 w-9 min-w-9 items-center justify-center rounded-full bg-stone-50 text-stone-500 transition-all duration-200 hover:scale-105 hover:bg-rose-50 hover:text-rose-500 active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-1.5 text-sm text-stone-500">
          {mode === 'signup'
            ? 'Save your favourites, track orders and shop faster next time.'
            : 'Your favourites and orders, waiting for you.'}
        </p>

        <div className="mt-3 grid grid-cols-2 gap-1 rounded-full bg-rose-50 p-1">
          {(['login', 'signup'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => switchMode(tab)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                mode === tab
                  ? 'bg-white text-rose-600 shadow-sm ring-1 ring-rose-100'
                  : 'text-stone-500 hover:text-rose-500'
              }`}
            >
              {tab === 'login' ? 'Log in' : 'Sign up'}
            </button>
          ))}
        </div>

        {/* Google sign-in — both login and signup offer it. */}
        {!submitting && (
          <div className="mt-4">
            {googleDisabled ? (
              <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
                Firebase Google Sign-In is not configured — use e-mail and password instead.
              </p>
            ) : (
              <button
                type="button"
                onClick={() => void handleGoogleSignIn()}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-rose-100 bg-white px-4 text-sm font-semibold text-stone-700 transition-colors hover:bg-rose-50 disabled:opacity-60"
              >
                Continue with Google
              </button>
            )}
          </div>
        )}

        {notice ? (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <div>
                <p className="font-semibold">{notice}</p>
                <p className="mt-1 text-xs opacity-80">
                  You can continue browsing or go ahead with your purchase.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="mt-3 w-full rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition-transform active:scale-95"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)} className="mt-4 flex flex-col gap-3">
            {mode === 'signup' && (
              <label className="block">
                <span className="mb-1 block text-xs font-semibold tracking-wide text-stone-500">Your name</span>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="What should we call you?"
                    autoComplete="name"
                    className="w-full rounded-2xl border border-rose-100 bg-white py-2.5 pl-10 pr-3 text-sm text-stone-800 placeholder:text-stone-300 focus:border-rose-300 focus:ring-2 focus:ring-rose-100 focus:outline-none"
                  />
                </div>
              </label>
            )}

            <label className="block">
              <span className="mb-1 block text-xs font-semibold tracking-wide text-stone-500">E-mail</span>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="w-full rounded-2xl border border-rose-100 bg-white py-2.5 pl-10 pr-3 text-sm text-stone-800 placeholder:text-stone-300 focus:border-rose-300 focus:ring-2 focus:ring-rose-100 focus:outline-none"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold tracking-wide text-stone-500">
                Password
                {mode === 'signup' && <span className="ml-1 font-normal text-stone-400">(8+ characters)</span>}
              </span>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  className="w-full rounded-2xl border border-rose-100 bg-white py-2.5 pl-10 pr-3 text-sm text-stone-800 placeholder:text-stone-300 focus:border-rose-300 focus:ring-2 focus:ring-rose-100 focus:outline-none"
                />
              </div>
            </label>

            {error && (
              <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 text-sm font-bold text-white shadow-lg shadow-rose-200 transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {mode === 'signup' ? 'Creating account…' : 'Signing in…'}
                </>
              ) : mode === 'signup' ? (
                'Create account'
              ) : (
                'Sign in'
              )}
            </button>

          </form>
        )}

        <p className="mt-4 text-center text-[11px] leading-relaxed text-stone-400">
          Your e-mail is used for your Cupi account and order updates.
        </p>
      </motion.div>
    </motion.div>
  )
}