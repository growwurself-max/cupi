import { AnimatePresence, motion } from 'framer-motion'
import { AudioLines, Volume2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { ScreenShell } from '../../shared/ScreenShell'

const COUNTDOWN = [3, 2, 1]

interface Screen3CountdownProps {
  config: ExperienceConfig
  onTick: () => void
  onComplete: () => void
}

export function Screen3Countdown({
  config,
  onTick,
  onComplete,
}: Screen3CountdownProps) {
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

  return (
    <ScreenShell>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_60%,rgba(246,198,182,0.14),transparent_55%)]"
      />

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.6 }}
        className="relative z-10 mb-8 text-sm font-semibold tracking-[0.25em] text-soft-amber uppercase"
      >
        {config.content.countdownTagline}
      </motion.p>

      <div className="relative z-10 flex h-52 items-center justify-center sm:h-64">
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
              exit={{
                opacity: 0,
                scale: 0.55,
                y: -30,
                filter: 'blur(8px)',
              }}
              transition={{
                duration: 0.5,
                times: [0, 0.5, 1],
                ease: 'easeOut',
              }}
              className="text-gradient-lux font-display text-[7rem] leading-none font-black sm:text-[9rem]"
            >
              {current}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Soundwave pulses */}
      <div className="relative z-10 mt-6 flex h-12 items-end gap-2">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <motion.span
            key={i}
            aria-hidden
            animate={{
              scaleY: [0.25, 1, 0.4, 0.9, 0.25],
            }}
            transition={{
              duration: 1.1,
              repeat: Infinity,
              repeatType: 'loop',
              delay: i * 0.12,
              ease: 'easeInOut',
            }}
            className="w-1.5 origin-bottom rounded-full bg-gradient-to-t from-rose-gold/70 to-soft-violet/70 sm:w-2"
            style={{ height: 40 + (i % 3) * 16 }}
          />
        ))}
      </div>

      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        className="mt-8 flex items-center gap-2 text-xs font-semibold text-white/40 uppercase"
      >
        <Volume2 className="h-3.5 w-3.5 text-rose-gold" />
        Can you feel the build-up?
        <AudioLines className="h-3.5 w-3.5 text-soft-violet" />
      </motion.div>
    </ScreenShell>
  )
}