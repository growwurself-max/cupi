import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { ScreenShell } from '../../shared/ScreenShell'

const PROMISES = [
  { title: 'I promise the real me', emoji: '🌟' },
  { title: 'I promise the boring Tuesdays', emoji: '🏡' },
  { title: 'I promise forever heights', emoji: '🏔️' },
]

interface Screen3PromiseProps {
  config: ExperienceConfig
  onVow: () => void
  onContinue: () => void
}

export function Screen3Promise({ config, onVow, onContinue }: Screen3PromiseProps) {
  const [lit, setLit] = useState<boolean[]>([false, false, false])
  const allLit = lit.every(Boolean)

  const light = (index: number) => {
    if (lit[index]) return
    onVow()
    setLit((prev) => prev.map((value, i) => (i === index ? true : value)))
  }

  return (
    <ScreenShell className="surface-obsidian">
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-full border border-amber-200/30 bg-white/5 px-4 py-1.5 text-xs font-bold tracking-[0.3em] text-amber-200/80 uppercase"
      >
        Forever Promise
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.6 }}
        className="font-display mt-5 text-balance text-center text-3xl font-black sm:text-4xl"
      >
        <span className="text-gradient-lux">Three promises, lit one by one</span>
      </motion.h1>

      <div className="relative z-10 mt-12 grid w-full max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3">
        {PROMISES.map((promise, index) => {
          const isLit = lit[index]
          return (
            <motion.button
              key={promise.title}
              type="button"
              onClick={() => light(index)}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.18, type: 'spring', stiffness: 120 }}
              whileTap={{ scale: 0.95 }}
              className={`group relative flex flex-col items-center gap-4 rounded-3xl border p-8 text-center transition-all duration-500 ${
                isLit
                  ? 'border-amber-300/60 bg-amber-400/15 shadow-[0_0_40px_-8px_rgba(245,184,97,0.6)]'
                  : 'border-white/10 bg-white/[0.03] hover:border-amber-200/40'
              }`}
            >
              <motion.span
                animate={isLit ? { scale: [1, 1.3, 1], rotate: [0, -10, 10, 0] } : { scale: 1 }}
                transition={isLit ? { duration: 1.4, repeat: Infinity, ease: 'easeInOut' } : {}}
                className="text-5xl"
              >
                {promise.emoji}
              </motion.span>
              <span
                className={`font-display text-base font-semibold transition-colors ${
                  isLit ? 'text-amber-100' : 'text-white/50'
                }`}
              >
                {promise.title}
              </span>
              <span
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold tracking-wider uppercase transition-colors ${
                  isLit ? 'bg-amber-400/25 text-amber-200' : 'bg-white/5 text-white/40'
                }`}
              >
                {isLit ? 'Promise kept ✨' : 'Tap to promise'}
              </span>
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence>
        {allLit && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 160, damping: 18 }}
            className="relative z-10 mt-12 flex flex-col items-center gap-4"
          >
            <p className="max-w-md text-center text-sm text-amber-100/70">
              {config.content.suspenseHeading}
            </p>
            <motion.button
              type="button"
              onClick={onContinue}
              animate={{ boxShadow: ['0 0 24px -6px rgba(245,184,97,0.5)', '0 0 48px -6px rgba(245,184,97,0.9)', '0 0 24px -6px rgba(245,184,97,0.5)'] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-amber-400 via-rose-400 to-pink-500 px-9 text-base font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.04] active:scale-95"
            >
              Ask the question
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </ScreenShell>
  )
}