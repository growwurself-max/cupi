import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { TeddyMascot } from '../components/TeddyMascot'
import { TeddyDecor } from '../TeddyDecor'

interface Screen3TeddyCountdownProps {
  config: ExperienceConfig
  onTick: () => void
  onComplete: () => void
}

const START = 3

export function Screen3TeddyCountdown({
  config,
  onTick,
  onComplete,
}: Screen3TeddyCountdownProps) {
  const [count, setCount] = useState(START)
  const [justLanded, setJustLanded] = useState(false)

  useEffect(() => {
    const initial = window.setTimeout(() => onTick(), 350)
    return () => window.clearTimeout(initial)
  }, [onTick])

  useEffect(() => {
    if (count <= 0) return
    const timer = window.setTimeout(() => {
      onTick()
      setCount((prev) => prev - 1)
    }, 1000)
    return () => window.clearTimeout(timer)
  }, [count, onTick])

  useEffect(() => {
    if (count === 0) {
      const timer = window.setTimeout(() => setJustLanded(true), 320)
      return () => window.clearTimeout(timer)
    }
  }, [count])

  const shakeIntensity = count === 1 ? 10 : count === 2 ? 5 : 2

  return (
    <section className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-5 py-20 text-center sm:px-8">
      <TeddyDecor />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center gap-4"
      >
        <span className="rounded-full border border-[#FFB6C8] bg-white/80 px-4 py-1.5 text-xs font-black tracking-[0.22em] text-[#F43F5E] uppercase shadow-sm backdrop-blur-md">
          The Big Reveal 🎁
        </span>
        <h2 className="font-display text-balance text-3xl font-bold text-[#881337] italic sm:text-4xl">
          Teddy is getting the gift ready…
        </h2>
      </motion.div>

      {/* Teddy balancing wobbly gift box */}
      <div className="relative z-10 mt-12">
        <motion.div
          animate={{
            rotate: [-shakeIntensity, shakeIntensity, -shakeIntensity],
          }}
          transition={{
            duration: count > 0 ? 0.12 : 0.6,
            repeat: count > 0 ? Infinity : 0,
            ease: 'easeInOut',
          }}
          className="relative flex flex-col items-center"
        >
          {/* Teddy mascot */}
          <TeddyMascot state="countdown" className="w-36 h-40 sm:w-44 sm:h-48" />

          {/* Gift box held above teddy's head */}
          <motion.div
            animate={
              count > 0
                ? { rotate: [-3, 3, -3], y: [0, -2, 0] }
                : { scale: [1, 1.3, 0], opacity: [1, 1, 0] }
            }
            transition={
              count > 0
                ? { duration: 0.3, repeat: Infinity }
                : { duration: 0.5 }
            }
            className="absolute -top-16 left-1/2 -translate-x-1/2"
          >
            <div className="relative">
              {/* Box body */}
              <div className="h-20 w-24 rounded-lg bg-gradient-to-br from-[#F43F5E] to-[#E11D48] shadow-lg" />
              {/* Lid */}
              <div className="absolute -top-2 -left-1 h-5 w-26 rounded-t-lg bg-gradient-to-br from-[#FB7185] to-[#F43F5E] shadow-md" />
              {/* Ribbon vertical */}
              <div className="absolute top-0 left-1/2 h-full w-3 -translate-x-1/2 rounded bg-[#FBBF24]" />
              {/* Ribbon horizontal */}
              <div className="absolute top-1/2 left-0 h-3 w-full -translate-y-1/2 rounded bg-[#FBBF24]" />
              {/* Bow */}
              <motion.span
                animate={{ rotate: [-5, 5, -5] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="absolute -top-5 left-1/2 -translate-x-1/2 text-2xl"
              >
                🎀
              </motion.span>
            </div>
          </motion.div>
        </motion.div>

        {/* Soundwave rings */}
        <AnimatePresence>
          {count > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {[1, 2, 3].map((ring) => (
                <motion.div
                  key={`ring-${ring}`}
                  animate={{
                    scale: [1, 2.5],
                    opacity: [0.3, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: ring * 0.4,
                    ease: 'easeOut',
                  }}
                  className="absolute h-24 w-24 rounded-full border-2 border-[#FB7185]/30"
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Big count number */}
        <div className="relative z-10 mt-6">
          <AnimatePresence mode="wait">
            {count > 0 ? (
              <motion.span
                key={count}
                initial={{ scale: 2, opacity: 0, filter: 'blur(10px)' }}
                animate={{
                  scale: [2, 0.85, 1],
                  opacity: 1,
                  filter: 'blur(0px)',
                }}
                exit={{ scale: 0.5, opacity: 0, filter: 'blur(6px)' }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="font-display bg-gradient-to-br from-[#F43F5E] to-[#FBBF24] bg-clip-text text-8xl font-black text-transparent"
              >
                {count}
              </motion.span>
            ) : (
              <motion.span
                key="go"
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="font-display text-6xl font-black text-[#881337] italic"
              >
                Open! 🎉
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="mt-6 text-xs font-bold tracking-[0.25em] text-[#F43F5E]/50 uppercase"
        >
          {config.content.countdownTagline}
        </motion.p>
      </div>

      <AnimatePresence>
        {count === 0 && justLanded && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 140, damping: 16 }}
            className="relative z-10 mt-11"
          >
            <motion.button
              type="button"
              onClick={onComplete}
              animate={{
                boxShadow: [
                  '0 0 26px -4px rgba(244,63,94,0.5)',
                  '0 0 54px -6px rgba(251,113,133,0.85)',
                  '0 0 26px -4px rgba(244,63,94,0.5)',
                ],
              }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-[#F43F5E] via-[#E11D48] to-[#FB7185] px-9 text-base font-bold text-white shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
            >
              {config.recipient.name}&apos;s Big Surprise ✨
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
