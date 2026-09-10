import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import type { ExperienceConfig } from '../../../types/experience'
import { ScreenShell } from '../../shared/ScreenShell'
import { FloatingEmojis } from '../../shared/FloatingEmojis'

interface TeaserProps {
  config: ExperienceConfig
  onBegin: () => void
}

export function TeaserScreen({ config, onBegin }: TeaserProps) {
  return (
    <ScreenShell>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(245,184,97,0.16),transparent_55%)]"
      />
      <FloatingEmojis emojis={['🕊️', '✨', '🌟']} count={10} />

      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 0.1 }}
        className="relative z-10 mb-10"
      >
        <motion.div
          aria-hidden
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -inset-5 rounded-full blur-2xl"
          style={{ background: 'rgba(245,184,97,0.25)' }}
        />
        <span className="animate-pulse-glow relative flex h-32 w-32 items-center justify-center rounded-full text-6xl shadow-2xl"
          style={{
            background:
              'linear-gradient(135deg, rgba(245,184,97,0.18), rgba(255,233,201,0.08))',
            border: '1px solid rgba(245,184,97,0.35)',
            backdropFilter: 'blur(16px)',
          }}
        >
          🎁
        </span>
        <motion.div
          aria-hidden
          animate={{ rotate: 360 }}
          transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border border-dashed border-amber-200/20"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.7, ease: 'easeOut' }}
        className="relative z-10 flex max-w-2xl flex-col items-center gap-6 text-center"
      >
        <span
          className="rounded-full border border-amber-200/30 px-4 py-1.5 text-xs font-bold tracking-[0.2em] uppercase"
          style={{ color: config.branding.accentColor }}
        >
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
          className="group flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-[#f5b861] to-[#e8924a] px-8 text-base font-bold text-obsidian-900 transition-transform duration-200 hover:scale-[1.05] active:scale-95"
        >
          <Sparkles className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
          Unlock the Box
        </button>
      </motion.div>
    </ScreenShell>
  )
}