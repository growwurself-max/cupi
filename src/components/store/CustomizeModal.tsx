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
            className="absolute inset-0 bg-obsidian-900/80 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="glass-panel relative max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-3xl p-6 sm:p-8"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close customize dialog"
              className="glass-panel absolute top-4 right-4 flex h-10 w-10 min-w-10 items-center justify-center rounded-full text-white/70 transition-all duration-200 hover:scale-105 hover:text-white active:scale-95"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-2xl ring-1 ring-white/10">
                {theme.emoji}
              </span>
              <div>
                <p className="text-xs font-bold tracking-[0.2em] text-rose-gold uppercase">
                  Create yours
                </p>
                <h2 className="font-display text-xl font-semibold text-white">
                  {theme.name}
                </h2>
              </div>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-white/65">
              Add their name, your photos, a heartfelt note, and a song. Then
              get an instant link to send.
            </p>

            <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-soft-violet/20 bg-soft-violet/10 p-4">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-soft-violet" />
              <p className="text-sm leading-relaxed text-white/80">
                Personalization &amp; instant link generation is coming in the
                next update! For now, explore the full interactive demo.
              </p>
            </div>

            <div className="mt-5 space-y-3">
              {COMING_FIELDS.map((field) => (
                <div key={field.label} className="relative">
                  <label className="mb-1 block text-xs font-semibold text-white/50">
                    {field.label}
                  </label>
                  <div className="relative">
                    <input
                      disabled
                      value=""
                      placeholder={field.placeholder}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/50 placeholder-white/30 outline-none focus:border-soft-violet/40"
                    />
                    <span className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-bold tracking-wider text-soft-violet/70 uppercase">
                      Soon
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={onLaunchDemo}
              className="glow-primary mt-6 flex min-h-14 w-full items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-rose-gold via-soft-violet to-soft-amber text-base font-bold text-obsidian-900 transition-transform duration-200 hover:scale-[1.02] active:scale-95"
            >
              <Play className="h-5 w-5 fill-current" />
              Explore the Live Demo
            </button>
            <p className="mt-3 text-center text-[11px] font-medium text-white/35">
              Free preview · no account, no sign-up, no catch.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}