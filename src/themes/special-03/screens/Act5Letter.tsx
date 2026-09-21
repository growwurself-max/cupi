import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { ScreenShell } from '../../shared/ScreenShell'

interface Act5LetterProps {
  config: ExperienceConfig
  onOpen: () => void
  onContinue: () => void
}

export function Act5Letter({ config, onOpen, onContinue }: Act5LetterProps) {
  const [phase, setPhase] = useState<'sealed' | 'breaking' | 'open'>('sealed')

  const unseal = () => {
    if (phase !== 'sealed') return
    onOpen()
    setPhase('breaking')
    setTimeout(() => setPhase('open'), 900)
    setTimeout(onContinue, 4800)
  }

  return (
    <ScreenShell className="bg-[#FCF1ED] py-24">
      <AnimatePresence mode="wait">
        {phase !== 'open' ? (
          <motion.div
            key="envelope"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-10 flex flex-col items-center"
            style={{ perspective: 900 }}
          >
            <motion.div
              animate={{ rotate: [0, -1.2, 0.8, 0] }}
              transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut' }}
              className="relative"
            >
            <button
              type="button"
              onClick={unseal}
              className="relative outline-none"
              aria-label="Tap the wax seal"
            >
              <div className="relative h-44 w-64 sm:h-48 sm:w-72" style={{ transformStyle: 'preserve-3d' }}>
                <div className="absolute inset-x-0 bottom-0 h-32 rounded-md bg-gradient-to-b from-[#F5E6C8] to-[#E8D4A8] shadow-lg ring-1 ring-[#D4AF37]/40" />
                <div className="absolute inset-x-0 bottom-0 h-32 overflow-hidden rounded-md">
                  <div className="absolute inset-x-4 bottom-3 h-24 rounded-sm bg-[#FFF9F0]/90 shadow-inner" />
                </div>
                <motion.div
                  animate={phase === 'breaking' ? { rotateX: -150 } : { rotateX: 0 }}
                  transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1], delay: phase === 'breaking' ? 0.12 : 0 }}
                  style={{ transformOrigin: '50% 0%', transformStyle: 'preserve-3d' }}
                  className="absolute inset-x-0 top-8 h-24 origin-top bg-gradient-to-b from-[#EDE0C4] to-[#F5E6C8] shadow-md"
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      clipPath: 'polygon(0 0, 50% 55%, 100% 0)',
                      background: 'linear-gradient(180deg, #EDE0C4, #E5D5B5)',
                    }}
                  />
                </motion.div>

                {phase === 'breaking' && (
                  <motion.div
                    initial={{ y: 70, opacity: 0, scale: 0.9 }}
                    animate={{ y: 12, opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-x-5 -bottom-1 h-24 rounded-sm bg-gradient-to-b from-[#FFFDF6] to-[#FFF4E2] shadow-[0_-6px_16px_rgba(120,80,40,0.18)]"
                  >
                    <p className="px-4 pt-3 font-serif text-[11px] leading-snug text-amber-900/80 italic">
                      {config.content.letterIntro}
                    </p>
                  </motion.div>
                )}

                <motion.button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    unseal()
                  }}
                  animate={
                    phase === 'breaking'
                      ? { scale: 1.6, opacity: 0, rotate: 24 }
                      : { scale: 1, opacity: 1, rotate: 0 }
                  }
                  transition={{ duration: 0.45 }}
                  className="absolute left-1/2 top-[4.5rem] z-20 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-gradient-to-br from-[#B91C1C] to-[#991B1B] shadow-lg ring-2 ring-[#FDE68A]/80"
                >
                  <span className="font-serif text-sm text-[#FDE68A]">♥</span>
                </motion.button>

                {phase === 'breaking' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    className="pointer-events-none absolute left-1/2 top-[4.5rem] -translate-x-1/2"
                  >
                    {['✨', '💫', '✨'].map((s, i) => (
                      <motion.span
                        key={i}
                        animate={{ x: (i - 1) * 22, y: -18 - i * 8, opacity: 0 }}
                        className="absolute text-sm"
                      >
                        {s}
                      </motion.span>
                    ))}
                  </motion.div>
                )}
              </div>
            </button>
            <p className="mt-5 text-center text-sm font-semibold text-amber-900/70">
              Tap the wax seal to open
            </p>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="letter"
            initial={{ opacity: 0, y: 96, scale: 0.94, rotate: 1 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
            transition={{ duration: 1.25, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
            className="relative z-10 w-full max-w-md rounded-lg border border-amber-200/80 bg-[#FFF9F0] p-6 shadow-[0_28px_60px_-24px_rgba(120,80,40,0.45)]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(transparent, transparent 27px, rgba(180,140,90,0.08) 28px)',
            }}
          >
            <span className="absolute -top-2 -right-2 text-xl" aria-hidden>
              ✨
            </span>
            <span className="absolute -bottom-1 -left-2 text-lg" aria-hidden>
              💕
            </span>
            <p className="font-serif text-lg font-bold text-amber-950">{config.content.letterIntro}</p>
            <div className="mt-4 space-y-3 font-serif text-sm leading-relaxed text-stone-700 italic">
              {(config.content.letterLines ?? []).map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            <p className="mt-6 text-right text-sm font-semibold text-amber-900/80">
              {config.content.letterSignoff} {config.sender.name}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </ScreenShell>
  )
}
