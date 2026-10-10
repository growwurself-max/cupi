import type { ReactNode } from 'react'
import { PALETTE } from '../palette'

/* ------------------------------------------------------------------ */
/* Paper card                                                          */
/* ------------------------------------------------------------------ */

interface PaperCardProps {
  children: ReactNode
  className?: string
  /** Slightly warmer paper for letter scenes. */
  tone?: 'cream' | 'blush'
}

/** A soft hand-made paper card with a fine gold hairline and gentle grain. */
export function PaperCard({ children, className = '', tone = 'cream' }: PaperCardProps) {
  const bg =
    tone === 'cream'
      ? `linear-gradient(180deg, ${PALETTE.cream} 0%, ${PALETTE.creamDeep} 100%)`
      : `linear-gradient(180deg, #FFF6FA 0%, #FBE4EC 100%)`
  return (
    <div
      className={`relative overflow-hidden rounded-[26px] ${className}`}
      style={{
        background: bg,
        boxShadow:
          '0 26px 60px -30px rgba(110,36,64,0.55), 0 2px 0 rgba(255,255,255,0.7) inset',
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          background:
            'repeating-linear-gradient(115deg, rgba(190,140,120,0.05) 0 1px, transparent 1px 3px)',
          mixBlendMode: 'multiply',
        }}
      />
      <div
        className="pointer-events-none absolute inset-[7px] rounded-[20px]"
        style={{ border: `1px solid ${PALETTE.gold}`, opacity: 0.5 }}
      />
      <div className="relative">{children}</div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Balloon                                                             */
/* ------------------------------------------------------------------ */

const BALLOON_TONES = [
  { a: '#F8D3E1', b: '#E48AAB' },
  { a: '#FDEAD1', b: '#E7C06B' },
  { a: '#EFE3FB', b: '#B99BE6' },
  { a: '#FCE0E8', b: '#EE9BB6' },
  { a: '#FBE9F0', b: '#D98FB0' },
]

export function Balloon({
  tone = 0,
  size = 92,
  label,
  className = '',
}: {
  tone?: number
  size?: number
  label?: string
  className?: string
}) {
  const colors = BALLOON_TONES[tone % BALLOON_TONES.length]
  const gid = `bal-${tone}-${colors.b.replace('#', '')}`
  return (
    <svg
      width={size}
      height={size * 1.5}
      viewBox="0 0 100 150"
      className={className}
      role="img"
      aria-label={label}
    >
      <defs>
        <radialGradient id={gid} cx="35%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="30%" stopColor={colors.a} />
          <stop offset="100%" stopColor={colors.b} />
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="46" rx="36" ry="44" fill={`url(#${gid})`} />
      <ellipse cx="37" cy="30" rx="10" ry="15" fill="#FFFFFF" opacity="0.55" />
      <path d="M50 88 L44 96 L56 96 Z" fill={PALETTE.roseDeep} />
      <path
        d="M50 96 C 58 112, 42 120, 50 136"
        fill="none"
        stroke={PALETTE.berrySoft}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Teddy bear on a swing                                               */
/* ------------------------------------------------------------------ */

interface TeddyProps {
  /** 'a' | 'b' alternate for a pair of teddies. */
  variant?: 'a' | 'b'
  size?: number
  className?: string
}

/** A hand-drawn teddy sitting on a swing, ready to be nudged by the child. */
export function TeddyOnSwing({ variant = 'a', size = 150, className = '' }: TeddyProps) {
  const fur = variant === 'a' ? '#E7B98E' : '#D9A06B'
  const furDark = variant === 'a' ? '#C99A6D' : '#B9834F'
  const tummy = '#FBEBD6'
  return (
    <svg width={size} height={size} viewBox="0 0 160 170" className={className} aria-hidden>
      {/* swing ropes */}
      <path d="M30 0 L40 96 M130 0 L120 96" stroke={PALETTE.goldDeep} strokeWidth="2.4" strokeLinecap="round" />
      {/* seat */}
      <rect x="34" y="92" width="92" height="12" rx="6" fill={PALETTE.gold} />
      <rect x="34" y="92" width="92" height="5" rx="2.5" fill={PALETTE.goldLight} />
      {/* legs */}
      <ellipse cx="58" cy="100" rx="11" ry="8" fill={furDark} />
      <ellipse cx="102" cy="100" rx="11" ry="8" fill={furDark} />
      {/* body */}
      <ellipse cx="80" cy="72" rx="30" ry="30" fill={fur} />
      <ellipse cx="80" cy="76" rx="19" ry="20" fill={tummy} />
      {/* arms */}
      <ellipse cx="50" cy="66" rx="10" ry="14" fill={furDark} transform="rotate(18 50 66)" />
      <ellipse cx="110" cy="66" rx="10" ry="14" fill={furDark} transform="rotate(-18 110 66)" />
      {/* head */}
      <circle cx="80" cy="38" r="26" fill={fur} />
      <circle cx="60" cy="22" r="10" fill={fur} />
      <circle cx="100" cy="22" r="10" fill={fur} />
      <circle cx="60" cy="22" r="5" fill={furDark} />
      <circle cx="100" cy="22" r="5" fill={furDark} />
      <ellipse cx="80" cy="46" rx="12" ry="10" fill={tummy} />
      <circle cx="70" cy="36" r="3" fill={PALETTE.berry} />
      <circle cx="90" cy="36" r="3" fill={PALETTE.berry} />
      <ellipse cx="80" cy="43" rx="4" ry="3" fill={PALETTE.berry} />
      <path d="M80 46 V52 M80 52 C76 56 72 55 72 55 M80 52 C84 56 88 55 88 55" stroke={PALETTE.berry} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {/* little bow */}
      <path d="M80 66 L72 62 L72 70 Z" fill={PALETTE.roseMid} />
      <path d="M80 66 L88 62 L88 70 Z" fill={PALETTE.roseDeep} />
      <circle cx="80" cy="66" r="2.4" fill={PALETTE.goldLight} />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Small icons                                                         */
/* ------------------------------------------------------------------ */

export function Sparkle({ size = 16, color = PALETTE.goldLight, className = '' }: { size?: number; color?: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden>
      <path d="M12 1 C13 8 16 11 23 12 C16 13 13 16 12 23 C11 16 8 13 1 12 C8 11 11 8 12 1 Z" fill={color} />
    </svg>
  )
}

export function Heart({ size = 18, color = PALETTE.roseDeep, className = '' }: { size?: number; color?: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden>
      <path
        d="M12 21 C5 15 2 11.5 2 8.2 C2 5.3 4.3 3 7.2 3 C9.2 3 10.9 3.9 12 5.4 C13.1 3.9 14.8 3 16.8 3 C19.7 3 22 5.3 22 8.2 C22 11.5 19 15 12 21 Z"
        fill={color}
      />
    </svg>
  )
}
