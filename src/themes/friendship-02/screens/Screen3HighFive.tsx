import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { useCallback, useState } from 'react'
import { fireSideCannons } from '../../../utils/confetti'
import { FloatingEmojis } from '../../shared/FloatingEmojis'
import { ScreenShell } from '../../shared/ScreenShell'

const TARGET_HIGH_FIVES = 10

interface Screen3HighFiveProps {
  onFive: () => void
  onContinue: () => void
}

export function Screen3HighFive({ onFive, onContinue }: Screen3HighFiveProps) {
  const [count, setCount] = useState(0)

  const highFive = useCallback(() => {
    setCount((prev) => {
      const next = Math.min(prev + 1, TARGET_HIGH_FIVES)
      if (next === prev) return prev
      onFive()
      if (next === TARGET_HIGH_FIVES) fireSideCannons()
      return next
    })
  }, [onFive])

  const complete = count >= TARGET_HIGH_FIVES
  const progress = (count / TARGET_HIGH_FIVES) * 100

  return (
    <ScreenShell className="surface-obsidian">
      <FloatingEmojis emojis={['✋', '💥', '✨']} count={8} />

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-full border border-orange-200/30 bg-white/5 px-4 py-1.5 text-xs font-bold tracking-[0.3em] text-orange-200/80 uppercase"
      >
        Super High-Five
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.6 }}
        className="font-display mt-5 text-balance text-center text-3xl font-black sm:text-4xl"
      >
        <span className="text-gradient-lux">Hit {TARGET_HIGH_FIVES} high-fives</span>
      </motion.h1>

      <motion.button
        type="button"
        onClick={highFive}
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        whileTap={{ scale: 0.9 }}
        className="relative z-10 mt-12 flex flex-col items-center gap-4 outline-none"
        aria-label="Give a super high-five"
      >
        <motion.span
          animate={complete ? { rotate: [0, -14, 14, 0], scale: [1, 1.15, 1] } : { rotate: [0, -6, 6, 0] }}
          transition={
            complete
              ? { duration: 1, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }
          }
          className="flex h-36 w-36 items-center justify-center rounded-full border border-orange-200/50 bg-white/[0.06] text-7xl backdrop-blur-md"
        >
          ✋
        </motion.span>
        <span className="text-sm font-semibold text-orange-200/80">
          {complete
            ? 'Super-high-five achieved! 🎉'
            : 'tap the hand — besties never miss'}
        </span>
      </motion.button>

      {/* Counter */}
      <div className="relative z-10 mt-8 flex w-full max-w-xs flex-col items-center gap-3">
        <div className="flex items-baseline gap-1">
          <motion.span
            key={count}
            initial={{ scale: 1.5, color: '#ffd98a' }}
            animate={{ scale: 1, color: '#ffefd6' }}
            transition={{ duration: 0.25 }}
            className="font-display text-6xl font-black"
          >
            {count}
          </motion.span>
          <span className="text-sm font-semibold text-orange-200/60">
            / {TARGET_HIGH_FIVES}
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-orange-400 to-rose-400"
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 140, damping: 18 }}
          />
        </div>
      </div>

      <AnimatePresence>
        {complete && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 160, damping: 18 }}
            className="relative z-10 mt-10"
          >
            <motion.button
              type="button"
              onClick={onContinue}
              animate={{ boxShadow: ['0 0 24px -6px rgba(255,138,92,0.5)', '0 0 48px -6px rgba(255,138,92,0.9)', '0 0 24px -6px rgba(255,138,92,0.5)'] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 px-9 text-base font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.04] active:scale-95"
            >
              Read the bestie letter
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </ScreenShell>
  )
}