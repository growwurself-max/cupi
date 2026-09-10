import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { ScreenShell } from '../../shared/ScreenShell'

interface HeartbeatScreenProps {
  config: ExperienceConfig
  onBeat: () => void
  onContinue: () => void
}

const BEATS_NEEDED = 4

export function HeartbeatScreen({
  config,
  onBeat,
  onContinue,
}: HeartbeatScreenProps) {
  const [beats, setBeats] = useState(0)
  const full = beats >= BEATS_NEEDED

  const pump = () => {
    if (full) return
    const next = beats + 1
    setBeats(next)
    onBeat()
  }

  return (
    <ScreenShell>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(246,198,182,0.14),transparent_55%)]"
      />

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7, ease: 'easeOut' }}
        className="relative z-10 mb-10 text-center"
      >
        <h1 className="font-display text-balance text-4xl font-semibold text-white sm:text-5xl">
          {config.content.suspenseHeading}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-pretty text-sm leading-relaxed text-white/60 sm:text-base">
          {config.content.suspenseSubtext}
        </p>
      </motion.div>

      {/* Heartbeat ritual */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 90, damping: 15 }}
        className="relative z-10 flex flex-col items-center"
      >
        <button
          type="button"
          onClick={pump}
          aria-label={full ? 'Heart is full' : 'Tap to feel our heartbeat'}
          className="relative flex h-44 w-44 select-none items-center justify-center outline-none"
        >
          {/* pulse rings */}
          {[...Array(3)].map((_, i) => (
            <motion.span
              key={i}
              aria-hidden
              animate={
                !full
                  ? { scale: [1, 1.65], opacity: [0.45, 0] }
                  : { scale: 1, opacity: 0 }
              }
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: 'easeOut',
                delay: i * 0.55,
              }}
              className="absolute inset-2 rounded-full bg-[#ffb3ba]/25"
            />
          ))}
          <motion.span
            aria-hidden
            animate={full ? { scale: 1, opacity: 0 } : { scale: [1, 1.7], opacity: [0.5, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
            className="absolute inset-2 rounded-full bg-[#ffb3ba]/40"
          />
          <motion.svg
            viewBox="0 0 32 32"
            className="relative h-28 w-28 drop-shadow-[0_14px_34px_rgba(255,179,186,0.55)]"
          >
            <motion.path
              d="M16 28 C7 20 2 14 2 8 C2 3 7 0 12 0 C14.5 0 16 1.5 16 3 C16 1.5 18 0 20 0 C25 0 30 3 30 8 C30 14 25 20 16 28 Z"
              fill="url(#heartGrad)"
              animate={full
                ? { scale: [1, 1.25, 1] }
                : { scale: [1, 1.18, 0.92, 1.12, 1] }}
              transition={full
                ? { duration: 0.9, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 0.9, repeat: Infinity }}
              style={{ transformOrigin: 'center' }}
            />
            <defs>
              <linearGradient id="heartGrad" x1="0" y1="0" x2="32" y2="32">
                <stop stopColor="#ff9bb3" />
                <stop offset="1" stopColor="#e0b3f2" />
              </linearGradient>
            </defs>
          </motion.svg>
        </button>

        {/* beat meter */}
        <div className="mt-6 flex items-center gap-2">
          {[...Array(BEATS_NEEDED)].map((_, i) => (
            <motion.span
              key={i}
              animate={
                beats > i
                  ? { scale: [1.6, 1], opacity: 1 }
                  : { scale: 1, opacity: 0.25 }
              }
              transition={{ type: 'spring', stiffness: 220 }}
              className="h-3 w-3 rounded-full"
              style={{
                background: beats > i ? '#ffb3ba' : '#ffffff',
                boxShadow: beats > i ? '0 0 12px rgba(255,179,186,0.8)' : 'none',
              }}
            />
          ))}
        </div>

        <p className="mt-4 max-w-sm text-center text-sm font-semibold text-white/70">
          {full
            ? 'Ba-dum. Ba-dum. That’s us. 🥰'
            : `${BEATS_NEEDED - beats} ${BEATS_NEEDED - beats === 1 ? 'tap' : 'taps'} to feel our heartbeat`}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: full ? 1 : 0, y: full ? 0 : 16 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 mt-10"
      >
        <button
          type="button"
          onClick={onContinue}
          disabled={!full}
          className="disabled:cursor-not-allowed flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-[#ffb3ba] to-[#e0b3f2] px-8 text-base font-bold text-obsidian-900 transition-all duration-300 hover:scale-[1.05] active:scale-95 disabled:opacity-40 disabled:saturate-0"
        >
          Ask the Question
          <ArrowRight className="h-5 w-5" />
        </button>
      </motion.div>
    </ScreenShell>
  )
}