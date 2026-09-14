import { motion } from 'framer-motion'
import { useMemo } from 'react'

interface TeddyDecorProps {
  subtle?: boolean
}

export function TeddyDecor({ subtle = false }: TeddyDecorProps) {
  const hearts = useMemo(
    () =>
      Array.from({ length: 18 }).map((_, i) => ({
        id: i,
        left: (i * 37 + 5) % 100,
        delay: ((i * 17) % 90) / 10,
        duration: 14 + (i % 7) * 3,
        size: 10 + (i % 5) * 4,
        drift: (i % 2 === 0 ? 1 : -1) * (8 + (i % 4) * 7),
        opacity: 0.15 + (i % 4) * 0.08,
      })),
    [],
  )

  const balloons = useMemo(
    () =>
      [
        { emoji: '🎈', left: 8, delay: 0, duration: 24, sway: 18, opacity: 0.45 },
        { emoji: '🎈', left: 24, delay: 2.5, duration: 28, sway: -14, opacity: 0.4 },
        { emoji: '🎀', left: 42, delay: 5, duration: 22, sway: 12, opacity: 0.5 },
        { emoji: '🎈', left: 58, delay: 1.2, duration: 26, sway: -16, opacity: 0.35 },
        { emoji: '🧸', left: 72, delay: 3.8, duration: 30, sway: 10, opacity: 0.5 },
        { emoji: '🎈', left: 88, delay: 6.2, duration: 25, sway: -12, opacity: 0.4 },
      ],
    [],
  )

  const sparkles = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        left: (i * 43 + 11) % 96,
        delay: ((i * 19) % 80) / 10,
        duration: 10 + (i % 5) * 4,
        size: 3 + (i % 3),
        color: i % 3 === 0 ? '#F43F5E' : i % 3 === 1 ? '#FB7185' : '#FBBF24',
      })),
    [],
  )

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#FFF0F3] via-[#FFE5EC] to-[#FFF9EE]" />
      <div className="absolute -top-32 -right-24 h-96 w-96 rounded-full bg-[#FFD6E0]/45 blur-3xl" />
      <div className="absolute top-[20%] -left-28 h-[26rem] w-[26rem] rounded-full bg-[#FFECD2]/50 blur-3xl" />
      <div className="absolute -bottom-24 left-1/3 h-80 w-80 rounded-full bg-[#FFE0EC]/50 blur-3xl" />

      {!subtle && (
        <>
          {balloons.map((b, i) => (
            <motion.span
              key={`balloon-${i}`}
              className="absolute select-none"
              style={{ left: `${b.left}%`, bottom: '-8%', fontSize: 24 + i * 2 }}
              initial={{ y: 0, opacity: 0 }}
              animate={{
                y: ['0vh', '-118vh'],
                x: [0, b.sway, 0],
                opacity: [0, b.opacity, b.opacity, 0],
              }}
              transition={{
                duration: b.duration,
                repeat: Infinity,
                delay: b.delay,
                ease: 'linear',
              }}
            >
              {b.emoji}
            </motion.span>
          ))}

          {hearts.map((h) => (
            <motion.span
              key={`heart-${h.id}`}
              className="absolute rounded-full"
              style={{
                left: `${h.left}%`,
                bottom: '10%',
                width: h.size,
                height: h.size,
                background: h.id % 2 === 0 ? '#FB7185' : '#FBBF24',
                boxShadow: `0 0 8px ${h.id % 2 === 0 ? '#FB7185' : '#FBBF24'}`,
                opacity: h.opacity,
              }}
              animate={{
                y: [-20, -140, -20],
                x: Math.sin(h.delay + h.id) * h.drift,
                opacity: [h.opacity, h.opacity + 0.25, h.opacity],
                borderRadius: ['50%', '50% 0 50% 50%', '50%'],
              }}
              transition={{
                duration: h.duration,
                repeat: Infinity,
                delay: h.delay,
                ease: 'easeInOut',
              }}
            />
          ))}

          {sparkles.map((s) => (
            <motion.span
              key={`sparkle-${s.id}`}
              className="absolute"
              style={{
                left: `${s.left}%`,
                top: '35%',
                fontSize: s.size + 6,
                color: s.color,
              }}
              animate={{
                y: [-10, -80, -10],
                x: Math.sin(s.delay) * 14,
                opacity: [0, 0.7, 0],
                scale: [0.5, 1.1, 0.5],
              }}
              transition={{
                duration: s.duration,
                repeat: Infinity,
                delay: s.delay,
                ease: 'easeInOut',
              }}
            >
              ✦
            </motion.span>
          ))}
        </>
      )}
    </div>
  )
}
