import { motion } from 'framer-motion'
import { RotateCcw, WandSparkles } from 'lucide-react'
import { useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { FloatingEmojis } from '../../shared/FloatingEmojis'
import { FloatingParticles } from '../../shared/FloatingParticles'
import { ScreenShell } from '../../shared/ScreenShell'
import { fireGoldenRain, fireGoldenSpark } from '../../../utils/confetti'

function GoldenGlass({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 120" fill="none" className={className} aria-hidden>
      <defs>
        <linearGradient id="cupi-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FDEBB0" />
          <stop offset="55%" stopColor="#F5B861" />
          <stop offset="100%" stopColor="#E8924A" />
        </linearGradient>
      </defs>
      <path
        d="M18 30 C23 40 25 44 24 46 C23 44 25 40 30 30 Z"
        fill="#FFE9B8"
        fillOpacity="0.85"
      />
      <path
        d="M11 8 C8 24 8 32 24 46 C40 32 40 24 37 8 C30 12.5 18 12.5 11 8 Z"
        fill="url(#cupi-gold)"
        stroke="#B45309"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <circle cx="20" cy="20" r="1.6" fill="#FFFDF7" opacity="0.8" />
      <circle cx="27" cy="12" r="1.2" fill="#FFFDF7" opacity="0.6" />
      <path
        d="M22.5 46 V96"
        stroke="#B45309"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <ellipse
        cx="24"
        cy="99"
        rx="13"
        ry="3.5"
        fill="url(#cupi-gold)"
        stroke="#B45309"
        strokeWidth="2.5"
      />
      <path
        d="M18 52 C22 62 22 70 19 78"
        stroke="#FFFDF7"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  )
}

interface ToastScreenProps {
  config: ExperienceConfig
  onReplay: () => void
  onExit: () => void
  onClink: () => void
}

export function ToastScreen({ config, onReplay, onExit, onClink }: ToastScreenProps) {
  const [clinking, setClinking] = useState(false)
  const [clinkIndex, setClinkIndex] = useState(0)

  const handleClink = () => {
    if (clinking) return
    setClinking(true)
    setClinkIndex((n) => n + 1)
    window.setTimeout(() => setClinking(false), 950)
    window.setTimeout(() => fireGoldenSpark(), 150)
    window.setTimeout(() => fireGoldenRain(1600), 180)
    window.setTimeout(() => onClink(), 200)
  }

  return (
    <ScreenShell>
      <FloatingParticles
        type="gold-sparkles"
        colors={[config.branding.accentColor, config.branding.accentSecondary]}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(245,184,97,0.18),transparent_55%)]"
      />
      <FloatingEmojis emojis={['🥂', '✨', '🌟']} count={8} />

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 font-display animate-shimmer mt-2 bg-[length:200%_auto] bg-gradient-to-r from-[#B45309] via-[#F5B861] to-[#B45309] bg-clip-text text-center text-4xl font-black text-transparent sm:text-5xl"
      >
        {config.content.finalMessage}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.6 }}
        className="relative z-10 font-display mt-3 text-center text-lg font-bold text-[#78350F]"
      >
        To a lifetime of more chapters together 🥂
      </motion.p>

      <div className="relative z-10 mt-8 flex items-end justify-center gap-10 sm:gap-16">
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="relative"
        >
          <motion.div
            key={clinkIndex}
            initial={{ x: 0, rotate: 0 }}
            animate={
              clinking
                ? { x: [0, 26, 4, 0], rotate: [0, -10, 3, 0] }
                : { x: 0, rotate: 0 }
            }
            transition={{ duration: 0.95, ease: 'easeInOut' }}
          >
            <GoldenGlass className="h-40 w-16" />
          </motion.div>
        </motion.div>

        <div className="relative flex h-40 w-16 items-center justify-center">
          {clinkIndex > 0 && (
            <motion.span
              key={clinkIndex}
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: [0, 1, 0], scale: [0.3, 1.6, 0.7] }}
              transition={{ duration: 0.95, ease: 'easeOut' }}
              className="pointer-events-none absolute text-4xl"
            >
              ✨
            </motion.span>
          )}
        </div>

        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
          className="relative"
        >
          <motion.div
            key={clinkIndex}
            initial={{ x: 0, rotate: 0 }}
            animate={
              clinking
                ? { x: [0, -26, -4, 0], rotate: [0, 10, -3, 0] }
                : { x: 0, rotate: 0 }
            }
            transition={{ duration: 0.95, ease: 'easeInOut' }}
          >
            <GoldenGlass className="h-40 w-16" />
          </motion.div>
        </motion.div>
      </div>
      <div
        aria-hidden
        className="relative z-10 mt-3 h-px w-64 bg-gradient-to-r from-transparent via-[#E7C98A] to-transparent sm:w-80"
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 mt-8"
      >
        <button
          type="button"
          onClick={handleClink}
          className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-400 px-7 text-sm font-bold text-white shadow-lg shadow-amber-500/30 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          Tap to Clink 🥂
        </button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="relative z-10 mt-7 max-w-md text-center text-sm leading-relaxed text-stone-600 sm:text-base"
      >
        {config.content.finalCelebration}
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="relative z-10 font-display mt-5 text-xl font-semibold italic text-[#B45309]"
      >
        — {config.sender.name}
      </motion.p>

      <div className="relative z-10 mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onReplay}
          className="flex min-h-14 items-center gap-2 rounded-full border-2 border-[#E7C98A] bg-[#FFF3D6] px-7 text-sm font-bold text-[#B45309] shadow-md shadow-amber-500/20 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <RotateCcw className="h-5 w-5" />
          Replay Surprise 🔁
        </button>
        <button
          type="button"
          onClick={onExit}
          className="flex min-h-14 items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-400 px-7 text-sm font-bold text-white shadow-lg shadow-amber-500/30 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <WandSparkles className="h-5 w-5" />
          Create a Surprise Like This ✨
        </button>
      </div>

      <p className="relative z-10 mt-8 text-center text-xs font-medium text-stone-500">
        Crafted with ♥ by Cupi
      </p>
    </ScreenShell>
  )
}