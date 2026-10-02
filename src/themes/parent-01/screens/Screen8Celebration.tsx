import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'

interface Screen8CelebrationProps {
  config: ExperienceConfig
  onContinue: () => void
}

export function Screen8Celebration({ config, onContinue }: Screen8CelebrationProps) {
  const [showHeading, setShowHeading] = useState(false)
  const [showMessage, setShowMessage] = useState(false)
  const [showFinalLine, setShowFinalLine] = useState(false)
  const [showContinue, setShowContinue] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setShowHeading(true), 800)
    const t2 = setTimeout(() => setShowMessage(true), 1800)
    const t3 = setTimeout(() => setShowFinalLine(true), 3000)
    const t4 = setTimeout(() => setShowContinue(true), 4500)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
    }
  }, [])

  return (
    <div className="relative flex h-full flex-col items-center justify-center px-6 bg-gradient-to-b from-[#1a1f2e] via-[#2d3a4a] to-[#1a1f2e]">
      {/* Warm light gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#c9a959]/10 via-transparent to-transparent" />
      
      {/* Subtle warm glow */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#c9a959]/5 blur-3xl" />

      <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center max-w-2xl">
        {/* Birthday heading - elegant */}
        {showHeading && (
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="mb-12 font-serif text-4xl font-light text-[#f5f0e8] sm:text-5xl lg:text-6xl tracking-tight"
          >
            Happy Birthday, Dad.
          </motion.h2>
        )}

        {/* Message */}
        {showMessage && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
            className="mb-12 font-serif text-lg font-light text-[#f5f0e8]/80 leading-relaxed sm:text-xl"
          >
            {config.content.finalMessage}
          </motion.p>
        )}

        {/* Final line - emphasized */}
        {showFinalLine && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="mb-16 font-serif text-2xl font-light text-[#c9a959] sm:text-3xl lg:text-4xl tracking-tight"
          >
            {config.content.finalCelebration}
          </motion.p>
        )}

        {/* Continue button */}
        {showContinue && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onContinue}
            className="border border-[#c9a959]/30 bg-[#c9a959]/5 px-10 py-3 font-sans text-xs font-light tracking-[0.25em] text-[#c9a959]/80 transition-all hover:bg-[#c9a959]/10 hover:border-[#c9a959]/40"
          >
            Continue
          </motion.button>
        )}
      </div>
    </div>
  )
}
