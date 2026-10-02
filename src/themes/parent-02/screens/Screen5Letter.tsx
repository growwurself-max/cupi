import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'

interface Screen5LetterProps {
  config: ExperienceConfig
  onContinue: () => void
}

export function Screen5Letter({ config, onContinue }: Screen5LetterProps) {
  const [showText, setShowText] = useState(false)
  const [showContinue, setShowContinue] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setShowText(true), 600)
    const t2 = setTimeout(() => setShowContinue(true), 2000)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  const letterLines = config.content.letterLines || []

  return (
    <div className="flex h-full flex-col items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6 text-center font-serif text-2xl font-bold text-pink-200"
        >
          A Letter For My Mom
        </motion.h2>

        {/* Envelope / Letter */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative rounded-lg border-2 border-pink-400/30 bg-pink-50/90 p-6 shadow-2xl shadow-pink-900/20 backdrop-blur-sm"
        >
          {/* Letter content */}
          {showText && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="space-y-3 font-serif text-base leading-relaxed text-slate-800"
            >
              {letterLines.map((line, index) => (
                <motion.p
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.4 }}
                  className={line === '' ? 'h-4' : ''}
                >
                  {line}
                </motion.p>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>

      {showContinue && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onContinue}
          className="mt-8 rounded-full border-2 border-pink-400/50 bg-pink-500/20 px-8 py-3 font-serif text-base font-semibold text-pink-100 backdrop-blur-sm transition-all hover:bg-pink-500/30"
        >
          Continue →
        </motion.button>
      )}
    </div>
  )
}
