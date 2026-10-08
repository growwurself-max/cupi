import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import { useEffect, useMemo } from 'react'

export type PremiumFrameVariant =
  | 'special'
  | 'birthday'
  | 'love'
  | 'anniversary'
  | 'proposal'
  | 'friendship'
  | 'graduation'
  | 'queen'
  | 'morning'
  | 'dusk'

interface FlagStyle {
  from: string
  to: string
  ink: string
}

interface BalloonStyle {
  emoji: string
  left: number
  duration: number
  sway: number
  delay: number
  opacity: number
}

interface VariantStyle {
  banner: string | null
  compact: boolean
  flags: FlagStyle[]
  rope: string
  glows: [string, string, string]
  heartColors: [string, string]
  balloons: BalloonStyle[]
  clouds: boolean
  hearts: boolean
  butterflies: boolean
  sparkles: boolean
  cloudTint?: string
  cloudShadow?: string
  centerWash?: string
  ringBorder?: string
  ringGlow?: string
  innerLine?: string
  glare?: string
}

interface CloudStyle {
  id: string
  className: string
  opacity: number
  blur: string
  drift: number
  duration: number
}

interface HeartStyle {
  id: string
  left: number
  top: number
  size: number
  delay: number
  duration: number
  drift: number
  opacity: number
}

interface SparkleStyle {
  id: string
  left: number
  top: number
  size: number
  delay: number
  duration: number
}

interface ButterflyStyle {
  id: string
  className: string
  upper: string
  lower: string
  flap: number
  delay: number
  float: number
}

const ROSE_FLAG: FlagStyle = { from: '#ffdcea', to: '#ffb9d4', ink: '#c2185b' }
const BLUSH_FLAG: FlagStyle = { from: '#fff0f5', to: '#ffd3e3', ink: '#ad1457' }
const LAV_FLAG: FlagStyle = { from: '#efe7ff', to: '#cfc0fb', ink: '#5e35b1' }
const CREAM_FLAG: FlagStyle = { from: '#fff7e6', to: '#f6dfae', ink: '#9a6b18' }
const SKY_FLAG: FlagStyle = { from: '#e6f3ff', to: '#c2ddfb', ink: '#1d5fa8' }
const PEACH_FLAG: FlagStyle = { from: '#ffeae0', to: '#ffc8b4', ink: '#b4501f' }

