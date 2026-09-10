import { motion } from 'framer-motion'
import { PartyPopper } from 'lucide-react'
import type { ExperienceConfig } from '../../../types/experience'
import { ScreenShell } from '../../shared/ScreenShell'
import { FloatingEmojis } from '../../shared/FloatingEmojis'

interface TeaserProps {
  config: ExperienceConfig
  onBegin: () => void
}

const AMBIENT = ['🫶', '✨', '🕶️', '🎈']

export function TeaserScreen({ config, onBegin }: TeaserProps) {
  return (
    <ScreenShell>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_32%,rgba(255,138,92,0.16),transparent_55%)]"
      />
      <FloatingEmojis emojis={AMBIENT} count={12} />

      <motion.div
        initial={{ scale: 0, rotate: 12 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 130, damping: 13, delay: 0.1 }}
        className="relative z-10 mb-10"
      >
        <motion.span
          aria-hidden
          animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.85, 0.5] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -inset-6 rounded-full blur-2xl"
          style={{ background: 'radial-gradient(circle, rgba(255,138,92,0.3), transparent 70%)' }}
        />
        <span className="animate-pulse-glow relative flex h-32 w-32 items-center justify-center rounded-full text-6xl shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(92,214,200,0.2), rgba(255,138,92,0.14))',
            border: '1px solid rgba(92,214,200,0.4)',
            backdropFilter: 'blur(16px)',
          }}
        >
          🫶
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.7, ease: 'easeOut' }}
        className="relative z-10 flex max-w-2xl flex-col items-center gap-6 text-center"
      >
        <span
          className="rounded-full border px-4 py-1.5 text-xs font-bold tracking-[0.2em] uppercase"
          style={{ color: config.branding.accentColor, borderColor: 'rgba(255,138,92,0.35)' }}
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
          className="group flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-[#ff8a5c] to-[#5cd6c8] px-8 text-base font-bold text-obsidian-900 transition-transform duration-200 hover:scale-[1.05] active:scale-95"
        >
          <PartyPopper className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
          Join the Ride
        </button>
      </motion.div>
    </ScreenShell>
  )
}