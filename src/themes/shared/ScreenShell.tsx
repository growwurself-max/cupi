import { motion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'

const screenVariants = {
  initial: { opacity: 0, y: 28, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -18, scale: 0.97 },
}

interface ScreenShellProps extends HTMLMotionProps<'section'> {
  children: ReactNode
  className?: string
  background?: string
}

export function ScreenShell({
  children,
  className = '',
  background,
  ...rest
}: ScreenShellProps) {
  return (
    <motion.section
      variants={screenVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-5 py-20 sm:px-8 ${className}`}
      style={background ? { background } : undefined}
      {...rest}
    >
      {children}
    </motion.section>
  )
}