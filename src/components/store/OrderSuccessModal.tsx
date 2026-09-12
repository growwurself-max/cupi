import { motion } from 'framer-motion'
import { Check, Copy, ExternalLink, MessageCircle, PartyPopper, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { fireGrandBurst, fireHeartRain } from '../../utils/confetti'

interface OrderSuccessModalProps {
  experienceId: string
  shareUrl: string
  onClose: () => void
  onOpen: () => void
}

export function OrderSuccessModal({
  experienceId,
  shareUrl,
  onClose,
  onOpen,
}: OrderSuccessModalProps) {
  const absoluteUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${shareUrl}`
      : shareUrl

  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fireGrandBurst()
    const timer = setTimeout(() => fireHeartRain(), 600)
    return () => clearTimeout(timer)
  }, [])

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(absoluteUrl)
      setCopied(true)
    } catch {
      const textArea = document.createElement('textarea')
      textArea.value = absoluteUrl
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      textArea.remove()
      setCopied(true)
    }
    setTimeout(() => setCopied(false), 2200)
  }, [absoluteUrl])

  const shareOnWhatsApp = useCallback(() => {
    const text = encodeURIComponent(
      `🎁 I made something special just for you — open it here: ${absoluteUrl}`,
    )
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank', 'noopener')
  }, [absoluteUrl])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[120] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Your surprise is ready"
    >
      <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" onClick={onClose} aria-hidden />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 28 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        className="relative max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-3xl border border-rose-100/70 bg-white p-6 text-center shadow-[0_24px_70px_rgba(244,63,94,0.25)] sm:p-8"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-rose-300/80 to-transparent"
        />

        <button
          type="button"
          onClick={onClose}
          aria-label="Close celebration"
          className="absolute top-4 right-4 flex h-10 w-10 min-w-10 items-center justify-center rounded-full bg-stone-50 text-stone-500 transition-all duration-200 hover:scale-105 hover:bg-rose-50 hover:text-rose-500 active:scale-95"
        >
          <X className="h-4 w-4" />
        </button>

        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 14 }}
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-500 shadow-xl shadow-rose-200"
        >
          <PartyPopper className="h-8 w-8 text-white" />
        </motion.div>

        <h2 className="font-display mt-5 text-2xl font-bold text-stone-900 sm:text-3xl">
          ✨ Your Surprise is Locked &amp; Ready! ✨
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">
          The moment is crafted, the payment is verified, and your personalized
          experience is permanently saved. Share it anywhere — it can be opened
          an unlimited number of times.
        </p>

        {/* Share URL */}
        <div className="mt-6 rounded-2xl border border-rose-100 bg-rose-50/70 p-4">
          <p className="text-left text-[11px] font-bold tracking-[0.16em] text-rose-500 uppercase">
            Your permanent link
          </p>
          <div className="mt-2 flex items-center gap-2">
            <input
              readOnly
              value={absoluteUrl}
              onFocus={(event) => event.currentTarget.select()}
              className="min-w-0 flex-1 rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-700 outline-none focus:border-rose-300"
              aria-label="Shareable link"
            />
            <button
              type="button"
              onClick={copyLink}
              className={`flex h-11 shrink-0 items-center gap-1.5 rounded-xl px-3.5 text-sm font-bold transition-all duration-200 active:scale-95 ${
                copied
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-200'
              }`}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="mt-2 text-left text-[11px] text-stone-400">
            Copy this link into any chat, bio, or card — forever.
          </p>
        </div>

        <div className="mt-4 grid gap-2.5">
          <button
            type="button"
            onClick={shareOnWhatsApp}
            className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 text-sm font-bold text-emerald-700 transition-all duration-200 hover:scale-[1.02] hover:bg-emerald-100 active:scale-95"
          >
            <MessageCircle className="h-4 w-4" />
            Share on WhatsApp
          </button>
          <button
            type="button"
            onClick={onOpen}
            className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 text-sm font-bold text-white shadow-lg shadow-rose-200 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-rose-200 active:scale-95"
          >
            <ExternalLink className="h-4 w-4" />
            Open Your Surprise Now
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-stone-100 text-sm font-semibold text-stone-700 transition-all duration-200 hover:scale-[1.02] hover:bg-stone-200 active:scale-95"
          >
            Back to Cupi Store
          </button>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-4 text-[11px] font-medium text-stone-400"
        >
          Your experience is permanently saved and can be viewed unlimited times.
        </motion.p>

        <span className="sr-only">Experience ID {experienceId}</span>
      </motion.div>
    </motion.div>
  )
}