const VARIANTS: Record<PremiumFrameVariant, VariantStyle> = {
  special: {
    banner: 'HAPPY',
    compact: false,
    flags: [ROSE_FLAG, BLUSH_FLAG, LAV_FLAG, CREAM_FLAG, ROSE_FLAG],
    rope: '#f3a8c4',
    glows: ['rgba(255,226,238,0.9)', 'rgba(255,247,241,0.85)', 'rgba(254,205,211,0.62)'],
    heartColors: ['#f4a9c4', '#c9b6f5'],
    balloons: [
      { emoji: '🎈', left: 5, duration: 34, sway: -18, delay: 0, opacity: 0.35 },
      { emoji: '🎀', left: 90, duration: 30, sway: 16, delay: 5, opacity: 0.3 },
      { emoji: '🎈', left: 15, duration: 38, sway: 12, delay: 9, opacity: 0.22 },
    ],
    clouds: true,
    hearts: true,
    butterflies: true,
    sparkles: true,
    cloudTint: '#f4dbe7',
    cloudShadow: 'rgba(190,120,170,0.3)',
  },
  birthday: {
    banner: 'HAPPY',
    compact: false,
    flags: [BLUSH_FLAG, ROSE_FLAG, CREAM_FLAG, ROSE_FLAG, LAV_FLAG],
    rope: '#f7b3cb',
    glows: ['rgba(255,224,236,0.92)', 'rgba(255,249,233,0.8)', 'rgba(255,214,229,0.62)'],
    heartColors: ['#ff9eb8', '#f7c6dc'],
    balloons: [
      { emoji: '🎈', left: 4, duration: 32, sway: -16, delay: 0, opacity: 0.38 },
      { emoji: '🎀', left: 91, duration: 36, sway: 14, delay: 4, opacity: 0.3 },
      { emoji: '🎈', left: 13, duration: 40, sway: 10, delay: 10, opacity: 0.22 },
    ],
    clouds: true,
    hearts: true,
    butterflies: true,
    sparkles: true,
    cloudTint: '#f7dee6',
    cloudShadow: 'rgba(200,120,160,0.32)',
  },
  love: {
    banner: 'LOVE',
    compact: true,
    flags: [ROSE_FLAG, BLUSH_FLAG, ROSE_FLAG, LAV_FLAG],
    rope: '#ee9fb8',
    glows: ['rgba(255,231,240,0.9)', 'rgba(255,247,243,0.85)', 'rgba(250,214,224,0.6)'],
    heartColors: ['#f0879f', '#f4b0c6'],
    balloons: [
      { emoji: '🩷', left: 6, duration: 36, sway: -14, delay: 2, opacity: 0.3 },
      { emoji: '🎀', left: 89, duration: 33, sway: 15, delay: 6, opacity: 0.28 },
    ],
    clouds: true,
    hearts: true,
    butterflies: true,
    sparkles: true,
    cloudTint: '#f6dce8',
    cloudShadow: 'rgba(210,110,150,0.34)',
  },
  anniversary: {
    banner: 'FOREVER',
    compact: false,
    flags: [CREAM_FLAG, ROSE_FLAG, BLUSH_FLAG, CREAM_FLAG, LAV_FLAG, BLUSH_FLAG, ROSE_FLAG],
    rope: '#e2b678',
    glows: ['rgba(255,244,220,0.9)', 'rgba(255,235,244,0.75)', 'rgba(253,224,180,0.55)'],
    heartColors: ['#f2b8c6', '#e8c9a0'],
    balloons: [
      { emoji: '🎈', left: 5, duration: 35, sway: -15, delay: 1, opacity: 0.3 },
      { emoji: '✨', left: 90, duration: 31, sway: 13, delay: 7, opacity: 0.3 },
    ],
    clouds: true,
    hearts: true,
    butterflies: true,
    sparkles: true,
    cloudTint: '#f2e2cc',
    cloudShadow: 'rgba(190,150,110,0.3)',
  },
  proposal: {
    banner: 'YES!',
    compact: false,
    flags: [LAV_FLAG, BLUSH_FLAG, ROSE_FLAG, LAV_FLAG],
    rope: '#cdb6f4',
    glows: ['rgba(238,228,255,0.9)', 'rgba(255,236,247,0.8)', 'rgba(226,214,255,0.6)'],
    heartColors: ['#c9b6f5', '#f4a9c4'],
    balloons: [
      { emoji: '💝', left: 6, duration: 34, sway: -14, delay: 3, opacity: 0.3 },
      { emoji: '🩷', left: 89, duration: 37, sway: 15, delay: 8, opacity: 0.26 },
    ],
    clouds: true,
    hearts: true,
    butterflies: true,
    sparkles: true,
    cloudTint: '#e9dcf6',
    cloudShadow: 'rgba(140,110,200,0.3)',
  },
  friendship: {
    banner: 'BESTIES',
    compact: false,
    flags: [PEACH_FLAG, ROSE_FLAG, BLUSH_FLAG, LAV_FLAG, PEACH_FLAG, ROSE_FLAG, BLUSH_FLAG],
    rope: '#f4aebe',
    glows: ['rgba(255,232,238,0.9)', 'rgba(255,243,225,0.8)', 'rgba(255,219,226,0.6)'],
    heartColors: ['#ff9eb8', '#ffc39e'],
    balloons: [
      { emoji: '🎈', left: 4, duration: 33, sway: -17, delay: 0, opacity: 0.34 },
      { emoji: '✨', left: 91, duration: 29, sway: 14, delay: 6, opacity: 0.32 },
    ],
    clouds: true,
    hearts: true,
    butterflies: true,
    sparkles: true,
    cloudTint: '#f8dccd',
    cloudShadow: 'rgba(200,130,110,0.3)',
  },
  graduation: {
    banner: 'PROUD',
    compact: false,
    flags: [SKY_FLAG, CREAM_FLAG, BLUSH_FLAG, ROSE_FLAG, SKY_FLAG],
    rope: '#e9c98c',
    glows: ['rgba(255,238,244,0.85)', 'rgba(232,243,255,0.75)', 'rgba(255,246,214,0.55)'],
    heartColors: ['#f4b0c6', '#a9c9f2'],
    balloons: [
      { emoji: '🎓', left: 5, duration: 36, sway: -13, delay: 2, opacity: 0.32 },
      { emoji: '🎈', left: 90, duration: 32, sway: 15, delay: 7, opacity: 0.28 },
    ],
    clouds: true,
    hearts: true,
    butterflies: true,
    sparkles: true,
    cloudTint: '#dce8f6',
    cloudShadow: 'rgba(110,150,200,0.3)',
  },
  queen: {
    banner: null,
    compact: false,
    flags: [ROSE_FLAG, BLUSH_FLAG, LAV_FLAG, CREAM_FLAG, ROSE_FLAG],
    rope: '#f3a8c4',
    glows: ['rgba(255,224,238,0.85)', 'rgba(230,222,255,0.8)', 'rgba(255,222,236,0.55)'],
    heartColors: ['#f4a9c4', '#c9b6f5'],
    balloons: [],
    clouds: false,
    hearts: false,
    butterflies: false,
    sparkles: false,
  },
  morning: {
    banner: null,
    compact: true,
    flags: [CREAM_FLAG, PEACH_FLAG, SKY_FLAG, CREAM_FLAG, PEACH_FLAG],
    rope: '#e8b06a',
    glows: [
      'rgba(255,242,216,0.9)',
      'rgba(255,231,214,0.85)',
      'rgba(255,210,166,0.6)',
    ],
    heartColors: ['#ffc39e', '#f4c9a0'],
    balloons: [
      { emoji: '🌤️', left: 6, duration: 36, sway: -13, delay: 1, opacity: 0.3 },
      { emoji: '✨', left: 90, duration: 31, sway: 14, delay: 6, opacity: 0.3 },
    ],
    clouds: true,
    hearts: false,
    butterflies: true,
    sparkles: true,
    cloudTint: '#f6e9d2',
    cloudShadow: 'rgba(200,160,110,0.3)',
  },
  dusk: {
    banner: null,
    compact: false,
    flags: [],
    rope: '#c9a959',
    glows: [
      'rgba(32,38,66,0.95)',
      'rgba(40,34,64,0.9)',
      'rgba(98,78,44,0.6)',
    ],
    heartColors: ['#e2c47c', '#f1a9b4'],
    balloons: [
      { emoji: '✨', left: 8, duration: 34, sway: -12, delay: 2, opacity: 0.35 },
      { emoji: '🌙', left: 90, duration: 36, sway: 12, delay: 7, opacity: 0.3 },
    ],
    clouds: true,
    hearts: true,
    butterflies: false,
    sparkles: true,
    cloudTint: '#c9d8f2',
    cloudShadow: 'rgba(8,12,24,0.45)',
    centerWash: 'rgba(40,46,78,0.85)',
    ringBorder: 'border-[#c9a959]/60',
    ringGlow: 'rgba(201,169,89,0.35)',
    innerLine: '#c9a959',
    glare: 'radial-gradient(52% 40% at 50% 52%, rgba(201,169,89,0.22), rgba(201,169,89,0.06) 58%, transparent 80%)',
  },
}

