import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { FloatingParticles } from '../../shared/FloatingParticles'
import { LightLetterCard } from '../../shared/LightLetterCard'
import { ScreenShell } from '../../shared/ScreenShell'

interface Screen3ExtendedLetterProps {
  config: ExperienceConfig
  onSeal: () => void
  onContinue: () => void
}

export function Screen3ExtendedLetter({
  config,
  onSeal,
  onContinue,
}: Screen3ExtendedLetterProps) {
  const [opened, setOpened] = useState(false)

  const crack = () => {
    if (opened) return
    onSeal()
    setOpened(true)
  }

  return (
    <ScreenShell className="surface-obsidian">
      <FloatingParticles type="gold-sparkles" count={10} />
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-full border border-amber-200/30 bg-white/5 px-4 py-1.5 text-xs font-bold tracking-[0.3em] text-amber-200/80 uppercase"
      >
        Extended Letter
      </motion.p>

      <AnimatePresence mode="wait">
        {!opened ? (
          <motion.div
            key="seal"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -14 }}
            transition={{ duration: 0.45 }}
            className="relative mt-10 flex flex-col items-center text-center"
          >
            <motion.div
              animate={{ rotate: [0, -2, 2, 0], scale: [1, 1.04, 1] }}
              transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
              className="relative rounded-3xl border border-white/10 bg-white/[0.04] p-10 backdrop-blur-md"
            >
              <span className="text-5xl">💌</span>
            </motion.div>
            <button
              type="button"
              onClick={crack}
              className="group mt-8 flex flex-col items-center gap-3"
            >
              <motion.span
                whileHover={{ scale: 1.12, rotate: 4 }}
                whileTap={{ scale: 0.85 }}
                className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 via-amber-400 to-pink-500 text-4xl shadow-[0_0_44px_-6px_rgba(245,184,97,0.8)]"
              >
                💮
              </motion.span>
              <span className="text-sm font-semibold text-amber-200/80">
                Tap the wax seal to break it
              </span>
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="letter"
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 mt-10 flex w-full flex-col items-center"
          >
            <LightLetterCard
              recipient={config.recipient.name}
              content={config.content}
              sender={config.sender.name}
              headerEmoji="🎂"
              accent={config.branding.accentColor}
              accentSecondary={config.branding.accentSecondary}
            />
            <motion.button
              type="button"
              onClick={onContinue}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-10 flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-amber-400 via-rose-400 to-pink-500 px-9 text-base font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.04] active:scale-95"
            >
              On to the grand finale
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </ScreenShell>
  )
}