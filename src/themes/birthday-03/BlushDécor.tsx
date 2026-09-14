import { motion } from 'framer-motion'
import { useMemo } from 'react'

const BALLOON_TINTS = [
  { emoji: '🎈', hue: 'pink' },
  { emoji: '🎈', hue: 'lavender' },
  { emoji: '🎈', hue: 'cream' },
  { emoji: '🩷', hue: 'pink' },
  { emoji: '🎈', hue: 'rose' },
  { emoji: '🎀', hue: 'lavender' },
]

interface BlushDécorProps {
  /** Set false on photo-heavy screens to keep visuals focused on the photos. */
  subtle?: boolean
}

/**
 * Soft, premium pink/blush backdrop for the ₹49 Moments Édition experience.
 * Never dark — warm light tones, elegant glow orbs and drifting party décor.
 */
export function BlushDécor({ subtle = false }: BlushDécorProps) {
  const floats = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        id: i,
        left: (i * 41 + 7) % 96,
        delay: ((i * 23) % 90) / 10,
        duration: 13 + (i % 6) * 4,
        size: 14 + (i % 5) * 6,
        drift: (i % 2 === 0 ? 1 : -1) * (10 + (i % 5) * 9),
        opacity: 0.22 + (i % 4) * 0.1,
      })),
    [],
  )

  const balloons = useMemo(
    () =>
      BALLOON_TINTS.map((balloon, i) => ({
        ...balloon,
        id: i,
        left: 6 + ((i * 29 + 17) % 88),
        delay: ((i * 13) % 60) / 10,
        duration: 22 + (i % 5) * 7,
        sway: (i % 2 === 0 ? 1 : -1) * (14 + (i % 4) * 8),
        rotate: (i * 37) % 50 - 25,
        opacity: 0.5 + (i % 3) * 0.16,
      })),
    [],
  )

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#FFF8F6] via-[#FFEDF2] to-[#FBE9F0]" />
      <div className="absolute -top-32 -right-24 h-96 w-96 rounded-full bg-[#F9C9DD]/50 blur-3xl" />
      <div className="absolute top-[18%] -left-28 h-[26rem] w-[26rem] rounded-full bg-[#EDE2FF]/55 blur-3xl" />
      <div className="absolute -bottom-24 left-1/3 h-80 w-80 rounded-full bg-[#FFD9E6]/50 blur-3xl" />

      {!subtle && (
        <>
          {balloons.map((balloon) => (
            <motion.span
              key={`balloon-${balloon.id}`}
              className="absolute select-none"
              style={{ left: `${balloon.left}%`, bottom: '-8%', fontSize: 26 + balloon.id * 3 }}
              initial={{ y: 0, opacity: 0, rotate: balloon.rotate }}
              animate={{
                y: ['0vh', '-118vh'],
                x: [0, balloon.sway, 0],
                opacity: [0, balloon.opacity, balloon.opacity, 0],
                rotate: balloon.rotate + 14,
              }}
              transition={{
                duration: balloon.duration,
                repeat: Infinity,
                delay: balloon.delay,
                ease: 'linear',
              }}
            >
              {balloon.emoji}
            </motion.span>
          ))}

          {floats.map((float) => (
            <motion.span
              key={`spark-${float.id}`}
              className="absolute rounded-full"
              style={{
                left: `${float.left}%`,
                top: '45%',
                width: 3 + (float.id % 4),
                height: 3 + (float.id % 4),
                background: float.id % 2 === 0 ? '#F7A8C8' : '#C9BDF8',
                boxShadow: `0 0 8px ${
                  float.id % 2 === 0 ? '#F7A8C8' : '#C9BDF8'
                }`,
                opacity: float.opacity,
              }}
              animate={{
                y: [-30, -120, -30],
                x: Math.sin(float.delay + float.id) * 22,
                opacity: [float.opacity, float.opacity + 0.3, float.opacity],
              }}
              transition={{
                duration: float.duration,
                repeat: Infinity,
                delay: float.delay,
                ease: 'easeInOut',
              }}
            />
          ))}
        </>
      )}
    </div>
  )
}