import { AnimatePresence, motion } from 'framer-motion'
import { RotateCcw, WandSparkles } from 'lucide-react'
import { useCallback, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { fireGoldenSpark, fireHeartRain } from '../../../utils/confetti'
import { TeddyMascot } from '../components/TeddyMascot'
import { TeddyDecor } from '../TeddyDecor'

interface Screen6TeddyCakeProps {
  config: ExperienceConfig
  onReplay: () => void
  onExit: () => void
  onBlow: () => void
}

export function Screen6TeddyCake({
  config,
  onReplay,
  onExit,
  onBlow,
}: Screen6TeddyCakeProps) {
  const [showWish, setShowWish] = useState(false)
  const [teddyJump, setTeddyJump] = useState(false)
  const [isExtinguished, setIsExtinguished] = useState(false)

  const extinguishCandle = useCallback(() => {
    if (isExtinguished) return
    setIsExtinguished(true)
    onBlow()
    setTeddyJump(true)
    fireHeartRain(1800)
    setTimeout(() => fireGoldenSpark(), 200)
    setTimeout(() => setShowWish(true), 700)
  }, [isExtinguished, onBlow])

  return (
    <section className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-5 py-24 text-center sm:px-8">
      <TeddyDecor />

      <motion.span
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="relative z-10 rounded-full border border-[#FFB6C8] bg-white/80 px-4 py-1.5 text-xs font-black tracking-[0.22em] text-[#F43F5E] uppercase shadow-sm backdrop-blur-md"
      >
        The Grand Finale 🎂
      </motion.span>

      {/* Teddy mascot with integrated cake & candle */}
      <div className="relative flex flex-col items-center justify-center my-auto">
        {/* Teddy Mascot */}
        <motion.div
          animate={teddyJump ? { y: [0, -30, 0, -15, 0] } : {}}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative z-10"
        >
          <TeddyMascot state="cake" className="w-44 h-44 sm:w-52 sm:h-52" />
        </motion.div>

        {/* Integrated Cake & Candle Container */}
        <div className="relative -mt-10 z-20 flex flex-col items-center">
          {/* 1. Animated Candle Flame & Wick (Seated directly on top of candle) */}
          {!isExtinguished ? (
            <motion.div
              animate={{ scale: [1, 1.15, 0.95, 1], y: [0, -2, 1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
              onClick={extinguishCandle}
              className="cursor-pointer flex flex-col items-center -mb-1"
            >
              {/* Glowing Flame Drop */}
              <div className="w-5 h-7 bg-gradient-to-t from-amber-500 via-yellow-400 to-yellow-100 rounded-full blur-[1px] shadow-[0_0_15px_rgba(251,191,36,0.8)]" />
              {/* Candle Wick */}
              <div className="w-0.5 h-2 bg-stone-700 -mt-1" />
            </motion.div>
          ) : (
            /* Smoke plume after blow out */
            <motion.div initial={{ opacity: 1, y: 0 }} animate={{ opacity: 0, y: -20 }} className="text-stone-400 text-xs mb-1">
              💨 ✨
            </motion.div>
          )}

          {/* 2. Candle Stick Body */}
          <div className="w-3 h-8 bg-gradient-to-r from-pink-400 via-rose-300 to-pink-400 rounded-t-sm shadow-sm" />

          {/* 3. Birthday Cake Body */}
          <div className="w-44 sm:w-52 h-20 bg-gradient-to-b from-rose-100 to-pink-200 border-2 border-rose-300 rounded-2xl shadow-xl flex items-center justify-around px-4 relative overflow-hidden">
            {/* Frosting drips */}
            <div className="absolute top-0 inset-x-0 h-4 bg-white rounded-b-xl opacity-90" />
            <span className="text-base z-10">🍓</span>
            <span className="text-base z-10 font-bold text-rose-800 text-xs uppercase tracking-wider">Happy Birthday</span>
            <span className="text-base z-10">🍓</span>
          </div>
        </div>
      </div>

      {/* Final reveal */}
      <AnimatePresence>
        {showWish && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.7, type: 'spring', stiffness: 90 }}
            className="relative z-10 mt-10 flex w-full flex-col items-center gap-6 pb-6"
          >
            <motion.h2
              initial={{ opacity: 0, scale: 0.82 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 130 }}
              className="font-display text-balance text-4xl font-bold italic sm:text-5xl md:text-6xl"
            >
              <span className="bg-gradient-to-br from-[#E11D48] via-[#F43F5E] to-[#FB7185] bg-clip-text text-transparent">
                {config.content.finalMessage}
              </span>
              <span className="text-[#F43F5E]"> ❤️</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="max-w-md text-pretty text-base leading-relaxed text-[#7C4A63]"
            >
              May all your wishes come true! Today is all about YOU ❤️
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="max-w-md text-pretty text-sm leading-relaxed text-[#7C4A63]"
            >
              {config.content.finalCelebration}
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-lg font-bold text-[#881337]/80"
            >
              — {config.sender.name} <span className="text-[#F43F5E]">♥</span>
            </motion.p>

            <div className="mt-2 flex flex-col items-center gap-4 pb-2 sm:flex-row">
              <button
                type="button"
                onClick={onReplay}
                className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-[#F43F5E] via-[#E11D48] to-[#FB7185] px-7 text-base font-bold text-white shadow-xl shadow-[#FFB6C8]/60 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <RotateCcw className="h-5 w-5" />
                Replay Surprise 🔁
              </button>
              <button
                type="button"
                onClick={onExit}
                className="flex min-h-14 items-center gap-2.5 rounded-full border border-[#FFB6C8] bg-white/85 px-7 text-base font-bold text-[#881337] shadow-sm transition-all duration-200 hover:scale-105 hover:bg-white active:scale-95"
              >
                <WandSparkles className="h-5 w-5 text-[#F43F5E]" />
                Create Your Own 🎁
              </button>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-2 text-xs font-bold tracking-[0.2em] text-[#F4A0B0]/60 uppercase"
            >
              Crafted with ♥ by Cupi
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
