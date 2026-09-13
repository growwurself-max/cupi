import { motion } from 'framer-motion'
import { useState } from 'react'

interface PlayfulQuestionProps {
  question: string
  onYes: () => void
  yesLabel?: string
  noLabel?: string
}

export function PlayfulQuestion({
  question,
  onYes,
  yesLabel = 'Yes',
  noLabel = 'No',
}: PlayfulQuestionProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dodged, setDodged] = useState(false)

  const dodge = () => {
    const range = Math.min(window.innerWidth, window.innerHeight) * 0.3
    setPosition({
      x: (Math.random() - 0.5) * range * 2,
      y: (Math.random() - 0.5) * range,
    })
    setDodged(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
      className="relative z-10 flex flex-col items-center gap-5 text-center"
    >
      <p className="font-serif text-balance text-2xl font-bold italic text-[#881337] sm:text-3xl">
        {question}
      </p>
      <div className="flex items-center justify-center gap-4">
        <motion.button
          type="button"
          onClick={onYes}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className="flex min-h-14 items-center rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 px-10 text-base font-semibold text-white shadow-lg shadow-rose-300/50 transition-all duration-200 hover:brightness-105"
        >
          {yesLabel}
        </motion.button>
        <motion.button
          type="button"
          onMouseEnter={dodge}
          onTouchStart={(e) => {
            e.preventDefault()
            dodge()
          }}
          animate={{ x: position.x, y: position.y }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className="flex min-h-14 items-center rounded-full border border-rose-300 bg-white/90 px-8 text-base font-semibold text-rose-700 shadow-sm transition-colors hover:border-rose-400 hover:text-rose-900"
        >
          {dodged ? 'Nope! 🏃‍♀️💨' : noLabel}
        </motion.button>
      </div>
    </motion.div>
  )
}