const CLOUDS: CloudStyle[] = [
  { id: 'c1', className: '-bottom-8 -left-14 w-52 sm:w-72', opacity: 0.85, blur: 'blur-[1px]', drift: 26, duration: 28 },
  { id: 'c2', className: '-bottom-12 -right-16 w-60 sm:w-80', opacity: 0.7, blur: 'blur-[2px]', drift: -22, duration: 32 },
  { id: 'c3', className: 'bottom-[30%] -left-20 w-40 sm:w-56', opacity: 0.4, blur: 'blur-[4px]', drift: 16, duration: 36 },
  { id: 'c4', className: 'bottom-[46%] -right-24 w-36 sm:w-52', opacity: 0.3, blur: 'blur-[5px]', drift: -14, duration: 40 },
  { id: 'c5', className: 'bottom-[4%] left-[32%] w-40 sm:w-56', opacity: 0.45, blur: 'blur-[3px]', drift: 12, duration: 34 },
]

const HEARTS: HeartStyle[] = [
  { id: 'h1', left: 5, top: 22, size: 7, delay: 0, duration: 16, drift: 14, opacity: 0.5 },
  { id: 'h2', left: 92, top: 30, size: 6, delay: 1.4, duration: 18, drift: -12, opacity: 0.45 },
  { id: 'h3', left: 9, top: 68, size: 5, delay: 2.6, duration: 15, drift: 10, opacity: 0.4 },
  { id: 'h4', left: 87, top: 62, size: 8, delay: 0.8, duration: 20, drift: -16, opacity: 0.36 },
  { id: 'h5', left: 17, top: 44, size: 5, delay: 3.2, duration: 17, drift: 12, opacity: 0.3 },
  { id: 'h6', left: 79, top: 14, size: 6, delay: 2.1, duration: 19, drift: -10, opacity: 0.4 },
  { id: 'h7', left: 71, top: 83, size: 5, delay: 4, duration: 16, drift: 8, opacity: 0.3 },
  { id: 'h8', left: 29, top: 87, size: 6, delay: 1.1, duration: 21, drift: -9, opacity: 0.28 },
]

