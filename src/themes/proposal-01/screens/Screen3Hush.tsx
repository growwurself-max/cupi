import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { fireContinuousSparkle } from '../../../utils/confetti'
import { FloatingParticles } from '../../shared/FloatingParticles'
import { ScreenShell } from '../../shared/ScreenShell'

interface Screen3HushProps {
  config: ExperienceConfig
  onOpen: () => void
  onContinue: () => void
}

const PILL =
  'inline-flex items-center gap-1.5 rounded-full border border-violet-200/70 bg-white/70 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#581C87] backdrop-blur-md'

export function Screen3Hush({ config, onOpen, onContinue }: Screen3HushProps) {
  const [opened, setOpened] = useState(false)

  const openBox = () => {
    if (opened) return
    setOpened(true)
    onOpen()
    fireContinuousSparkle(900)
  }

  return (
    <ScreenShell>
      <FloatingParticles
        type="lavender-mist"
        count={10}
        colors={['#a78bfa', '#f9a8d4']}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.55),transparent_60%)]"
      />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center gap-5 text-center"
      >
        <span className={PILL}>Shh…</span>
        <p className="font-display text-balance text-2xl italic text-[#581C87] sm:text-3xl">
          Take a deep breath and tap to open…
        </p>
      </motion.div>

      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.25, type: 'spring', stiffness: 140, damping: 15 }}
        className="relative z-10 mt-12 flex w-64 items-center justify-center sm:w-72"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute h-64 w-64 sm:h-72 sm:w-72"
        >
          <div className="absolute inset-0 rotate-45 rounded-3xl border-2 border-white/70 shadow-[0_0_28px_rgba(240,171,252,0.45)]" />
          <div className="absolute inset-3 -rotate-45 rounded-3xl border border-white/70 shadow-[0_0_20px_rgba(167,139,250,0.4)]" />
        </div>

        {opened && (
          <motion.div
            aria-hidden
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: [0, 1, 0.75], scale: [0.4, 1.7, 2.1] }}
            transition={{ duration: 1.8, times: [0, 0.35, 1], ease: 'easeOut' }}
            className="pointer-events-none absolute m-auto h-56 w-56 rounded-full blur-md sm:h-64 sm:w-64"
            style={{
              background:
                'conic-gradient(from 0deg, rgba(240,171,252,0.75) 0deg, transparent 24deg, rgba(167,139,250,0.7) 48deg, transparent 72deg, rgba(249,168,212,0.75) 96deg, transparent 120deg, rgba(167,139,250,0.7) 144deg, transparent 168deg, rgba(240,171,252,0.75) 192deg, transparent 216deg, rgba(167,139,250,0.7) 240deg, transparent 264deg, rgba(249,168,212,0.75) 288deg, transparent 312deg, rgba(167,139,250,0.7) 336deg, transparent 360deg)',
            }}
          />
        )}

        <motion.button
          type="button"
          onClick={openBox}
          aria-label="Open the ring box"
          className={`relative w-40 outline-none ${opened ? 'pointer-events-none' : ''}`}
          whileTap={{ scale: opened ? 1 : 0.9 }}
        >
          <motion.div
            aria-hidden
            animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.75, 0.4] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -inset-7 rounded-full bg-violet-300/30 blur-3xl"
          />

          <div className="relative flex h-28 w-40 items-center justify-center overflow-visible rounded-3xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-rose-400 shadow-xl shadow-violet-500/40">
            <div
              aria-hidden
              className="absolute inset-1.5 rounded-[20px] bg-gradient-to-br from-[#581C87]/15 to-transparent"
            />

            <AnimatePresence>
              {!opened && (
                <motion.div
                  key="lid"
                  exit={{ y: -60, rotate: -12, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  className="absolute inset-x-0 -top-0 h-14 rounded-t-3xl bg-gradient-to-b from-fuchsia-200 via-fuchsia-400 to-violet-500 shadow-md"
                >
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl drop-shadow-md">
                    🎀
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {opened && (
                <motion.span
                  key="ring"
                  initial={{ scale: 0, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 12,
                    delay: 0.12,
                  }}
                  className="relative text-5xl"
                  style={{
                    filter:
                      'drop-shadow(0 0 22px rgba(240,171,252,0.95)) drop-shadow(0 0 40px rgba(167,139,250,0.6))',
                  }}
                >
                  {config.branding.emojiPrimary}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {opened && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.35, type: 'spring', stiffness: 150, damping: 16 }}
            className="relative z-10 mt-12"
          >
            <button
              type="button"
              onClick={onContinue}
              className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400 px-7 text-sm font-bold text-white shadow-lg shadow-violet-500/30 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Open It 💍
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </ScreenShell>
  )
}