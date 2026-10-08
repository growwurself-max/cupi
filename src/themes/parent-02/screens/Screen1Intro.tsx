import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'

interface Screen1IntroProps {
  config: ExperienceConfig
  onBegin: () => void
}

export function Screen1Intro({ onBegin }: Screen1IntroProps) {
  const [showLine1, setShowLine1] = useState(false)
  const [showLine2, setShowLine2] = useState(false)
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setShowLine1(true), 800)
    const t2 = setTimeout(() => setShowLine2(true), 2000)
    const t3 = setTimeout(() => setShowButton(true), 3200)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [])

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      {/* Floating flowers */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="mb-6 text-6xl drop-shadow-[0_8px_18px_rgba(225,29,72,0.25)] sm:text-7xl"
      >
        🌷
      </motion.div>

      {/* Line 1 */}
      {showLine1 && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mx-auto mb-5 max-w-sm font-serif text-lg leading-relaxed text-rose-600/90 sm:text-xl"
        >
          For the woman who made my world beautiful...
        </motion.p>
      )}

      {/* Line 2 */}
      {showLine2 && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mx-auto mb-12 max-w-md font-script text-4xl leading-tight text-rose-600 drop-shadow-sm sm:text-5xl"
        >
          🌷 Happy Birthday, Mom
        </motion.p>
      )}

      {/* Open Your Surprise Button */}
      {showButton && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBegin}
          className="rounded-full border border-white/80 bg-white/75 px-8 py-3 font-display text-lg font-semibold text-rose-700 shadow-[0_14px_32px_-16px_rgba(219,39,119,0.55)] backdrop-blur-md transition-all hover:bg-white hover:text-rose-800"
        >
          Open Your Surprise
        </motion.button>
      )}
    </div>
  )
}
