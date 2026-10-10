import { motion } from 'framer-motion'
import type { ExperienceConfig } from '../../../types/experience'
import { PALETTE } from '../palette'
import { Eyebrow, PrimaryButton, StageScene } from '../components/Stage'
import { Bunting } from '../components/Bunting'

interface Act4BuntingProps {
  config: ExperienceConfig
  reduce: boolean
  onCheer: () => void
  onContinue: () => void
}

export function Act4Bunting({ config, reduce, onCheer, onContinue }: Act4BuntingProps) {
  return (
    <StageScene
      initial={reduce ? { opacity: 0 } : { opacity: 0, rotateX: 10, y: 30 }}
      animate={{ opacity: 1, rotateX: 0, y: 0 }}
      exit={{ opacity: 0, rotateX: -8, y: -24 }}
      transition={{ duration: reduce ? 0.4 : 0.7, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformPerspective: 900 }}
    >
      <Eyebrow>dress the stage</Eyebrow>

      <motion.button
        type="button"
        onClick={onCheer}
        aria-label="Cheer the bunting"
        className="mt-10 w-full max-w-xl outline-none focus-visible:ring-2 focus-visible:ring-[#c2688c]"
        whileTap={{ scale: 0.98 }}
      >
        <Bunting text={config.content.countdownTagline || 'Happy Birthday'} reduce={reduce} />
      </motion.button>

      {config.content.memoryDate && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: reduce ? 0 : 0.9, duration: 0.6 }}
          className="mt-10 flex items-center gap-3"
        >
          <span className="h-px w-10" style={{ background: PALETTE.gold }} />
          <span className="font-display text-lg font-semibold" style={{ color: PALETTE.berrySoft }}>
            {config.content.memoryDate}
          </span>
          <span className="h-px w-10" style={{ background: PALETTE.gold }} />
        </motion.div>
      )}

      <p className="mt-8 text-xs font-medium uppercase tracking-[0.24em] text-[#b98a9f]">
        tap the bunting for a little applause
      </p>

      <div className="mt-6">
        <PrimaryButton onClick={onContinue}>See the memories</PrimaryButton>
      </div>
    </StageScene>
  )
}
