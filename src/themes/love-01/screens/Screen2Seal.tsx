import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { FloatingParticles } from '../../shared/FloatingParticles'
import { ScreenShell } from '../../shared/ScreenShell'
import { FloatingEmojis } from '../../shared/FloatingEmojis'

interface SealScreenProps {
  config: ExperienceConfig
  onBreak: () => void
  onContinue: () => void
}

export function SealScreen({
  config,
  onBreak,
  onContinue,
}: SealScreenProps) {
  const [broken, setBroken] = useState(false)

  const breakSeal = () => {
    if (broken) return
    setBroken(true)
    onBreak()
  }

  return (
    <ScreenShell>
      <FloatingParticles
        type="lavender-mist"
        colors={[config.branding.accentColor, config.branding.accentSecondary]}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,155,179,0.14),transparent_55%)]"
      />
      <FloatingEmojis emojis={['🕊️', '💫', '💌']} count={10} />

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7, ease: 'easeOut' }}
        className="relative z-10 mb-8 text-center"
      >
        <h1 className="font-display text-balance text-4xl font-semibold text-white sm:text-5xl">
          {config.content.suspenseHeading}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-pretty text-sm leading-relaxed text-white/60 sm:text-base">
          {config.content.suspenseSubtext}
        </p>
      </motion.div>

      {/* Sealed letter */}
      <motion.div
        initial={{ opacity: 0, y: 40, rotateX: 40 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 90, damping: 15 }}
        style={{ perspective: 800 }}
        className="relative z-10 mt-2 w-full max-w-sm"
      >
        <motion.div
          className="relative rounded-2xl bg-gradient-to-br from-[#fff5f7] via-[#ffe9ee] to-[#fbdde5] p-8 text-center shadow-2xl"
          animate={broken ? { rotate: -1.5, scale: 1.02 } : { rotate: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 12 }}
        >
          <span className="text-4xl">📜</span>
          <p className="mt-3 text-sm font-semibold text-obsidian-800/70">
            A letter, sealed with a kiss
          </p>

          <motion.button
            type="button"
            onClick={breakSeal}
            aria-label={broken ? 'Seal broken' : 'Break the wax seal'}
            className="mx-auto mt-6 flex items-center justify-center outline-none"
            whileTap={{ scale: 0.85 }}
          >
            <AnimatePresence mode="wait">
              {!broken ? (
                <motion.span
                  key="seal"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: [0, -4, 4, 0] }}
                  exit={{ scale: 2, opacity: 0, rotate: 20 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 14 }}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#ff9bb3] to-[#d65d7a] text-2xl shadow-lg shadow-[#ff9bb3]/40"
                >
                  💋
                </motion.span>
              ) : (
                <motion.span
                  key="broken"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/30 bg-[#ffe9ee] text-2xl"
                >
                  💔
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>

        {broken && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-8 left-1/2 -translate-x-1/2"
          >
            <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold tracking-wide text-white/70 uppercase">
              Seal broken ✨ now open it
            </span>
          </motion.div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: broken ? 0.2 : 0 }}
        className="relative z-10 mt-10"
      >
        <button
          type="button"
          onClick={onContinue}
          disabled={!broken}
          className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-[#8f7bff] to-[#ff9bb3] px-8 text-base font-bold text-obsidian-900 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:saturate-0 hover:scale-[1.05] active:scale-95"
        >
          Open the Letter
          <ArrowRight className="h-5 w-5" />
        </button>
      </motion.div>
    </ScreenShell>
  )
}