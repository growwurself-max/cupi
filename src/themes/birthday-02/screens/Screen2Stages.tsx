import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight, Lightbulb } from 'lucide-react'
import { useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { ScreenShell } from '../../shared/ScreenShell'

const STAGES = [
  { label: 'Stage I', title: 'The Teaser', emoji: '🎬' },
  { label: 'Stage II', title: 'The Countdown', emoji: '⏳' },
  { label: 'Stage III', title: 'The Reveal', emoji: '🎉' },
]

interface Screen2StagesProps {
  config: ExperienceConfig
  onStage: () => void
  onContinue: () => void
}

export function Screen2Stages({ config, onStage, onContinue }: Screen2StagesProps) {
  const [lit, setLit] = useState<boolean[]>([false, false, false])
  const allLit = lit.every(Boolean)

  const lightUp = (index: number) => {
    if (lit[index]) return
    onStage()
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
        Multi-Stage Reveal
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.6 }}
        className="font-display mt-5 text-balance text-center text-3xl font-black sm:text-5xl"
      >
        <span className="text-gradient-lux">{config.content.suspenseHeading}</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="mt-4 max-w-md text-center text-sm text-amber-100/60"
      >
        {config.content.suspenseSubtext}
      </motion.p>

      <div className="relative z-10 mt-12 grid w-full max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3">
        {STAGES.map((stage, index) => {
          const isLit = lit[index]
          return (
            <motion.button
              key={stage.label}
              type="button"
              onClick={() => lightUp(index)}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.18, type: 'spring', stiffness: 120 }}
              whileTap={{ scale: 0.96 }}
              className={`group relative flex flex-col items-center gap-3 rounded-3xl border p-7 text-center transition-all duration-500 ${
                isLit
                  ? 'border-amber-300/60 bg-amber-400/15 shadow-[0_0_40px_-8px_rgba(245,184,97,0.6)]'
                  : 'border-white/10 bg-white/[0.03] hover:border-amber-200/40'
              }`}
            >
              <span className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black">
                {isLit ? (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex h-full w-full items-center justify-center rounded-full bg-amber-400/30 text-amber-200"
                  >
                    ✓
                  </motion.span>
                ) : (
                  <span className="flex h-full w-full items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/40">
                    {index + 1}
                  </span>
                )}
              </span>
              <motion.span
                animate={
                  isLit
                    ? { scale: [1, 1.25, 1], rotate: [0, -8, 8, 0] }
                    : { scale: 1 }
                }
                transition={
                  isLit
                    ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
                    : {}
                }
                className="text-5xl"
              >
                {stage.emoji}
              </motion.span>
              <span className="text-[10px] font-bold tracking-[0.25em] text-amber-200/60 uppercase">
                {stage.label}
              </span>
              <span
                className={`font-display text-lg font-semibold transition-colors ${
                  isLit ? 'text-amber-100' : 'text-white/50'
                }`}
              >
                {stage.title}
              </span>
              <span className="flex items-center gap-1.5 text-[11px] font-semibold transition-colors">
                {isLit ? (
                  <span className="text-amber-200">Lit ✨</span>
                ) : (
                  <span className="flex items-center gap-1 text-white/40">
                    <Lightbulb className="h-3 w-3" />
                    Tap to light
                  </span>
                )}
              </span>
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence>
        {allLit && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 160, damping: 18 }}
            className="relative z-10 mt-12"
          >
            <motion.button
              type="button"
              onClick={onContinue}
              animate={{ boxShadow: ['0 0 24px -6px rgba(245,184,97,0.5)', '0 0 48px -6px rgba(245,184,97,0.9)', '0 0 24px -6px rgba(245,184,97,0.5)'] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-amber-400 via-rose-400 to-pink-500 px-9 text-base font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.04] active:scale-95"
            >
              All stages lit — open the letter
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </ScreenShell>
  )
}