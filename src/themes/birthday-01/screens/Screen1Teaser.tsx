import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import type { ExperienceConfig } from '../../../types/experience'
import { FloatingParticles } from '../../shared/FloatingParticles'
import { ScreenShell } from '../../shared/ScreenShell'

interface Screen1TeaserProps {
  config: ExperienceConfig
  onBegin: () => void
}

export function Screen1Teaser({ config, onBegin }: Screen1TeaserProps) {
  return (
    <ScreenShell>
      <FloatingParticles
        type="heart-petals"
        colors={[config.branding.accentColor, config.branding.accentSecondary]}
      />
      <div
        aria-hidden
        className="animate-float-slow pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(251,113,133,0.28) 0%, rgba(244,114,182,0.22) 45%, transparent 70%)',
        }}
      />

      {/* Ambient pulsing sphere */}
      <motion.div
        initial={{ scale: 0, rotate: -12 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 0.1 }}
        className="relative z-10 mb-10"
      >
        <motion.div
          aria-hidden
          animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -inset-5 rounded-full bg-pink-300/30 blur-2xl"
        />
        <span className="animate-pulse-glow relative flex h-32 w-32 items-center justify-center rounded-full border-2 border-rose-200 bg-white/80 text-6xl shadow-xl shadow-rose-200/50">
          {config.branding.emojiPrimary}
        </span>
        <motion.div
          aria-hidden
          animate={{ rotate: 360 }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border border-dashed border-rose-300/60"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.7, ease: 'easeOut' }}
        className="relative z-10 flex max-w-2xl flex-col items-center gap-6 text-center"
      >
        <span className="rounded-full border border-rose-200 bg-white/80 px-4 py-1.5 text-xs font-bold tracking-[0.2em] text-rose-800 uppercase shadow-sm">
          {config.branding.themeLabel}
        </span>
        <h1 className="font-serif text-balance text-4xl font-bold italic text-[#881337] sm:text-5xl">
          {config.content.teaserHeading}
        </h1>
        <p className="max-w-md text-pretty text-sm leading-relaxed text-rose-950/70 sm:text-base">
          {config.content.teaserSubtext}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 mt-10"
      >
        <button
          type="button"
          onClick={onBegin}
          className="group flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 px-8 text-base font-semibold text-white shadow-lg shadow-rose-300/50 transition-all duration-200 hover:brightness-105 hover:scale-[1.04] active:scale-95"
        >
          <Sparkles className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
          Open My Surprise ✨
        </button>
      </motion.div>
    </ScreenShell>
  )
}