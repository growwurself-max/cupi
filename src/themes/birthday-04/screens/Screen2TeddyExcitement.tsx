import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { TeddyMascot } from '../components/TeddyMascot'
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
        <TeddyMascot state="excited" className="w-44 h-48 sm:w-52 sm:h-56" />

        {/* Bouncing hearts around teddy */}
        {[
          { x: -55, y: -10, delay: 0, size: 16 },
          { x: 55, y: -5, delay: 0.4, size: 14 },
          { x: -40, y: 30, delay: 0.8, size: 12 },
          { x: 45, y: 25, delay: 1.2, size: 18 },
        ].map((heart, i) => (
          <motion.span
            key={i}
            animate={{
              y: [heart.y, heart.y - 22, heart.y],
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
              top: `calc(42% + ${heart.y}px)`,
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
