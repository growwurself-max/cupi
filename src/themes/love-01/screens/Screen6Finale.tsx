import { AnimatePresence, motion } from 'framer-motion'
import { RotateCcw, WandSparkles } from 'lucide-react'
import { useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { fireContinuousSparkle } from '../../../utils/confetti'
import { ScreenShell } from '../../shared/ScreenShell'
import { FloatingEmojis } from '../../shared/FloatingEmojis'

interface FinaleScreenProps {
  config: ExperienceConfig
  onReplay: () => void
  onExit: () => void
  onTap: () => void
}

export function FinaleScreen({
  config,
  onReplay,
  onExit,
  onTap,
}: FinaleScreenProps) {
  const [opened, setOpened] = useState(false)

  const open = () => {
    if (opened) return
    setOpened(true)
    onTap()
    fireContinuousSparkle(1400)
  }

  return (
    <ScreenShell>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_70%,rgba(255,155,179,0.16),transparent_55%)]"
      />
      <FloatingEmojis emojis={['💗', '💖', '✨']} count={12} />

      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-xs font-bold tracking-[0.3em] uppercase"
        style={{ color: config.branding.accentColor }}
      >
        One last thing
      </motion.p>

      <motion.button
        type="button"
        onClick={open}
        aria-label="Open your heart"
        whileTap={{ scale: 0.85 }}
        className="relative z-20 mt-10 outline-none"
      >
        <motion.div
          animate={{ scale: opened ? [1, 1.3, 3.2] : [1, 1.12, 1] }}
          transition={
            opened
              ? { duration: 1.4, times: [0, 0.3, 1], ease: 'easeOut' }
              : { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }
          }
          className="glass-panel flex h-40 w-40 items-center justify-center rounded-full text-7xl"
        >
          <span style={{ filter: `drop-shadow(0 0 24px ${config.branding.accentColor}66)` }}>
            {opened ? '💖' : '🫀'}
          </span>
        </motion.div>
      </motion.button>

      <motion.p
        animate={opened ? { opacity: 0 } : { opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="mt-7 max-w-sm text-center text-sm font-semibold text-white/70"
      >
        {opened ? 'That’s my whole heart. ✨' : 'Go on… tap the heart 🤍'}
      </motion.p>

      <AnimatePresence>
        {opened && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.25, duration: 0.7, type: 'spring', stiffness: 90 }}
            className="relative z-10 mt-12 flex flex-col items-center gap-6 pb-6 text-center"
          >
            <motion.h2
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 130 }}
              className="font-display text-balance text-4xl font-bold sm:text-5xl md:text-6xl"
            >
              <span className="text-shimmer animate-shimmer">
                {config.content.finalMessage}
              </span>
            </motion.h2>
            <p className="max-w-md text-pretty text-white/65">
              {config.content.finalCelebration}
            </p>
            <p className="text-lg text-white/45">
              — {config.sender.name}{' '}
              <span style={{ color: config.branding.accentColor }}>♥</span>
            </p>

            <div className="mt-2 flex flex-col items-center gap-4 pb-2 sm:flex-row">
              <button
                type="button"
                onClick={onReplay}
                className="glass-panel glow-primary flex min-h-14 items-center gap-2.5 rounded-full px-7 text-base font-bold text-white transition-transform duration-200 hover:scale-[1.04] active:scale-95"
              >
                <RotateCcw className="h-5 w-5 text-rose-gold" />
                Replay Experience 🔁
              </button>
              <button
                type="button"
                onClick={onExit}
                className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-[#ff9bb3] via-[#f6c6b6] to-[#8f7bff] px-7 text-base font-bold text-obsidian-900 shadow-lg transition-transform duration-200 hover:scale-[1.04] active:scale-95"
              >
                <WandSparkles className="h-5 w-5" />
                Create a Surprise for Someone Else
              </button>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-2 text-xs font-semibold tracking-[0.2em] text-white/35 uppercase"
            >
              Crafted with ♥ by Cupi
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </ScreenShell>
  )
}