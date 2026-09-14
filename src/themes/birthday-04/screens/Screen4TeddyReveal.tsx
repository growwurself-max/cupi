import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { useCallback, useEffect } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { fireGrandBurst, fireContinuousSparkle, fireSideCannons } from '../../../utils/confetti'
import { TeddyMascot } from '../components/TeddyMascot'
import { TeddyDecor } from '../TeddyDecor'

interface Screen4TeddyRevealProps {
  config: ExperienceConfig
  onContinue: () => void
}

export function Screen4TeddyReveal({
  config,
  onContinue,
}: Screen4TeddyRevealProps) {
  const fireConfetti = useCallback(() => {
    fireGrandBurst()
    fireSideCannons()
    setTimeout(() => fireContinuousSparkle(2400), 350)
  }, [])

  useEffect(() => {
    fireConfetti()
  }, [fireConfetti])

  return (
    <section className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-5 py-24 text-center sm:px-8">
      <TeddyDecor />

      {/* Teddy mascot pulling party poppers */}
      <motion.div
        initial={{ scale: 0, rotate: -15 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 110, damping: 14 }}
        className="relative z-10 mb-6"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <TeddyMascot state="party" className="w-40 h-44 sm:w-48 sm:h-52" />
        </motion.div>

        {/* Party popper effects */}
        {['🎉', '🎊', '✨', '💫', '🎀'].map((emoji, i) => (
          <motion.span
            key={i}
            initial={{ scale: 0, x: 0, y: 0 }}
            animate={{
              scale: [0, 1.2, 0.8],
              x: (i % 2 === 0 ? 1 : -1) * (50 + i * 30),
              y: -40 - i * 22,
              opacity: [0, 1, 0.7],
            }}
            transition={{ delay: 0.3 + i * 0.15, duration: 0.8, ease: 'easeOut' }}
            className="absolute"
            style={{ left: '50%', top: '35%', fontSize: 20 + i * 2 }}
          >
            {emoji}
          </motion.span>
        ))}
      </motion.div>

      {/* Headline */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.8, type: 'spring', stiffness: 100 }}
        className="relative z-10 flex max-w-2xl flex-col items-center gap-5"
      >
        {/* Floating balloons */}
        {['🎈', '🎈', '🎀', '🎈', '🎈'].map((emoji, i) => (
          <motion.span
            key={`balloon-${i}`}
            animate={{
              y: [0, -15, 0],
              x: [0, (i % 2 === 0 ? 8 : -8), 0],
            }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
            className="absolute select-none"
            style={{
              left: `${15 + i * 18}%`,
              top: `-${10 + i * 5}%`,
              fontSize: 28 + i * 3,
              opacity: 0.6,
            }}
          >
            {emoji}
          </motion.span>
        ))}

        <motion.h1
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="font-display text-balance text-5xl leading-tight font-bold sm:text-6xl md:text-7xl"
          style={{ color: '#881337' }}
        >
          ✨ {config.content.revealHeading} ✨
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="font-display text-balance text-3xl font-bold italic text-[#F43F5E] sm:text-4xl"
        >
          {config.recipient.name}! 🎂
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="max-w-md text-pretty text-base leading-relaxed text-[#7C4A63]"
        >
          {config.content.revealSubtext}
        </motion.p>
      </motion.div>

      {/* Sparkle accent */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="relative z-10 mt-8"
      >
        {['✦', '✧', '✦'].map((s, i) => (
          <motion.span
            key={i}
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
            className="mx-2 text-xl text-[#FBBF24]"
          >
            {s}
          </motion.span>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.6 }}
        className="relative z-10 mt-10"
      >
        <motion.button
          type="button"
          onClick={onContinue}
          animate={{
            boxShadow: [
              '0 0 24px -4px rgba(244,63,94,0.5)',
              '0 0 52px -6px rgba(251,113,133,0.8)',
              '0 0 24px -4px rgba(244,63,94,0.5)',
            ],
          }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-[#F43F5E] via-[#E11D48] to-[#FB7185] px-9 text-base font-bold text-white shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
        >
          Open Teddy&apos;s Letter 💌
          <ChevronRight className="h-5 w-5" />
        </motion.button>
      </motion.div>
    </section>
  )
}
