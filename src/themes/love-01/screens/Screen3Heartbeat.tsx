import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { FloatingParticles } from '../../shared/FloatingParticles'
import { ScreenShell } from '../../shared/ScreenShell'

interface HeartbeatScreenProps {
  config: ExperienceConfig
  onBeat: () => void
  onContinue: () => void
}

export function HeartbeatScreen({
  config,
  onBeat,
  onContinue,
}: HeartbeatScreenProps) {
  const words = useMemo(
    () => config.content.letterLines[0].split(' ').filter(Boolean),
    [config.content.letterLines],
  )
  const [revealed, setRevealed] = useState(0)
  const full = revealed >= words.length

  const beatDuration = Math.max(1.6 - revealed * 0.14, 0.55)

  const pump = () => {
    setRevealed((prev) => Math.min(prev + 1, words.length))
    onBeat()
  }

  return (
    <ScreenShell>
      <FloatingParticles
        type="heart-petals"
        colors={[config.branding.accentColor, config.branding.accentSecondary]}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(255,155,180,0.16),transparent_55%)]"
      />

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.7, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center text-center"
      >
        <span className="flex min-h-9 items-center rounded-full border border-[#FFC9D4] bg-white/80 px-4 text-[11px] font-bold tracking-[0.3em] text-[#D65D7A] uppercase shadow-sm backdrop-blur-md">
          The Heartbeat Sensor
        </span>

        <h1 className="font-display mt-10 text-balance text-3xl font-black text-[#831843] sm:text-4xl">
          Tap my heart…
        </h1>
        <p className="mt-3 max-w-sm text-pretty text-sm leading-relaxed text-stone-600 sm:text-base">
          Every beat is a word I’ve been saving just for you.
        </p>

        <div className="relative mt-10 flex flex-col items-center">
          <button
            type="button"
            onClick={pump}
            aria-label={full ? 'Heart is bursting with love' : 'Tap to feel our heartbeat'}
            className="relative flex h-44 w-44 select-none items-center justify-center outline-none"
          >
            {[...Array(3)].map((_, i) => (
              <motion.span
                key={i}
                aria-hidden
                animate={{ scale: [1, 1.7], opacity: [0.45, 0] }}
                transition={{
                  duration: beatDuration,
                  repeat: Infinity,
                  ease: 'easeOut',
                  delay: i * beatDuration * 0.34,
                }}
                className="absolute inset-2 rounded-full bg-rose-300/40"
              />
            ))}
            <motion.span
              aria-hidden
              animate={{ scale: [1, 1.7], opacity: [0.5, 0] }}
              transition={{ duration: beatDuration, repeat: Infinity, ease: 'easeOut' }}
              className="absolute inset-2 rounded-full bg-pink-300/40"
            />
            <motion.svg
              viewBox="0 0 32 32"
              className="relative h-28 w-28 drop-shadow-[0_14px_34px_rgba(251,113,133,0.45)]"
            >
              <motion.path
                d="M16 28 C7 20 2 14 2 8 C2 3 7 0 12 0 C14.5 0 16 1.5 16 3 C16 1.5 18 0 20 0 C25 0 30 3 30 8 C30 14 25 20 16 28 Z"
                fill="url(#loveHeartGrad)"
                animate={
                  full
                    ? { scale: [1, 1.3, 1] }
                    : { scale: [1, 1.18, 0.92, 1.12, 1] }
                }
                transition={{
                  duration: beatDuration,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{ transformOrigin: 'center' }}
              />
              <defs>
                <linearGradient id="loveHeartGrad" x1="0" y1="0" x2="32" y2="32">
                  <stop stopColor="#fb7185" />
                  <stop offset="1" stopColor="#f9a8d4" />
                </linearGradient>
              </defs>
            </motion.svg>
          </button>

          <p className="mt-8 max-w-md text-pretty text-center font-serif text-xl font-semibold leading-relaxed text-[#831843] italic sm:text-2xl">
            {words.slice(0, revealed).map((word, i) => (
              <motion.span
                key={`${word}${i}`}
                initial={{ opacity: 0, filter: 'blur(8px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                transition={{ duration: 0.35 }}
                className="inline-block"
              >
                {word}
                <span>&nbsp;</span>
              </motion.span>
            ))}
          </p>
        </div>

        <p className="relative z-10 mt-6 text-xs font-semibold tracking-wide text-[#D65D7A]/70 uppercase">
          {full
            ? 'Ba-dum. Ba-dum. That’s all of it. 🥹'
            : `tap the heart to feel the words · ${revealed}/${words.length}`}
        </p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: full ? 1 : 0, y: full ? 0 : 16 }}
          transition={{ duration: 0.4 }}
          className="relative z-10 mt-10"
        >
          <button
            type="button"
            onClick={onContinue}
            disabled={!full}
            className="flex min-h-14 cursor-pointer items-center gap-2.5 rounded-full bg-gradient-to-r from-rose-400 to-pink-400 px-7 text-sm font-bold text-white shadow-lg shadow-rose-400/30 transition-all duration-200 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:saturate-0"
          >
            Keep Reading 💌
            <ArrowRight className="h-5 w-5" />
          </button>
        </motion.div>
      </motion.div>
    </ScreenShell>
  )
}