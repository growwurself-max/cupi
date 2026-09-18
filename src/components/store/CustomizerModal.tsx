import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowDown,
  ArrowUp,
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
  RefreshCw,
  Trash2,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useCashfree } from '../../hooks/useCashfree'
import { createOrder, verifyOrder } from '../../lib/api'
import {
  getCustomizerStepIds,
  type CustomizerStepId,
} from '../../config/customization'
import { themeRegistry } from '../../themes/registry'
import type { ExperienceMetadata } from '../../types/catalog'
import {
  buildExperienceConfig,
  emptyDraft,
  type CustomizerDraft,
  type PhotoDraft,
} from '../../utils/experienceDraft'
import { resizeAndCompressImage } from '../../utils/imageResize'
import { OrderSuccessModal } from './OrderSuccessModal'

interface CustomizerModalProps {
  theme: ExperienceMetadata | null
  onClose: () => void
  onOpenExperience: (path: string) => void
}

const STEP_DEFS = {
  basics: { label: 'Basics', icon: Heart },
  question: { label: 'Question', icon: MessagesSquare },
  message: { label: 'Message', icon: PenLine },
  bouquet: { label: 'Notes', icon: MessagesSquare },
  memories: { label: 'Memories', icon: ImagePlus },
} as const satisfies Record<CustomizerStepId, { label: string; icon: typeof Heart }>

const GRID_CLASS: Record<number, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
}

const INPUT_CLASS =
  'w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 placeholder-stone-400 shadow-sm outline-none transition-all focus:border-rose-400 focus:ring-2 focus:ring-rose-100'

type PaymentResult =
  | { kind: 'verified'; experienceId: string; shareUrl: string }
  | { kind: 'failed'; message: string }

