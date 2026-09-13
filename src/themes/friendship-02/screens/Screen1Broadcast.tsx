import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import type { ExperienceConfig } from '../../../types/experience'
import { FloatingEmojis } from '../../shared/FloatingEmojis'
import { ScreenShell } from '../../shared/ScreenShell'

interface Screen1BroadcastProps {
  config: ExperienceConfig
  onBegin: () => void
}

export function Screen1Broadcast({ config, onBegin }: Screen1BroadcastProps) {
  return (
    <ScreenShell className="surface-obsidian">
      <FloatingEmojis emojis={['🍕', '🤪', '✨', '💖', '🎉']} count={12} />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 0.1 }}
        className="relative mb-10"
      >
        <motion.div
          aria-hidden
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.65, 0.3] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -inset-6 rounded-full bg-orange-400/20 blur-2xl"
        />
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            className="absolute -inset-4 rounded-full border-2 border-dashed border-orange-300/50"
          />
          <span className="relative flex h-32 w-32 items-center justify-center rounded-full border border-orange-200/40 bg-white/10 text-6xl backdrop-blur-md">
            📡
          </span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.7, ease: 'easeOut' }}
        className="relative z-10 flex max-w-2xl flex-col items-center gap-6 text-center"
      >
        <motion.span
          animate={{ opacity: [0.55, 1, 0.55], scale: [1, 1.05, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="rounded-full border border-red-400/50 bg-red-500/15 px-5 py-1.5 text-xs font-black tracking-[0.25em] text-red-300 uppercase"
        >
          ● On air
        </motion.span>
        <h1 className="font-display text-balance text-4xl font-black uppercase sm:text-6xl">
          <motion.span
            className="block"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="text-gradient-lux">{config.content.teaserHeading}</span>
          </motion.span>
        </h1>
        <p className="max-w-md text-pretty text-sm leading-relaxed text-orange-100/65 sm:text-base">
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
          animate={{ boxShadow: ['0 0 24px -6px rgba(255,138,92,0.5)', '0 0 52px -6px rgba(255,138,92,0.85)', '0 0 24px -6px rgba(255,138,92,0.5)'] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 px-9 text-base font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.04] active:scale-95"
        >
          <Play className="h-5 w-5 fill-current" />
          Open the Broadcast
        </motion.button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.3, 0.65, 0.3] }}
        transition={{ delay: 1.2, duration: 2.2, repeat: Infinity }}
        className="relative z-10 mt-8 text-[11px] font-semibold tracking-[0.25em] text-orange-200/40 uppercase"
      >
        {config.branding.themeLabel}
      </motion.p>
    </ScreenShell>
  )
}