import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { TeddyDecor } from '../TeddyDecor'

interface Screen2TeddyExcitementProps {
  config: ExperienceConfig
  onYes: () => void
}

export function Screen2TeddyExcitement({
  config,
  onYes,
}: Screen2TeddyExcitementProps) {
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 })
  const [noTaps, setNoTaps] = useState(0)

  const noLabels = useMemo(
    () => [
      "You can't say no to Teddy! 🥺",
      "Teddy insists... you can't! 🧸",
      "Nice try! But no escape! 💕",
      "Teddy won't let you! 😤",
      'Teddy says... only yes! 💖',
    ],
    [],
  )

  const currentNoLabel = noLabels[noTaps % noLabels.length]

  const dodgeNo = () => {
    const range = Math.min(window.innerWidth, window.innerHeight) * 0.35
    setNoPosition({
      x: (Math.random() - 0.5) * range * 2,
      y: (Math.random() - 0.5) * range,
    })
    setNoTaps((prev) => prev + 1)
  }

  return (
    <section className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-5 py-20 text-center sm:px-8">
      <TeddyDecor />

      {/* Teddy giggling */}
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 14, delay: 0.1 }}
        className="relative z-10 mb-10"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width="120" height="140" viewBox="0 0 140 160" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Ears */}
            <circle cx="35" cy="30" r="22" fill="#D4A574" />
            <circle cx="35" cy="30" r="14" fill="#F0C9A6" />
            <circle cx="105" cy="30" r="22" fill="#D4A574" />
            <circle cx="105" cy="30" r="14" fill="#F0C9A6" />
            {/* Head */}
            <circle cx="70" cy="62" r="42" fill="#D4A574" />
            <circle cx="70" cy="66" r="30" fill="#F5E6D3" />
            {/* Happy squinted eyes */}
            <path d="M52 57 Q57 52 62 57" stroke="#3D2914" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M78 57 Q83 52 88 57" stroke="#3D2914" strokeWidth="3" fill="none" strokeLinecap="round" />
            {/* Nose */}
            <ellipse cx="70" cy="68" rx="5" ry="3.5" fill="#C4956A" />
            {/* Open giggle mouth */}
            <ellipse cx="70" cy="78" rx="8" ry="6" fill="#C4956A" />
            <ellipse cx="70" cy="77" rx="6" ry="4" fill="#8B5E3C" />
            {/* Blush */}
            <ellipse cx="46" cy="70" rx="9" ry="5.5" fill="#F4A0B0" opacity="0.65" />
            <ellipse cx="94" cy="70" rx="9" ry="5.5" fill="#F4A0B0" opacity="0.65" />
            {/* Hands over mouth */}
            <ellipse cx="52" cy="78" rx="10" ry="8" fill="#D4A574" transform="rotate(-15 52 78)" />
            <ellipse cx="88" cy="78" rx="10" ry="8" fill="#D4A574" transform="rotate(15 88 78)" />
            {/* Body */}
            <ellipse cx="70" cy="125" rx="36" ry="34" fill="#D4A574" />
            <ellipse cx="70" cy="128" rx="24" ry="22" fill="#F5E6D3" />
            {/* Paws waving */}
            <ellipse cx="36" cy="120" rx="14" ry="10" fill="#D4A574" transform="rotate(-20 36 120)" />
            <ellipse cx="104" cy="120" rx="14" ry="10" fill="#D4A574" transform="rotate(20 104 120)" />
          </svg>
        </motion.div>

        {/* Bouncing hearts around teddy */}
        {[
          { x: -30, y: -20, delay: 0, size: 16 },
          { x: 35, y: -15, delay: 0.4, size: 14 },
          { x: -20, y: 10, delay: 0.8, size: 12 },
          { x: 25, y: 5, delay: 1.2, size: 18 },
        ].map((heart, i) => (
          <motion.span
            key={i}
            animate={{
              y: [heart.y, heart.y - 20, heart.y],
              scale: [0.8, 1.15, 0.8],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: heart.delay,
              ease: 'easeInOut',
            }}
            className="absolute"
            style={{
              left: `calc(50% + ${heart.x}px)`,
              top: `calc(40% + ${heart.y}px)`,
              fontSize: heart.size,
            }}
          >
            💖
          </motion.span>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.7 }}
        className="relative z-10 flex max-w-2xl flex-col items-center gap-5"
      >
        <h2 className="font-display text-balance text-3xl font-bold italic text-[#881337] sm:text-4xl">
          {config.content.suspenseHeading}
        </h2>
        <p className="max-w-md text-pretty text-base leading-relaxed text-[#7C4A63]">
          {config.content.suspenseSubtext}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="relative z-10 mt-10 flex flex-col items-center gap-5"
      >
        <motion.button
          type="button"
          onClick={onYes}
          animate={{
            boxShadow: [
              '0 0 20px -4px rgba(244,63,94,0.5)',
              '0 0 44px -6px rgba(251,113,133,0.85)',
              '0 0 20px -4px rgba(244,63,94,0.5)',
            ],
          }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          className="flex min-h-14 items-center rounded-full bg-gradient-to-r from-[#F43F5E] via-[#E11D48] to-[#FB7185] px-10 text-base font-bold text-white shadow-xl transition-all duration-200"
        >
          Yes, I&apos;m Ready! 💖
        </motion.button>

        <motion.button
          type="button"
          onMouseEnter={dodgeNo}
          onTouchStart={(e) => {
            e.preventDefault()
            dodgeNo()
          }}
          animate={{ x: noPosition.x, y: noPosition.y }}
          transition={{ type: 'spring', stiffness: 280, damping: 18 }}
          whileTap={{ scale: 0.92 }}
          className="flex min-h-12 items-center rounded-full border border-[#FFB6C8] bg-white/85 px-8 text-sm font-semibold text-[#881337] shadow-sm transition-colors hover:border-[#F43F5E] hover:text-[#F43F5E]"
        >
          {currentNoLabel}
        </motion.button>
      </motion.div>
    </section>
  )
}
