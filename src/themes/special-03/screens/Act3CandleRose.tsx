import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { InteractiveCandle } from '../../shared/InteractiveCandle'
import { ScreenShell } from '../../shared/ScreenShell'

interface Act3CandleRoseProps {
  config: ExperienceConfig
  onBlow: () => void
  onComplete: () => void
}

export function Act3CandleRose({ config, onBlow, onComplete }: Act3CandleRoseProps) {
  const [revealed, setRevealed] = useState(false)

  const handleBlow = useCallback(() => {
    onBlow()
    setTimeout(() => {
      setRevealed(true)
      setTimeout(onComplete, 2800)
    }, 400)
  }, [onBlow, onComplete])

  return (
    <ScreenShell className="bg-[#FCF1ED] py-24">
      <p className="relative z-10 text-xs font-bold tracking-[0.28em] text-amber-800/55 uppercase">
        {config.content.wishPrompt || 'Make a wish'}
      </p>

      {!revealed ? (
        <div className="relative z-10 mt-10 scale-90 sm:scale-100">
          <InteractiveCandle onBlow={handleBlow} tone="blush" />
        </div>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 90 }}
            className="relative z-10 mt-6 flex flex-col items-center"
          >
            <RoseBouquet />
            <FloatingPetals />
            <p className="mt-6 font-serif text-lg font-bold text-rose-800 italic">
              {config.content.revealHeading}
            </p>
          </motion.div>
        </AnimatePresence>
      )}
    </ScreenShell>
  )
}

function RoseBouquet() {
  return (
    <div className="relative">
      <svg viewBox="0 0 200 220" className="h-52 w-48 drop-shadow-xl sm:h-60 sm:w-52">
        <defs>
          <linearGradient id="roseGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fb7185" />
            <stop offset="100%" stopColor="#be123c" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i} transform={`rotate(${i * 72 - 36} 100 110)`}>
            <ellipse cx="100" cy="78" rx="22" ry="28" fill="url(#roseGrad)" opacity={0.92 - i * 0.05} />
            <ellipse cx="100" cy="72" rx="10" ry="14" fill="#ffe4e6" opacity="0.5" />
          </g>
        ))}
        <rect x="94" y="110" width="12" height="70" rx="4" fill="#166534" />
        <path d="M94 140 Q70 130 62 150" stroke="#15803d" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M106 150 Q130 142 138 162" stroke="#15803d" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path
          d="M88 178 L112 178 L108 200 L92 200 Z"
          fill="#92400e"
          stroke="#78350f"
          strokeWidth="1"
        />
      </svg>
    </div>
  )
}

function FloatingPetals() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute text-rose-300/80"
          style={{ left: `${20 + i * 9}%`, top: `${30 + (i % 3) * 8}%` }}
          animate={{
            y: [0, 40, 80],
            x: [0, (i % 2 ? 1 : -1) * 20, 0],
            opacity: [0.8, 0.5, 0],
            rotate: [0, 180],
          }}
          transition={{ duration: 3.5, repeat: Infinity, delay: i * 0.35, ease: 'easeOut' }}
        >
          🌸
        </motion.span>
      ))}
    </>
  )
}
