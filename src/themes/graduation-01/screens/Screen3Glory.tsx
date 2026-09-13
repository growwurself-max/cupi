import { motion } from 'framer-motion'
import { useEffect } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { fireGoldenSpark } from '../../../utils/confetti'
import { FloatingEmojis } from '../../shared/FloatingEmojis'
import { FloatingParticles } from '../../shared/FloatingParticles'
import { ScreenShell } from '../../shared/ScreenShell'

interface GloryScreenProps {
  config: ExperienceConfig
  onContinue: () => void
}

const CURRENT_YEAR = new Date().getFullYear()

export function GloryScreen({ config, onContinue }: GloryScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => fireGoldenSpark(), 400)
    return () => clearTimeout(timer)
  }, [])

  return (
    <ScreenShell>
      <FloatingParticles
        type="gold-sparkles"
        colors={[config.branding.accentColor, config.branding.accentSecondary]}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(245,194,66,0.18),transparent_55%)]"
      />
      <FloatingEmojis emojis={['🎓', '✨', '🏅', '📚']} count={10} />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex flex-col items-center gap-6 text-center"
      >
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/80 bg-white/85 px-3 py-1.5 text-xs font-bold tracking-[0.24em] text-[#854D0E] uppercase backdrop-blur-md">
          The Glory Reveal
        </span>

        <motion.h1
          initial={{ opacity: 0, scale: 0.7, y: 26 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 110, damping: 15 }}
          className="font-display text-balance text-4xl font-black leading-tight sm:text-6xl md:text-7xl"
        >
          <span className="animate-shimmer bg-[length:200%_auto] bg-gradient-to-r from-[#1E3A8A] via-[#F5C242] to-[#1E3A8A] bg-clip-text text-transparent">
            ✨ OFFICIALLY GRADUATED!
          </span>
          <span className="mt-2 block animate-shimmer bg-[length:200%_auto] bg-gradient-to-r from-[#1E3A8A] via-[#F5C242] to-[#1E3A8A] bg-clip-text text-3xl text-transparent sm:text-5xl">
            Class of {CURRENT_YEAR} ✨
          </span>
        </motion.h1>

        <div
          aria-hidden
          className="flex w-full max-w-md items-center gap-3"
        >
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#F5C242]/80 to-[#F5C242]" />
          <span className="text-xl">🌿</span>
          <span className="text-xl">✨</span>
          <span className="text-xl">🌿</span>
          <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[#F5C242]/80 to-[#F5C242]" />
        </div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.6 }}
          className="max-w-md text-pretty text-sm leading-relaxed text-slate-600 sm:text-base"
        >
          {config.content.revealSubtext}
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="relative z-10 mt-10"
      >
        <button
          type="button"
          onClick={onContinue}
          className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-blue-500 to-sky-400 px-7 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          The Journey 📚
        </button>
      </motion.div>
    </ScreenShell>
  )
}