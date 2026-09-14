import { AnimatePresence, motion } from 'framer-motion'
import { RotateCcw, WandSparkles } from 'lucide-react'
import { useCallback, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { fireGoldenSpark } from '../../../utils/confetti'
import { ScreenShell } from '../../shared/ScreenShell'
import { InteractiveCandle } from '../../shared/InteractiveCandle'

interface Screen6WishFinaleProps {
  config: ExperienceConfig
  onReplay: () => void
  onExit: () => void
  onBlow: () => void
}

export function Screen6WishFinale({
  config,
  onReplay,
  onExit,
  onBlow,
}: Screen6WishFinaleProps) {
  const [showWish, setShowWish] = useState(false)

  const blowOut = useCallback(() => {
    onBlow()
    fireGoldenSpark()
    setTimeout(() => setShowWish(true), 700)
  }, [onBlow])

  return (
    <ScreenShell>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_70%,rgba(253,164,175,0.18),transparent_55%)]"
      />

      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="rounded-full border border-rose-200 bg-white/80 px-4 py-1.5 text-xs font-bold tracking-[0.3em] text-rose-700 uppercase shadow-sm"
      >
        The grand finale
      </motion.p>

      {/* Candle — tap or blow into the mic */}
      <div className="relative z-20 mt-12 flex flex-col items-center">
        <InteractiveCandle onBlow={blowOut} tone="rose" />
      </div>

      {/* Final message */}
      <AnimatePresence>
        {showWish && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.7, type: 'spring', stiffness: 90 }}
            className="relative z-10 mt-14 flex flex-col items-center gap-6 pb-6 text-center"
          >
            <motion.h2
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 130 }}
              className="font-serif text-balance text-4xl font-bold italic text-[#881337] sm:text-5xl md:text-6xl"
            >
              {config.content.finalMessage} <span className="text-rose-500">❤️</span>
            </motion.h2>
            <p className="max-w-md text-pretty text-rose-950/75">
              {config.content.finalCelebration}
            </p>
            <p className="text-lg text-rose-800/70">
              — {config.sender.name} <span className="text-rose-500">♥</span>
            </p>

            <div className="mt-2 flex flex-col items-center gap-4 pb-2 sm:flex-row">
              <button
                type="button"
                onClick={onReplay}
                className="flex min-h-14 items-center gap-2.5 rounded-full bg-rose-500 px-7 text-base font-semibold text-white shadow-lg shadow-rose-300/50 transition-all duration-200 hover:brightness-110 hover:scale-[1.04] active:scale-95"
              >
                <RotateCcw className="h-5 w-5" />
                Replay Surprise 🔁
              </button>
              <button
                type="button"
                onClick={onExit}
                className="flex min-h-14 items-center gap-2.5 rounded-full border border-rose-200 bg-white/80 px-7 text-base font-semibold text-rose-800 shadow-sm transition-all duration-200 hover:scale-[1.04] hover:text-rose-900 active:scale-95"
              >
                <WandSparkles className="h-5 w-5 text-rose-500" />
                Create a Surprise Like This ✨
              </button>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-2 text-xs font-semibold tracking-[0.2em] text-rose-700/60 uppercase"
            >
              Crafted with ♥ by Cupi
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </ScreenShell>
  )
}