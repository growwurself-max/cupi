import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { fireContinuousSparkle } from '../../../utils/confetti'
import { ScreenShell } from '../../shared/ScreenShell'

interface RingBoxScreenProps {
  config: ExperienceConfig
  onOpen: () => void
  onContinue: () => void
}

export function RingBoxScreen({
  config,
  onOpen,
  onContinue,
}: RingBoxScreenProps) {
  const [open, setOpen] = useState(false)

  const openBox = () => {
    if (open) return
    setOpen(true)
    onOpen()
    fireContinuousSparkle(2000)
  }

  return (
    <ScreenShell>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,179,186,0.15),transparent_55%)]"
      />

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.7, ease: 'easeOut' }}
        className="relative z-10 mb-10 text-center"
      >
        <p className="text-sm font-bold tracking-[0.3em] uppercase"
          style={{ color: config.branding.accentColor }}
        >
          An old joke. A new question.
        </p>
        <h1 className="font-display mt-3 text-balance text-4xl font-semibold text-white sm:text-5xl">
          {config.content.revealHeading}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-pretty text-sm text-white/60">
          {config.content.revealSubtext}
        </p>
      </motion.div>

      {/* Ring box */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 90, damping: 15 }}
        style={{ perspective: 900 }}
        className="relative z-10 mt-2"
      >
        <div className="relative mx-auto flex h-64 w-72">
          {/* Lid */}
          <motion.button
            type="button"
            onClick={openBox}
            aria-label={open ? 'Box is open' : 'Tap to open the ring box'}
            animate={open ? { rotateX: 70, y: -90, z: 40 } : { rotateX: 0, y: 0 }}
            transition={{ type: 'spring', stiffness: 110, damping: 12 }}
            style={{ transformOrigin: 'top center' }}
            className="absolute inset-x-0 top-0 z-20 flex h-16 items-center justify-center overflow-hidden rounded-t-3xl bg-gradient-to-b from-[#f6c6b6] to-[#d9a6f0] shadow-xl outline-none"
          >
            <span className="text-xs font-black tracking-[0.3em] text-obsidian-900/50 uppercase">
              {open ? 'open' : 'the hardest part'}
            </span>
          </motion.button>

          {/* Body */}
          <div className="absolute inset-x-0 bottom-0 top-14 overflow-hidden rounded-b-3xl border border-white/10 bg-gradient-to-b from-[#2b1f35] to-[#171019] shadow-2xl">
            <div className="flex h-full items-center justify-center pt-8">
              <AnimatePresence>
                {open && (
                  <motion.div
                    key="ring"
                    initial={{ opacity: 0, scale: 0.3, y: 40 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.25, type: 'spring', stiffness: 140, damping: 11 }}
                    className="relative"
                  >
                    <motion.div
                      aria-hidden
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.95, 0.5] }}
                      transition={{ duration: 1.6, repeat: Infinity }}
                      className="absolute -inset-6 rounded-full bg-[#ffb3ba]/30 blur-xl"
                    />
                    <span className="relative block text-7xl drop-shadow-[0_0_28px_rgba(255,217,138,0.65)]">
                      💍
                    </span>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-bold tracking-[0.25em] text-amber-200 uppercase"
                    >
                      a question inside
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: open ? 1 : 0, y: open ? 0 : 16 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 mt-10"
      >
        <button
          type="button"
          onClick={onContinue}
          disabled={!open}
          className="disabled:cursor-not-allowed flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-[#ffb3ba] via-[#e0b3f2] to-[#c9b8ff] px-8 text-base font-bold text-obsidian-900 transition-all duration-300 hover:scale-[1.05] active:scale-95 disabled:opacity-40 disabled:saturate-0"
        >
          Take the Box
          <ArrowRight className="h-5 w-5" />
        </button>
      </motion.div>

      {open && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative z-10 mt-6 text-xs font-semibold tracking-wide text-white/40 uppercase"
        >
          It’s light. But it means everything.
        </motion.p>
      )}
    </ScreenShell>
  )
}