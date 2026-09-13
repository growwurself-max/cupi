import { motion } from 'framer-motion'
import { useMemo } from 'react'

interface FloatingHeartsProps {
  count?: number
  className?: string
}

export function FloatingHearts({ count = 18, className = '' }: FloatingHeartsProps) {
  const hearts = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: (i * 53) % 100,
        size: 12 + (i % 5) * 7,
        delay: ((i * 29) % 100) / 10,
        duration: 14 + (i % 7) * 3,
        opacity: 0.16 + (i % 4) * 0.09,
        rotate: (i * 31) % 60 - 30,
        drift: (i % 2 === 0 ? 1 : -1) * (8 + (i % 4) * 6),
      })),
    [count],
  )

  return (
    <div
      aria-hidden
      className={`pointer-events-none ${className}`}
    >
      {hearts.map((h) => (
        <motion.span
          key={h.id}
          className="absolute"
          style={{ left: `${h.left}%`, bottom: '-6%' }}
          initial={{ y: 0, opacity: 0, rotate: h.rotate }}
          animate={{
            y: ['0vh', '-120vh'],
            x: [0, h.drift, 0],
            opacity: [0, h.opacity, h.opacity, 0],
            rotate: h.rotate + 20,
          }}
          transition={{
            duration: h.duration,
            repeat: Infinity,
            delay: h.delay,
            ease: 'linear',
          }}
        >
          <svg
            width={h.size}
            height={h.size}
            viewBox="0 0 24 24"
            fill="currentColor"
            className="text-rose-400/80"
          >
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            />
          </svg>
        </motion.span>
      ))}
    </div>
  )
}