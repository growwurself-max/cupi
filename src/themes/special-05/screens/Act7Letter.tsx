import { motion } from 'framer-motion'
import type { ExperienceConfig } from '../../../types/experience'
import { fillPlaceholders } from '../../../utils/placeholders'
import { PALETTE } from '../palette'
import { Eyebrow, PrimaryButton, StageScene } from '../components/Stage'
import { PaperCard } from '../components/Decor'

interface Act7LetterProps {
  config: ExperienceConfig
  reduce: boolean
  onContinue: () => void
}

export function Act7Letter({ config, reduce, onContinue }: Act7LetterProps) {
  const ctx = { recipient: config.recipient.name, sender: config.sender.name }
  const lines = config.content.letterLines.map((line) => fillPlaceholders(line, ctx))
  const signoff = fillPlaceholders(config.content.letterSignoff, ctx)
  const baseDelay = 0.35

  return (
    <StageScene
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: reduce ? 0.4 : 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <Eyebrow>with all my heart</Eyebrow>

      <PaperCard className="mt-7 w-full max-w-lg px-6 py-9 text-left sm:px-10 sm:py-12">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-[#b98a9f]">
          {config.content.letterIntro}
        </p>

        <div className="mt-7 space-y-5">
          {lines.map((line, i) => (
            <motion.p
              key={i}
              initial={reduce ? { opacity: 1 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduce ? 0 : baseDelay + i * 0.55, duration: 0.6, ease: 'easeOut' }}
              className="font-display text-[15px] leading-relaxed sm:text-base"
              style={{ color: PALETTE.berry }}
            >
              {line}
            </motion.p>
          ))}
        </div>

        <motion.div
          initial={reduce ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduce ? 0 : baseDelay + lines.length * 0.55 + 0.3, duration: 0.6 }}
          className="mt-9 text-right"
        >
          <p className="font-script text-2xl" style={{ color: PALETTE.roseDeep }}>
            {signoff}
          </p>
          <p className="mt-1 text-sm font-semibold" style={{ color: PALETTE.berrySoft }}>
            {config.sender.name}
          </p>
        </motion.div>
      </PaperCard>

      <motion.div
        initial={reduce ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduce ? 0 : baseDelay + lines.length * 0.55 + 0.7, duration: 0.5 }}
        className="mt-8"
      >
        <PrimaryButton onClick={onContinue}>Make a wish</PrimaryButton>
      </motion.div>
    </StageScene>
  )
}
