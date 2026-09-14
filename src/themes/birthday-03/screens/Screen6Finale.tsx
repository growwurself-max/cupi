import { AnimatePresence, motion } from 'framer-motion'
import { RotateCcw, WandSparkles } from 'lucide-react'
import { useCallback, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { fireGoldenSpark, fireHeartRain } from '../../../utils/confetti'
import { InteractiveCandle } from '../../shared/InteractiveCandle'
import { BlushDécor } from '../BlushDécor'

interface Screen6FinaleProps {
  config: ExperienceConfig
  onReplay: () => void
  onExit: () => void
  onBlow: () => void
}

export function Screen6Finale({
  config,
  onReplay,
  onExit,
  onBlow,
}: Screen6FinaleProps) {
  const [showWish, setShowWish] = useState(false)

  const highlightPhoto =
    config.content.photos.length > 0 ? config.content.photos[0] : null

  const blowOut = useCallback(() => {
    onBlow()
    fireHeartRain(1800)
    fireGoldenSpark()
    setTimeout(() => setShowWish(true), 700)
  }, [onBlow])

  return (
    <section className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-5 py-24 text-center sm:px-8">
      <BlushDécor />

      <motion.span
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="relative z-10 rounded-full border border-[#F4BCD1] bg-white/80 px-4 py-1.5 text-xs font-black tracking-[0.22em] text-[#D9548A] uppercase shadow-sm backdrop-blur-md"
      >
        The Grand Finale
      </motion.span>

      {/* Candle — tap or blow into the mic */}
      <div className="relative z-10 mt-12 flex flex-col items-center">
        <InteractiveCandle onBlow={blowOut} tone="blush" />
      </div>

      {/* Final reveal */}
      <AnimatePresence>
        {showWish && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.7, type: 'spring', stiffness: 90 }}
            className="relative z-10 mt-14 flex w-full flex-col items-center gap-6 pb-6"
          >
            {highlightPhoto && (
              <motion.div
                initial={{ opacity: 0, rotate: -10, scale: 0.7, y: 30 }}
                animate={{ opacity: 1, rotate: -4, scale: 1, y: 0 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 110, damping: 13 }}
                className="relative"
              >
                <div
                  aria-hidden
                  className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-[#F9C9DD]/80 to-[#E6DBFF]/80 blur-xl"
                />
                <div className="relative rounded-2xl bg-white p-3 pb-4 shadow-[0_26px_60px_-22px_rgba(231,140,178,0.8)]">
                  <div className="h-36 w-52 overflow-hidden rounded-xl bg-[#FDE9F1] shadow-inner sm:h-40 sm:w-60">
                    <img
                      src={highlightPhoto.src}
                      alt={highlightPhoto.alt}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-1.5">
                    <span className="text-[#F472B6]">✦</span>
                    <p className="text-[11px] font-black tracking-widest text-[#C46D97] uppercase">
                      the memory that started it all
                    </p>
                    <span className="text-[#F472B6]">✦</span>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.h2
              initial={{ opacity: 0, scale: 0.82 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45, type: 'spring', stiffness: 130 }}
              className="font-display text-balance text-4xl font-bold italic sm:text-5xl md:text-6xl"
            >
              <span className="bg-gradient-to-br from-[#E85C9B] via-[#D9548A] to-[#8B5CF6] bg-clip-text text-transparent">
                {config.content.finalMessage}
              </span>
              <span className="text-[#F472B6]"> ❤️</span>
            </motion.h2>

            <p className="max-w-md text-pretty text-base leading-relaxed text-[#7C4A63]">
              {config.content.finalCelebration}
            </p>
            <p className="text-lg font-bold text-[#9A3168]/80">
              — {config.sender.name} <span className="text-[#F472B6]">♥</span>
            </p>

            <div className="mt-2 flex flex-col items-center gap-4 pb-2 sm:flex-row">
              <button
                type="button"
                onClick={onReplay}
                className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-[#F472B6] via-[#EC6E9F] to-[#A78BFA] px-7 text-base font-bold text-white shadow-xl shadow-[#F4BCD1]/60 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <RotateCcw className="h-5 w-5" />
                Replay Surprise 🔁
              </button>
              <button
                type="button"
                onClick={onExit}
                className="flex min-h-14 items-center gap-2.5 rounded-full border border-[#F0B8CE] bg-white/85 px-7 text-base font-bold text-[#B9447D] shadow-sm transition-all duration-200 hover:scale-105 hover:bg-white active:scale-95"
              >
                <WandSparkles className="h-5 w-5 text-[#F472B6]" />
                Create a Surprise Like This ✨
              </button>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-2 text-xs font-bold tracking-[0.2em] text-[#C46D97]/60 uppercase"
            >
              Crafted with ♥ by Cupi
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}