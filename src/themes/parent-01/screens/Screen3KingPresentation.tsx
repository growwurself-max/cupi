import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'

interface Screen3KingPresentationProps {
  config: ExperienceConfig
  onContinue: () => void
}

export function Screen3KingPresentation({ config, onContinue }: Screen3KingPresentationProps) {
  const [showHeading, setShowHeading] = useState(false)
  const [showTeaching1, setShowTeaching1] = useState(false)
  const [showTeaching2, setShowTeaching2] = useState(false)
  const [showTeaching3, setShowTeaching3] = useState(false)
  const [showContinue, setShowContinue] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setShowHeading(true), 800)
    const t2 = setTimeout(() => setShowTeaching1(true), 1800)
    const t3 = setTimeout(() => setShowTeaching2(true), 3200)
    const t4 = setTimeout(() => setShowTeaching3(true), 4600)
    const t5 = setTimeout(() => setShowContinue(true), 6000)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
      clearTimeout(t5)
    }
  }, [])

  const teachings = config.bouquet?.notes || []

  return (
    <div className="relative flex h-full flex-col items-center justify-center px-6 bg-[#0a0f1a]/70">
      {/* Subtle background texture */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(10,15,26,0.42)_100%)]" />

      <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center max-w-2xl">
        {/* Heading - elegant serif */}
        {showHeading && (
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="mb-16 font-serif text-3xl font-light text-[#f5f0e8] sm:text-4xl lg:text-5xl tracking-tight"
          >
            {config.content.revealHeading}
          </motion.h2>
        )}

        {/* Teaching 01 */}
        {showTeaching1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="mb-12"
          >
            <p className="font-sans text-xs font-light tracking-[0.3em] text-[#c9a959]/40 uppercase mb-4">
              01
            </p>
            <p className="font-serif text-xl font-light text-[#f5f0e8]/90 leading-relaxed sm:text-2xl">
              {teachings[0]?.text || 'To keep going when things don\'t go as planned.'}
            </p>
          </motion.div>
        )}

        {/* Teaching 02 */}
        {showTeaching2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="mb-12"
          >
            <p className="font-sans text-xs font-light tracking-[0.3em] text-[#c9a959]/40 uppercase mb-4">
              02
            </p>
            <p className="font-serif text-xl font-light text-[#f5f0e8]/90 leading-relaxed sm:text-2xl">
              {teachings[1]?.text || 'To take responsibility for the people I care about.'}
            </p>
          </motion.div>
        )}

        {/* Teaching 03 */}
        {showTeaching3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="mb-16"
          >
            <p className="font-sans text-xs font-light tracking-[0.3em] text-[#c9a959]/40 uppercase mb-4">
              03
            </p>
            <p className="font-serif text-xl font-light text-[#f5f0e8]/90 leading-relaxed sm:text-2xl">
              {teachings[2]?.text || 'To stay grounded, no matter where life takes me.'}
            </p>
          </motion.div>
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
