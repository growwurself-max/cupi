import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'

interface Screen7ThankYouProps {
  config: ExperienceConfig
  onContinue: () => void
}

export function Screen7ThankYou({ config, onContinue }: Screen7ThankYouProps) {
  const [showHeading, setShowHeading] = useState(false)
  const [showLine1, setShowLine1] = useState(false)
  const [showLine2, setShowLine2] = useState(false)
  const [showLine3, setShowLine3] = useState(false)
  const [showLine4, setShowLine4] = useState(false)
  const [showContinue, setShowContinue] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setShowHeading(true), 800)
    const t2 = setTimeout(() => setShowLine1(true), 1800)
    const t3 = setTimeout(() => setShowLine2(true), 2800)
    const t4 = setTimeout(() => setShowLine3(true), 3800)
    const t5 = setTimeout(() => setShowLine4(true), 4800)
    const t6 = setTimeout(() => setShowContinue(true), 6000)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
      clearTimeout(t5)
      clearTimeout(t6)
    }
  }, [])

  return (
    <div className="relative flex h-full flex-col items-center justify-center px-6 bg-[#0a0f1a]">
      {/* Minimal background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(10,15,26,0.5)_100%)]" />

      <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center max-w-2xl">
        {/* Heading */}
        {showHeading && (
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="mb-16 font-serif text-2xl font-light text-[#f5f0e8] sm:text-3xl lg:text-4xl tracking-tight"
          >
            {config.content.wishPrompt}
          </motion.h2>
        )}

        {/* Line 1 */}
        {showLine1 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
            className="mb-8 font-serif text-xl font-light text-[#f5f0e8]/90 sm:text-2xl"
          >
            I'm proud to be your son.
          </motion.p>
        )}

        {/* Line 2 */}
        {showLine2 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
            className="mb-8 font-serif text-xl font-light text-[#f5f0e8]/90 sm:text-2xl"
          >
            I notice more than you think.
          </motion.p>
        )}

        {/* Line 3 */}
        {showLine3 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
            className="mb-8 font-serif text-xl font-light text-[#f5f0e8]/90 sm:text-2xl"
          >
            I appreciate the things you do for our family.
          </motion.p>
        )}

        {/* Line 4 - emphasized */}
        {showLine4 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="mb-16 font-serif text-2xl font-light text-[#c9a959] sm:text-3xl lg:text-4xl tracking-tight leading-relaxed"
          >
            And even when I don't say it,{' '}
            <span className="font-normal">I am grateful for you.</span>
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
