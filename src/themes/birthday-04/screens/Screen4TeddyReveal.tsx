import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { useCallback, useEffect } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { fireGrandBurst, fireContinuousSparkle, fireSideCannons } from '../../../utils/confetti'
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

      {/* Teddy pulling party poppers */}
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
          <svg width="110" height="120" viewBox="0 0 140 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="scale-80">
            <circle cx="35" cy="30" r="22" fill="#D4A574" />
            <circle cx="35" cy="30" r="14" fill="#F0C9A6" />
            <circle cx="105" cy="30" r="22" fill="#D4A574" />
            <circle cx="105" cy="30" r="14" fill="#F0C9A6" />
            <circle cx="70" cy="62" r="42" fill="#D4A574" />
            <circle cx="70" cy="66" r="30" fill="#F5E6D3" />
            {/* Celebrating eyes — wide open */}
            <circle cx="57" cy="58" r="5" fill="#3D2914" />
            <circle cx="83" cy="58" r="5" fill="#3D2914" />
            <circle cx="59" cy="56" r="2" fill="white" />
            <circle cx="85" cy="56" r="2" fill="white" />
            <ellipse cx="70" cy="68" rx="5" ry="3.5" fill="#C4956A" />
            {/* Big smile */}
            <path d="M58 75 Q70 86 82 75" stroke="#C4956A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <ellipse cx="46" cy="70" rx="9" ry="5.5" fill="#F4A0B0" opacity="0.7" />
            <ellipse cx="94" cy="70" rx="9" ry="5.5" fill="#F4A0B0" opacity="0.7" />
            <ellipse cx="70" cy="125" rx="36" ry="34" fill="#D4A574" />
            <ellipse cx="70" cy="128" rx="24" ry="22" fill="#F5E6D3" />
            {/* Arms raised high */}
            <ellipse cx="30" cy="100" rx="12" ry="9" fill="#D4A574" transform="rotate(-50 30 100)" />
            <ellipse cx="110" cy="100" rx="12" ry="9" fill="#D4A574" transform="rotate(50 110 100)" />
          </svg>
        </motion.div>

        {/* Party popper effects */}
        {['🎉', '🎊', '✨', '💫', '🎀'].map((emoji, i) => (
          <motion.span
            key={i}
            initial={{ scale: 0, x: 0, y: 0 }}
            animate={{
              scale: [0, 1.2, 0.8],
              x: (i % 2 === 0 ? 1 : -1) * (40 + i * 25),
              y: -30 - i * 18,
              opacity: [0, 1, 0.7],
            }}
            transition={{ delay: 0.3 + i * 0.15, duration: 0.8, ease: 'easeOut' }}
            className="absolute"
            style={{ left: '50%', top: '30%', fontSize: 20 + i * 2 }}
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
