import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { useCallback, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { ScreenShell } from '../../shared/ScreenShell'

const TARGET_YEARS = 9

interface Screen2OdometerProps {
  config: ExperienceConfig
  onRoll: () => void
  onContinue: () => void
}

export function Screen2Odometer({
  config,
  onRoll,
  onContinue,
}: Screen2OdometerProps) {
  const [years, setYears] = useState(1)

  const roll = useCallback(() => {
    setYears((prev) => {
      const next = Math.min(prev + 1, TARGET_YEARS)
      if (next !== prev) onRoll()
      return next
    })
  }, [onRoll])

  const complete = years >= TARGET_YEARS
  const digits = String(years).padStart(2, '0')

  return (
    <ScreenShell className="surface-obsidian">
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-full border border-amber-200/30 bg-white/5 px-4 py-1.5 text-xs font-bold tracking-[0.3em] text-amber-200/80 uppercase"
      >
        Dynamic Odometer
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.6 }}
        className="font-display mt-5 text-balance text-center text-3xl font-black sm:text-4xl"
      >
        <span className="text-gradient-lux">{config.content.suspenseHeading}</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="mt-3 max-w-md text-center text-sm text-amber-100/60"
      >
        {config.content.suspenseSubtext}
      </motion.p>

      <motion.button
        type="button"
        onClick={roll}
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        whileTap={{ scale: 0.95 }}
        className="relative z-10 mt-10 flex flex-col items-center gap-2 outline-none"
        aria-label="Roll the odometer forward one year"
      >
        <span className="text-[10px] font-bold tracking-[0.3em] text-amber-200/50 uppercase">
          Years together
        </span>
        <div className="flex items-center gap-3 rounded-3xl border border-amber-200/30 bg-white/[0.04] px-8 py-4 backdrop-blur-md">
          {digits.split('').map((digit, i) => (
            <span
              key={i}
              className="font-display w-16 text-center text-6xl font-black text-amber-100 drop-shadow-[0_0_20px_rgba(245,184,97,0.5)] sm:text-7xl"
            >
              {digit}
            </span>
          ))}
        </div>
        <span className="mt-1 text-xs font-semibold text-amber-200/70">
          {complete ? 'Every single one. 👑' : 'tap to roll the years'}
        </span>
      </motion.button>

      <div className="relative z-10 mt-8 w-full max-w-xs">
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-400"
            animate={{ width: `${(years / TARGET_YEARS) * 100}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 18 }}
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
              animate={{ boxShadow: ['0 0 24px -6px rgba(245,184,97,0.5)', '0 0 48px -6px rgba(245,184,97,0.9)', '0 0 24px -6px rgba(245,184,97,0.5)'] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-amber-400 via-rose-400 to-pink-500 px-9 text-base font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.04] active:scale-95"
            >
              Flip the nostalgia reel
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </ScreenShell>
  )
}