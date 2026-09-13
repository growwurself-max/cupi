import { AnimatePresence, motion } from 'framer-motion'
import { RotateCcw, WandSparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import {
  fireContinuousSparkle,
  fireGoldenRain,
  fireGoldenSpark,
} from '../../../utils/confetti'
import { ScreenShell } from '../../shared/ScreenShell'
import { PlayfulQuestion } from '../../shared/PlayfulQuestion'

interface Screen4GoldenFireworksProps {
  config: ExperienceConfig
  onYes: () => void
  onReplay: () => void
  onExit: () => void
}

export function Screen4GoldenFireworks({
  config,
  onYes,
  onReplay,
  onExit,
}: Screen4GoldenFireworksProps) {
  const [accepted, setAccepted] = useState(false)

  const celebrate = () => {
    onYes()
    fireGoldenSpark()
    fireGoldenRain(1600)
    fireContinuousSparkle(1200)
    setAccepted(true)
  }

  useEffect(() => {
    if (!accepted) return
    const timer = setTimeout(() => fireGoldenSpark(), 1000)
    return () => clearTimeout(timer)
  }, [accepted])

  return (
    <ScreenShell className="surface-obsidian">
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-full border border-amber-200/30 bg-white/5 px-4 py-1.5 text-xs font-bold tracking-[0.3em] text-amber-200/80 uppercase"
      >
        Golden Fireworks
      </motion.p>

      <AnimatePresence mode="wait">
        {!accepted ? (
          <motion.div
            key="question"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.94, y: -16 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 mt-16"
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 140 }}
              className="mb-10 block text-center text-7xl drop-shadow-[0_0_30px_rgba(245,184,97,0.7)]"
            >
              💍
            </motion.span>
            <PlayfulQuestion
              question={config.content.finalMessage}
              onYes={celebrate}
              yesLabel="Yes, a thousand times 💖"
              noLabel="Not yet…"
            />
          </motion.div>
        ) : (
          <motion.div
            key="yes"
            initial={{ opacity: 0, scale: 0.88, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 90 }}
            className="relative z-10 flex flex-col items-center gap-6 text-center"
          >
            <motion.span
              initial={{ scale: 0, rotate: -24 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.45, type: 'spring', stiffness: 130 }}
              className="text-7xl drop-shadow-[0_0_30px_rgba(245,184,97,0.8)]"
            >
              🎆
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, type: 'spring', stiffness: 120 }}
              className="font-display text-balance text-5xl font-black sm:text-6xl"
            >
              <span className="text-gradient-lux">SHE SAID YES 🎉</span>
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
                Replay Experience 🔁
              </button>
              <button
                type="button"
                onClick={onExit}
                className="flex min-h-14 items-center gap-2.5 rounded-full border border-amber-200/40 bg-white/5 px-7 text-base font-semibold text-amber-100 transition-all duration-200 hover:scale-[1.04] hover:bg-white/10 active:scale-95"
              >
                <WandSparkles className="h-5 w-5" />
                Create a Surprise for Someone Else
              </button>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-xs font-semibold tracking-[0.2em] text-amber-200/40 uppercase"
            >
              Crafted with ♥ by Cupi
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </ScreenShell>
  )
}