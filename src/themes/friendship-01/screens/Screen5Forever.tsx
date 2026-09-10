import { motion } from 'framer-motion'
import { RotateCcw, WandSparkles } from 'lucide-react'
import { useEffect } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { fireGrandBurst } from '../../../utils/confetti'
import { ScreenShell } from '../../shared/ScreenShell'
import { LetterCard } from '../../shared/LetterCard'
import { FloatingEmojis } from '../../shared/FloatingEmojis'

interface ForeverScreenProps {
  config: ExperienceConfig
  onReplay: () => void
  onExit: () => void
}

export function ForeverScreen({ config, onReplay, onExit }: ForeverScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => fireGrandBurst(), 400)
    return () => clearTimeout(timer)
  }, [])

  return (
    <ScreenShell className="justify-start pt-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(92,214,200,0.14),transparent_45%)]"
      />
      <FloatingEmojis emojis={['🫶', '🎈', '✨', '🍀']} count={11} />

      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-xs font-bold tracking-[0.35em] uppercase"
        style={{ color: config.branding.accentColor }}
      >
        Group pledge accepted
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

      <div className="relative z-10 mt-10 w-full max-w-xl">
        <LetterCard
          recipient={config.recipient.name}
          content={config.content}
          sender={config.sender.name}
          headerEmoji="🫶"
          accent={config.branding.accentColor}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mt-12 flex flex-col items-center gap-4 pb-6 sm:flex-row"
      >
        <button
          type="button"
          onClick={onReplay}
          className="glass-panel glow-primary flex min-h-14 items-center gap-2.5 rounded-full px-7 text-base font-bold text-white transition-transform duration-200 hover:scale-[1.04] active:scale-95"
        >
          <RotateCcw className="h-5 w-5 text-rose-gold" />
          Replay the Chaos 🔁
        </button>
        <button
          type="button"
          onClick={onExit}
          className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-[#ff8a5c] to-[#5cd6c8] px-7 text-base font-bold text-obsidian-900 shadow-lg transition-transform duration-200 hover:scale-[1.04] active:scale-95"
        >
          <WandSparkles className="h-5 w-5" />
          Surprise Your Squad
        </button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="mt-4 text-xs font-semibold tracking-[0.2em] text-white/35 uppercase"
      >
        Crafted with ♥ by Cupi
      </motion.p>
    </ScreenShell>
  )
}