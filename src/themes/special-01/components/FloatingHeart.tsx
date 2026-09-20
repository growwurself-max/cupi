import { motion } from 'framer-motion'

interface FloatingHeartProps {
  size?: number
  color?: string
  glow?: string
  excited?: boolean
  className?: string
}

/**
 * A glowing, gently-levitating 3D-styled heart built entirely from CSS/SVG.
 * `excited` intensifies the heartbeat so the heart visibly reacts to the
 * arrow strike before Act 2 takes over.
 */
export function FloatingHeart({
  size = 104,
  color = '#ff8296',
  glow = '#f9b16e',
  excited = false,
  className = '',
}: FloatingHeartProps) {
  return (
    <motion.div
      className={`relative select-none ${className}`}
      style={{ width: size, height: size }}
      animate={
        excited
          ? { y: [0, -12, 0], scale: [1, 1.28, 0.92, 1.18, 1] }
          : { y: [0, -12, 0], scale: 1 }
      }
      transition={
        excited
          ? { duration: 0.9, ease: 'easeInOut', times: [0, 0.35, 0.55, 0.75, 1] }
          : { duration: 3.4, repeat: Infinity, ease: 'easeInOut' }
      }
      aria-hidden
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at 50% 55%, ${glow}59, transparent 70%)`,
          filter: 'blur(14px)',
          opacity: excited ? 1 : 0.85,
        }}
      />
      <motion.svg
        viewBox="0 0 24 24"
        className="relative h-full w-full"
        style={{
          transform: 'rotateX(18deg) rotateY(-14deg)',
          transformStyle: 'preserve-3d',
          filter: `drop-shadow(0 8px 20px ${color}66)`,
        }}
        animate={excited ? { rotateX: [18, 26, 18], rotateY: [-14, -6, -14] } : {}}
        transition={excited ? { duration: 0.9, ease: 'easeInOut' } : {}}
      >
        <motion.path
          d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
          fill={color}
        />
        <path
          d="M16.2 8.4a2.9 2.9 0 0 1 2.1 2"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="1.1"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M5.5 8.6a3 3 0 0 0 2.2 1"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
        />
      </motion.svg>
      <motion.span
        className="absolute rounded-full bg-white/80 blur-[2px]"
        style={{ left: '30%', top: '20%', width: size * 0.16, height: size * 0.12 }}
        animate={{ opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  )
}