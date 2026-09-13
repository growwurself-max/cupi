import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { ScreenShell } from '../../shared/ScreenShell'

interface Screen2CapTossProps {
  config: ExperienceConfig
  onToss: () => void
  onContinue: () => void
}

export function Screen2CapToss({ config, onToss, onContinue }: Screen2CapTossProps) {
  const [tossed, setTossed] = useState(false)

  const toss = () => {
    if (tossed) return
    onToss()
    setTossed(true)
  }

  return (
    <ScreenShell className="surface-obsidian">
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-full border border-amber-200/30 bg-white/5 px-4 py-1.5 text-xs font-bold tracking-[0.3em] text-amber-200/80 uppercase"
      >
        Cap Toss
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.6 }}
        className="font-display mt-5 text-balance text-center text-3xl font-black sm:text-4xl"
      >
        <span className="text-gradient-lux">{config.content.wishPrompt}</span>
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="relative z-10 mt-14 flex flex-col items-center"
      >
        <motion.button
          type="button"
          onClick={toss}
          whileTap={{ scale: 0.9 }}
          className="relative flex h-44 w-44 flex-col items-center justify-center gap-3 rounded-[2rem] border border-amber-200/30 bg-white/[0.04] backdrop-blur-md"
          aria-label={tossed ? 'Cap tossed into the air' : 'Tap to toss the graduation cap'}
        >
          <AnimatePresence mode="wait">
            {!tossed ? (
              <motion.span
                key="ground"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18, rotate: -24 }}
                transition={{ duration: 0.35 }}
                className="text-7xl"
              >
                🎓
              </motion.span>
            ) : (
              <motion.span
                key="sky"
                initial={{ opacity: 0, y: 90, rotate: 0, scale: 0.7 }}
                animate={{
                  opacity: 1,
                  y: -160,
                  rotate: [0, -20, 10, -14, 6, 0],
                  scale: 1.15,
                }}
                transition={{ duration: 1.15, ease: 'easeOut' }}
                className="text-7xl drop-shadow-[0_0_30px_rgba(224,178,75,0.8)]"
              >
                🎓
              </motion.span>
            )}
          </AnimatePresence>
          <span className="text-sm font-semibold text-amber-200/80">
            {tossed ? '10/10 arc. Praised.' : 'tap the cap'}
          </span>
        </motion.button>

        <AnimatePresence>
          {tossed && (
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 150 }}
              className="mt-14 flex flex-col items-center gap-5 text-center"
            >
              <p className="max-w-sm text-sm text-amber-100/70">
                {config.content.revealSubtext}
              </p>
              <motion.button
                type="button"
                onClick={onContinue}
                animate={{ boxShadow: ['0 0 24px -6px rgba(224,178,75,0.5)', '0 0 48px -6px rgba(224,178,75,0.9)', '0 0 24px -6px rgba(224,178,75,0.5)'] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-500 to-emerald-400 px-9 text-base font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.04] active:scale-95"
              >
                Golden confetti time
                <ChevronRight className="h-5 w-5" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </ScreenShell>
  )
}