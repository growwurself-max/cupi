import { m as motion, useMotionValue, useSpring, useTransform, type MotionValue } from 'framer-motion'
import { useEffect } from 'react'
import { PALETTE } from '../palette'

interface CloudLayerProps {
  reduce: boolean
}

interface CloudSpec {
  id: string
  top: string
  start: string
  width: number
  opacity: number
  duration: number
  travel: string
  delay: number
  bob: number
  breath: number
  depth: number
  tint: string
}

const CLOUDS: CloudSpec[] = [
  { id: 'far-a', top: '12%', start: '-150vw', width: 160, opacity: 0.25, duration: 94, travel: '300vw', delay: -21, bob: 8, breath: 0.025, depth: 0.25, tint: '#FFFFFF' },
  { id: 'far-b', top: '29%', start: '150vw', width: 176, opacity: 0.28, duration: 108, travel: '-300vw', delay: -57, bob: 7, breath: 0.035, depth: 0.3, tint: '#FDF1F6' },
  { id: 'mid-a', top: '7%', start: '-150vw', width: 250, opacity: 0.57, duration: 79, travel: '300vw', delay: -38, bob: 11, breath: 0.045, depth: 0.58, tint: '#FFFFFF' },
  { id: 'mid-b', top: '45%', start: '150vw', width: 238, opacity: 0.46, duration: 88, travel: '-300vw', delay: -12, bob: 12, breath: 0.05, depth: 0.7, tint: '#F7DFEA' },
  { id: 'mid-c', top: '73%', start: '-150vw', width: 222, opacity: 0.38, duration: 91, travel: '300vw', delay: -64, bob: 9, breath: 0.04, depth: 0.78, tint: '#F5D8E6' },
  { id: 'near-a', top: '24%', start: '150vw', width: 332, opacity: 0.36, duration: 68, travel: '-300vw', delay: -29, bob: 15, breath: 0.06, depth: 1, tint: '#F5D8E6' },
  { id: 'near-b', top: '61%', start: '-150vw', width: 370, opacity: 0.32, duration: 73, travel: '300vw', delay: -49, bob: 13, breath: 0.055, depth: 1.1, tint: '#F1CCDD' },
]

const SPARKLES = [
  { id: 's1', top: '16%', left: '14%', size: 10, delay: -0.6 },
  { id: 's2', top: '24%', left: '82%', size: 8, delay: -1.9 },
  { id: 's3', top: '40%', left: '8%', size: 11, delay: -3.2 },
  { id: 's4', top: '36%', left: '92%', size: 9, delay: -0.2 },
  { id: 's5', top: '58%', left: '22%', size: 8, delay: -2.5 },
  { id: 's6', top: '64%', left: '76%', size: 10, delay: -4.1 },
  { id: 's7', top: '78%', left: '36%', size: 8, delay: -1.2 },
]

export function CloudLayer({ reduce }: CloudLayerProps) {
  const pointerX = useSpring(useMotionValue(0), { stiffness: 45, damping: 22, mass: 0.7 })
  const pointerY = useSpring(useMotionValue(0), { stiffness: 45, damping: 22, mass: 0.7 })

  useEffect(() => {
    if (reduce) return
    const move = (x: number, y: number) => {
      pointerX.set(Math.max(-1, Math.min(1, x)) * 10)
      pointerY.set(Math.max(-1, Math.min(1, y)) * 7)
    }
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      move((event.clientX / window.innerWidth) * 2 - 1, (event.clientY / window.innerHeight) * 2 - 1)
    }
    const onTilt = (event: DeviceOrientationEvent) => {
      if (event.gamma === null || event.beta === null) return
      move(event.gamma / 35, (event.beta - 35) / 45)
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('deviceorientation', onTilt, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('deviceorientation', onTilt)
      pointerX.set(0)
      pointerY.set(0)
    }
  }, [pointerX, pointerY, reduce])

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {CLOUDS.map((cloud) => (
        <LivingCloud
          key={cloud.id}
          cloud={cloud}
          pointerX={pointerX}
          pointerY={pointerY}
          reduce={reduce}
        />
      ))}

      {SPARKLES.map((sparkle, index) => (
        <motion.svg
          key={sparkle.id}
          viewBox="0 0 24 24"
          className="absolute"
          style={{ top: sparkle.top, left: sparkle.left, width: sparkle.size, height: sparkle.size }}
          animate={reduce ? undefined : { opacity: [0.08, 0.55, 0.12], scale: [0.7, 1.1, 0.7] }}
          transition={{ duration: 5.2 + index * 0.37, repeat: Infinity, ease: 'easeInOut', delay: sparkle.delay }}
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

function LivingCloud({
  cloud,
  pointerX,
  pointerY,
  reduce,
}: {
  cloud: CloudSpec
  pointerX: MotionValue<number>
  pointerY: MotionValue<number>
  reduce: boolean
}) {
  const layerX = useTransform(pointerX, (value) => value * cloud.depth)
  const layerY = useTransform(pointerY, (value) => value * cloud.depth)
  return (
    <motion.div
      className="absolute"
      style={{
        top: cloud.top,
        left: cloud.start,
        width: cloud.width,
        x: reduce ? 0 : layerX,
        y: reduce ? 0 : layerY,
        opacity: reduce ? cloud.opacity : undefined,
      }}
    >
      <motion.div
        animate={
          reduce
            ? undefined
            : {
                x: ['0vw', cloud.travel],
                y: [0, -cloud.bob, cloud.bob * 0.35, 0],
                scale: [1, 1 + cloud.breath, 1],
                opacity: [cloud.opacity * 0.55, cloud.opacity, cloud.opacity * 0.78],
              }
        }
        transition={{
          duration: cloud.duration,
          repeat: Infinity,
          ease: 'linear',
          repeatType: 'loop',
          delay: cloud.delay,
        }}
      >
        <CloudShape tint={cloud.tint} id={cloud.id} />
      </motion.div>
    </motion.div>
  )
}

function CloudShape({ tint, id: cloudId }: { tint: string; id: string }) {
  const id = `cloud-${cloudId}`
  return (
    <svg viewBox="0 0 240 120" className="h-auto w-full" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor={tint} />
        </linearGradient>
      </defs>
      <g fill={`url(#${id})`}>
        <rect x="26" y="62" width="190" height="44" rx="22" />
        <ellipse cx="74" cy="60" rx="46" ry="33" />
        <ellipse cx="136" cy="48" rx="42" ry="36" />
        <ellipse cx="184" cy="66" rx="34" ry="25" />
        <ellipse cx="46" cy="72" rx="34" ry="23" />
        <ellipse cx="120" cy="96" rx="92" ry="10" fill={PALETTE.blushDeep} opacity="0.18" />
      </g>
    </svg>
  )
}
