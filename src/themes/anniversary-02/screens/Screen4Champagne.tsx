import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { fireGoldenSpark } from '../../../utils/confetti'
import { ScreenShell } from '../../shared/ScreenShell'

interface Screen4ChampagneProps {
  config: ExperienceConfig
  onClink: () => void
  onContinue: () => void
}

export function Screen4Champagne({
  config,
  onClink,
  onContinue,
}: Screen4ChampagneProps) {
  const [popped, setPopped] = useState(false)
  const [clinked, setClinked] = useState(false)

  const pop = () => {
    if (popped) return
    onClink()
    fireGoldenSpark()
    setPopped(true)
  }

  const clink = () => {
    if (clinked) return
    onClink()
    setClinked(true)
  }

  return (
    <ScreenShell className="surface-obsidian">
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-full border border-amber-200/30 bg-white/5 px-4 py-1.5 text-xs font-bold tracking-[0.3em] text-amber-200/80 uppercase"
      >
        Champagne Ritual
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.6 }}
        className="font-display mt-5 text-balance text-center text-3xl font-black sm:text-4xl"
      >
        <span className="text-gradient-lux">To us. To every golden year.</span>
      </motion.h1>

      <AnimatePresence mode="wait">
        {!popped ? (
          <motion.button
            key="bottle"
            type="button"
            onClick={pop}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16, scale: 0.9 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 130 }}
            whileTap={{ scale: 0.93 }}
            className="relative mt-10 flex flex-col items-center gap-5 outline-none"
          >
            <motion.span
              animate={{ rotate: [0, -4, 4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="text-7xl"
            >
              🍾
            </motion.span>
            <span className="flex items-center gap-2 rounded-full border border-amber-200/30 bg-white/5 px-5 py-2 text-sm font-semibold text-amber-200/80">
              Tap the bottle to pop the cork
            </span>
          </motion.button>
        ) : !clinked ? (
          <motion.button
            key="glasses"
            type="button"
            onClick={clink}
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16, scale: 0.94 }}
            transition={{ delay: 0.25, type: 'spring', stiffness: 150 }}
            whileTap={{ scale: 0.95 }}
            className="mt-10 flex flex-col items-center gap-4"
          >
            <motion.div
              initial={{ scale: 0, rotate: -16 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 140 }}
              className="flex items-center gap-10"
            >
              <motion.span
                animate={{ x: [0, 8, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                className="text-6xl"
              >
                🥂
              </motion.span>
              <motion.span
                animate={{ x: [0, -8, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                className="text-6xl"
              >
                🥂
              </motion.span>
            </motion.div>
            <span className="flex items-center gap-2 rounded-full border border-amber-200/30 bg-white/5 px-5 py-2 text-sm font-semibold text-amber-200/80">
              Tap the glasses to clink
            </span>
          </motion.button>
        ) : (
          <motion.div
            key="toast"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 120 }}
            className="mt-10 flex flex-col items-center gap-6 text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="text-6xl"
            >
              🥂✨
            </motion.div>
            <p className="max-w-sm text-amber-100/75">
              The cork flew, the glass rang, and the golden particles are still
              dancing. Exactly how every year should start.
            </p>
            <motion.button
              type="button"
              onClick={onContinue}
              animate={{ boxShadow: ['0 0 24px -6px rgba(245,184,97,0.5)', '0 0 48px -6px rgba(245,184,97,0.9)', '0 0 24px -6px rgba(245,184,97,0.5)'] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-amber-400 via-rose-400 to-pink-500 px-9 text-base font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.04] active:scale-95"
            >
              Read the forever letter
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1 }}
        className="relative z-10 mt-8 text-[11px] font-semibold tracking-[0.25em] text-amber-200/40 uppercase"
      >
        {config.content.revealSubtext}
      </motion.p>
    </ScreenShell>
  )
}