import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import type { ExperienceConfig } from '../../../types/experience'
import { FloatingParticles } from '../../shared/FloatingParticles'
import { ScreenShell } from '../../shared/ScreenShell'

interface Screen1RomanticScoreProps {
  config: ExperienceConfig
  onBegin: () => void
}

export function Screen1RomanticScore({ config, onBegin }: Screen1RomanticScoreProps) {
  return (
    <ScreenShell className="surface-obsidian">
      <FloatingParticles type="star-dust" count={24} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(167,139,250,0.18),transparent_58%)]"
      />

      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 0.1 }}
        className="relative mb-10"
      >
        <motion.div
          aria-hidden
          animate={{ scale: [1, 1.28, 1], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -inset-6 rounded-full bg-violet-400/20 blur-2xl"
        />
        <span className="glow-violet relative flex h-32 w-32 items-center justify-center rounded-full border border-violet-300/40 bg-white/10 text-6xl backdrop-blur-md">
          {config.branding.emojiPrimary}
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.7, ease: 'easeOut' }}
        className="relative z-10 flex max-w-2xl flex-col items-center gap-6 text-center"
      >
        <span className="rounded-full border border-violet-200/40 bg-white/5 px-4 py-1.5 text-xs font-bold tracking-[0.25em] text-violet-200/80 uppercase">
          {config.branding.themeLabel}
        </span>
        <h1 className="font-display text-balance text-4xl font-black sm:text-6xl">
          <span className="text-gradient-lux">{config.content.teaserHeading}</span>
        </h1>
        <p className="max-w-md text-pretty text-sm leading-relaxed text-violet-100/60 sm:text-base">
          {config.content.teaserSubtext}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 mt-10"
      >
        <motion.button
          type="button"
          onClick={onBegin}
          animate={{ boxShadow: ['0 0 24px -6px rgba(167,139,250,0.5)', '0 0 52px -6px rgba(167,139,250,0.85)', '0 0 24px -6px rgba(167,139,250,0.5)'] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 px-9 text-base font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.04] active:scale-95"
        >
          <Play className="h-5 w-5 fill-current" />
          Press Play — Draw The Stars
        </motion.button>
      </motion.div>
    </ScreenShell>
  )
}