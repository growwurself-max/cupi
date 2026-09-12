import { AnimatePresence, motion } from 'framer-motion'
import { Play, Sparkles, X } from 'lucide-react'
import { useEffect } from 'react'
import type { ThemeMetadata } from '../../types/catalog'

interface CustomizeModalProps {
  theme: ThemeMetadata | null
  onClose: () => void
  onLaunchDemo: () => void
}

const COMING_FIELDS = [
  { label: 'Their name', placeholder: 'Sophia' },
  { label: 'Your name', placeholder: 'Alex' },
  { label: 'Photos & memories', placeholder: 'Drop in your favorite photos' },
  { label: 'Heartfelt note', placeholder: 'What do you want to say?' },
  { label: 'Special song', placeholder: 'Pick a song that says it all' },
]

export function CustomizeModal({
  theme,
  onClose,
  onLaunchDemo,
}: CustomizeModalProps) {
  useEffect(() => {
    if (!theme) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [theme, onClose])

  return (
    <AnimatePresence>
      {theme && (
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
            onClick={onClose}
            aria-hidden
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="relative max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-3xl border border-rose-100/70 bg-white p-6 shadow-[0_24px_70px_rgba(30,15,20,0.2)] sm:p-8"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-rose-200/80 to-transparent"
            />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close customize dialog"
              className="absolute top-4 right-4 flex h-10 w-10 min-w-10 items-center justify-center rounded-full bg-stone-50 text-stone-500 transition-all duration-200 hover:scale-105 hover:bg-rose-50 hover:text-rose-500 active:scale-95"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-2xl ring-1 ring-rose-100">
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

            <p className="mt-5 text-sm leading-relaxed text-stone-600">
              Add their name, your photos, a heartfelt note, and a song. Then
              get an instant link to send.
            </p>

            <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-rose-100 bg-rose-50/70 p-4">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
              <p className="text-sm leading-relaxed text-stone-600">
                Personalization &amp; instant link generation is coming in the
                next update! For now, explore the full interactive demo.
              </p>
            </div>

            <div className="mt-5 space-y-3">
              {COMING_FIELDS.map((field) => (
                <div key={field.label} className="relative">
                  <label className="mb-1 block text-xs font-semibold text-stone-500">
                    {field.label}
                  </label>
                  <div className="relative">
                    <input
                      disabled
                      value=""
                      placeholder={field.placeholder}
                      className="w-full rounded-xl border border-stone-200 bg-stone-50/60 px-4 py-3 text-sm text-stone-400 placeholder-stone-300 outline-none focus:border-rose-300 focus:bg-white"
                    />
                    <span className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-rose-600 uppercase">
                      Soon
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={onLaunchDemo}
              className="mt-6 flex min-h-14 w-full items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 text-base font-bold text-white shadow-lg shadow-rose-200 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-rose-200 active:scale-95"
            >
              <Play className="h-5 w-5 fill-current" />
              Explore the Live Demo
            </button>
            <p className="mt-3 text-center text-[11px] font-medium text-stone-400">
              Free preview · no account, no sign-up, no catch.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}