export function CustomizerModal({
  theme,
  onClose,
  onOpenExperience,
}: CustomizerModalProps) {
  const { openCheckout } = useCashfree()

  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<CustomizerDraft>(emptyDraft)
  const [previewing, setPreviewing] = useState(false)
  const [checking, setChecking] = useState(false)
  const [processingIndex, setProcessingIndex] = useState<number | null>(null)
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null)

  const maxPhotos = theme?.maxPhotos ?? 3
  const canReorderPhotos = maxPhotos > 3

  const steps = useMemo(() => {
    if (!theme) return []
    return getCustomizerStepIds(theme).map((stepId) => ({
      id: stepId,
      ...STEP_DEFS[stepId],
    }))
  }, [theme])
  const lastStepIndex = steps.length - 1
  const currentStepId: CustomizerStepId = steps[step]?.id ?? 'basics'

  useEffect(() => {
    setStep((prev) => Math.max(0, Math.min(prev, lastStepIndex)))
  }, [lastStepIndex])

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

  const previewConfig = useMemo(() => {
    if (!theme) return null
    const baseConfig = themeRegistry[theme.id]?.defaultConfig
    if (!baseConfig) return null
    return buildExperienceConfig(draft, baseConfig, theme.maxPhotos ?? 3)
  }, [theme, draft])

  const PreviewComponent =
    theme ? themeRegistry[theme.id]?.component ?? null : null

  const stepError = useMemo(() => {
    if (!draft.recipientName.trim() || !draft.senderName.trim()) {
      return 'Add who it’s for and who it’s from.'
    }
    if (currentStepId === 'message') {
      return draft.letterLines.some((line) => line.trim())
        ? null
        : 'Write at least one line of your letter.'
    }
    if (currentStepId === 'bouquet') {
      return draft.bouquetNotes.some((note) => note.trim())
        ? null
        : 'Add at least one bouquet note.'
    }
    if (currentStepId === 'question') {
      return draft.finalMessage.trim()
        ? null
        : 'Write the question or headline for the big moment.'
    }
    return null
  }, [currentStepId, draft])

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
      photos: [...prev.photos, { src: '', caption: '' }].slice(0, maxPhotos),
    }))
  }, [maxPhotos])

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

  const handleFileChange = useCallback(
    async (index: number, file: File) => {
      if (processingIndex !== null) return
      setProcessingIndex(index)
      try {
        const resizedBase64 = await resizeAndCompressImage(file)
        updatePhoto(index, { src: resizedBase64 })
      } catch (error) {
        console.error('Image processing failed:', error)
        alert('Could not process image. Please try another photo.')
      } finally {
        setProcessingIndex(null)
      }
    },
    [processingIndex, updatePhoto],
  )

  const removePhoto = useCallback(
    (index: number) => updatePhoto(index, { src: '' }),
    [updatePhoto],
  )

  const handleCheckout = useCallback(async () => {
    if (!theme || !previewConfig || checking) return
    setChecking(true)
    try {
      const orderRes = await createOrder(theme.id, previewConfig)

      if (!orderRes.paymentSessionId) {
        throw new Error('Failed to create payment session with Cashfree.')
      }

      // Open native Cashfree popup (UPI, Cards, Netbanking)
      await openCheckout(orderRes.paymentSessionId)

      // Verify on backend
      const verifyRes = await verifyOrder({ orderId: orderRes.orderId })

      if (!verifyRes.success) {
        throw new Error('Payment verification failed.')
      }

      const generatedId = verifyRes.experienceId || verifyRes.id
      if (!generatedId) {
        throw new Error('No experience ID returned from verification server.')
      }

      setPaymentResult({
        kind: 'verified',
        experienceId: generatedId,
        shareUrl: verifyRes.sharePath || `/x/${generatedId}`,
      })
    } catch (err) {
      console.error('Checkout error:', err)
      const message =
        err instanceof Error
          ? err.message
          : 'Payment was not completed.'
      setPaymentResult({ kind: 'failed', message })
    } finally {
      setChecking(false)
    }
  }, [theme, previewConfig, checking, openCheckout])

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

        {previewConfig && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-2xl ring-1 ring-rose-100">
                  {theme.previewVisual.emoji}
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
            <div
              className={`mt-6 grid gap-2 ${GRID_CLASS[steps.length] ?? 'grid-cols-3'}`}
            >
              {steps.map((stepDef, i) => {
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
                          ? 'border-stone-100 bg-stone-50 text-stone-600'
                          : 'border-transparent text-stone-600'
                    }`}
                    aria-label={`Step ${i + 1}: ${stepDef.label}`}
                  >
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                        isActive
                          ? 'bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-md shadow-rose-200'
                          : isPast
                            ? 'bg-white text-stone-500'
                            : 'bg-stone-100 text-stone-500'
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
                  {currentStepId === 'basics' && (
                    <div className="space-y-4">
                      <Field
                        label="Who’s it for?"
                        hint="They’ll see this name throughout the experience."
                      >
                        <div className="relative">
                          <UserIcon className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone-500" />
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
                          <PenLineIcon className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone-500" />
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
                          <HeartIcon className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone-500" />
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

                  {currentStepId === 'question' && (
                    <Field
                      label="Your big moment"
                      hint="Shown big at the instant they say YES."
                    >
                      <textarea
                        className={`${INPUT_CLASS} min-h-28 resize-none leading-relaxed`}
                        placeholder="Will you make me the happiest person alive? 💍"
                        value={draft.finalMessage}
                        onChange={(event) =>
                          update('finalMessage', event.target.value)
                        }
                        maxLength={120}
                        aria-label="Your question or headline"
                      />
                    </Field>
                  )}

                  {currentStepId === 'message' && (
                    <Field
                      label="Your heartfelt message"
                      hint="One line = one paragraph. Say what words cannot."
                    >
                      <textarea
                        className={`${INPUT_CLASS} min-h-44 resize-none leading-relaxed`}
                        placeholder={`To ${draft.recipientName.trim() || 'my favourite person'} — I keep trying to find the right words…\nYou make ordinary moments feel like small adventures.`}
                        value={draft.letterLines.join('\n')}
                        onChange={(event) => setLetterText(event.target.value)}
                        maxLength={1500}
                        aria-label="Heartfelt message"
                      />
                    </Field>
                  )}

                  {currentStepId === 'bouquet' && (
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-bold text-stone-900">
                          Sticky notes 💐
                        </p>
                        <p className="mt-0.5 text-xs text-stone-500">
                          Each note becomes an interactive tag inside the
                          experience. Customize them — or keep the sweet
                          suggestions.
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
                          Add another note
                        </button>
                      )}
                    </div>
                  )}

{currentStepId === 'memories' && (
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-stone-900">
                            Memories 📸
                          </p>
                          <p className="mt-0.5 text-xs text-stone-500">
                            Pick photos from your phone — they&apos;re compressed
                            on-device in under a second and pop straight into a
                            pretty polaroid frame.
                          </p>
                        </div>
                        {canReorderPhotos && (
                          <span className="shrink-0 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-600">
                            {draft.photos.filter((p) => p.src).length}/{maxPhotos}{' '}
                            photos
                          </span>
                        )}
                      </div>
                      {draft.photos.map((photo, i) => (
                        <div
                          key={i}
                          className="space-y-3 rounded-2xl border border-stone-100 bg-stone-50/50 p-3"
                        >
                          <MemoryUpload
                            index={i}
                            src={photo.src}
                            processing={processingIndex === i}
                            onUpload={handleFileChange}
                            onRemove={removePhoto}
                          />
                          <div className="flex items-center gap-2">
                            <input
                              className={`${INPUT_CLASS} min-w-0 flex-1`}
                              placeholder="Caption (e.g. Us, being us.)"
                              value={photo.caption}
                              onChange={(event) =>
                                updatePhoto(i, { caption: event.target.value })
                              }
                              maxLength={120}
                              aria-label={`Photo ${i + 1} caption`}
                            />
                            {canReorderPhotos && (
                              <div className="flex shrink-0 items-center gap-1">
                                <button
                                  type="button"
                                  disabled={i === 0}
                                  onClick={() =>
                                    setDraft((prev) => {
                                      const photos = [...prev.photos]
                                      ;[photos[i - 1], photos[i]] = [
                                        photos[i],
                                        photos[i - 1],
                                      ]
                                      return { ...prev, photos }
                                    })
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 transition-colors hover:border-rose-200 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-30"
                                  aria-label={`Move photo ${i + 1} up`}
                                >
                                  <ArrowUp className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  disabled={i === draft.photos.length - 1}
                                  onClick={() =>
                                    setDraft((prev) => {
                                      const photos = [...prev.photos]
                                      ;[photos[i], photos[i + 1]] = [
                                        photos[i + 1],
                                        photos[i],
                                      ]
                                      return { ...prev, photos }
                                    })
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 transition-colors hover:border-rose-200 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-30"
                                  aria-label={`Move photo ${i + 1} down`}
                                >
                                  <ArrowDown className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {draft.photos.length < maxPhotos && (
                        <button
                          type="button"
                          disabled={processingIndex !== null}
                          onClick={addPhoto}
                          className="flex items-center gap-2 text-sm font-semibold text-rose-500 transition-colors hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ListPlus className="h-4 w-4" />
                          Add another memory
                        </button>
                      )}
                      {canReorderPhotos && (
                        <p className="text-[11px] font-medium text-stone-400">
                          Drag-free ordering — use the arrows to set which memory
                          leads the story reel.
                        </p>
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
                {step < lastStepIndex && (
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
                {step === lastStepIndex && (
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
                          Contacting Cashfree…
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4" />
                          Pay {theme.price}
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
        )}
      </motion.div>

      {/* Live preview overlay — renders the real theme experience untouched */}
      <AnimatePresence>
        {previewing && previewConfig && PreviewComponent && (
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
            <PreviewComponent
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

interface MemoryUploadProps {
  index: number
  src: string
  processing: boolean
  onUpload: (index: number, file: File) => void
  onRemove: (index: number) => void
}

function MemoryUpload({
  index,
  src,
  processing,
  onUpload,
  onRemove,
}: MemoryUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const hasImage = Boolean(src)

  const openPicker = () => inputRef.current?.click()

  const handleFile = (file: File | undefined | null) => {
    if (file) onUpload(index, file)
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          handleFile(event.target.files?.[0])
          event.target.value = ''
        }}
      />

      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault()
          handleFile(event.dataTransfer.files?.[0])
        }}
      >
        {processing ? (
          <div className="flex min-h-36 flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/50 p-4 text-center">
            <LoaderCircle className="h-6 w-6 animate-spin text-rose-400" />
            <p className="animate-pulse text-sm font-semibold text-rose-500">
              Compressing photo…
            </p>
          </div>
        ) : hasImage ? (
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-rose-100 bg-rose-50 shadow-inner">
            <img
              src={src}
              alt="Uploaded memory preview"
              className="h-full w-full object-cover object-center"
            />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/50 via-black/15 to-transparent p-2.5">
              <button
                type="button"
                onClick={openPicker}
                className="flex min-h-9 items-center gap-1.5 rounded-full bg-white/95 px-3.5 text-xs font-bold text-stone-700 transition-all duration-200 hover:scale-105 hover:bg-white active:scale-95"
              >
                <RefreshCw className="h-3.5 w-3.5 text-rose-500" />
                Change
              </button>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="flex min-h-9 items-center gap-1.5 rounded-full bg-white/95 px-3.5 text-xs font-bold text-rose-600 transition-all duration-200 hover:scale-105 hover:bg-white active:scale-95"
                aria-label={`Remove photo ${index + 1}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={openPicker}
            className="flex min-h-36 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/50 p-4 text-center transition-all hover:bg-rose-50 active:scale-[0.99]"
          >
            <ImagePlus className="h-6 w-6 text-rose-400" />
            <span className="text-sm font-semibold text-rose-500">
              Tap to select photo
            </span>
            <span className="text-[11px] font-medium text-stone-400">
              or drag &amp; drop — auto-compressed
            </span>
          </button>
        )}
      </div>
    </div>
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
      <span className="mb-1.5 block text-[13px] font-bold text-stone-800">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-stone-500">{hint}</span>}
    </label>
  )
}