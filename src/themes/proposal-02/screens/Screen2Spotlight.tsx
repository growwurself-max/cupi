import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { ScreenShell } from '../../shared/ScreenShell'

interface Screen2SpotlightProps {
  config: ExperienceConfig
  onOpen: () => void
  onContinue: () => void
}

export function Screen2Spotlight({ config, onOpen, onContinue }: Screen2SpotlightProps) {
  const [opened, setOpened] = useState(false)

  const reveal = () => {
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
        className="rounded-full border border-amber-200/30 bg-white/5 px-4 py-1.5 text-xs font-bold tracking-[0.3em] text-amber-200/80 uppercase"
      >
        Spotlight Reveal
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.6 }}
        className="font-display mt-5 text-balance text-center text-3xl font-black sm:text-4xl"
      >
        <span className="text-gradient-lux">Wait for the spotlight…</span>
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="relative z-10 mt-10 flex flex-col items-center"
      >
        <motion.button
          type="button"
          onClick={reveal}
          whileTap={{ scale: 0.94 }}
          className="relative outline-none"
          aria-label={opened ? 'Ring revealed in the spotlight' : 'Tap to light the spotlight'}
        >
          <motion.div
            animate={opened ? { opacity: 1 } : { opacity: [0.15, 0.5, 0.15] }}
            transition={opened ? { duration: 0.6 } : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            className="pointer-events-none absolute -inset-16 rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(245,184,97,0.55) 0%, rgba(245,184,97,0.12) 45%, transparent 70%)',
            }}
          />
          <AnimatePresence mode="wait">
            {!opened ? (
              <motion.span
                key="box"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.3, rotate: 6 }}
                transition={{ duration: 0.4 }}
                className="relative flex h-40 w-40 flex-col items-center justify-center gap-2 rounded-[2rem] border border-white/10 bg-white/[0.04] text-7xl backdrop-blur-md"
              >
                ♟️
                <span className="text-xs font-semibold tracking-widest text-amber-200/70 uppercase">
                  tap to reveal
                </span>
              </motion.span>
            ) : (
              <motion.span
                key="ring"
                initial={{ opacity: 0, scale: 0.3, rotate: -30 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 160, damping: 13 }}
                className="relative flex h-40 w-40 items-center justify-center rounded-full border border-amber-200/60 bg-amber-400/15 text-8xl shadow-[0_0_70px_-8px_rgba(245,184,97,0.9)]"
              >
                💍
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        <AnimatePresence>
          {opened && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, type: 'spring', stiffness: 150 }}
              className="mt-10 flex flex-col items-center gap-4 text-center"
            >
              <p className="max-w-sm text-sm text-amber-100/70">
                The ring was always there. The spotlight just had to find you.
              </p>
              <motion.button
                type="button"
                onClick={onContinue}
                animate={{ boxShadow: ['0 0 24px -6px rgba(245,184,97,0.5)', '0 0 48px -6px rgba(245,184,97,0.9)', '0 0 24px -6px rgba(245,184,97,0.5)'] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-amber-400 via-rose-400 to-pink-500 px-9 text-base font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.04] active:scale-95"
              >
                Make the forever promises
                <ChevronRight className="h-5 w-5" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1 }}
        className="relative z-10 mt-10 text-[11px] font-semibold tracking-[0.25em] text-amber-200/40 uppercase"
      >
        {config.content.revealSubtext}
      </motion.p>
    </ScreenShell>
  )
}