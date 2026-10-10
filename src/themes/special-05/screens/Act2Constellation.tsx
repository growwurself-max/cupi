import { motion } from 'framer-motion'
import { useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'

interface Act2ConstellationProps {
  config: ExperienceConfig
  onReveal: () => void
  onSparkle: () => void
}

export function Act2Constellation({ config, onReveal, onSparkle }: Act2ConstellationProps) {
  const [revealed, setRevealed] = useState(false)

  const handleReveal = () => {
    onSparkle()
    setRevealed(true)
    setTimeout(onReveal, 2000)
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
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="relative"
      >
        {/* Constellation visualization */}
        <div className="relative h-64 w-64 sm:h-80 sm:w-80">
          {/* Star points */}
          {[
            { x: 50, y: 20 },
            { x: 80, y: 40 },
            { x: 60, y: 70 },
            { x: 30, y: 60 },
            { x: 20, y: 30 },
          ].map((star, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
              className="absolute rounded-full bg-indigo-300"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: '12px',
                height: '12px',
                boxShadow: '0 0 20px rgba(99, 102, 241, 0.8)',
              }}
            />
          ))}

          {/* Connection lines */}
          <svg className="absolute inset-0 h-full w-full" style={{ zIndex: -1 }}>
            <motion.path
              d="M 50 20 L 80 40 L 60 70 L 30 60 L 20 30 L 50 20"
              stroke="rgba(99, 102, 241, 0.5)"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: revealed ? 1 : 0.5 }}
              transition={{ delay: 1, duration: 1.5 }}
            />
          </svg>

          {/* Central glow */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: revealed ? 1.5 : 1, opacity: revealed ? 0.8 : 0.3 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500 blur-3xl"
            style={{ width: '200px', height: '200px' }}
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="mt-8 text-center"
      >
        <h2 className="font-display text-3xl font-bold text-indigo-200 sm:text-4xl">
          {config.content.revealHeading}
        </h2>
        <p className="mt-3 text-lg text-indigo-300/80">{config.content.revealSubtext}</p>
      </motion.div>

      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.6 }}
        onClick={handleReveal}
        disabled={revealed}
        className="mt-8 flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50"
      >
        {revealed ? (
          <>
            <span className="text-xl">✨</span>
            <span>Revealing...</span>
          </>
        ) : (
          <>
            <span className="text-xl">🌟</span>
            <span>Reveal the Message</span>
          </>
        )}
      </motion.button>

      {revealed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 flex items-center justify-center bg-indigo-950/50 backdrop-blur-sm"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-6xl"
          >
            ✨
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}
