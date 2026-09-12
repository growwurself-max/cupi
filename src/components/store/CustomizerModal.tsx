import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  ImagePlus,
  ListPlus,
  LoaderCircle,
  Lock,
  MessagesSquare,
  PenLine,
  Sparkles,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useRazorpay, type CheckoutOutcome } from '../../hooks/useRazorpay'
import { BirthdayTheme } from '../../themes/birthday-01/BirthdayTheme'
import type { ThemeMetadata } from '../../types/catalog'
import {
  buildBirthdayConfig,
  emptyDraft,
  type CustomizerDraft,
  type PhotoDraft,
} from '../../utils/experienceDraft'
import { OrderSuccessModal } from './OrderSuccessModal'

interface CustomizerModalProps {
  theme: ThemeMetadata | null
  onClose: () => void
  onLaunchDemo: (themeId: string) => void
  onOpenExperience: (path: string) => void
}

const STEPS = [
  { id: 'basics', label: 'Basics', icon: Heart },
  { id: 'message', label: 'Message', icon: PenLine },
  { id: 'bouquet', label: 'Bouquet', icon: MessagesSquare },
  { id: 'memories', label: 'Memories', icon: ImagePlus },
]

const PRICE_LABEL = '₹199'

const INPUT_CLASS =
  'w-full rounded-xl border border-stone-200 bg-stone-50/60 px-4 py-3 text-sm text-stone-800 placeholder-stone-300 outline-none transition-colors focus:border-rose-300 focus:bg-white'

type PaymentResult = Extract<CheckoutOutcome, { kind: 'verified' } | { kind: 'failed' }>

