import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'

interface Act1StarsProps {
  config: ExperienceConfig
  onConnect: () => void
  onTwinkle: () => void
}

export function Act1Stars({ config, onConnect, onTwinkle }: Act1StarsProps) {
  const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number }>>([])
  const [connected, setConnected] = useState(0)
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const newStars = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 2,
    }))
    setStars(newStars)
  }, [])

  const handleStarClick = () => {
    onTwinkle()
    setConnected((prev) => {
      const newCount = prev + 1
      if (newCount >= 5) {
        setTimeout(onConnect, 500)
      }
      return newCount
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-5"
    >
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="text-center"
      >
        <motion.h1
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="font-display text-4xl font-bold text-indigo-200 sm:text-5xl"
        >
          {config.content.teaserHeading}
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mt-4 max-w-md text-lg leading-relaxed text-indigo-300/80"
        >
          {config.content.teaserSubtext}
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-6 text-sm font-medium text-indigo-400"
        >
          Tap {5 - connected} more stars to connect the constellation
        </motion.p>
      </motion.div>

      <div
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 5 }}
      >
        {stars.map((star) => (
          <motion.div
            key={star.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1, 0.8, 1],
              opacity: [0, 1, 0.7, 1],
            }}
            transition={{
              duration: 2,
              delay: star.delay,
              repeat: Infinity,
              repeatDelay: 3,
            }}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              pointerEvents: 'auto',
              cursor: 'pointer',
              boxShadow: connected >= 5 ? '0 0 20px rgba(99, 102, 241, 0.8)' : '0 0 10px rgba(255, 255, 255, 0.5)',
            }}
            onClick={handleStarClick}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: connected >= 5 ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        className="fixed bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex items-center gap-2 rounded-full bg-indigo-500/20 px-6 py-3 text-indigo-200 backdrop-blur-sm"
        >
          <span className="text-2xl">✨</span>
          <span className="text-sm font-medium">Constellation connected!</span>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
