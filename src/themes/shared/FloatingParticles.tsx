import { motion } from 'framer-motion'
import { useMemo } from 'react'

export type ParticleType =
  | 'heart-petals'
  | 'star-dust'
  | 'emoji-stickers'
  | 'lavender-mist'
  | 'gold-sparkles'
  | 'confetti-flakes'

interface FloatingParticlesProps {
  type: ParticleType
  count?: number
  colors?: [string, string]
  className?: string
}

interface ParticleConfig {
  count: number
  emojis: string[]
  baseColor: string
  secondaryColor: string
}

const PARTICLE_CONFIG: Record<ParticleType, ParticleConfig> = {
  'heart-petals': {
    count: 16,
    emojis: ['💖', '💗', '💓', '🥰'],
    baseColor: '#ffb3ba',
    secondaryColor: '#f6c6b6',
  },
  'star-dust': {
    count: 20,
    emojis: ['✨', '🌟', '⭐'],
    baseColor: '#e0b3f2',
    secondaryColor: '#fde8cf',
  },
  'emoji-stickers': {
    count: 12,
    emojis: ['✨', '🍕', '💖', '🤪', '🥳'],
    baseColor: '#ff8a5c',
    secondaryColor: '#5cd6c8',
  },
  'lavender-mist': {
    count: 14,
    emojis: ['✨', '💫', '🌿'],
    baseColor: '#a78bfa',
    secondaryColor: '#fbcfe8',
  },
  'gold-sparkles': {
    count: 18,
    emojis: ['✨', '💫', '🌟'],
    baseColor: '#f5b861',
    secondaryColor: '#ffd98a',
  },
  'confetti-flakes': {
    count: 14,
    emojis: ['🍂', '🍃', '✨'],
    baseColor: '#fff7e6',
    secondaryColor: '#f6c6b6',
  },
}

export function FloatingParticles({
  type,
  count,
  colors,
  className = '',
}: FloatingParticlesProps) {
  const cfg = PARTICLE_CONFIG[type]
  const [color1, color2] = colors ?? [cfg.baseColor, cfg.secondaryColor]
  const particleCount = count ?? cfg.count

  const fallbackColors: [string, string] = [cfg.baseColor, cfg.secondaryColor]
  const baseColor = color1 ?? fallbackColors[0]
  const secondaryColor = color2 ?? fallbackColors[1]

  const items = useMemo(
    () =>
      Array.from({ length: particleCount }).map((_, i) => ({
        id: i,
        emoji: cfg.emojis[i % cfg.emojis.length],
        left: (i * 35) % 94,
        delay: ((i * 17) % 80) / 10,
        duration: 6 + (i % 8),
        rotation: (i * 13) % 50 - 25,
        opacity: 0.4 + (i % 4) * 0.15,
      })),
    [particleCount, cfg],
  )

  const emojiDriven = type !== 'star-dust' && type !== 'lavender-mist' && type !== 'gold-sparkles'

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {items.map((item) =>
        emojiDriven ? (
          <motion.span
            key={item.id}
            className="absolute"
            style={{ left: `${item.left}%`, bottom: '-5%', fontSize: 16 + (item.id % 6) * 2 }}
            initial={{ y: 0, opacity: 0, rotate: item.rotation }}
            animate={{
              y: -(60 + item.duration * 12),
              x: Math.sin(item.delay + item.id) * 26,
              opacity: [0, item.opacity, 0],
              rotate: item.rotation + (item.id % 2 === 0 ? 22 : -22),
              scale: [1, 1.1, 1],
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
        ) : (
          <motion.span
            key={item.id}
            className="absolute"
            style={{
              left: `${item.left}%`,
              top: '50%',
              width: 3 + (item.id % 4),
              height: 3 + (item.id % 4),
              borderRadius: '50%',
              background: baseColor,
              opacity: item.opacity,
              boxShadow: `0 0 6px ${baseColor}, 0 0 12px ${secondaryColor}`,
            }}
            animate={{
              y: [-40, -90, -40],
              x: Math.sin(item.delay + item.id) * 20,
              opacity: [item.opacity, item.opacity + 0.3, item.opacity],
            }}
            transition={{
              duration: item.duration,
              repeat: Infinity,
              delay: item.delay,
              ease: 'easeInOut',
            }}
          />
        ),
      )}
    </div>
  )
}