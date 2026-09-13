import { AnimatePresence, motion } from 'framer-motion'
import { AudioLines, Volume2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { FloatingParticles } from '../../shared/FloatingParticles'
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
      <FloatingParticles
        type="heart-petals"
        colors={[config.branding.accentColor, config.branding.accentSecondary]}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_60%,rgba(251,113,133,0.16),transparent_55%)]"
      />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.6 }}
        className="relative z-10 mb-8 rounded-full border border-rose-200 bg-white/80 px-5 py-2 text-sm font-semibold tracking-[0.25em] text-rose-700 uppercase shadow-sm"
      >
        {config.content.countdownTagline}
      </motion.div>

      <div className="relative z-10 flex h-52 items-center justify-center sm:h-64">
        <div className="relative flex h-52 items-center justify-center sm:h-64">
          <AnimatePresence>
            {current !== null && (
              <motion.span
                key={`ring-${current}`}
                initial={{ scale: 0.5, opacity: 0.55 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.95, ease: 'easeOut' }}
                className="pointer-events-none absolute"
                aria-hidden
              >
                <svg
                  width="208"
                  height="208"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  className="h-52 w-52 text-rose-300/80 sm:h-64 sm:w-64"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </motion.span>
            )}
          </AnimatePresence>

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
                className="font-serif text-[7rem] leading-none font-black text-rose-600 sm:text-[9rem]"
              >
                {current}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
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
            className="w-1.5 origin-bottom rounded-full bg-gradient-to-t from-rose-400/70 to-pink-300/70 sm:w-2"
            style={{ height: 40 + (i % 3) * 16 }}
          />
        ))}
      </div>

      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        className="mt-8 flex items-center gap-2 text-xs font-semibold text-rose-700/70 uppercase"
      >
        <Volume2 className="h-3.5 w-3.5 text-rose-500" />
        Can you feel the build-up?
        <AudioLines className="h-3.5 w-3.5 text-pink-400" />
      </motion.div>
    </ScreenShell>
  )
}