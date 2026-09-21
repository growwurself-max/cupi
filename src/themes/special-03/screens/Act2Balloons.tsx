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
    <>
      <style>{`
        @keyframes floatingSparkle {
          0%, 100% { transform: translateY(0) scale(0.9); opacity: 0.2; }
          50% { transform: translateY(-18px) scale(1); opacity: 1; }
        }
      `}</style>
      <ScreenShell className="bg-[#FCF1ED] py-24">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative z-10 mb-2 text-xs font-bold tracking-[0.28em] text-amber-700/60 uppercase"
        >
          Pop the surprise sentence
        </motion.p>

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.span
              key={i}
              className="absolute text-xl text-rose-300/70"
              style={{
                left: `${8 + i * 7}%`,
                top: `${18 + (i % 5) * 15}%`,
              }}
              animate={{
                y: [0, -24, 0],
                x: [0, (i % 2 === 0 ? 1 : -1) * 12, 0],
                opacity: [0.15, 0.7, 0.15],
                rotate: [0, 20, -12, 0],
              }}
              transition={{ duration: 3.5 + i * 0.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              ✨
            </motion.span>
          ))}
        </div>

        <BalloonPopGame words={words} onPop={onPop} onComplete={onComplete} title="" />
      </ScreenShell>
    </>
  )
}
