import confetti from 'canvas-confetti'
import { motion } from 'framer-motion'
import { useEffect, useMemo } from 'react'
import { getExperienceById } from '../../data/catalog'
import type { CategoryId } from '../../types/catalog'

interface BackgroundAnimationProps {
  templateId?: string
}

type Effect = 'hearts' | 'balloons' | 'confetti' | 'sparkles'

function effectsForCategory(categoryId: CategoryId | undefined): Effect[] {
  switch (categoryId) {
    case 'birthday':
      return ['confetti', 'balloons']
    case 'parents':
      return ['confetti', 'hearts']
    case 'love':
    case 'anniversary':
    case 'proposal':
      return ['hearts']
    default:
      return ['sparkles']
  }
}

/**
 * Deterministic pseudo-random in [0, 1) derived from an index, so every particle
 * keeps the same position across re-renders instead of jumping on each render.
 */
function seeded(index: number, salt: number): number {
  const raw = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453
  return raw - Math.floor(raw)
}

function randomInRange(index: number, salt: number, min: number, max: number) {
  return seeded(index, salt) * (max - min) + min
}

export function BackgroundAnimation({ templateId }: BackgroundAnimationProps) {
  const effects = useMemo(
    () => effectsForCategory(getExperienceById(templateId ?? '')?.categoryId),
    [templateId],
  )

  const hasConfetti = effects.includes('confetti')

  useEffect(() => {
    if (!hasConfetti) return

    const duration = 15 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }
    const spawnSalt = Math.floor(Math.random() * 1000)

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        clearInterval(interval)
        return
      }

      const particleCount = 50 * (timeLeft / duration)
      const batch = Math.floor((animationEnd - timeLeft) / 250)
      confetti({
        ...defaults,
        particleCount,
        origin: {
          x: randomInRange(batch, spawnSalt + 1, 0.1, 0.3),
          y: seeded(batch, spawnSalt + 2) - 0.2,
        },
      })
      confetti({
        ...defaults,
        particleCount,
        origin: {
          x: randomInRange(batch, spawnSalt + 3, 0.7, 0.9),
          y: seeded(batch, spawnSalt + 4) - 0.2,
        },
      })
    }, 250)

    return () => clearInterval(interval)
  }, [hasConfetti])

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {effects.includes('hearts') && <FloatingHearts count={15} />}
      {effects.includes('balloons') && <FloatingBalloons count={8} />}
      {effects.includes('sparkles') && <FloatingSparkles count={18} />}
    </div>
  )
}

function FloatingHearts({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-4xl text-rose-300 opacity-60"
          initial={{
            bottom: -50,
            left: `${seeded(i, 1) * 100}%`,
            scale: seeded(i, 2) * 0.5 + 0.5,
          }}
          animate={{
            bottom: '120%',
            left: `${seeded(i, 3) * 100}%`,
            rotate: seeded(i, 4) * 360,
          }}
          transition={{
            duration: seeded(i, 5) * 10 + 10,
            repeat: Infinity,
            ease: 'linear',
            delay: seeded(i, 6) * 10,
          }}
        >
          ❤️
        </motion.div>
      ))}
    </>
  )
}

const BALLOON_COLORS = ['#f43f5e', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b']

function FloatingBalloons({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const color = BALLOON_COLORS[i % BALLOON_COLORS.length]
        return (
          <motion.div
            key={i}
            className="absolute opacity-70"
            initial={{
              bottom: -100,
              left: `${seeded(i, 11) * 100}%`,
            }}
            animate={{
              bottom: '120%',
              x: seeded(i, 12) * 100 - 50,
            }}
            transition={{
              duration: seeded(i, 13) * 15 + 10,
              repeat: Infinity,
              ease: 'linear',
              delay: seeded(i, 14) * 10,
            }}
          >
            <div
              style={{ backgroundColor: color }}
              className="relative h-16 w-12 rounded-full shadow-inner"
            >
              <div className="absolute top-full left-1/2 h-16 w-0.5 -translate-x-1/2 bg-stone-300 opacity-50" />
              <div
                style={{ borderBottomColor: color }}
                className="absolute top-[95%] left-1/2 h-0 w-0 -translate-x-1/2 border-r-[4px] border-b-[6px] border-l-[4px] border-l-transparent border-r-transparent"
              />
            </div>
          </motion.div>
        )
      })}
    </>
  )
}

const SPARKLE_GLYPHS = ['✨', '⭐', '💫', '🌟']

function FloatingSparkles({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl text-amber-300 opacity-70"
          initial={{
            bottom: -40,
            left: `${seeded(i, 21) * 100}%`,
            scale: seeded(i, 22) * 0.4 + 0.4,
          }}
          animate={{
            bottom: '120%',
            left: `${seeded(i, 23) * 100}%`,
            opacity: [0.2, 0.9, 0.2],
            scale: [0.6, 1.1, 0.6],
          }}
          transition={{
            duration: seeded(i, 24) * 12 + 8,
            repeat: Infinity,
            ease: 'linear',
            delay: seeded(i, 25) * 8,
          }}
        >
          {SPARKLE_GLYPHS[i % SPARKLE_GLYPHS.length]}
        </motion.div>
      ))}
    </>
  )
}