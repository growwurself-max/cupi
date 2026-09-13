import { motion } from 'framer-motion'
import { Heart, RotateCcw, WandSparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { fireHeartRain } from '../../../utils/confetti'
import { FloatingParticles } from '../../shared/FloatingParticles'
import { ScreenShell } from '../../shared/ScreenShell'

interface Screen5EternalProps {
  config: ExperienceConfig
  onReplay: () => void
  onExit: () => void
  onBeat: () => void
}

export function Screen5Eternal({
  config,
  onReplay,
  onExit,
  onBeat,
}: Screen5EternalProps) {
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      onBeat()
      fireHeartRain(1500)
      setShown(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [onBeat])

  return (
    <ScreenShell className="surface-obsidian">
      <FloatingParticles
        type="heart-petals"
        colors={[config.branding.accentColor, config.branding.accentSecondary]}
      />

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-full border border-violet-200/30 bg-white/5 px-4 py-1.5 text-xs font-bold tracking-[0.3em] text-violet-200/80 uppercase"
      >
        The beat goes on
      </motion.p>

      {shown && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 28 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 90 }}
          className="relative z-10 flex flex-col items-center gap-6 text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.18, 1] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
            className="glow-violet flex h-28 w-28 items-center justify-center rounded-full border border-violet-300/50 bg-gradient-to-br from-violet-500 to-pink-500 text-5xl shadow-xl"
          >
            <Heart className="h-12 w-12 text-white" fill="currentColor" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.82 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.45, type: 'spring', stiffness: 130 }}
            className="font-display text-balance text-5xl font-black sm:text-6xl"
          >
            <span className="text-gradient-lux">{config.content.finalMessage}</span>
          </motion.h1>
          <p className="max-w-md text-pretty text-violet-100/70">
            {config.content.finalCelebration}
          </p>
          <p className="text-lg text-violet-200/80">
            — {config.sender.name} <span className="text-rose-400">♥</span>
          </p>

          <div className="mt-2 flex flex-col items-center gap-4 pb-2 sm:flex-row">
            <button
              type="button"
              onClick={onReplay}
              className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 px-7 text-base font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.04] active:scale-95"
            >
              <RotateCcw className="h-5 w-5" />
              Replay Surprise 🔁
            </button>
            <button
              type="button"
              onClick={onExit}
              className="flex min-h-14 items-center gap-2.5 rounded-full border border-violet-200/40 bg-white/5 px-7 text-base font-semibold text-violet-100 transition-all duration-200 hover:scale-[1.04] hover:bg-white/10 active:scale-95"
            >
              <WandSparkles className="h-5 w-5" />
              Create a Surprise Like This ✨
            </button>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-xs font-semibold tracking-[0.2em] text-violet-200/40 uppercase"
          >
            Crafted with ♥ by Cupi
          </motion.p>
        </motion.div>
      )}
    </ScreenShell>
  )
}