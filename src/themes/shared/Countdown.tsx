import { AnimatePresence, motion } from 'framer-motion'
import type { CSSProperties } from 'react'
import { useEffect, useState } from 'react'
import { ScreenShell } from './ScreenShell'

const COUNTDOWN = [3, 2, 1]

interface CountdownProps {
  tagline: string
  color: string
  colorSecondary: string
  onTick: () => void
  onComplete: () => void
}

export function Countdown({
  tagline,
  color,
  colorSecondary,
  onTick,
  onComplete,
}: CountdownProps) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (index >= COUNTDOWN.length) return
    onTick()
    const timer = setTimeout(
      () => setIndex((prev) => prev + 1),
      index === COUNTDOWN.length - 1 ? 900 : 950,
    )
    return () => clearTimeout(timer)
  }, [index, onTick])

  useEffect(() => {
    if (index >= COUNTDOWN.length) {
      const timer = setTimeout(onComplete, 350)
      return () => clearTimeout(timer)
    }
  }, [index, onComplete])

  const current = index < COUNTDOWN.length ? COUNTDOWN[index] : null

  const gradientStyle: CSSProperties = {
    backgroundImage: `linear-gradient(92deg, ${color} 0%, ${colorSecondary} 60%, #ffffff 100%)`,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
  }

  return (
    <ScreenShell
      background={`radial-gradient(circle at 50% 60%, ${color}${'1f'} 0%, transparent 55%)`}
    >
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.6 }}
        className="relative z-10 mb-8 text-sm font-semibold tracking-[0.25em] uppercase"
        style={{ color }}
      >
        {tagline}
      </motion.p>

      <div className="relative z-10 flex h-64 items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.35, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden
          className="absolute h-56 w-56 rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${color}44 0%, transparent 65%)`,
          }}
        />
        <AnimatePresence mode="wait">
          {current !== null && (
            <motion.span
              key={current}
              initial={{ opacity: 0, scale: 1.8, y: 30, filter: 'blur(10px)' }}
              animate={{
                opacity: 1,
                scale: [1.8, 0.9, 1],
                y: 0,
                filter: 'blur(0px)',
              }}
              exit={{ opacity: 0, scale: 0.55, y: -30, filter: 'blur(8px)' }}
              transition={{ duration: 0.5, times: [0, 0.5, 1], ease: 'easeOut' }}
              style={gradientStyle}
              className="font-display text-[7rem] leading-none font-black sm:text-[9rem]"
            >
              {current}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 mt-6 text-xs font-semibold tracking-wide text-stone-500 uppercase"
      >
        Feel the build-up…
      </motion.div>
    </ScreenShell>
  )
}