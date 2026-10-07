/**
 * Login / Sign up / Forgot-password dialog for the Cupi storefront.
 *
 * The Google sign-in button is the official Google Identity Services widget
 * rendered into a reserved container (no fake "sign in with Google" masks the
 * real flow). The ID token it produces is sent to /api/auth/google, where the
 * server verifies the RSA signature against Google's JWKS before creating or
 * linking an account.
 */
import { motion } from 'framer-motion'
import { AlertCircle, AlertTriangle, ArrowLeft, CheckCircle2, Heart, Loader2, Lock, Mail, Sparkles, User, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  forgotPassword,
  login,
  loginWithGoogle,
  resendVerification,
  signup,
  type AuthResponse,
} from '../../lib/api.ts'
import { useAuth, type AuthModalMode } from '../../lib/authContext.ts'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined

interface GsiCallbackPayload {
  credential: string
  select_by?: string
}

/** Minimal typing for the GIS script; @types/google.accounts is not installed. */
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (payload: GsiCallbackPayload) => void
            auto_select?: boolean
          }) => void
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void
        }
      }
    }
  }
}

let googleScriptPromise: Promise<void> | null = null

function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve()
  if (!googleScriptPromise) {
    googleScriptPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.onload = () => resolve()
      script.onerror = () => {
        googleScriptPromise = null
        reject(new Error('Google sign-in could not be loaded. Please try again.'))
      }
      document.head.appendChild(script)
    })
  }
  return googleScriptPromise
}

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
  const [forgot, setForgot] = useState(false)
  const [googleButtonReady, setGoogleButtonReady] = useState(false)
  const googleButtonRef = useRef<HTMLDivElement | null>(null)
  // Holds the just-signed-up address so the success panel can offer a resend.
  const [signedUpEmail, setSignedUpEmail] = useState<string | null>(null)
  const [signedUpEmailSent, setSignedUpEmailSent] = useState(true)
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [resendError, setResendError] = useState<string | null>(null)

  const open = modalMode !== null

  // Switching between "Log in" and "Sign up" resets the per-form helpers but
  // keeps the e-mail address (the one thing people hate to retype).
  const switchMode = useCallback((next: AuthModalMode) => {
    setMode(next)
    setError(null)
    setNotice(null)
    setForgot(false)
    setSignedUpEmail(null)
    setResendState('idle')
    setResendError(null)
  }, [])

  const handleClose = useCallback(() => {
    if (submitting) return
    closeAuth()
    setError(null)
    setNotice(null)
    setSubmitting(false)
    setSignedUpEmail(null)
    setResendState('idle')
    setResendError(null)
  }, [closeAuth, submitting])

  useEffect(() => {
    if (!open) return
    setGoogleButtonReady(false)
    // The container survives between opens; clear any stale widget before the
    // next render, otherwise StrictMode's double-effect would stack buttons.
    if (googleButtonRef.current) googleButtonRef.current.innerHTML = ''
  }, [open, modalMode])

  const runGoogleButton = useCallback(async () => {
    if (!open || googleButtonRef.current === null) return
    if (!GOOGLE_CLIENT_ID) return
    try {
      await loadGoogleScript()
      window.google?.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        auto_select: false,
        callback: (payload) => {
          if (!payload.credential) return
          void handleGoogleCredential(payload.credential)
        },
      })
      if (googleButtonRef.current === null) return
      googleButtonRef.current.innerHTML = ''
      window.google?.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        text: 'continue_with',
      })
      setGoogleButtonReady(true)
    } catch {
      setError('Google sign-in could not be loaded. Please try again.')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, GOOGLE_CLIENT_ID])

  useEffect(() => {
    if (!open || !GOOGLE_CLIENT_ID) return
    void runGoogleButton()
  }, [runGoogleButton, open])

  async function handleGoogleCredential(credential: string): Promise<void> {
    setError(null)
    setSubmitting(true)
    try {
      const response = await loginWithGoogle(credential)
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

    if (forgot) {
      setSubmitting(true)
      try {
        const response = await forgotPassword(email)
        setNotice(response.message || 'If that address has an account, a reset link is on its way.')
      } catch (cause) {
        setError(errorMessage(cause, 'Something went wrong. Please try again.'))
      } finally {
        setSubmitting(false)
      }
      return
    }

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
        // Account created. Purchases are locked until the e-mail is verified,
        // so tell them explicitly — and remember whether the verification
        // e-mail actually went out so we can offer a resend if it didn't.
        setSignedUpEmail(email)
        setSignedUpEmailSent(Boolean(response.emailSent))
        setResendState('idle')
        setResendError(null)
        setNotice(
          response.emailSent
            ? response.message ||
                'Account created. Please verify your e-mail before purchasing.'
            : 'Account created, but the verification e-mail could not be sent right now.',
        )
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

  // Re-send the verification e-mail from the post-signup panel when the first
  // attempt didn't go out (or from the customizer's buy-block). Mirrors the
  // Navbar's pattern but stays inside the modal the user is already looking at.
  const handleResendVerification = async () => {
    const target = signedUpEmail
    if (!target || resendState === 'sending') return
    setResendState('sending')
    setResendError(null)
    try {
      const response = await resendVerification(target)
      if (!response.emailSent) {
        setResendError(
          response.message ||
            'The e-mail could not be sent right now. Please try again in a moment.',
        )
        setResendState('idle')
        return
      }
      setResendState('sent')
    } catch (cause) {
      setResendError(errorMessage(cause, 'The e-mail could not be sent right now.'))
      setResendState('idle')
    }
  }

  if (!open) return null

  const googleDisabled = !GOOGLE_CLIENT_ID

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={forgot ? 'Reset your password' : mode === 'signup' ? 'Create a Cupi account' : 'Sign in to Cupi'}
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
            {forgot ? (
              <h2 className="font-display text-lg font-semibold text-stone-900">Reset password</h2>
            ) : (
              <h2 className="font-display text-lg font-semibold text-stone-900">
                {mode === 'signup' ? 'Create your account' : 'Welcome back'}
              </h2>
            )}
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
          {forgot
            ? 'Enter the e-mail on your account and we’ll send a reset link.'
            : mode === 'signup'
              ? 'Save your favourites, track orders and shop faster next time.'
              : 'Your favourites and orders, waiting for you.'}
        </p>

        {!forgot && (
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
        )}

        {/* Google sign-in — both login and signup offer it. */}
        {!forgot && !submitting && (
          <div className="mt-4">
            {googleDisabled ? (
              <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
                Google sign-in is switched off right now — use e-mail and password instead.
              </p>
            ) : (
              <>
                <div ref={googleButtonRef} className="flex min-h-[44px] items-stretch justify-center [&>div]:w-full" />
                {googleButtonReady && (
                  <div className="my-3 flex items-center gap-3">
                    <span className="h-px flex-1 bg-rose-100" />
                    <span className="text-[11px] font-semibold tracking-[0.18em] text-stone-400 uppercase">or</span>
                    <span className="h-px flex-1 bg-rose-100" />
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {notice ? (
          mode === 'signup' && !signedUpEmailSent ? (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div>
                  <p className="font-semibold">{notice}</p>
                  <p className="mt-1 text-xs leading-relaxed opacity-90">
                    You can still browse — but you'll need the verification link
                    before you can buy anything.
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={resendState === 'sending'}
                onClick={() => void handleResendVerification()}
                className="mt-3 w-full rounded-full border border-amber-300 bg-white px-4 py-2 text-sm font-bold text-amber-700 transition-transform active:scale-95 disabled:opacity-60"
              >
                {resendState === 'sending' ? 'Sending…' : resendState === 'sent' ? 'Verification e-mail sent' : 'Resend verification e-mail'}
              </button>
              {resendState === 'sent' && (
                <p className="mt-2 text-xs font-semibold text-emerald-700">
                  A fresh verification link is on its way — check your inbox.
                </p>
              )}
              {resendError && (
                <p className="mt-2 text-xs font-semibold text-rose-600">{resendError}</p>
              )}
              <button
                type="button"
                onClick={handleClose}
                className="mt-2 w-full rounded-full bg-amber-600 px-4 py-2 text-sm font-bold text-white transition-transform active:scale-95"
              >
                Done
              </button>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <div>
                  <p className="font-semibold">{notice}</p>
                  {mode === 'signup' ? (
                    <p className="mt-1 text-xs opacity-80">
                      No need to wait — keep exploring while you do. We'll need
                      the link verified before the purchase step, though.
                    </p>
                  ) : (
                    <p className="mt-1 text-xs opacity-80">
                      No need to wait — go ahead and keep exploring while you do.
                    </p>
                  )}
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
          )
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)} className="mt-4 flex flex-col gap-3">
            {forgot && (
              <button
                type="button"
                onClick={() => setForgot(false)}
                className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 hover:text-rose-600"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
              </button>
            )}

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
                  placeholder={forgot ? 'Leave blank to keep your password' : '••••••••'}
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
                  {forgot ? 'Sending…' : mode === 'signup' ? 'Creating account…' : 'Signing in…'}
                </>
              ) : forgot ? (
                'Send reset link'
              ) : mode === 'signup' ? (
                'Create account'
              ) : (
                'Sign in'
              )}
            </button>

            {!forgot && (
              <button
                type="button"
                onClick={() => setForgot(true)}
                className="text-center text-xs font-semibold text-stone-500 hover:text-rose-500"
              >
                Forgot your password?
              </button>
            )}
          </form>
        )}

        <p className="mt-4 text-center text-[11px] leading-relaxed text-stone-400">
          By continuing you agree to Cupi’s way of handling your e-mail — only for
          verification and order updates, never spam.
        </p>
      </motion.div>
    </motion.div>
  )
}