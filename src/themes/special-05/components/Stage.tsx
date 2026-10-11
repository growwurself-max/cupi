import { m as motion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'
import { GOLD_TRIM, PALETTE } from '../palette'
import { AnimatedText, type TextEffect } from './AnimatedText'

export type SceneMotionPreset =
  | 'circle-reveal'
  | 'zoom-through'
  | 'float-up'
  | 'unfold'
  | 'push-left'
  | 'wipe'
  | 'page-fold'
  | 'split'
  | 'flip'
  | 'spiral'

const SCENE_MOTION: Record<
  SceneMotionPreset,
  { initial: Record<string, number | string>; exit: Record<string, number | string>; duration: number }
> = {
  'circle-reveal': {
    initial: { opacity: 0, clipPath: 'circle(0% at 50% 50%)', y: 26 },
    exit: { opacity: 0, clipPath: 'circle(0% at 50% 50%)' },
    duration: 1,
  },
  'zoom-through': {
    initial: { opacity: 0, scale: 1.14 },
    exit: { opacity: 0, scale: 0.82 },
    duration: 0.65,
  },
  'float-up': {
    initial: { opacity: 0, y: 44 },
    exit: { opacity: 0, y: -24 },
    duration: 0.7,
  },
  unfold: {
    initial: { opacity: 0, rotateX: 20, y: 18 },
    exit: { opacity: 0, rotateX: -12, y: -16 },
    duration: 0.75,
  },
  'push-left': {
    initial: { opacity: 0, x: '18vw' },
    exit: { opacity: 0, x: '-16vw' },
    duration: 0.62,
  },
  wipe: {
    initial: { opacity: 0.4, clipPath: 'inset(0 100% 0 0)' },
    exit: { opacity: 0, clipPath: 'inset(0 0 0 100%)' },
    duration: 0.72,
  },
  'page-fold': {
    initial: { opacity: 0, rotateY: -24, x: 26 },
    exit: { opacity: 0, rotateY: 20, x: -18 },
    duration: 0.72,
  },
  split: {
    initial: { opacity: 0, scaleX: 0.72, scaleY: 0.94 },
    exit: { opacity: 0, scaleX: 0.76, scaleY: 0.96 },
    duration: 0.66,
  },
  flip: {
    initial: { opacity: 0, rotateY: 70, scale: 0.92 },
    exit: { opacity: 0, rotateY: -55, scale: 0.94 },
    duration: 0.7,
  },
  spiral: {
    initial: { opacity: 0, rotate: -14, scale: 0.68 },
    exit: { opacity: 0, rotate: 10, scale: 0.78 },
    duration: 0.76,
  },
}

/** Consistent full-height stage scene with room for the fixed toolbar. */
export function StageScene({
  children,
  className = '',
  motionPreset,
  reduceMotion = false,
  ...rest
}: HTMLMotionProps<'section'> & {
  children: ReactNode
  motionPreset?: SceneMotionPreset
  reduceMotion?: boolean
}) {
  const choreography = motionPreset ? SCENE_MOTION[motionPreset] : null
  const motionProps: Pick<HTMLMotionProps<'section'>, 'initial' | 'animate' | 'exit' | 'transition'> = choreography
    ? reduceMotion
      ? {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: 0.35, ease: 'easeOut' },
        }
      : {
          initial: choreography.initial,
          animate: {
            opacity: 1,
            ...Object.fromEntries(
              Object.keys(choreography.initial)
                .filter((key) => key !== 'opacity')
                .map((key) => [
                  key,
                  key === 'clipPath'
                    ? String(choreography.initial.clipPath).startsWith('circle')
                      ? 'circle(150% at 50% 50%)'
                      : 'inset(0 0 0 0)'
                    : key === 'scale' || key === 'scaleX' || key === 'scaleY'
                      ? 1
                      : 0,
                ]),
            ),
          },
          exit: choreography.exit,
          transition: { duration: choreography.duration, ease: [0.22, 1, 0.36, 1] },
        }
    : {}
  return (
    <motion.section
      className={`relative z-10 mx-auto flex min-h-dvh w-full max-w-2xl flex-col items-center justify-center px-5 pb-16 pt-24 text-center sm:px-8 ${className}`}
      {...rest}
      style={{
        ...rest.style,
        paddingTop: 'calc(6rem + env(safe-area-inset-top))',
        paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))',
      }}
      {...motionProps}
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

export function SceneTitle({
  children,
  className = '',
  reduce = false,
  effect = 'masked',
  highlightText,
}: {
  children: ReactNode
  className?: string
  reduce?: boolean
  effect?: TextEffect
  highlightText?: string
}) {
  return (
    <h2
      className={`font-display text-3xl font-bold leading-tight sm:text-5xl ${className}`}
      style={{ color: PALETTE.berry }}
    >
      {typeof children === 'string' ? (
        <AnimatedText text={children} effect={effect} reduce={reduce} highlightText={highlightText} />
      ) : (
        children
      )}
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