export function CustomizerModal({
  theme,
  onClose,
  onLaunchDemo,
  onOpenExperience,
}: CustomizerModalProps) {
  const checkout = useRazorpay()

  const isBirthday = theme?.id === 'birthday-01'

  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<CustomizerDraft>(emptyDraft)
  const [previewing, setPreviewing] = useState(false)
  const [checking, setChecking] = useState(false)
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null)

  useEffect(() => {
    if (!theme) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !previewing && !paymentResult) onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [theme, onClose, previewing, paymentResult])

  const previewConfig = useMemo(
    () => (theme ? buildBirthdayConfig(draft) : null),
    [theme, draft],
  )

  const stepError = useMemo(() => {
    if (!draft.recipientName.trim() || !draft.senderName.trim()) {
      return 'Add who it’s for and who it’s from.'
    }
    if (step === 1) {
      return draft.letterLines.some((line) => line.trim())
        ? null
        : 'Write at least one line of your letter.'
    }
    if (step === 2) {
      return draft.bouquetNotes.some((note) => note.trim())
        ? null
        : 'Add at least one bouquet note.'
    }
return null
  }, [step, draft])

  const update = useCallback(
    <K extends keyof CustomizerDraft>(key: K, value: CustomizerDraft[K]) => {
      setDraft((prev) => ({ ...prev, [key]: value }))
    },
    [],
  )

  const setLetterText = useCallback(
    (value: string) => update('letterLines', value.split('\n')),
    [update],
  )

  const addPhoto = useCallback(() => {
    setDraft((prev) => ({
      ...prev,
      photos: [...prev.photos, { src: '', caption: '' }].slice(0, 3),
    }))
  }, [])

  const updatePhoto = useCallback(
    (index: number, patch: Partial<PhotoDraft>) => {
      setDraft((prev) => ({
        ...prev,
        photos: prev.photos.map((photo, i) =>
          i === index ? { ...photo, ...patch } : photo,
        ),
      }))
    },
    [],
  )

  const handleCheckout = useCallback(async () => {
    if (!theme || !previewConfig || checking) return
    setChecking(true)
    const outcome = await checkout({
      templateId: theme.id,
      customization: previewConfig,
      buyerName: draft.senderName.trim() || 'Cupi Creator',
    })
    setChecking(false)
    if (outcome.kind === 'verified' || outcome.kind === 'failed') {
      setPaymentResult(outcome)
    }
  }, [theme, previewConfig, checking, checkout, draft.senderName])

  const handleOpenExperience = useCallback(() => {
    if (!paymentResult || paymentResult.kind !== 'verified') return
    onOpenExperience(paymentResult.shareUrl)
  }, [paymentResult, onOpenExperience])

  const handleClose = useCallback(() => {
    if (checking) return
    onClose()
  }, [checking, onClose])

  if (!theme) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Customize ${theme.name}`}
    >
      <div
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="relative max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-3xl border border-rose-100/70 bg-white p-6 shadow-[0_24px_70px_rgba(30,15,20,0.22)] sm:p-8"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-rose-200/80 to-transparent"
        />

        {isBirthday && previewConfig ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-2xl ring-1 ring-rose-100">
                  {theme.emoji}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold tracking-[0.2em] text-rose-500 uppercase">
                    Create yours
                  </p>
                  <h2 className="font-display truncate text-lg font-semibold text-stone-900">
                    {theme.name}
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close customize dialog"
                className="flex h-10 w-10 min-w-10 items-center justify-center rounded-full bg-stone-50 text-stone-500 transition-all duration-200 hover:scale-105 hover:bg-rose-50 hover:text-rose-500 active:scale-95"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Stepper */}
            <div className="mt-6 grid grid-cols-4 gap-2">
              {STEPS.map((stepDef, i) => {
                const StepIcon = stepDef.icon
                const isActive = i === step
                const isPast = i < step
                return (
                  <button
                    key={stepDef.id}
                    type="button"
                    disabled={i > step}
                    onClick={() => i < step && setStep(i)}
                    className={`flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-2.5 transition-all duration-200 ${
                      isActive
                        ? 'border-rose-200 bg-rose-50 text-rose-600'
                        : isPast
                          ? 'border-stone-100 bg-stone-50 text-stone-400'
                          : 'border-transparent text-stone-400'
                    }`}
                    aria-label={`Step ${i + 1}: ${stepDef.label}`}
                  >
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                        isActive
                          ? 'bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-md shadow-rose-200'
                          : isPast
                            ? 'bg-white text-stone-400'
                            : 'bg-stone-100 text-stone-400'
                      }`}
                    >
                      {isPast ? <CheckIcon /> : <StepIcon className="h-3.5 w-3.5" />}
                    </span>
                    <span className="text-[10px] font-semibold tracking-wide uppercase">
                      {stepDef.label}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Step content */}
            <div className="mt-6 min-h-[19rem]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  {step === 0 && (
                    <div className="space-y-4">
                      <Field
                        label="Who’s it for?"
                        hint="They’ll see this name throughout the experience."
                      >
                        <div className="relative">
                          <UserIcon className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone-400" />
                          <input
                            className={`${INPUT_CLASS} pl-10`}
                            placeholder="Sophia"
                            value={draft.recipientName}
                            onChange={(event) =>
                              update('recipientName', event.target.value)
                            }
                            maxLength={40}
                            aria-label="Recipient name"
                          />
                        </div>
                      </Field>
                      <Field label="Nickname" hint="Optional — used for a cute greeting.">
                        <div className="relative">
                          <PenLineIcon className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone-400" />
                          <input
                            className={`${INPUT_CLASS} pl-10`}
                            placeholder="Bubs"
                            value={draft.nickname}
                            onChange={(event) => update('nickname', event.target.value)}
                            maxLength={40}
                            aria-label="Nickname"
                          />
                        </div>
                      </Field>
                      <Field label="From (your name)" hint="Shown as the sender.">
                        <div className="relative">
                          <HeartIcon className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone-400" />
                          <input
                            className={`${INPUT_CLASS} pl-10`}
                            placeholder="Alex"
                            value={draft.senderName}
                            onChange={(event) => update('senderName', event.target.value)}
                            maxLength={40}
                            aria-label="Sender name"
                          />
                        </div>
                      </Field>
                    </div>
                  )}

                  {step === 1 && (
                    <Field
                      label="Your heartfelt message"
                      hint="One line = one paragraph. Say what words cannot."
                    >
                      <textarea
                        className={`${INPUT_CLASS} min-h-44 resize-none leading-relaxed`}
                        placeholder={`Happy birthday, ${draft.recipientName.trim() || 'Sophia'}. I keep trying to find the right words…\nYou are the kind of person who makes ordinary moments feel like small adventures.`}
                        value={draft.letterLines.join('\n')}
                        onChange={(event) => setLetterText(event.target.value)}
                        maxLength={1500}
                        aria-label="Heartfelt message"
                      />
                    </Field>
                  )}

                  {step === 2 && (
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-semibold text-stone-700">
                          Rose bouquet notes 🌹
                        </p>
                        <p className="mt-0.5 text-xs text-stone-400">
                          Each note blooms into an interactive tag. Customize them —
                          or keep the sweet suggestions.
                        </p>
                      </div>
                      <div className="space-y-2.5">
                        {draft.bouquetNotes.map((note, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-50 text-sm ring-1 ring-rose-100"
                              aria-hidden
                            >
                              {i + 1}
                            </span>
                            <input
                              className={INPUT_CLASS}
                              placeholder="A little compliment that makes them smile…"
                              value={note}
                              onChange={(event) =>
                                update(
                                  'bouquetNotes',
                                  draft.bouquetNotes.map((n, j) =>
                                    j === i ? event.target.value : n,
                                  ),
                                )
                              }
                              maxLength={160}
                              aria-label={`Bouquet note ${i + 1}`}
                            />
                            <button
                              type="button"
                              onClick={() =>
                                update(
                                  'bouquetNotes',
                                  draft.bouquetNotes.filter((_, j) => j !== i),
                                )
                              }
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-rose-50 hover:text-rose-500"
                              aria-label={`Remove bouquet note ${i + 1}`}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      {draft.bouquetNotes.length < 6 && (
                        <button
                          type="button"
                          onClick={() =>
                            update('bouquetNotes', [...draft.bouquetNotes, ''])
                          }
                          className="flex items-center gap-2 text-sm font-semibold text-rose-500 transition-colors hover:text-rose-600"
                        >
                          <ListPlus className="h-4 w-4" />
                          Add another bloom
                        </button>
                      )}
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-stone-700">
                          Memories 📸
                        </p>
                        <p className="mt-0.5 text-xs text-stone-400">
                          Paste direct image URLs (https://…) and a tiny caption for
                          each polaroid.
                        </p>
                      </div>
                      {draft.photos.map((photo, i) => (
                        <div key={i} className="space-y-2 rounded-2xl border border-stone-100 bg-stone-50/50 p-3">
                          <div className="relative">
                            <ImageIcon className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone-400" />
                            <input
                              className={`${INPUT_CLASS} pl-10`}
                              placeholder="https://images.example.com/us.jpg"
                              value={photo.src}
                              onChange={(event) =>
                                updatePhoto(i, { src: event.target.value })
                              }
                              maxLength={600}
                              aria-label={`Photo ${i + 1} URL`}
                            />
                          </div>
                          <input
                            className={INPUT_CLASS}
                            placeholder="Caption (e.g. Us, being us.)"
                            value={photo.caption}
                            onChange={(event) =>
                              updatePhoto(i, { caption: event.target.value })
                            }
                            maxLength={120}
                            aria-label={`Photo ${i + 1} caption`}
                          />
                        </div>
                      ))}
                      {draft.photos.length < 3 && (
                        <button
                          type="button"
                          onClick={addPhoto}
                          className="flex items-center gap-2 text-sm font-semibold text-rose-500 transition-colors hover:text-rose-600"
                        >
                          <ListPlus className="h-4 w-4" />
                          Add another memory
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {stepError && (
              <p className="mt-3 text-xs font-medium text-rose-500">{stepError}</p>
            )}

            {/* Footer */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex gap-3">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={() => setStep((prev) => prev - 1)}
                    className="flex min-h-12 items-center gap-1.5 rounded-full bg-stone-100 px-5 text-sm font-semibold text-stone-700 transition-all duration-200 hover:bg-stone-200 active:scale-95"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </button>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:justify-end">
                {step < 3 && (
                  <button
                    type="button"
                    disabled={Boolean(stepError)}
                    onClick={() => setStep((prev) => prev + 1)}
                    className="flex min-h-12 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 px-6 text-sm font-bold text-white shadow-lg shadow-rose-200 transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                  >
                    Continue
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
                {step === 3 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setPreviewing(true)}
                      className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-stone-200 bg-white px-5 text-sm font-semibold text-stone-700 transition-all duration-200 hover:scale-[1.02] hover:border-rose-200 hover:text-rose-600 active:scale-95"
                    >
                      <Eye className="h-4 w-4" />
                      Preview My Surprise
                    </button>
                    <button
                      type="button"
                      disabled={checking || Boolean(stepError)}
                      onClick={handleCheckout}
                      className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 px-6 text-sm font-bold text-white shadow-lg shadow-rose-200 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-rose-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                    >
                      {checking ? (
                        <>
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                          Contacting Razorpay…
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4" />
                          Lock In &amp; Pay {PRICE_LABEL}
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>

            <p className="mt-4 text-center text-[11px] font-medium text-stone-400">
              One payment · one locked surprise · one shareable link. Read more
              before you pay — this is a gift that cannot be edited later.
            </p>
          </>
        ) : (
          <>
            {/* Coming-soon panel for non-purchasable themes */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-2xl ring-1 ring-rose-100">
                  {theme.emoji}
                </span>
                <div>
                  <p className="text-xs font-bold tracking-[0.2em] text-rose-500 uppercase">
                    Create yours
                  </p>
                  <h2 className="font-display text-xl font-semibold text-stone-900">
                    {theme.name}
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close customize dialog"
                className="flex h-10 w-10 min-w-10 items-center justify-center rounded-full bg-stone-50 text-stone-500 transition-all duration-200 hover:scale-105 hover:bg-rose-50 hover:text-rose-500 active:scale-95"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-rose-100 bg-rose-50/70 p-4">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
              <p className="text-sm leading-relaxed text-stone-600">
                Personalization &amp; instant link generation for this theme is coming
                in the next update! For now, explore the full interactive demo.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onLaunchDemo(theme.id)}
              className="mt-6 flex min-h-14 w-full items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 text-base font-bold text-white shadow-lg shadow-rose-200 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-rose-200 active:scale-95"
            >
              <Sparkles className="h-5 w-5" />
              Explore the Live Demo
            </button>
            <p className="mt-3 text-center text-[11px] font-medium text-stone-400">
              Free preview · no account, no sign-up, no catch.
            </p>
          </>
        )}
      </motion.div>

      {/* Live preview overlay — renders the real Birthday experience untouched */}
      <AnimatePresence>
        {previewing && previewConfig && (
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="demo-scope fixed inset-0 z-[110]"
            role="dialog"
            aria-label="Preview of your surprise"
          >
            <BirthdayTheme
              config={previewConfig}
              onExit={() => setPreviewing(false)}
            />
            <div className="pointer-events-none fixed inset-x-0 top-4 z-[120] flex justify-center px-4">
              <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-rose-200 bg-white/95 px-4 py-2.5 shadow-[0_8px_30px_rgba(244,63,94,0.18)] backdrop-blur">
                <Eye className="h-4 w-4 shrink-0 text-rose-500" />
                <span className="text-xs font-semibold text-stone-700 sm:text-sm">
                  Preview Mode — Finish checkout to generate your shareable link
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewing(false)}
                  className="ml-1 flex min-h-9 items-center rounded-full bg-stone-100 px-3 text-xs font-semibold text-stone-700 transition-colors hover:bg-rose-50 hover:text-rose-600"
                >
                  Exit Preview
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Post-payment celebration */}
      <AnimatePresence>
        {paymentResult?.kind === 'verified' && (
          <OrderSuccessModal
            key="success"
            experienceId={paymentResult.experienceId}
            shareUrl={paymentResult.shareUrl}
            onClose={() => setPaymentResult(null)}
            onOpen={handleOpenExperience}
          />
        )}
      </AnimatePresence>

      {/* Inline payment error */}
      <AnimatePresence>
        {paymentResult?.kind === 'failed' && (
          <motion.div
            key="payment-error"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mt-3 flex flex-col gap-3 rounded-2xl border border-rose-100 bg-rose-50/70 p-4"
          >
            <p className="text-sm font-medium text-stone-700">
              {paymentResult.message}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCheckout}
                className="flex min-h-11 items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-5 text-sm font-bold text-white shadow-md shadow-rose-200 transition-transform active:scale-95"
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={() => setPaymentResult(null)}
                className="flex min-h-11 items-center rounded-full bg-stone-100 px-5 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-200"
              >
                Never Mind
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function CheckIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function PenLineIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  )
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  )
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-stone-500">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-stone-400">{hint}</span>}
    </label>
  )
}