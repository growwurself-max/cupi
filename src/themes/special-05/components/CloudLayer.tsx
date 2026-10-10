import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { PALETTE } from '../palette'

interface CloudLayerProps {
  reduce: boolean
}

interface CloudSpec {
  id: string
  /** viewport-relative placement */
  top: string
  left: string
  width: number
  opacity: number
  duration: number
  drift: number
  tint: string
  depth: number
}

const CLOUDS: CloudSpec[] = [
  { id: 'c1', top: '12%', left: '-12%', width: 320, opacity: 0.9, duration: 62, drift: 60, tint: '#FFFFFF', depth: 0.5 },
  { id: 'c2', top: '7%', left: '58%', width: 260, opacity: 0.72, duration: 74, drift: -70, tint: '#FDF1F6', depth: 0.6 },
  { id: 'c3', top: '34%', left: '-18%', width: 240, opacity: 0.5, duration: 84, drift: 52, tint: '#F7DFEA', depth: 0.8 },
  { id: 'c4', top: '52%', left: '70%', width: 300, opacity: 0.42, duration: 92, drift: -58, tint: '#F5D8E6', depth: 0.9 },
  { id: 'c5', top: '70%', left: '-10%', width: 220, opacity: 0.36, duration: 100, drift: 44, tint: '#F3D2E0', depth: 1 },
  { id: 'c6', top: '82%', left: '48%', width: 280, opacity: 0.32, duration: 110, drift: -48, tint: '#F1CCDD', depth: 1.1 },
]

const SPARKLES = [
  { id: 's1', top: '16%', left: '14%', size: 12, delay: 0 },
  { id: 's2', top: '24%', left: '82%', size: 10, delay: 0.9 },
  { id: 's3', top: '40%', left: '8%', size: 14, delay: 1.7 },
  { id: 's4', top: '36%', left: '92%', size: 11, delay: 0.5 },
  { id: 's5', top: '58%', left: '22%', size: 9, delay: 2.3 },
  { id: 's6', top: '64%', left: '76%', size: 12, delay: 1.3 },
  { id: 's7', top: '78%', left: '36%', size: 10, delay: 3.1 },
  { id: 's8', top: '20%', left: '50%', size: 8, delay: 2.8 },
]

/**
 * Three-plus layers of crisp vector clouds that drift at different speeds to
 * build parallax depth, plus a scatter of slowly twinkling sparkles. Sits behind
 * the content card and peeks past the curtain edges to create a dreamy stage.
 */
export function CloudLayer({ reduce }: CloudLayerProps) {
  const sparkles = useMemo(() => SPARKLES, [])

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {CLOUDS.map((cloud) => (
        <motion.div
          key={cloud.id}
          className="absolute"
          style={{ top: cloud.top, left: cloud.left, width: cloud.width, opacity: cloud.opacity }}
          animate={reduce ? undefined : { x: [0, cloud.drift, 0], y: [0, -cloud.depth * 8, 0] }}
          transition={{
            duration: cloud.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <CloudShape tint={cloud.tint} />
        </motion.div>
      ))}

      {sparkles.map((sparkle) => (
        <motion.svg
          key={sparkle.id}
          viewBox="0 0 24 24"
          className="absolute"
          style={{ top: sparkle.top, left: sparkle.left, width: sparkle.size, height: sparkle.size }}
          animate={reduce ? undefined : { opacity: [0.15, 0.7, 0.15], scale: [0.7, 1.15, 0.7] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: sparkle.delay }}
        >
          <path
            d="M12 1 C13 8 16 11 23 12 C16 13 13 16 12 23 C11 16 8 13 1 12 C8 11 11 8 12 1 Z"
            fill={PALETTE.goldLight}
          />
        </motion.svg>
      ))}
    </div>
  )
}

function CloudShape({ tint }: { tint: string }) {
  return (
    <svg viewBox="0 0 240 120" className="h-auto w-full" aria-hidden>
      <defs>
        <linearGradient id={`cloud-${tint.replace(/[^a-z0-9]/gi, '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor={tint} />
        </linearGradient>
      </defs>
      <g fill={`url(#cloud-${tint.replace(/[^a-z0-9]/gi, '')})`}>
        <rect x="26" y="62" width="190" height="44" rx="22" />
        <ellipse cx="74" cy="60" rx="46" ry="33" />
        <ellipse cx="136" cy="48" rx="42" ry="36" />
        <ellipse cx="184" cy="66" rx="34" ry="25" />
        <ellipse cx="46" cy="72" rx="34" ry="23" />
        {/* subtle lower shading to keep the edge crisp but soft */}
        <ellipse cx="120" cy="96" rx="92" ry="10" fill={PALETTE.blushDeep} opacity="0.18" />
      </g>
    </svg>
  )
}
