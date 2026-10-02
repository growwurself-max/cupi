import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'

interface Screen8CelebrationProps {
  config: ExperienceConfig
  onContinue: () => void
}

export function Screen8Celebration({ onContinue }: Screen8CelebrationProps) {
  const [showFlowers, setShowFlowers] = useState(false)
  const [showCake, setShowCake] = useState(false)
  const [showText1, setShowText1] = useState(false)
  const [showText2, setShowText2] = useState(false)
  const [showContinue, setShowContinue] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setShowFlowers(true), 400)
    const t2 = setTimeout(() => setShowCake(true), 800)
    const t3 = setTimeout(() => setShowText1(true), 1400)
    const t4 = setTimeout(() => setShowText2(true), 2400)
    const t5 = setTimeout(() => setShowContinue(true), 4000)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
      clearTimeout(t5)
    }
  }, [])

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      {/* Flowers */}
      {showFlowers && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="mb-4 text-6xl"
        >
          🌷
        </motion.div>
      )}

      {/* Birthday Cake */}
      {showCake && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="mb-8 text-8xl"
        >
          🎂
        </motion.div>
      )}

      {/* Text 1 */}
      {showText1 && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-6 font-serif text-3xl font-bold text-pink-200"
        >
          🌷 Happy Birthday, Mom!
        </motion.p>
      )}

      {/* Text 2 */}
      {showText2 && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-md font-serif text-lg leading-relaxed text-pink-100/90"
        >
          May every happiness you've given others come back to you a hundred
          times over.
        </motion.p>
      )}

      {/* Continue indicator */}
      {showContinue && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onContinue}
          className="mt-12 rounded-full border-2 border-pink-400/50 bg-pink-500/20 px-8 py-3 font-serif text-base font-semibold text-pink-100 backdrop-blur-sm transition-all hover:bg-pink-500/30"
        >
          Continue →
        </motion.button>
      )}
    </div>
  )
}
