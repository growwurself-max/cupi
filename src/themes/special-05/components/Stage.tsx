import { motion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'
import { GOLD_TRIM, PALETTE } from '../palette'

/** Consistent full-height stage scene with room for the fixed toolbar. */
export function StageScene({
  children,
  className = '',
  ...rest
}: HTMLMotionProps<'section'> & { children: ReactNode }) {
  return (
    <motion.section
      className={`relative z-10 mx-auto flex min-h-dvh w-full max-w-2xl flex-col items-center justify-center px-5 pb-16 pt-24 text-center sm:px-8 ${className}`}
      {...rest}
    >
      {children}
    </motion.section>
  )
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.42em] text-[#a9748c]">
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: PALETTE.gold }} />
      {children}
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: PALETTE.gold }} />
    </span>
  )
}

export function SceneTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h2
      className={`font-display text-3xl font-bold leading-tight sm:text-5xl ${className}`}
      style={{ color: PALETTE.berry }}
    >
      {children}
    </h2>
  )
}

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  className?: string
  ariaLabel?: string
}

export function PrimaryButton({ children, onClick, className = '', ariaLabel }: ButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.03 }}
      className={`rounded-full px-8 py-3.5 text-sm font-bold uppercase tracking-[0.18em] outline-none focus-visible:ring-2 focus-visible:ring-[#a9748c] ${className}`}
      style={{ background: GOLD_TRIM, color: PALETTE.berry, boxShadow: '0 16px 34px -14px rgba(120,60,80,0.65)' }}
    >
      {children}
    </motion.button>
  )
}

export function GhostButton({ children, onClick, className = '', ariaLabel }: ButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      whileTap={{ scale: 0.96 }}
      className={`rounded-full border bg-white/70 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] backdrop-blur-sm outline-none focus-visible:ring-2 focus-visible:ring-[#a9748c] ${className}`}
      style={{ borderColor: 'rgba(194,104,140,0.35)', color: PALETTE.berrySoft }}
    >
      {children}
    </motion.button>
  )
}
