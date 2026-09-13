import { AnimatePresence, motion } from 'framer-motion'
import { RotateCcw, Sparkles, WandSparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import {
  fireContinuousSparkle,
  fireGoldenRain,
  fireGoldenSpark,
} from '../../../utils/confetti'
import { FloatingParticles } from '../../shared/FloatingParticles'
import { ScreenShell } from '../../shared/ScreenShell'

interface Screen4GrandFinaleProps {
  config: ExperienceConfig
  onReplay: () => void
  onExit: () => void
  onBoom: () => void
}

export function Screen4GrandFinale({
  config,
  onReplay,
  onExit,
  onBoom,
}: Screen4GrandFinaleProps) {
  const [fired, setFired] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      onBoom()
      fireGoldenSpark()
      fireGoldenRain(1600)
      fireContinuousSparkle(1400)
      setFired(true)
    }, 600)
    return () => clearTimeout(timer)
  }, [onBoom])

  return (
    <ScreenShell className="surface-obsidian">
      <FloatingParticles
        type="gold-sparkles"
        colors={[config.branding.accentColor, config.branding.accentSecondary]}
      />
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-full border border-amber-200/30 bg-white/5 px-4 py-1.5 text-xs font-bold tracking-[0.3em] text-amber-200/80 uppercase"
      >
        Grand Finale
      </motion.p>

      <AnimatePresence>
        {fired && (
          <motion.div
            key="finale"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 90 }}
            className="relative z-10 flex flex-col items-center gap-6 text-center"
          >
            <motion.span
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.55, type: 'spring', stiffness: 130 }}
              className="text-7xl drop-shadow-[0_0_30px_rgba(245,184,97,0.7)]"
            >
              🎆
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, type: 'spring', stiffness: 120 }}
              className="font-display text-balance text-5xl font-black sm:text-6xl md:text-7xl"
            >
              <span className="text-gradient-lux">{config.content.finalMessage}</span>
            </motion.h1>
            <p className="max-w-md text-pretty text-amber-100/70">
              {config.content.finalCelebration}
            </p>
            <p className="text-lg text-amber-200/80">
              — {config.sender.name} <span className="text-amber-400">♥</span>
            </p>

            <div className="mt-2 flex flex-col items-center gap-4 pb-2 sm:flex-row">
              <button
                type="button"
                onClick={onReplay}
                className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-amber-400 via-rose-400 to-pink-500 px-7 text-base font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.04] active:scale-95"
              >
                <RotateCcw className="h-5 w-5" />
                Replay Surprise 🔁
              </button>
              <button
                type="button"
                onClick={onExit}
                className="flex min-h-14 items-center gap-2.5 rounded-full border border-amber-200/40 bg-white/5 px-7 text-base font-semibold text-amber-100 transition-all duration-200 hover:scale-[1.04] hover:bg-white/10 active:scale-95"
              >
                <WandSparkles className="h-5 w-5" />
                Create a Surprise Like This ✨
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ delay: 1.4, duration: 2.2, repeat: Infinity }}
        className="relative z-10 mt-10 text-[11px] font-semibold tracking-[0.25em] text-amber-200/40 uppercase"
      >
        <Sparkles className="mr-1 inline h-3 w-3" />
        Crafted with ♥ by Cupi
      </motion.p>
    </ScreenShell>
  )
}