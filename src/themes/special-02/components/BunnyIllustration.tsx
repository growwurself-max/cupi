import { motion } from 'framer-motion'

export function BunnyIllustration({ className = '' }: { className?: string }) {
  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      className={className}
      aria-hidden
    >
      <svg viewBox="0 0 200 240" className="h-full w-full drop-shadow-lg" fill="none">
        <ellipse cx="100" cy="200" rx="72" ry="18" fill="rgba(244,114,182,0.15)" />
        <path
          d="M68 95 C58 40 72 18 88 42 C92 20 108 18 112 42 C128 18 142 40 132 95 Z"
          fill="#FFE8EE"
          stroke="#FFB5C2"
          strokeWidth="2"
        />
        <ellipse cx="100" cy="130" rx="58" ry="62" fill="#FFF5F7" stroke="#FFB5C2" strokeWidth="2" />
        <circle cx="82" cy="118" r="6" fill="#4A3728" />
        <circle cx="118" cy="118" r="6" fill="#4A3728" />
        <ellipse cx="100" cy="132" rx="8" ry="6" fill="#FFB5C2" />
        <path d="M88 142 Q100 152 112 142" stroke="#E879A9" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <circle cx="74" cy="128" r="10" fill="#FFD6E0" opacity="0.65" />
        <circle cx="126" cy="128" r="10" fill="#FFD6E0" opacity="0.65" />
      </svg>
    </motion.div>
  )
}