const SPARKLES: SparkleStyle[] = [
  { id: 's1', left: 13, top: 18, size: 13, delay: 0, duration: 9 },
  { id: 's2', left: 86, top: 24, size: 11, delay: 1.2, duration: 11 },
  { id: 's3', left: 7, top: 54, size: 15, delay: 2.4, duration: 10 },
  { id: 's4', left: 93, top: 47, size: 12, delay: 0.7, duration: 12 },
  { id: 's5', left: 24, top: 76, size: 10, delay: 3.1, duration: 9 },
  { id: 's6', left: 76, top: 71, size: 14, delay: 1.9, duration: 13 },
  { id: 's7', left: 45, top: 12, size: 10, delay: 2.8, duration: 11 },
  { id: 's8', left: 56, top: 90, size: 12, delay: 0.4, duration: 10 },
]

const BUTTERFLIES: ButterflyStyle[] = [
  {
    id: 'b1',
    className: 'left-[6%] top-[26%] w-6 sm:w-8',
    upper: '#f7a8c8',
    lower: '#ffd7e5',
    flap: 1.4,
    delay: 0,
    float: 11,
  },
  {
    id: 'b2',
    className: 'right-[7%] top-[54%] w-7 sm:w-9',
    upper: '#c9b8f8',
    lower: '#e7ddff',
    flap: 1.7,
    delay: 1.2,
    float: 13,
  },
]

interface PremiumFrameProps {
  variant?: PremiumFrameVariant
}

