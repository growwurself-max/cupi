import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import type { ExperienceConfig } from '../../../types/experience'
import { ScreenShell } from '../../shared/ScreenShell'

const STATS = [
  { emoji: '📚', value: '4', label: 'all-nighters survived' },
  { emoji: '🏆', value: '∞', label: 'impossible re-drafts' },
  { emoji: '👩‍🎓', value: '10', label: 'cap toss rating' },
  { emoji: '💸', value: '₹0', label: 'tuition for future me' },
]

interface Screen1HonorRollProps {
  config: ExperienceConfig
  onBegin: () => void
}

export function Screen1HonorRoll({ config, onBegin }: Screen1HonorRollProps) {
  return (
    <ScreenShell className="surface-obsidian">
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 130, damping: 14, delay: 0.1 }}
        className="relative mb-10"
      >
        <motion.div
          aria-hidden
          animate={{ scale: [1, 1.3, 1], opacity: [0.25, 0.6, 0.25] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -inset-6 rounded-full bg-emerald-400/20 blur-2xl"
        />
        <motion.span
          animate={{ y: [0, -10, 0], rotate: [0, -6, 6, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="relative flex h-32 w-32 items-center justify-center rounded-full border border-emerald-200/40 bg-white/10 text-6xl backdrop-blur-md"
        >
          {config.branding.emojiPrimary}
        </motion.span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.7, ease: 'easeOut' }}
        className="relative z-10 flex max-w-2xl flex-col items-center gap-6 text-center"
      >
        <span className="rounded-full border border-emerald-200/40 bg-white/5 px-4 py-1.5 text-xs font-bold tracking-[0.25em] text-emerald-200/80 uppercase">
          Honor Roll Stats
        </span>
        <h1 className="font-display text-balance text-4xl font-black sm:text-6xl">
          <span className="text-gradient-lux">{config.content.teaserHeading}</span>
        </h1>
        <p className="max-w-md text-pretty text-sm leading-relaxed text-slate-100/60 sm:text-base">
          {config.content.teaserSubtext}
        </p>
      </motion.div>

      <div className="relative z-10 mt-10 grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
        {STATS.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.12, duration: 0.5 }}
            className="flex flex-col items-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-5 backdrop-blur-md"
          >
            <span className="text-2xl">{stat.emoji}</span>
            <span className="font-display text-3xl font-black text-amber-200">
              {stat.value}
            </span>
            <span className="text-center text-[11px] font-semibold text-white/50 uppercase tracking-wider">
              {stat.label}
            </span>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 mt-10"
      >
        <motion.button
          type="button"
          onClick={onBegin}
          animate={{ boxShadow: ['0 0 24px -6px rgba(224,178,75,0.5)', '0 0 52px -6px rgba(224,178,75,0.85)', '0 0 24px -6px rgba(224,178,75,0.5)'] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-500 to-emerald-400 px-9 text-base font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.04] active:scale-95"
        >
          <Play className="h-5 w-5 fill-current" />
          Start the Ceremony
        </motion.button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.45 }}
        transition={{ delay: 1.1 }}
        className="relative z-10 mt-8 text-[11px] font-semibold tracking-[0.25em] text-emerald-200/40 uppercase"
      >
        {config.branding.themeLabel}
      </motion.p>
    </ScreenShell>
  )
}