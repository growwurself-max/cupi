import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { ScreenShell } from '../../shared/ScreenShell'

interface Screen3WaxSealProps {
  config: ExperienceConfig
  onOpen: () => void
  onContinue: () => void
}

export function Screen3WaxSeal({ config, onOpen, onContinue }: Screen3WaxSealProps) {
  const [opened, setOpened] = useState(false)

  const crack = () => {
    if (opened) return
    onOpen()
    setOpened(true)
  }

  return (
    <ScreenShell className="surface-obsidian">
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-full border border-violet-200/30 bg-white/5 px-4 py-1.5 text-xs font-bold tracking-[0.3em] text-violet-200/80 uppercase"
      >
        Wax Seal Reveal
      </motion.p>

      <div className="relative z-10 mt-10 flex flex-col items-center text-center">
        <motion.button
          type="button"
          onClick={crack}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          whileTap={{ scale: 0.88 }}
          className="group relative flex flex-col items-center gap-5 outline-none"
          aria-label={opened ? 'Seal broken open' : 'Tap to crack the wax seal'}
        >
          <motion.span
            animate={opened ? { scale: 1.4, opacity: 0, rotate: 220 } : { rotate: [0, -3, 3, 0] }}
            transition={
              opened
                ? { duration: 0.7, ease: 'easeOut' }
                : { duration: 3.4, repeat: Infinity, ease: 'easeInOut' }
            }
            className={`relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 via-violet-500 to-pink-500 shadow-[0_0_50px_-6px_rgba(167,139,250,0.9)] ${
              opened ? 'pointer-events-none' : ''
            }`}
          >
            <span className="text-5xl">💍</span>
            <span
              aria-hidden
              className="absolute inset-1 rounded-full border-2 border-dashed border-white/30"
            />
          </motion.span>
          <span
            className={`text-sm font-semibold transition-colors ${
              opened ? 'text-violet-200/70' : 'text-violet-200/80'
            }`}
          >
            {opened ? 'Seal cracked open…' : 'Tap the wax seal 💍'}
          </span>
        </motion.button>

        <AnimatePresence>
          {opened && (
            <motion.div
              initial={{ opacity: 0, y: 26, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.35, type: 'spring', stiffness: 130 }}
              className="mt-10 flex flex-col items-center gap-5"
            >
              <motion.div
                animate={{ scale: [1, 1.15, 1], rotate: [0, -4, 4, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                className="glow-violet flex h-20 w-20 items-center justify-center rounded-3xl border border-violet-300/40 bg-white/10 text-4xl backdrop-blur-md"
              >
                💌
              </motion.div>
              <p className="max-w-sm text-sm text-violet-100/70">
                Inside, a confession I could never send by text. Read it until it ends.
              </p>
              <motion.button
                type="button"
                onClick={onContinue}
                animate={{ boxShadow: ['0 0 24px -6px rgba(167,139,250,0.5)', '0 0 48px -6px rgba(167,139,250,0.9)', '0 0 24px -6px rgba(167,139,250,0.5)'] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 px-9 text-base font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.04] active:scale-95"
              >
                Read the deep confession
                <ChevronRight className="h-5 w-5" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1 }}
        className="relative z-10 mt-10 text-[11px] font-semibold tracking-[0.25em] text-violet-200/40 uppercase"
      >
        {config.content.revealSubtext}
      </motion.p>
    </ScreenShell>
  )
}