import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'

interface Screen9FinalProps {
  config: ExperienceConfig
  onExit: () => void
}

export function Screen9Final({ onExit }: Screen9FinalProps) {
  const [showLine1, setShowLine1] = useState(false)
  const [showLine2, setShowLine2] = useState(false)
  const [showLine3, setShowLine3] = useState(false)
  const [showFooter, setShowFooter] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setShowLine1(true), 600)
    const t2 = setTimeout(() => setShowLine2(true), 1800)
    const t3 = setTimeout(() => setShowLine3(true), 3000)
    const t4 = setTimeout(() => setShowFooter(true), 4200)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
    }
  }, [])

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      {/* Line 1 */}
      {showLine1 && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-6 font-serif text-3xl font-bold text-pink-200"
        >
          I love you, Mom. ❤️
        </motion.p>
      )}

      {/* Line 2 */}
      {showLine2 && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-4 font-serif text-xl text-pink-100/90"
        >
          Thank you for being my home, my comfort and my biggest blessing.
        </motion.p>
      )}

      {/* Line 3 */}
      {showLine3 && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12 font-serif text-xl text-pink-200"
        >
          Happy Birthday, Mom! 🌷
        </motion.p>
      )}

      {/* Footer */}
      {showFooter && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="space-y-4"
        >
          <button
            onClick={onExit}
            className="rounded-full border-2 border-pink-400/50 bg-pink-500/20 px-8 py-3 font-serif text-lg font-semibold text-pink-100 backdrop-blur-sm transition-all hover:bg-pink-500/30"
          >
            Close
          </button>
          <p className="font-serif text-sm text-pink-300/50">
            Made with ❤️ on Cupi
          </p>
        </motion.div>
      )}
    </div>
  )
}
