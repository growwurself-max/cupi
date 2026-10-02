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
        className="mb-8 text-7xl"
      >
        🌷
      </motion.div>

      {/* Line 1 */}
      {showLine1 && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-4 font-serif text-xl leading-relaxed text-pink-100/90"
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
          className="mb-12 font-serif text-2xl font-bold text-pink-200"
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
          className="rounded-full border-2 border-pink-400/50 bg-pink-500/20 px-8 py-3 font-serif text-lg font-semibold text-pink-100 backdrop-blur-sm transition-all hover:bg-pink-500/30"
        >
          Open Your Surprise
        </motion.button>
      )}
    </div>
  )
}
