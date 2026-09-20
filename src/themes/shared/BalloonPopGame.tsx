import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useMemo, useState } from 'react'

const BALLOON_COLORS = ['#FFB5C2', '#FFD6E0', '#FFC8DD', '#FFE5EC'] as const

interface BalloonPopGameProps {
  words: string[]
  onPop: () => void
  onComplete: () => void
  className?: string
  title?: string
}

export function BalloonPopGame({
  words,
  onPop,
  onComplete,
  className = '',
  title = 'Pop the balloons',
}: BalloonPopGameProps) {
  const [popped, setPopped] = useState<boolean[]>(() => words.map(() => false))
  const [revealedCount, setRevealedCount] = useState(0)

  const positions = useMemo(
    () =>
      words.map((_, i) => ({
        left: `${12 + i * 22}%`,
        delay: i * 0.35,
        color: BALLOON_COLORS[i % BALLOON_COLORS.length],
      })),
    [words],
  )

  const popBalloon = useCallback(
    (index: number) => {
      if (popped[index]) return
      onPop()
      setPopped((prev) => {
        const next = [...prev]
        next[index] = true
        return next
      })
      setRevealedCount((c) => {
        const next = c + 1
        if (next >= words.length) {
          setTimeout(onComplete, 1200)
        }
        return next
      })
    },
    [onComplete, onPop, popped, words.length],
  )

  const allDone = revealedCount >= words.length

  return (
    <div className={`relative w-full max-w-lg ${className}`}>
      <p className="mb-8 text-center text-xs font-bold tracking-[0.28em] text-rose-400/90 uppercase">
        {title}
      </p>

      <div className="relative mx-auto h-52 w-full sm:h-56">
        {words.map((word, i) => {
          const isPopped = popped[i]
          const pos = positions[i]
          return (
            <div
              key={word}
              className="absolute bottom-0 -translate-x-1/2"
              style={{ left: pos.left }}
            >
              <AnimatePresence mode="wait">
                {!isPopped ? (
                  <motion.button
                    key="balloon"
                    type="button"
                    onClick={() => popBalloon(i)}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{
                      opacity: 1,
                      y: [0, -10, 0],
                    }}
                    exit={{ scale: 1.4, opacity: 0 }}
                    transition={{
                      y: {
                        duration: 2.6 + i * 0.2,
                        repeat: Infinity,
                        delay: pos.delay,
                        ease: 'easeInOut',
                      },
                      opacity: { duration: 0.4 },
                    }}
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.92 }}
                    className="relative flex flex-col items-center outline-none"
                    aria-label={`Pop balloon ${i + 1}`}
                  >
                    <span
                      className="block h-16 w-14 rounded-full shadow-[inset_-6px_-10px_18px_rgba(0,0,0,0.08)] sm:h-[4.5rem] sm:w-[3.25rem]"
                      style={{ background: `radial-gradient(circle at 35% 28%, #fff, ${pos.color})` }}
                    />
                    <span
                      className="mt-0.5 block h-8 w-px bg-stone-400/50"
                      aria-hidden
                    />
                  </motion.button>
                ) : (
                  <motion.span
                    key="word"
                    initial={{ opacity: 0, scale: 0.5, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="font-display block text-2xl font-bold text-rose-600 sm:text-3xl"
                  >
                    {word}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      <AnimatePresence>
        {allDone && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center text-sm font-semibold text-rose-500/80"
          >
            ✨ Nice popping!
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
