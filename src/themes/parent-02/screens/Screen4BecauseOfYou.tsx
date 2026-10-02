import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'

interface Screen4BecauseOfYouProps {
  config: ExperienceConfig
  onContinue: () => void
}

const cards = [
  {
    id: 'love',
    icon: '❤️',
    title: 'Your Love',
    text: 'You made even the difficult days feel easier.',
  },
  {
    id: 'care',
    icon: '🌸',
    title: 'Your Care',
    text: 'Every little thing you did became a beautiful memory.',
  },
  {
    id: 'home',
    icon: '🏡',
    title: 'Your Home',
    text: 'Wherever you are, that\'s where home feels like home.',
  },
]

export function Screen4BecauseOfYou({ onContinue }: Screen4BecauseOfYouProps) {
  const [visibleCards, setVisibleCards] = useState<number[]>([])
  const [showContinue, setShowContinue] = useState(false)

  useEffect(() => {
    cards.forEach((_, index) => {
      const timeout = setTimeout(() => {
        setVisibleCards((prev) => [...prev, index])
      }, 800 + index * 1200)
      return () => clearTimeout(timeout)
    })

    const continueTimeout = setTimeout(() => setShowContinue(true), 4500)
    return () => clearTimeout(continueTimeout)
  }, [])

  return (
    <div className="flex h-full flex-col items-center justify-center px-6">
      <div className="w-full max-w-md space-y-6">
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, x: -30 }}
            animate={visibleCards.includes(index) ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="rounded-2xl border border-pink-400/30 bg-rose-50/60 p-6 shadow-lg shadow-pink-900/20 backdrop-blur-sm"
          >
            <div className="mb-3 text-4xl">{card.icon}</div>
            <h3 className="mb-2 font-serif text-xl font-bold text-pink-800">
              {card.title}
            </h3>
            <p className="font-serif text-base leading-relaxed text-pink-700/90">
              {card.text}
            </p>
          </motion.div>
        ))}
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
