import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Home, RotateCcw, Volume2, VolumeX } from 'lucide-react'
import type { ExperienceConfig } from '../../../types/experience'

interface Act3UniverseProps {
  config: ExperienceConfig
  onReplay: () => void
  onExit: () => void
  onAmbient: () => void
  onGlow: () => void
  isMuted: boolean
  onToggleMute: () => void
}

export function Act3Universe({
  config,
  onReplay,
  onExit,
  onAmbient,
  onGlow,
  isMuted,
  onToggleMute,
}: Act3UniverseProps) {
  const [showLetter, setShowLetter] = useState(false)

  const handleOpenLetter = () => {
    onAmbient()
    onGlow()
    setShowLetter(true)
  }

  const recipientName = config.recipient?.name || 'You'
  const senderName = config.sender?.name || 'Someone'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-5"
    >
      <AnimatePresence mode="wait">
        {!showLetter ? (
          <motion.div
            key="envelope"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="mb-8 text-7xl"
            >
              💌
            </motion.div>

            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="font-display text-3xl font-bold text-indigo-200 sm:text-4xl"
            >
              A message from the stars
            </motion.h2>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-4 text-lg text-indigo-300/80"
            >
              Written just for {recipientName}
            </motion.p>

            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              onClick={handleOpenLetter}
              className="mt-8 flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <span className="text-xl">✨</span>
              <span>Open the Letter</span>
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="letter"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-lg"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="rounded-3xl border border-indigo-500/30 bg-indigo-950/40 p-6 backdrop-blur-sm sm:p-8"
            >
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-center text-sm font-medium text-indigo-300"
              >
                {config.content.letterIntro}
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="mt-6 space-y-4 text-center"
              >
                {config.content.letterLines.map((line, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + i * 0.2, duration: 0.5 }}
                    className="text-lg leading-relaxed text-indigo-100"
                  >
                    {line.replace(/\{\{name\}\}/g, recipientName)}
                  </motion.p>
                ))}
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4, duration: 0.5 }}
                className="mt-6 text-right text-sm font-medium text-indigo-300"
              >
                {config.content.letterSignoff}
                <br />
                {senderName}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.6, duration: 0.5 }}
                className="mt-8 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-4 text-center"
              >
                <p className="text-2xl font-bold text-indigo-200">
                  {config.content.finalMessage}
                </p>
                <p className="mt-2 text-sm text-indigo-300/80">
                  {config.content.finalCelebration}
                </p>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8, duration: 0.5 }}
              className="mt-6 flex flex-wrap justify-center gap-3"
            >
              <button
                onClick={onReplay}
                className="flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-5 py-2.5 text-sm font-semibold text-indigo-200 transition-all duration-200 hover:bg-indigo-500/20 active:scale-95"
              >
                <RotateCcw className="h-4 w-4" />
                Replay
              </button>
              <button
                onClick={onToggleMute}
                className="flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-5 py-2.5 text-sm font-semibold text-indigo-200 transition-all duration-200 hover:bg-indigo-500/20 active:scale-95"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                {isMuted ? 'Unmute' : 'Mute'}
              </button>
              <button
                onClick={onExit}
                className="flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-5 py-2.5 text-sm font-semibold text-indigo-200 transition-all duration-200 hover:bg-indigo-500/20 active:scale-95"
              >
                <Home className="h-4 w-4" />
                Back to Store
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating stars background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            className="absolute rounded-full bg-white"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}
