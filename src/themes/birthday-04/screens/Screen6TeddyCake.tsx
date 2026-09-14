import { AnimatePresence, motion } from 'framer-motion'
import { RotateCcw, WandSparkles } from 'lucide-react'
import { useCallback, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { fireGoldenSpark, fireHeartRain } from '../../../utils/confetti'
import { InteractiveCandle } from '../../shared/InteractiveCandle'
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

  const blowOut = useCallback(() => {
    onBlow()
    setTeddyJump(true)
    fireHeartRain(1800)
    setTimeout(() => fireGoldenSpark(), 200)
    setTimeout(() => setShowWish(true), 700)
  }, [onBlow])

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

      {/* Teddy holding cake */}
      <motion.div
        animate={teddyJump ? { y: [0, -30, 0, -15, 0] } : {}}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 mt-10 mb-4"
      >
        <svg width="100" height="115" viewBox="0 0 140 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="scale-80">
          <circle cx="35" cy="30" r="22" fill="#D4A574" />
          <circle cx="35" cy="30" r="14" fill="#F0C9A6" />
          <circle cx="105" cy="30" r="22" fill="#D4A574" />
          <circle cx="105" cy="30" r="14" fill="#F0C9A6" />
          <circle cx="70" cy="62" r="42" fill="#D4A574" />
          <circle cx="70" cy="66" r="30" fill="#F5E6D3" />
          <circle cx="57" cy="58" r="4" fill="#3D2914" />
          <circle cx="83" cy="58" r="4" fill="#3D2914" />
          <circle cx="59" cy="56" r="1.5" fill="white" />
          <circle cx="85" cy="56" r="1.5" fill="white" />
          <ellipse cx="70" cy="68" rx="5" ry="3.5" fill="#C4956A" />
          {/* Big happy smile */}
          <path d="M58 76 Q70 87 82 76" stroke="#C4956A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <ellipse cx="46" cy="70" rx="9" ry="5.5" fill="#F4A0B0" opacity="0.7" />
          <ellipse cx="94" cy="70" rx="9" ry="5.5" fill="#F4A0B0" opacity="0.7" />
          <ellipse cx="70" cy="125" rx="36" ry="34" fill="#D4A574" />
          <ellipse cx="70" cy="128" rx="24" ry="22" fill="#F5E6D3" />
          {/* Arms holding cake */}
          <ellipse cx="38" cy="112" rx="12" ry="9" fill="#D4A574" transform="rotate(-30 38 112)" />
          <ellipse cx="102" cy="112" rx="12" ry="9" fill="#D4A574" transform="rotate(30 102 112)" />
        </svg>

        {/* Birthday cake positioned below teddy */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
          {/* Cake layers */}
          <div className="relative">
            <div className="h-14 w-28 rounded-b-xl bg-gradient-to-b from-[#FFD6E0] to-[#FFB6C8] shadow-md" />
            <div className="absolute top-0 left-0 h-full w-full rounded-b-xl bg-gradient-to-b from-[#FFF0F3] to-transparent" />
            {/* Frosting drips */}
            <div className="absolute -top-1.5 left-2 h-4 w-3 rounded-b-full bg-[#FFF0F3]" />
            <div className="absolute -top-2 left-8 h-5 w-3.5 rounded-b-full bg-[#FFF0F3]" />
            <div className="absolute -top-1.5 left-14 h-4 w-3 rounded-b-full bg-[#FFF0F3]" />
            <div className="absolute -top-2 right-6 h-5 w-3.5 rounded-b-full bg-[#FFF0F3]" />
            <div className="absolute -top-1.5 right-1 h-4 w-3 rounded-b-full bg-[#FFF0F3]" />
            {/* Decorations */}
            <div className="absolute top-4 left-3 text-xs">🍓</div>
            <div className="absolute top-3 left-1/2 -translate-x-1/2 text-xs">🫐</div>
            <div className="absolute top-4 right-3 text-xs">🍓</div>
          </div>
        </div>
      </motion.div>

      {/* Candle */}
      <div className="relative z-10 mt-6 flex flex-col items-center">
        <InteractiveCandle onBlow={blowOut} tone="blush" />
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
