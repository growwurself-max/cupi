import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'

interface Screen6MemoriesProps {
  config: ExperienceConfig
  onContinue: () => void
}

export function Screen6Memories({ config, onContinue }: Screen6MemoriesProps) {
  const [showHeading, setShowHeading] = useState(false)
  const [showLetter, setShowLetter] = useState(false)
  const [showContinue, setShowContinue] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setShowHeading(true), 800)
    const t2 = setTimeout(() => setShowLetter(true), 1600)
    const t3 = setTimeout(() => setShowContinue(true), 3000)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [])

  const letterLines = config.content.letterLines || []

  return (
    <div className="relative flex h-full flex-col items-center justify-center px-6 bg-[#0a0f1a]">
      {/* Subtle background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(10,15,26,0.5)_100%)]" />

      <div className="relative z-10 flex flex-col items-center justify-center px-6 max-w-2xl w-full">
        {/* Heading */}
        {showHeading && (
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="mb-12 font-serif text-2xl font-light text-[#f5f0e8] sm:text-3xl lg:text-4xl tracking-tight text-center"
          >
            A few words for you
          </motion.h2>
        )}

        {/* Beautiful letter design */}
        {showLetter && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            className="w-full max-w-xl"
          >
            <div className="relative overflow-hidden rounded-lg border border-[#c9a959]/20 bg-[#f5f0e8]/95 p-8 sm:p-12 shadow-2xl">
              {/* Subtle paper texture */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-[#f5f0e8]/50 to-[#e8e0d0]/30" />
              
              {/* Letter content */}
              <div className="relative z-10 font-serif text-base leading-relaxed text-[#1a1f2e] sm:text-lg">
                {letterLines.map((line, index) => (
                  <motion.p
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 * index, duration: 0.6 }}
                    className={line === '' ? 'h-6' : 'mb-4'}
                  >
                    {line}
                  </motion.p>
                ))}
              </div>
            </div>
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
            className="mt-12 border border-[#c9a959]/30 bg-[#c9a959]/5 px-10 py-3 font-sans text-xs font-light tracking-[0.25em] text-[#c9a959]/80 transition-all hover:bg-[#c9a959]/10 hover:border-[#c9a959]/40"
          >
            Continue
          </motion.button>
        )}
      </div>
    </div>
  )
}
