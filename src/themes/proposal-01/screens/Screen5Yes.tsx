import { AnimatePresence, motion } from 'framer-motion'
import { RotateCcw, WandSparkles } from 'lucide-react'
import { useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { fireGoldenSpark, fireGrandBurst, fireHeartRain } from '../../../utils/confetti'
import { FloatingEmojis } from '../../shared/FloatingEmojis'
import { FloatingParticles } from '../../shared/FloatingParticles'
import { ScreenShell } from '../../shared/ScreenShell'

interface Screen5YesProps {
  config: ExperienceConfig
  onReplay: () => void
  onExit: () => void
}

export function Screen5Yes({ config, onReplay, onExit }: Screen5YesProps) {
  const [saved, setSaved] = useState(false)

  const press = () => {
    if (saved) return
    setSaved(true)
    fireGrandBurst()
    fireHeartRain(1800)
    fireGoldenSpark()
  }

  return (
    <ScreenShell>
      <FloatingParticles
        type="star-dust"
        colors={[config.branding.accentColor, config.branding.accentSecondary]}
      />
      <FloatingEmojis emojis={['✨', '💫', '💍', '💖']} count={10} />

      <AnimatePresence mode="wait">
        {!saved ? (
          <motion.div
            key="choose"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18, scale: 0.97 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="relative z-10 flex flex-col items-center gap-5 text-center"
          >
            <h2 className="font-display text-balance text-3xl font-bold text-[#581C87] sm:text-4xl">
              Choose your YES 💖
            </h2>
            <p className="max-w-sm text-pretty text-sm leading-relaxed text-purple-900/60 sm:text-base">
              Tap whichever makes your heart skip first — I'll be saying yes right
              along with you, either way. 😉
            </p>

            <div className="mt-4 flex flex-col gap-4">
              <button
                type="button"
                onClick={press}
                className="flex min-h-16 items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-fuchsia-400 px-9 py-4 text-base font-bold text-white shadow-xl shadow-violet-500/40 transition-all duration-200 hover:scale-105 active:scale-95 sm:text-lg"
              >
                YES! A MILLION TIMES YES! 💖
              </button>
              <button
                type="button"
                onClick={press}
                className="flex min-h-16 items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-rose-400 via-pink-400 to-fuchsia-400 px-9 py-4 text-base font-bold text-white shadow-xl shadow-rose-400/40 transition-all duration-200 hover:scale-105 active:scale-95 sm:text-lg"
              >
                YES! 😍
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="saved"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 110, damping: 15, delay: 0.1 }}
            className="relative z-10 flex flex-col items-center gap-6 text-center"
          >
            <motion.h2
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 130 }}
              className="animate-shimmer font-display text-balance bg-gradient-to-r from-[#A78BFA] via-[#F0ABFC] to-[#FBCFE8] bg-[length:200%_auto] bg-clip-text text-4xl font-bold text-transparent sm:text-5xl md:text-6xl"
            >
              {config.content.finalMessage}
            </motion.h2>
            <p className="max-w-md text-pretty text-sm leading-relaxed text-purple-900/60 sm:text-base">
              {config.content.finalCelebration}
            </p>
            <p className="font-display text-xl italic text-[#581C87]">
              — {config.sender.name} 💍
            </p>

            <div className="mt-2 flex flex-col items-center gap-4 pb-2 sm:flex-row">
              <button
                type="button"
                onClick={onReplay}
                className="flex min-h-14 items-center gap-2.5 rounded-full border border-violet-300 bg-white/70 px-7 text-sm font-bold text-[#581C87] shadow-lg shadow-violet-300/20 backdrop-blur transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <RotateCcw className="h-5 w-5" />
                Replay Surprise 🔁
              </button>
              <button
                type="button"
                onClick={onExit}
                className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400 px-7 text-sm font-bold text-white shadow-lg shadow-violet-500/30 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <WandSparkles className="h-5 w-5" />
                Create a Surprise Like This ✨
              </button>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-3 text-xs font-semibold tracking-[0.2em] text-purple-900/40 uppercase"
            >
              Crafted with ♥ by Cupi
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </ScreenShell>
  )
}