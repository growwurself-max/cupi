import { motion } from 'framer-motion'
import { useMemo } from 'react'

interface FloatingEmojisProps {
  emojis: string[]
  count?: number
  className?: string
}

export function FloatingEmojis({
  emojis,
  count = 14,
  className = '',
}: FloatingEmojisProps) {
  const items = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        emoji: emojis[i % emojis.length],
        left: (i * 41) % 100,
        delay: ((i * 13) % 80) / 10,
        duration: 8 + ((i * 7) % 6),
        size: 16 + ((i * 9) % 22),
        tilt: ((i * 17) % 50) - 25,
        distance: 40 + ((i * 11) % 90),
      })),
    [count, emojis],
  )

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {items.map((item) => (
        <motion.span
          key={item.id}
          className="absolute"
          style={{ left: `${item.left}%`, bottom: '-5%', fontSize: item.size }}
          initial={{ y: 0, opacity: 0, rotate: item.tilt }}
          animate={{
            y: -item.distance - item.size * 2,
            x: Math.sin(item.delay + item.id) * 18,
            opacity: [0, 0.85, 0],
            rotate: item.tilt + 24,
          }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            delay: item.delay,
            ease: 'linear',
          }}
        >
          {item.emoji}
        </motion.span>
      ))}
    </div>
  )
}