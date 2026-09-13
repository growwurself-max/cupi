import { motion } from 'framer-motion'
import { RotateCcw, WandSparkles } from 'lucide-react'
import { useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { fireGrandBurst, fireSideCannons } from '../../../utils/confetti'
import { FloatingEmojis } from '../../shared/FloatingEmojis'
import { FloatingParticles } from '../../shared/FloatingParticles'
import { ScreenShell } from '../../shared/ScreenShell'

interface HighFiveScreenProps {
  config: ExperienceConfig
  onReplay: () => void
  onExit: () => void
  onFive: () => void
}

const FOUNTAIN_EMOJIS = ['✨', '🍕', '💖', '🤪', '🥳', '🥑']
const MAX_TAPS = 5

interface FountainBurstProps {
  angles: number[]
}

function FountainBurst({ angles }: FountainBurstProps) {
  return (
    <>
      {angles.map((angle, i) => {
        const dist = 70 + ((i * 23) % 75)
        const emoji = FOUNTAIN_EMOJIS[(i * 7) % FOUNTAIN_EMOJIS.length]
        return (
          <motion.span
            key={i}
            className="pointer-events-none absolute left-1/2 top-1/2 text-2xl"
            style={{ marginLeft: -14, marginTop: -14 }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0.4 }}
            animate={{
              x: Math.cos(angle) * dist,
              y: Math.sin(angle) * dist - 24,
              opacity: 0,
              scale: 1.2,
              rotate: (i % 2 === 0 ? 1 : -1) * 70,
            }}
            transition={{ duration: 0.95, ease: 'easeOut' }}
          >
            {emoji}
          </motion.span>
        )
      })}
    </>
  )
}

interface Burst {
  id: number
  angles: number[]
}

export function HighFiveScreen({ config, onReplay, onExit, onFive }: HighFiveScreenProps) {
  const [taps, setTaps] = useState(0)
  const [bursts, setBursts] = useState<Burst[]>([])

  const exploded = taps >= MAX_TAPS

  const tap = () => {
    if (exploded) return
    onFive()
    const next = taps + 1
    setTaps(next)

    const angles = Array.from(
      { length: 10 },
      () => -Math.PI + Math.random() * Math.PI,
    )
    setBursts((prev) =>
      [...prev, { id: next, angles }].slice(-2),
    )

    if (next >= MAX_TAPS) {
      fireGrandBurst()
      fireSideCannons()
    }
  }

  return (
    <ScreenShell>
      {!exploded && (
        <FloatingParticles
          type="emoji-stickers"
          colors={[config.branding.accentColor, config.branding.accentSecondary]}
        />
      )}
      <FloatingEmojis emojis={['✨', '🍕', '💖', '🤪', '🥳', '🥑']} count={12} />

      {!exploded ? (
        <>
          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 flex flex-col items-center"
          >
            <motion.span
              animate={{ rotate: [-4, 4, -4] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="rounded-full border border-rose-200/70 bg-white/85 px-5 py-2 text-sm font-black tracking-widest text-rose-600 uppercase shadow-lg shadow-rose-200/50 backdrop-blur-md"
            >
              Final High-Five🙌
            </motion.span>
            <p className="mt-6 text-sm font-bold text-stone-600">
              Tap to high five until it explodes 💥
            </p>
          </motion.div>

          <div className="relative z-10 mt-8 flex items-center gap-2">
            {Array.from({ length: MAX_TAPS }).map((_, i) => (
              <span
                key={i}
                className={`h-3 rounded-full transition-all duration-300 ${
                  i < taps ? 'w-7 bg-gradient-to-r from-orange-400 to-rose-400' : 'w-3 bg-stone-200'
                }`}
              />
            ))}
          </div>

          <div className="relative z-10 mt-12 flex items-center justify-center">
            {bursts.map((burst) => (
              <div
                key={burst.id}
                className="pointer-events-none absolute inset-0 z-[3]"
              >
                <FountainBurst angles={burst.angles} />
              </div>
            ))}
            <motion.button
              type="button"
              onClick={tap}
              animate={{ scale: Math.min(1 + taps * 0.11, 1.5) }}
              transition={{ type: 'spring', stiffness: 300, damping: 13 }}
              whileTap={{ scale: Math.min(1 + taps * 0.11, 1.5) * 0.92 }}
              className="relative z-[2] flex min-h-24 items-center gap-3 rounded-full bg-gradient-to-r from-orange-400 via-rose-400 to-rose-400 px-10 py-6 text-xl font-black text-white shadow-[0_22px_55px_-15px_rgba(244,63,94,0.6)]"
            >
              <motion.span
                key={taps}
                initial={{ rotate: 0, scale: 0.6 }}
                animate={{ rotate: [0, -14, 16, 0], scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="inline-block text-3xl"
              >
                🙌
              </motion.span>
              Tap to High Five 🙌
            </motion.button>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="relative z-10 mt-9 text-xs font-semibold tracking-[0.25em] text-stone-500 uppercase"
          >
            {taps}/5 — make it count 💪
          </motion.p>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative z-10 flex max-w-2xl flex-col items-center text-center"
        >
          <motion.div
            initial={{ scale: 0, rotate: -18 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 140, damping: 12, delay: 0.15 }}
            className="mb-8"
          >
            <motion.span
              animate={{ scale: [1, 1.18, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -inset-5 rounded-full bg-rose-300/30 blur-3xl"
            />
            <span className="animate-pulse-glow relative flex h-28 w-28 items-center justify-center rounded-full border-2 border-rose-200 bg-white/85 text-6xl shadow-xl shadow-rose-200/60">
              🙌
            </span>
          </motion.div>

          <h1 className="font-display animate-shimmer bg-[length:200%_auto] bg-gradient-to-r from-[#9F1239] via-[#F97316] to-[#FBBF24] bg-clip-text text-center text-6xl font-black text-transparent sm:text-7xl">
            {config.content.finalMessage}
          </h1>

          <p className="mt-6 max-w-md text-pretty text-base leading-relaxed text-stone-600">
            {config.content.finalCelebration}
          </p>

          <p className="mt-6 rounded-full border border-amber-300/70 bg-amber-50/90 px-5 py-2 text-sm font-bold text-[#9F1239] shadow-md shadow-amber-100">
            Certified besties. 🏆
          </p>

          <p className="mt-5 text-base font-semibold text-stone-500">
            — {config.sender.name}
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={onReplay}
              className="flex min-h-14 items-center gap-2.5 rounded-full border border-orange-300/70 bg-white/85 px-7 py-3.5 text-sm font-bold text-[#9F1239] shadow-md shadow-orange-200/40 backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <RotateCcw className="h-5 w-5 text-orange-400" />
              Replay
            </button>
            <button
              type="button"
              onClick={onExit}
              className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-orange-400 to-rose-400 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-400/30 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <WandSparkles className="h-5 w-5" />
              Exit
            </button>
          </div>

          <p className="mt-8 text-xs font-semibold tracking-[0.25em] text-stone-500 uppercase">
            Crafted with ♥ by Cupi
          </p>
        </motion.div>
      )}
    </ScreenShell>
  )
}