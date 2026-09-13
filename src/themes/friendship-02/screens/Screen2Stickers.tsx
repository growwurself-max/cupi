import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { ScreenShell } from '../../shared/ScreenShell'

const STICKER_CLUSTERS = [
  { emoji: '🍕', label: 'pizza' },
  { emoji: '🤪', label: 'chaos' },
  { emoji: '✨', label: 'sparkle' },
  { emoji: '💖', label: 'bestie' },
  { emoji: '🎉', label: 'party' },
  { emoji: '💛', label: 'gold' },
]

const SPLAT_POSITIONS = [
  { x: '-20%', y: '-30%', rotate: -18 },
  { x: '120%', y: '-22%', rotate: 16 },
  { x: '-34%', y: '28%', rotate: 22 },
  { x: '128%', y: '24%', rotate: -14 },
  { x: '0%', y: '120%', rotate: 10 },
  { x: '96%', y: '104%', rotate: -20 },
  { x: '-14%', y: '88%', rotate: 8 },
  { x: '40%', y: '-38%', rotate: -6 },
]

interface Screen2StickersProps {
  config: ExperienceConfig
  onSplat: () => void
  onContinue: () => void
}

export function Screen2Stickers({
  config,
  onSplat,
  onContinue,
}: Screen2StickersProps) {
  const [exploded, setExploded] = useState(false)

  const explode = () => {
    if (exploded) return
    onSplat()
    setExploded(true)
  }

  return (
    <ScreenShell className="surface-obsidian">
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-full border border-orange-200/30 bg-white/5 px-4 py-1.5 text-xs font-bold tracking-[0.3em] text-orange-200/80 uppercase"
      >
        Sticker Explosion
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.6 }}
        className="font-display mt-5 text-balance text-center text-3xl font-black sm:text-4xl"
      >
        <span className="text-gradient-lux">{config.content.suspenseHeading}</span>
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.6 }}
        className="relative z-10 mt-14 flex flex-col items-center"
      >
        <AnimatePresence mode="wait">
          {!exploded ? (
            <motion.button
              key="pile"
              type="button"
              onClick={explode}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ opacity: 0, scale: 1.6 }}
              transition={{ type: 'spring', stiffness: 160, damping: 12 }}
              whileTap={{ scale: 0.9 }}
              className="relative flex h-44 w-44 flex-col items-center justify-center gap-2 rounded-[2rem] border border-orange-200/30 bg-white/[0.04] backdrop-blur-md"
              aria-label="Tap to explode the sticker pile"
            >
              <motion.span
                animate={{ rotate: [0, -6, 6, 0], y: [0, -5, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                className="text-7xl"
              >
                😱
              </motion.span>
              <span className="text-sm font-semibold text-orange-200/80">
                PILE OF EMOTIONS — tap it
              </span>
            </motion.button>
          ) : (
            <motion.div
              key="splat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="relative flex h-44 w-44 items-center justify-center"
            >
              {STICKER_CLUSTERS.map((sticker, i) => {
                const position = SPLAT_POSITIONS[i % SPLAT_POSITIONS.length]
                return (
                  <motion.span
                    key={sticker.label}
                    initial={{ scale: 0.2, opacity: 0, x: 0, y: 0, rotate: 0 }}
                    animate={{
                      scale: 1.6,
                      opacity: 1,
                      x: position.x,
                      y: position.y,
                      rotate: position.rotate,
                    }}
                    transition={{
                      delay: i * 0.08,
                      type: 'spring',
                      stiffness: 220,
                      damping: 13,
                    }}
                    className="absolute text-3xl drop-shadow-[0_0_16px_rgba(255,138,92,0.6)]"
                  >
                    {sticker.emoji}
                  </motion.span>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {exploded && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 160, damping: 18 }}
            className="relative z-10 mt-14 flex flex-col items-center gap-5"
          >
            <p className="max-w-sm text-center text-sm text-orange-100/70">
              Stickers everywhere. Emotional damage: repaired. This is the
              friendship equivalent of a hug.
            </p>
            <motion.button
              type="button"
              onClick={onContinue}
              animate={{ boxShadow: ['0 0 24px -6px rgba(255,138,92,0.5)', '0 0 48px -6px rgba(255,138,92,0.9)', '0 0 24px -6px rgba(255,138,92,0.5)'] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 px-9 text-base font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.04] active:scale-95"
            >
              Super High-Five time
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </ScreenShell>
  )
}