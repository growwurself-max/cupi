import { AnimatePresence, motion } from 'framer-motion'
import { RotateCcw, WandSparkles } from 'lucide-react'
import { useRef, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { fireGoldenSpark } from '../../../utils/confetti'
import { ScreenShell } from '../../shared/ScreenShell'

interface Screen6WishFinaleProps {
  config: ExperienceConfig
  onReplay: () => void
  onExit: () => void
  onBlow: () => void
}

function CandleFlame({ lit }: { lit: boolean }) {
  return (
    <AnimatePresence>
      {lit && (
        <motion.div
          key="flame"
          initial={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.15, y: -8 }}
          transition={{ duration: 0.22, ease: 'easeIn' }}
          className="pointer-events-none absolute -top-14 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ scaleY: [1, 1.14, 0.9, 1.05, 1], scaleX: [1, 0.92, 1.08, 0.96, 1] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: 'bottom center' }}
          >
            <svg
              width="48"
              height="62"
              viewBox="0 0 48 62"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M24 2 C31 15 43 21 42 35 C41 47 34 58 24 58 C14 58 7 47 6 35 C5 21 17 15 24 2 Z"
                fill="url(#flameGrad)"
              />
              <ellipse cx="24" cy="42" rx="7.5" ry="11" fill="#fff3c4" opacity="0.85" />
              <defs>
                <linearGradient id="flameGrad" x1="24" y1="2" x2="24" y2="58">
                  <stop stopColor="#fff6d8" />
                  <stop offset="0.35" stopColor="#ffd98a" />
                  <stop offset="0.75" stopColor="#f7a94d" />
                  <stop offset="1" stopColor="#e8733f" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
          <motion.div
            aria-hidden
            animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0.2, 0.5] }}
            transition={{ duration: 1.7, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -inset-5 rounded-full bg-amber-300/30 blur-xl"
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function Screen6WishFinale({
  config,
  onReplay,
  onExit,
  onBlow,
}: Screen6WishFinaleProps) {
  const [lit, setLit] = useState(true)
  const [showWish, setShowWish] = useState(false)
  const smokeRef = useRef<HTMLDivElement | null>(null)
  const bodyRef = useRef<HTMLDivElement | null>(null)

  const blowOut = () => {
    if (!lit) return
    setLit(false)
    onBlow()
    fireGoldenSpark()

    setTimeout(() => {
      if (smokeRef.current && bodyRef.current) {
        bodyRef.current.style.animation = 'none'
        smokeRef.current.style.animation = 'none'
        void bodyRef.current.offsetWidth
        void smokeRef.current.offsetWidth
      }
    }, 30)
    setTimeout(() => setShowWish(true), 700)
  }

  return (
    <ScreenShell>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_70%,rgba(255,217,138,0.13),transparent_55%)]"
      />

      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-xs font-bold tracking-[0.3em] text-soft-amber uppercase"
      >
        The grand finale
      </motion.p>

      {/* Candle */}
      <div className="relative z-20 mt-12 flex flex-col items-center">
        <div className="relative flex h-20 items-start">
          <CandleFlame lit={lit} />

          {/* Smoke on blow */}
          <AnimatePresence>
            {!lit && (
              <motion.div
                key="smoke"
                initial={{ opacity: 0.9 }}
                animate={{ opacity: 0, y: -70 }}
                transition={{ duration: 1.6, ease: 'easeOut' }}
              >
                <div
                  ref={smokeRef}
                  className="absolute -top-12 left-1/2 flex -translate-x-1/2 gap-1.5"
                >
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      animate={{ x: [0, (i - 1) * 14], y: [0, -36] }}
                      transition={{ duration: 1.2, delay: i * 0.09 }}
                      className="h-2.5 w-2.5 rounded-full bg-white/40 blur-[4px]"
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          type="button"
          onClick={blowOut}
          aria-label={lit ? 'Blow out the candle' : 'Candle is out'}
          animate={lit ? { rotate: [0, 1.5, -1.5, 0] } : { rotate: 0 }}
          transition={
            lit
              ? { duration: 3.2, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 0.4 }
          }
          whileTap={{ scale: 0.96 }}
          className="relative mt-6 flex flex-col items-center outline-none"
        >
          <motion.div
            ref={bodyRef}
            animate={lit ? { scaleY: 1 } : { scaleY: 0.92, opacity: 0.85 }}
            transition={{ duration: 0.25 }}
            style={{ transformOrigin: 'bottom center' }}
            className="relative"
          >
            <svg
              width="88"
              height="150"
              viewBox="0 0 88 150"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="9" y="34" width="70" height="112" rx="10" fill="url(#candleBody)" />
              <rect
                x="9"
                y="34"
                width="34"
                height="112"
                rx="10"
                fill="white"
                opacity="0.14"
              />
              {/* drips */}
              <path
                d="M18 34 C18 40 16 46 18 52 C20 46 22 40 20 34 Z"
                fill="#fff0e8"
                opacity="0.7"
              />
              <path
                d="M62 34 C61 42 57 50 60 58 C64 50 66 41 64 34 Z"
                fill="#fff0e8"
                opacity="0.55"
              />
              <defs>
                <linearGradient id="candleBody" x1="0" y1="0" x2="88" y2="0">
                  <stop stopColor="#f6c6b6" />
                  <stop offset="0.5" stopColor="#fff0e8" />
                  <stop offset="1" stopColor="#c99a8a" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
        </motion.button>

        {/* Wick */}
        <motion.div
          animate={lit ? { scaleY: 1 } : { scaleY: 0.6 }}
          transition={{ duration: 0.3 }}
          style={{ transformOrigin: 'bottom center' }}
          className="pointer-events-none relative -mt-1 flex justify-center"
        >
          <svg width="6" height="26" viewBox="0 0 6 26">
            <path d="M3 0 C4.5 8 5 15 3 26 C1 15 1.5 8 3 0 Z" fill="#3a2417" />
          </svg>
        </motion.div>

        <motion.p
          animate={lit ? { opacity: [0.55, 1, 0.55] } : { opacity: 0.5 }}
          transition={lit ? { duration: 2.2, repeat: Infinity } : {}}
          className="mt-7 max-w-sm text-center text-sm font-semibold text-white/70"
        >
          {lit
            ? 'Go on… tap the candle to blow it out 👆'
            : 'Nice blow. Now hold that thought. ✨'}
        </motion.p>
      </div>

      {/* Final message */}
      <AnimatePresence>
        {showWish && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.7, type: 'spring', stiffness: 90 }}
            className="relative z-10 mt-14 flex flex-col items-center gap-6 pb-6 text-center"
          >
            <motion.h2
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 130 }}
              className="font-display text-balance text-4xl font-bold sm:text-5xl md:text-6xl"
            >
              <span className="text-shimmer animate-shimmer">
                {config.content.finalMessage}
              </span>
            </motion.h2>
            <p className="max-w-md text-pretty text-white/65">
              {config.content.finalCelebration}
            </p>
            <p className="text-lg text-white/45">
              — {config.sender.name} <span className="text-rose-gold">♥</span>
            </p>

            <div className="mt-2 flex flex-col items-center gap-4 pb-2 sm:flex-row">
              <button
                type="button"
                onClick={onReplay}
                className="glass-panel glow-primary flex min-h-14 items-center gap-2.5 rounded-full px-7 text-base font-bold text-white transition-transform duration-200 hover:scale-[1.04] active:scale-95"
              >
                <RotateCcw className="h-5 w-5 text-rose-gold" />
                Replay Experience 🔁
              </button>
              <button
                type="button"
                onClick={onExit}
                className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-rose-gold via-soft-amber to-soft-violet px-7 text-base font-bold text-obsidian-900 shadow-lg shadow-rose-gold/25 transition-transform duration-200 hover:scale-[1.04] active:scale-95"
              >
                <WandSparkles className="h-5 w-5" />
                Create a Surprise for Someone Else
              </button>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-2 text-xs font-semibold tracking-[0.2em] text-white/35 uppercase"
            >
              Crafted with ♥ by Cupi
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </ScreenShell>
  )
}