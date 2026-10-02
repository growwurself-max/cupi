import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'

interface Screen7ThingsILoveProps {
  config: ExperienceConfig
  onContinue: () => void
}

const loveItems = [
  {
    id: 'smile',
    icon: '😊',
    text: 'Your smile',
  },
  {
    id: 'kindness',
    icon: '❤️',
    text: 'Your kindness',
  },
  {
    id: 'support',
    icon: '🤗',
    text: 'Your endless support',
  },
  {
    id: 'heart',
    icon: '🌷',
    text: 'Your beautiful heart',
  },
]

export function Screen7ThingsILove({ onContinue }: Screen7ThingsILoveProps) {
  const [visibleItems, setVisibleItems] = useState<number[]>([])
  const [showContinue, setShowContinue] = useState(false)

  useEffect(() => {
    loveItems.forEach((_, index) => {
      const timeout = setTimeout(() => {
        setVisibleItems((prev) => [...prev, index])
      }, 600 + index * 1000)
      return () => clearTimeout(timeout)
    })

    const continueTimeout = setTimeout(() => setShowContinue(true), 5000)
    return () => clearTimeout(continueTimeout)
  }, [])

  return (
    <div className="flex h-full flex-col items-center justify-center px-6">
      <div className="w-full max-w-md">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8 text-center font-serif text-2xl font-bold text-pink-200"
        >
          Things I Love About You
        </motion.h2>

        <div className="grid grid-cols-2 gap-4">
          {loveItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={visibleItems.includes(index) ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="rounded-2xl border border-pink-400/30 bg-rose-50/60 p-4 text-center shadow-lg shadow-pink-900/20 backdrop-blur-sm"
            >
              <div className="mb-2 text-3xl">{item.icon}</div>
              <p className="font-serif text-sm font-semibold text-pink-800">
                {item.text}
              </p>
            </motion.div>
          ))}
        </div>
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
