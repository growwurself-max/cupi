import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { PALETTE } from '../palette'
import { Eyebrow, GhostButton, PrimaryButton, StageScene } from '../components/Stage'
import { Heart, Sparkle, TeddyOnSwing } from '../components/Decor'

interface Act10FinaleProps {
  config: ExperienceConfig
  reduce: boolean
  onCelebrate: () => void
  onReplay: () => void
  onExit: () => void
}

const PETALS = [
  { left: 8, delay: 0, size: 16 },
  { left: 22, delay: 0.8, size: 12 },
  { left: 38, delay: 0.3, size: 18 },
  { left: 54, delay: 1.2, size: 13 },
  { left: 70, delay: 0.5, size: 17 },
  { left: 84, delay: 1.5, size: 12 },
  { left: 92, delay: 0.9, size: 15 },
]

export function Act10Finale({ config, reduce, onCelebrate, onReplay, onExit }: Act10FinaleProps) {
  const firedRef = useRef(false)
  useEffect(() => {
    if (firedRef.current) return
    firedRef.current = true
    onCelebrate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <StageScene
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.08 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduce ? 0.4 : 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* drifting petals / hearts */}
      {!reduce && (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {PETALS.map((p, i) => (
            <motion.span
              key={i}
              className="absolute top-[-40px]"
              style={{ left: `${p.left}%` }}
              initial={{ opacity: 0, y: -30 }}
              animate={{ y: ['0vh', '108vh'], rotate: [0, 180], opacity: [0, 0.9, 0] }}
              transition={{ duration: 8 + (i % 3) * 1.6, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
            >
              {i % 2 === 0 ? (
                <Heart size={p.size} color="rgba(238,166,192,0.85)" />
              ) : (
                <Sparkle size={p.size} color="rgba(216,178,106,0.8)" />
              )}
            </motion.span>
          ))}
        </div>
      )}

      <Eyebrow>curtain call</Eyebrow>

      <h1
        className="font-script mt-5 text-5xl leading-[1.05] sm:text-7xl"
        style={{ color: PALETTE.berry }}
      >
        {config.content.finalMessage}
      </h1>

      <p className="mt-5 max-w-md font-display text-lg sm:text-xl" style={{ color: PALETTE.roseDeep }}>
        {config.content.finalCelebration}
      </p>

      <div className="mt-8 flex items-end justify-center gap-2">
        <TeddyOnSwing variant="a" size={96} />
        <TeddyOnSwing variant="b" size={96} />
      </div>

      <p className="mt-8 text-sm font-semibold" style={{ color: PALETTE.berrySoft }}>
        — {config.sender.name}
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <PrimaryButton onClick={onReplay}>Watch again</PrimaryButton>
        <GhostButton onClick={onExit}>Back to Cupi Store</GhostButton>
      </div>
    </StageScene>
  )
}
