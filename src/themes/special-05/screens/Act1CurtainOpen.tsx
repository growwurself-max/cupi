import { motion } from 'framer-motion'
import type { ExperienceConfig } from '../../../types/experience'
import { PALETTE } from '../palette'
import { Eyebrow, StageScene } from '../components/Stage'
import { Sparkle } from '../components/Decor'

interface Act1CurtainOpenProps {
  config: ExperienceConfig
  reduce: boolean
}

/**
 * Scene 1 — the welcome revealed as the satin curtains sweep open.
 * The tap interaction lives on the shared CurtainStage overlay; this scene is
 * what the audience sees once the stage is lit.
 */
export function Act1CurtainOpen({ config, reduce }: Act1CurtainOpenProps) {
  const name = config.recipient.name || 'Someone Special'

  return (
    <StageScene
      initial={reduce ? { opacity: 0 } : { opacity: 0, clipPath: 'circle(0% at 50% 50%)' }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, clipPath: 'circle(75% at 50% 50%)' }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduce ? 0.4 : 1.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <Eyebrow>{config.content.teaserHeading}</Eyebrow>

      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduce ? 0 : 0.35, duration: 0.7 }}
        className="mt-7 text-sm uppercase tracking-[0.4em] text-[#b98a9f]"
      >
        Welcome
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: reduce ? 0 : 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="font-script mt-2 text-5xl leading-[1.05] sm:text-7xl"
        style={{ color: PALETTE.berry }}
      >
        {name}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduce ? 0 : 0.8, duration: 0.7 }}
        className="mt-6 max-w-md text-base leading-relaxed text-[#8c4360] sm:text-lg"
      >
        {config.content.teaserSubtext}
      </motion.p>

      <div className="mt-8 flex items-center gap-3" aria-hidden>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={reduce ? undefined : { y: [0, -6, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
          >
            <Sparkle size={16} color={PALETTE.gold} />
          </motion.span>
        ))}
      </div>
    </StageScene>
  )
}
