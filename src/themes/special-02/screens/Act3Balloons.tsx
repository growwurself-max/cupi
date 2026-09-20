import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { BalloonPopGame } from '../../shared/BalloonPopGame'
import { ScreenShell } from '../../shared/ScreenShell'

const WORDS = ['You', 'are', 'so', 'special'] as const

interface Act3BalloonsProps {
  onPop: () => void
  onComplete: () => void
}

export function Act3Balloons({ onPop, onComplete }: Act3BalloonsProps) {
  const [showPanda, setShowPanda] = useState(false)

  return (
    <ScreenShell className="bg-[#FFF0F3] py-24">
      <BalloonPopGame
        words={[...WORDS]}
        onPop={onPop}
        onComplete={() => {
          setShowPanda(true)
          onComplete()
        }}
        title="Pop each balloon"
      />

      <AnimatePresence>
        {showPanda && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -12 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 180 }}
            className="relative z-10 mt-8 text-6xl"
          >
            🐼
          </motion.div>
        )}
      </AnimatePresence>
    </ScreenShell>
  )
}
