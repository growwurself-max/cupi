import { AnimatePresence, motion } from 'framer-motion'
import { RotateCcw, WandSparkles } from 'lucide-react'
import { useRef, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { fireGoldenSpark, fireHeartRain } from '../../../utils/confetti'
import { BlushDécor } from '../BlushDécor'

interface Screen6FinaleProps {
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
            animate={{
              scaleY: [1, 1.14, 0.9, 1.05, 1],
              scaleX: [1, 0.92, 1.08, 0.96, 1],
            }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: 'bottom center' }}
          >
            <svg
              width="46"
              height="60"
              viewBox="0 0 48 62"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M24 2 C31 15 43 21 42 35 C41 47 34 58 24 58 C14 58 7 47 6 35 C5 21 17 15 24 2 Z"
                fill="url(#momentsFlameGrad)"
              />
              <ellipse cx="24" cy="42" rx="7.5" ry="11" fill="#FFF3C4" opacity="0.85" />
              <defs>
                <linearGradient id="momentsFlameGrad" x1="24" y1="2" x2="24" y2="58">
                  <stop stopColor="#FFF6D8" />
                  <stop offset="0.35" stopColor="#FFD98A" />
                  <stop offset="0.75" stopColor="#F7A94D" />
                  <stop offset="1" stopColor="#E8733F" />
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

export function Screen6Finale({
  config,
  onReplay,
  onExit,
  onBlow,
}: Screen6FinaleProps) {
  const [lit, setLit] = useState(true)
  const [showWish, setShowWish] = useState(false)
  const smokeRef = useRef<HTMLDivElement | null>(null)

  const highlightPhoto =
    config.content.photos.length > 0 ? config.content.photos[0] : null

  const blowOut = () => {
    if (!lit) return
    setLit(false)
    onBlow()
    fireHeartRain(1800)
    fireGoldenSpark()
    setTimeout(() => {
      if (smokeRef.current) {
        smokeRef.current.style.animation = 'none'
        void smokeRef.current.offsetWidth
      }
    }, 30)
    setTimeout(() => setShowWish(true), 700)
  }

  return (
    <section className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-5 py-24 text-center sm:px-8">
      <BlushDécor />

      <motion.span
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="relative z-10 rounded-full border border-[#F4BCD1] bg-white/80 px-4 py-1.5 text-xs font-black tracking-[0.22em] text-[#D9548A] uppercase shadow-sm backdrop-blur-md"
      >
        The Grand Finale
      </motion.span>

      {/* Candle ritual */}
      <div className="relative z-10 mt-12 flex flex-col items-center">
        <div className="relative flex h-20 items-start">
          <CandleFlame lit={lit} />

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
                      className="h-2.5 w-2.5 rounded-full bg-[#E890B4]/90 blur-[4px]"
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
          <svg
            width="84"
            height="142"
            viewBox="0 0 88 150"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="momentsCandleGrad" x1="0" y1="0" x2="88" y2="0">
                <stop stopColor="#F9A8C9" />
                <stop offset="0.5" stopColor="#FFF0F5" />
                <stop offset="1" stopColor="#D8A0D9" />
              </linearGradient>
            </defs>
            <rect x="9" y="34" width="70" height="112" rx="10" fill="url(#momentsCandleGrad)" />
            <rect x="9" y="34" width="34" height="112" rx="10" fill="white" opacity="0.18" />
            <path d="M18 34 C18 40 16 46 18 52 C20 46 22 40 20 34 Z" fill="#FFF0F5" opacity="0.8" />
            <path d="M62 34 C61 42 57 50 60 58 C64 50 66 41 64 34 Z" fill="#FFF0F5" opacity="0.65" />
          </svg>
        </motion.button>

        {/* Wick */}
        <div className="pointer-events-none relative -mt-1">
          <svg width="6" height="26" viewBox="0 0 6 26">
            <path d="M3 0 C4.5 8 5 15 3 26 C1 15 1.5 8 3 0 Z" fill="#8A5A72" />
          </svg>
        </div>

        <motion.p
          animate={lit ? { opacity: [0.55, 1, 0.55] } : { opacity: 0.5 }}
          transition={lit ? { duration: 2.2, repeat: Infinity } : {}}
          className="mt-7 max-w-sm text-sm font-bold text-[#7C4A63]"
        >
          {lit
            ? 'Go on… close your eyes and blow out the candle 👆'
            : 'Nice blow. Now hold that thought. ✨'}
        </motion.p>
      </div>

      {/* Final reveal */}
      <AnimatePresence>
        {showWish && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.7, type: 'spring', stiffness: 90 }}
            className="relative z-10 mt-14 flex w-full flex-col items-center gap-6 pb-6"
          >
            {highlightPhoto && (
              <motion.div
                initial={{ opacity: 0, rotate: -10, scale: 0.7, y: 30 }}
                animate={{ opacity: 1, rotate: -4, scale: 1, y: 0 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 110, damping: 13 }}
                className="relative"
              >
                <div
                  aria-hidden
                  className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-[#F9C9DD]/80 to-[#E6DBFF]/80 blur-xl"
                />
                <div className="relative rounded-2xl bg-white p-3 pb-4 shadow-[0_26px_60px_-22px_rgba(231,140,178,0.8)]">
                  <div className="h-36 w-52 overflow-hidden rounded-xl bg-[#FDE9F1] shadow-inner sm:h-40 sm:w-60">
                    <img
                      src={highlightPhoto.src}
                      alt={highlightPhoto.alt}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-1.5">
                    <span className="text-[#F472B6]">✦</span>
                    <p className="text-[11px] font-black tracking-widest text-[#C46D97] uppercase">
                      the memory that started it all
                    </p>
                    <span className="text-[#F472B6]">✦</span>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.h2
              initial={{ opacity: 0, scale: 0.82 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45, type: 'spring', stiffness: 130 }}
              className="font-display text-balance text-4xl font-bold italic sm:text-5xl md:text-6xl"
            >
              <span className="bg-gradient-to-br from-[#E85C9B] via-[#D9548A] to-[#8B5CF6] bg-clip-text text-transparent">
                {config.content.finalMessage}
              </span>
              <span className="text-[#F472B6]"> ❤️</span>
            </motion.h2>

            <p className="max-w-md text-pretty text-base leading-relaxed text-[#7C4A63]">
              {config.content.finalCelebration}
            </p>
            <p className="text-lg font-bold text-[#9A3168]/80">
              — {config.sender.name} <span className="text-[#F472B6]">♥</span>
            </p>

            <div className="mt-2 flex flex-col items-center gap-4 pb-2 sm:flex-row">
              <button
                type="button"
                onClick={onReplay}
                className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-[#F472B6] via-[#EC6E9F] to-[#A78BFA] px-7 text-base font-bold text-white shadow-xl shadow-[#F4BCD1]/60 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <RotateCcw className="h-5 w-5" />
                Replay Surprise 🔁
              </button>
              <button
                type="button"
                onClick={onExit}
                className="flex min-h-14 items-center gap-2.5 rounded-full border border-[#F0B8CE] bg-white/85 px-7 text-base font-bold text-[#B9447D] shadow-sm transition-all duration-200 hover:scale-105 hover:bg-white active:scale-95"
              >
                <WandSparkles className="h-5 w-5 text-[#F472B6]" />
                Create a Surprise Like This ✨
              </button>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-2 text-xs font-bold tracking-[0.2em] text-[#C46D97]/60 uppercase"
            >
              Crafted with ♥ by Cupi
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}