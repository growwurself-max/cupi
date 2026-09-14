import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { BlushDécor } from '../BlushDécor'

interface Screen3CountdownProps {
  config: ExperienceConfig
  onTick: () => void
  onComplete: () => void
}

const START = 3

export function Screen3Countdown({
  config,
  onTick,
  onComplete,
}: Screen3CountdownProps) {
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

  const radius = 64
  const circumference = 2 * Math.PI * radius

  return (
    <section className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-5 py-20 text-center sm:px-8">
      <BlushDécor />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center gap-4"
      >
        <span className="rounded-full border border-[#F4BCD1] bg-white/80 px-4 py-1.5 text-xs font-black tracking-[0.22em] text-[#D9548A] uppercase shadow-sm backdrop-blur-md">
          Chapter Two · The Anticipation
        </span>
        <h2 className="font-display text-balance text-3xl font-bold text-[#9A3168] italic sm:text-4xl">
          {config.content.suspenseHeading}
        </h2>
        <p className="max-w-md text-sm leading-relaxed text-[#7C4A63]">
          {config.content.suspenseSubtext}
        </p>
      </motion.div>

      {/* Countdown ring */}
      <div className="relative z-10 mt-14">
        <div className="relative" aria-live="polite">
          <svg width="176" height="176" viewBox="0 0 176 176" className="-rotate-90">
            <circle
              cx="88"
              cy="88"
              r={radius}
              fill="none"
              stroke="#F4BCD1"
              strokeWidth="6"
            />
            <motion.circle
              key={count}
              cx="88"
              cy="88"
              r={radius}
              fill="none"
              stroke="url(#countdownGrad)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: 0 }}
              animate={{ strokeDashoffset: circumference }}
              transition={{ duration: 1, ease: 'linear' }}
            />
            <defs>
              <linearGradient id="countdownGrad" x1="0" y1="0" x2="176" y2="176">
                <stop stopColor="#F472B6" />
                <stop offset="1" stopColor="#A78BFA" />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute inset-0 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {count > 0 ? (
                <motion.span
                  key={count}
                  initial={{ scale: 1.6, opacity: 0, filter: 'blur(8px)' }}
                  animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                  exit={{ scale: 0.6, opacity: 0, filter: 'blur(6px)' }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="font-display bg-gradient-to-br from-[#EC6E9F] to-[#A78BFA] bg-clip-text text-7xl font-black text-transparent"
                >
                  {count}
                </motion.span>
              ) : (
                <motion.span
                  key="go"
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="font-display text-5xl font-black text-[#D9548A] italic"
                >
                  Now.
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="mt-8 text-xs font-bold tracking-[0.25em] text-[#C46D97]/70 uppercase"
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
                  '0 0 26px -4px rgba(247,168,200,0.55)',
                  '0 0 54px -6px rgba(201,189,248,0.85)',
                  '0 0 26px -4px rgba(247,168,200,0.55)',
                ],
              }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-[#F472B6] via-[#EC6E9F] to-[#A78BFA] px-9 text-base font-bold text-white shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Unveil it, {config.recipient.name} ✨
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}