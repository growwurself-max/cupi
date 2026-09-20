import { motion } from 'framer-motion'
import { useMemo } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { BalloonPopGame } from '../../shared/BalloonPopGame'
import { ScreenShell } from '../../shared/ScreenShell'

interface Act2BalloonsProps {
  config: ExperienceConfig
  onPop: () => void
  onComplete: () => void
}

function balloonWords(config: ExperienceConfig): string[] {
  const fromCelebration = config.content.finalCelebration
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4)
  if (fromCelebration.length >= 4) return fromCelebration
  return ['You', 'are', 'my', 'forever']
}

export function Act2Balloons({ config, onPop, onComplete }: Act2BalloonsProps) {
  const words = useMemo(() => balloonWords(config), [config])

  return (
    <ScreenShell className="bg-[#FDFBF7] py-24">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 mb-2 text-xs font-bold tracking-[0.28em] text-amber-700/60 uppercase"
      >
        Pop the surprise sentence
      </motion.p>
      <BalloonPopGame words={words} onPop={onPop} onComplete={onComplete} title="" />
    </ScreenShell>
  )
}
