import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { fireGoldenRain } from '../../../utils/confetti'
import { FloatingEmojis } from '../../shared/FloatingEmojis'
import { ScreenShell } from '../../shared/ScreenShell'

interface Screen3GoldenConfettiProps {
  config: ExperienceConfig
  onRain: () => void
  onContinue: () => void
}

export function Screen3GoldenConfetti({
  config,
  onRain,
  onContinue,
}: Screen3GoldenConfettiProps) {
  const [rained, setRained] = useState(false)

  const rain = () => {
    if (rained) return
    onRain()
    fireGoldenRain(1500)
    setRained(true)
  }

  return (
    <ScreenShell className="surface-obsidian">
      <FloatingEmojis emojis={['🎊', '✨', '🥳', '🏆']} count={10} />

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-full border border-amber-200/30 bg-white/5 px-4 py-1.5 text-xs font-bold tracking-[0.3em] text-amber-200/80 uppercase"
      >
        Golden Confetti Shower
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.6 }}
        className="font-display mt-5 text-balance text-center text-3xl font-black sm:text-4xl"
      >
        <span className="text-gradient-lux">This one‘s for you. Pull the cord.</span>
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="relative z-10 mt-12 flex flex-col items-center gap-8"
      >
        <motion.button
          type="button"
          onClick={rain}
          whileTap={{ scale: 0.92 }}
          animate={rained ? { scale: [1, 1.06, 1] } : { scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative flex h-40 w-40 flex-col items-center justify-center gap-3 rounded-full border border-amber-200/50 bg-gradient-to-br from-amber-400/30 to-yellow-600/20 shadow-[0_0_50px_-8px_rgba(224,178,75,0.7)] backdrop-blur-md"
          aria-label="Pull the cord to release the confetti cannon"
        >
          <motion.span
            animate={rained ? { rotate: [0, -18, 14, 0], scale: [1, 1.3, 1] } : { rotate: [0, -5, 5, 0] }}
            transition={
              rained
                ? { duration: 0.9, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
            }
            className="text-7xl"
          >
            🎊
          </motion.span>
          <span className="text-xs font-bold tracking-widest text-amber-200/80 uppercase">
            {rained ? 'confetti deployed' : 'pull the cord ↓'}
          </span>
        </motion.button>

        <AnimatePresence>
          {rained && (
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 150 }}
              className="flex flex-col items-center gap-5 text-center"
            >
              <p className="max-w-sm text-sm text-amber-100/70">
                Golden shower complete. {config.recipient.name}, the confetti is
                legally yours now. We hold the receipt.
              </p>
              <motion.button
                type="button"
                onClick={onContinue}
                animate={{ boxShadow: ['0 0 24px -6px rgba(224,178,75,0.5)', '0 0 48px -6px rgba(224,178,75,0.9)', '0 0 24px -6px rgba(224,178,75,0.5)'] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-500 to-emerald-400 px-9 text-base font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.04] active:scale-95"
              >
                Read the mentor note
                <ChevronRight className="h-5 w-5" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </ScreenShell>
  )
}