import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { PALETTE } from '../palette'

interface BuntingProps {
  text: string
  reduce: boolean
  className?: string
}

const FLAGS = [
  { from: '#FDEAF1', to: '#F6C6D8', ink: '#8C2E52' },
  { from: '#FBD9E6', to: '#EFA7C4', ink: '#7A2547' },
  { from: '#FFF4DF', to: '#F0D9A6', ink: '#8A6520' },
  { from: '#F1E7FF', to: '#D6C4F4', ink: '#5B3A86' },
  { from: '#FCE3EE', to: '#F3A7C0', ink: '#8C2E52' },
]

/** How far a flag hangs below the straight line, given normalised x in [0,1]. */
function sag(t: number, amount: number) {
  const x = t * 2 - 1
  return (1 - x * x) * amount
}

/**
 * Crisp SVG "HAPPY BIRTHDAY" bunting: a curved string strung with fairy lights,
 * harmoniously pastel pennants and bows at the ends. Flags unfurl one by one and
 * then sway gently as if hung from the string. Never rasterized.
 */
export function Bunting({ text, reduce, className = '' }: BuntingProps) {
  const chars = useMemo(() => Array.from(text.trim()).slice(0, 18), [text])
  const compact = chars.length > 11
  const flagW = compact ? 24 : 32
  const flagH = compact ? 42 : 54
  const sagAmount = compact ? 12 : 16

  return (
    <div className={`relative w-full ${className ?? ''}`} role="img" aria-label={text}>
      {/* the string + fairy lights */}
      <svg
        viewBox="0 0 400 40"
        preserveAspectRatio="none"
        className="absolute inset-x-0 top-0 h-8 w-full"
        aria-hidden
      >
        <path
          d="M0 6 Q200 32 400 6"
          fill="none"
          stroke={PALETTE.roseMid}
          strokeWidth="2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        {Array.from({ length: 8 }).map((_, i) => {
          const t = (i + 0.5) / 8
          const x = t * 400
          const y = 6 + (1 - Math.pow(2 * t - 1, 2)) * 26
          return (
            <motion.circle
              key={i}
              cx={x}
              cy={y}
              r="3"
              fill={PALETTE.goldLight}
              animate={reduce ? undefined : { opacity: [0.25, 0.95, 0.25] }}
              transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.45 }}
            />
          )
        })}
      </svg>

      <Bow className="absolute -left-1 top-1" />
      <Bow className="absolute -right-1 top-1" flip />

      {/* flags */}
      <div className="relative flex items-start justify-center pt-2">
        {chars.map((char, index) => {
          const t = chars.length > 1 ? index / (chars.length - 1) : 0.5
          const drop = sag(t, sagAmount)
          const flag = FLAGS[index % FLAGS.length]
          return (
            <motion.div
              key={`${char}-${index}`}
              initial={reduce ? { opacity: 1 } : { opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: reduce ? 0 : index * 0.07, ease: 'easeOut' }}
              style={{ marginTop: 20 + drop, marginLeft: compact ? 1.5 : 3, marginRight: compact ? 1.5 : 3 }}
            >
              <motion.div
                animate={reduce ? undefined : { rotate: index % 2 === 0 ? [-2.5, 2, -2.5] : [2, -2.5, 2] }}
                transition={{ duration: 3.4 + (index % 4) * 0.4, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: 'top center' }}
              >
                <div
                  className="flex items-start justify-center pt-1.5"
                  style={{
                    width: flagW,
                    height: flagH,
                    background: `linear-gradient(180deg, ${flag.from} 0%, ${flag.to} 100%)`,
                    clipPath: 'polygon(0 0, 100% 0, 100% 72%, 50% 100%, 0 72%)',
                    boxShadow: '0 4px 10px -5px rgba(120,60,80,0.4)',
                  }}
                >
                  <span
                    className="font-display font-bold leading-none"
                    style={{ color: flag.ink, fontSize: compact ? 13 : 17 }}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                </div>
              </motion.div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function Bow({ className = '', flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      width="34"
      height="30"
      viewBox="0 0 34 30"
      className={className}
      style={{ transform: flip ? 'scaleX(-1)' : undefined }}
      aria-hidden
    >
      <path
        d="M17 15 C8 4 1 7 3 14 C1 21 9 25 17 15 Z"
        fill={PALETTE.roseDeep}
      />
      <path
        d="M17 15 C26 4 33 7 31 14 C33 21 25 25 17 15 Z"
        fill={PALETTE.roseMid}
      />
      <circle cx="17" cy="15" r="3.6" fill={PALETTE.goldLight} />
      <path d="M17 18 L13 29 M17 18 L21 29" stroke={PALETTE.roseDeep} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
