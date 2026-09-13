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
        className="animate-float-slow pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-35 blur-3xl"
        style={{
          background: `radial-gradient(circle, ${config.branding.accentColor}55 0%, ${config.branding.accentSecondary}44 45%, transparent 70%)`,
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
          className="absolute -inset-5 rounded-full bg-rose-gold/25 blur-2xl"
        />
        <span className="glass-panel animate-pulse-glow relative flex h-32 w-32 items-center justify-center rounded-full text-6xl shadow-2xl">
          {config.branding.emojiPrimary}
        </span>
        <motion.div
          aria-hidden
          animate={{ rotate: 360 }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border border-dashed border-white/10"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.7, ease: 'easeOut' }}
        className="relative z-10 flex max-w-2xl flex-col items-center gap-6 text-center"
      >
        <span className="glass-panel rounded-full px-4 py-1.5 text-xs font-bold tracking-[0.2em] text-rose-gold uppercase">
          {config.branding.themeLabel}
        </span>
        <h1 className="font-display text-balance text-4xl font-semibold text-white sm:text-5xl">
          {config.content.teaserHeading}
        </h1>
        <p className="max-w-md text-pretty text-sm leading-relaxed text-white/60 sm:text-base">
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
          className="glow-primary group flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-rose-gold to-soft-violet px-8 text-base font-bold text-obsidian-900 transition-transform duration-200 hover:scale-[1.05] active:scale-95"
        >
          <Sparkles className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
          Open My Surprise ✨
        </button>
      </motion.div>
    </ScreenShell>
  )
}