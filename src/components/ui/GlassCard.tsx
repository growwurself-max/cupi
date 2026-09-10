import { motion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: ReactNode
  className?: string
  glow?: 'none' | 'primary' | 'violet'
}

export function GlassCard({
  children,
  className = '',
  glow = 'none',
  ...rest
}: GlassCardProps) {
  const glowClass =
    glow === 'primary' ? 'glow-primary' : glow === 'violet' ? 'glow-violet' : ''

  return (
    <motion.div
      className={`glass-panel relative rounded-3xl ${glowClass} ${className}`}
      {...rest}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
      />
      {children}
    </motion.div>
  )
}