export function PremiumFrame({ variant = 'love' }: PremiumFrameProps) {
  const reduce = useReducedMotion() === true
  const style = VARIANTS[variant]

  const baseX = useMotionValue(0)
  const baseY = useMotionValue(0)
  const x = useSpring(baseX, { stiffness: 55, damping: 18, mass: 0.7 })
  const y = useSpring(baseY, { stiffness: 55, damping: 18, mass: 0.7 })

  useEffect(() => {
    if (reduce) return
    if (!window.matchMedia('(pointer: fine)').matches) return
    const onMove = (event: PointerEvent) => {
      baseX.set(((event.clientX / window.innerWidth) * 2 - 1) * -16)
      baseY.set(((event.clientY / window.innerHeight) * 2 - 1) * -10)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [reduce, baseX, baseY])

  const letters = useMemo(() => (style.banner ? style.banner.split('') : []), [style.banner])

  const wash = [
    `radial-gradient(65% 50% at 6% 2%, ${style.glows[0]}, transparent 72%)`,
    `radial-gradient(65% 45% at 94% 0%, ${style.glows[1]}, transparent 72%)`,
    `radial-gradient(95% 55% at 50% 102%, ${style.glows[2]}, transparent 70%)`,
    style.centerWash
      ? `radial-gradient(58% 44% at 50% 42%, ${style.centerWash}, ${style.centerWash} 30%, rgba(255,255,255,0.12) 62%, transparent 80%)`
      : 'radial-gradient(58% 44% at 50% 42%, rgba(255,255,255,0.55), rgba(255,255,255,0.12) 62%, transparent 80%)',
  ].join(', ')

  const ringBorder = style.ringBorder ?? 'border-white/70'
  const ringGlow = style.ringGlow ?? 'rgba(240,48,120,0.10)'
  const innerLine = style.innerLine ?? '#f03078'
  const glare = style.glare ??
    'bg-[radial-gradient(52%_40%_at_50%_52%,rgba(255,255,255,0.4),rgba(255,255,255,0.1)_58%,transparent_80%)]'

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0" style={{ background: wash }} />

      <div
        className={`absolute inset-2 rounded-[26px] border ${ringBorder}`}
        style={{ boxShadow: `0 0 0 1px ${ringGlow},0 0 60px ${ringGlow}` }}
      />
      <motion.div
        className="absolute inset-2 rounded-[26px]"
        style={{ boxShadow: `0 0 42px ${ringGlow}` }}
        animate={reduce ? undefined : { opacity: [0.3, 0.75, 0.3] }}
        transition={
          reduce ? undefined : { duration: 7, repeat: Infinity, ease: 'easeInOut' }
        }
      />
      <div
        className="absolute inset-[14px] rounded-[20px] border sm:inset-5 sm:rounded-[22px]"
        style={{ borderColor: `color-mix(in srgb, ${innerLine} 10%, transparent)` }}
      />

      <CornerOrnament className="absolute bottom-1 left-1 h-12 w-12 sm:h-16 sm:w-16" />
      <CornerOrnament className="absolute top-1 left-1 h-12 w-12 rotate-90 sm:h-16 sm:w-16" />
      <CornerOrnament className="absolute top-1 right-1 h-12 w-12 rotate-180 sm:h-16 sm:w-16" />
      <CornerOrnament className="absolute right-1 bottom-1 h-12 w-12 -rotate-90 sm:h-16 sm:w-16" />

      <motion.div
        className="absolute inset-0"
        style={{ x, y }}
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      >
        {style.clouds &&
          CLOUDS.map((cloud) => (
            <motion.div
              key={cloud.id}
              className={`absolute ${cloud.className} ${cloud.blur}`}
              style={{
                opacity: cloud.opacity,
                filter: `drop-shadow(0 10px 14px ${style.cloudShadow ?? 'rgba(200,120,160,0.25)'})`,
              }}
              animate={reduce ? undefined : { x: [0, cloud.drift, 0] }}
              transition={
                reduce
                  ? undefined
                  : { duration: cloud.duration, repeat: Infinity, ease: 'easeInOut' }
              }
            >
              <CloudShape tint={style.cloudTint ?? '#ffffff'} />
            </motion.div>
          ))}

        {style.balloons.map((balloon) => (
          <motion.span
            key={`${balloon.emoji}-${balloon.left}`}
            className="absolute text-2xl select-none sm:text-3xl"
            style={{ left: `${balloon.left}%`, bottom: '-10%' }}
            initial={reduce ? { opacity: balloon.opacity } : { opacity: 0 }}
            animate={
              reduce
                ? { opacity: balloon.opacity }
                : {
                    y: ['0vh', '-118vh'],
                    x: [0, balloon.sway, 0],
                    opacity: [0, balloon.opacity, balloon.opacity, 0],
                  }
            }
            transition={
              reduce
                ? undefined
                : {
                    duration: balloon.duration,
                    repeat: Infinity,
                    delay: balloon.delay,
                    ease: 'linear',
                  }
            }
          >
            {balloon.emoji}
          </motion.span>
        ))}

        {style.hearts &&
          HEARTS.map((heart, index) => {
          const color = style.heartColors[index % style.heartColors.length]
          return (
            <motion.span
              key={heart.id}
              className="absolute rounded-full"
              style={{
                left: `${heart.left}%`,
                top: `${heart.top}%`,
                width: heart.size,
                height: heart.size,
                background: color,
                boxShadow: `0 0 10px ${color}`,
                opacity: heart.opacity,
              }}
              animate={
                reduce
                  ? undefined
                  : {
                      y: [0, -24, 0],
                      x: Math.sin(heart.delay + index) * heart.drift,
                      opacity: [heart.opacity, heart.opacity + 0.2, heart.opacity],
                      borderRadius: ['50%', '50% 0 50% 50%', '50%'],
                    }
              }
              transition={
                reduce
                  ? undefined
                  : {
                      duration: heart.duration,
                      repeat: Infinity,
                      delay: heart.delay,
                      ease: 'easeInOut',
                    }
              }
            />
          )
        })}

        {style.sparkles &&
          SPARKLES.map((sparkle) => (
            <motion.span
              key={sparkle.id}
              className="absolute text-[#f472b6]"
              style={{ left: `${sparkle.left}%`, top: `${sparkle.top}%`, fontSize: sparkle.size }}
              animate={
                reduce
                  ? undefined
                  : {
                      y: [-5, -20, -5],
                      opacity: [0.15, 0.65, 0.15],
                      scale: [0.7, 1.15, 0.7],
                    }
              }
              transition={
                reduce
                  ? undefined
                  : {
                      duration: sparkle.duration,
                      repeat: Infinity,
                      delay: sparkle.delay,
                      ease: 'easeInOut',
                    }
              }
            >
              ✦
            </motion.span>
          ))}

        {style.butterflies &&
          BUTTERFLIES.map((butterfly) => (
            <motion.div
              key={butterfly.id}
              className={`absolute ${butterfly.className}`}
              animate={
                reduce ? undefined : { y: [0, -14, 0], x: [0, 8, 0], rotate: [-6, 7, -6] }
              }
              transition={
                reduce
                  ? undefined
                  : {
                      duration: butterfly.float,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: butterfly.delay,
                    }
              }
            >
              <ButterflyShape
                upper={butterfly.upper}
                lower={butterfly.lower}
                flap={butterfly.flap}
                delay={butterfly.delay}
                reduce={reduce}
              />
            </motion.div>
          ))}

        {style.banner && (
          <motion.div
            className={`absolute inset-x-0 flex justify-center px-3 ${style.compact ? 'top-9 sm:top-10' : 'top-11 sm:top-12'}`}
            initial={reduce ? false : { opacity: 0, y: -22 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.15, ease: 'easeOut' }}
          >
            <div className="relative">
              <svg
                viewBox="0 0 300 30"
                preserveAspectRatio="none"
                className="absolute -top-3 left-1/2 h-9 w-[145%] -translate-x-1/2"
                aria-hidden
              >
                <path
                  d="M2 6 Q150 28 298 6"
                  fill="none"
                  stroke={style.rope}
                  strokeWidth="2"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              <div
                className={`flex items-start ${style.compact ? 'gap-1 sm:gap-1.5' : 'gap-1.5 sm:gap-2.5'}`}
              >
                {letters.map((letter, index) => {
                  const flag = style.flags[index % style.flags.length]
                  const droop = index % 2 === 0 ? 4 : 10
                  return (
                    <motion.div
                      key={`${letter}-${index}`}
                      initial={reduce ? false : { opacity: 0, y: -16 }}
                      animate={
                        reduce
                          ? { opacity: 1, rotate: index % 2 === 0 ? -2 : 2 }
                          : {
                              opacity: 1,
                              y: 0,
                              rotate:
                                index % 2 === 0 ? [-2.5, 2.5, -2.5] : [2.5, -2.5, 2.5],
                            }
                      }
                      transition={{
                        y: { duration: 0.5, delay: 0.3 + index * 0.1, ease: 'easeOut' },
                        opacity: { duration: 0.5, delay: 0.3 + index * 0.1 },
                        rotate: reduce
                          ? { duration: 0 }
                          : {
                              duration: 3.4 + index * 0.5,
                              repeat: Infinity,
                              ease: 'easeInOut',
                              delay: index * 0.3,
                            },
                      }}
                      style={{ marginTop: droop, transformOrigin: 'top center' }}
                      className="drop-shadow-[0_6px_10px_rgba(200,110,150,0.32)]"
                    >
                      <div
                        className={`flex items-start justify-center pt-1 [clip-path:polygon(0_0,100%_0,100%_70%,50%_100%,0_70%)] ${
                          style.compact
                            ? 'h-9 w-7 pt-1 sm:h-10 sm:w-8 sm:pt-1.5'
                            : 'h-10 w-8 pt-1.5 sm:h-12 sm:w-10 sm:pt-2.5'
                        }`}
                        style={{
                          background: `linear-gradient(180deg, ${flag.from} 0%, ${flag.to} 100%)`,
                        }}
                      >
                        <span
                          className={`font-display font-bold ${style.compact ? 'text-sm sm:text-base' : 'text-lg sm:text-2xl'}`}
                          style={{ color: flag.ink }}
                        >
                          {letter}
                        </span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      <div
        className={style.glare ? 'absolute inset-0' : glare}
        style={style.glare ? { background: style.glare } : undefined}
      />
    </div>
  )
}

function CloudShape({ tint }: { tint: string }) {
  return (
    <svg viewBox="0 0 240 110" className="h-auto w-full" aria-hidden>
      <g fill={tint}>
        <rect x="30" y="58" width="180" height="44" rx="22" />
        <ellipse cx="78" cy="58" rx="46" ry="34" />
        <ellipse cx="138" cy="48" rx="40" ry="36" />
        <ellipse cx="182" cy="64" rx="34" ry="26" />
        <ellipse cx="48" cy="70" rx="34" ry="24" />
      </g>
    </svg>
  )
}

function CornerOrnament({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 72 72" className={className} fill="none" aria-hidden>
      <path
        d="M4 68 C4 36 24 12 56 6"
        stroke="#d8a860"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.75"
      />
      <path
        d="M10 68 C14 50 28 38 50 33"
        stroke="#f2a7c3"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path
        d="M22 48 C30 42 40 42 46 48 C40 54 30 54 22 48 Z"
        fill="#f7bcd2"
        opacity="0.6"
      />
      <path
        d="M4 68 C18 64 30 54 36 40"
        stroke="#d8a860"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.5"
      />
      <circle cx="4" cy="68" r="2.6" fill="#d8a860" opacity="0.85" />
      <circle cx="56" cy="6" r="2.2" fill="#f2a7c3" opacity="0.9" />
      <circle cx="36" cy="40" r="1.8" fill="#d8a860" opacity="0.6" />
    </svg>
  )
}

interface ButterflyShapeProps {
  upper: string
  lower: string
  flap: number
  delay: number
  reduce: boolean
}

function ButterflyShape({ upper, lower, flap, delay, reduce }: ButterflyShapeProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      className="h-auto w-full drop-shadow-[0_3px_8px_rgba(190,120,160,0.4)]"
      aria-hidden
    >
      <motion.g
        initial={reduce ? false : { scaleX: 1, originX: 1, originY: 0.5 }}
        animate={
          reduce ? undefined : { scaleX: [1, 0.45, 1], originX: 1, originY: 0.5 }
        }
        transition={
          reduce ? undefined : { duration: flap, repeat: Infinity, ease: 'easeInOut', delay }
        }
      >
        <path d="M32 32 C31 14 18 5 9 10 C1 15 6 28 31 34 Z" fill={upper} />
        <path d="M31 35 C14 33 4 40 8 49 C12 57 24 51 32 38 Z" fill={lower} />
        <circle cx="18" cy="20" r="3" fill="#ffffff" opacity="0.55" />
      </motion.g>
      <motion.g
        initial={reduce ? false : { scaleX: 1, originX: 0, originY: 0.5 }}
        animate={
          reduce ? undefined : { scaleX: [1, 0.45, 1], originX: 0, originY: 0.5 }
        }
        transition={
          reduce ? undefined : { duration: flap, repeat: Infinity, ease: 'easeInOut', delay }
        }
      >
        <path d="M32 32 C33 14 46 5 55 10 C63 15 58 28 33 34 Z" fill={upper} />
        <path d="M33 35 C50 33 60 40 56 49 C52 57 40 51 32 38 Z" fill={lower} />
        <circle cx="46" cy="20" r="3" fill="#ffffff" opacity="0.55" />
      </motion.g>
      <path d="M32 24 C34.5 30 34.5 45 32 53 C29.5 45 29.5 30 32 24 Z" fill="#8c5b73" />
      <path
        d="M31.5 26 C29 20 26 18 23.5 17 M32.5 26 C35 20 38 18 40.5 17"
        fill="none"
        stroke="#8c5b73"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
