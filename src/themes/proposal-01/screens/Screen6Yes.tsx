import { motion } from 'framer-motion'
import { RotateCcw, WandSparkles } from 'lucide-react'
import type { ExperienceConfig } from '../../../types/experience'
import { ScreenShell } from '../../shared/ScreenShell'
import { FloatingEmojis } from '../../shared/FloatingEmojis'

interface YesScreenProps {
  config: ExperienceConfig
  onReplay: () => void
  onExit: () => void
}

export function YesScreen({ config, onReplay, onExit }: YesScreenProps) {
  return (
    <ScreenShell>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,155,179,0.16),transparent_55%)]"
      />
      <FloatingEmojis emojis={['💞', '💍', '🥂', '✨']} count={12} />

      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-xs font-bold tracking-[0.35em] uppercase"
        style={{ color: config.branding.accentColor }}
      >
        {config.recipient.name}, this one’s official
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, scale: 0.7, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 110, damping: 15 }}
        className="font-display mt-4 text-center text-6xl font-black sm:text-7xl md:text-8xl"
      >
        <span className="text-shimmer animate-shimmer">{config.content.finalMessage}</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-6 max-w-md text-pretty text-center text-white/65"
      >
        {config.content.finalCelebration}
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="mt-8 text-lg text-white/45"
      >
        — Yours, {config.sender.name}{' '}
        <span style={{ color: config.branding.accentColor }}>💍</span>
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
        className="relative z-10 mt-12 flex flex-col items-center gap-4 pb-6 sm:flex-row"
      >
        <button
          type="button"
          onClick={onReplay}
          className="glass-panel glow-primary flex min-h-14 items-center gap-2.5 rounded-full px-7 text-base font-bold text-white transition-transform duration-200 hover:scale-[1.04] active:scale-95"
        >
          <RotateCcw className="h-5 w-5 text-rose-gold" />
          Relive the Question 🔁
        </button>
        <button
          type="button"
          onClick={onExit}
          className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-[#ffb3ba] via-[#e0b3f2] to-[#c9b8ff] px-7 text-base font-bold text-obsidian-900 shadow-lg transition-transform duration-200 hover:scale-[1.04] active:scale-95"
        >
          <WandSparkles className="h-5 w-5" />
          Plan a Surprise for Someone
        </button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="mt-4 text-xs font-semibold tracking-[0.2em] text-white/35 uppercase"
      >
        Crafted with ♥ by Cupi
      </motion.p>
    </ScreenShell>
  )
}