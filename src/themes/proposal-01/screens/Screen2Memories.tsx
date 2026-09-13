import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import type { ExperienceConfig } from '../../../types/experience'
import { FloatingParticles } from '../../shared/FloatingParticles'
import { ScreenShell } from '../../shared/ScreenShell'

interface Screen2MemoriesProps {
  config: ExperienceConfig
  onContinue: () => void
}

const CARD_LINES: Array<[string, string]> = [
  ['🌙', 'You make quiet evenings feel like fireworks.'],
  ['🎶', 'Every song reminds me of you.'],
  ['🤍', 'Home is wherever you are.'],
]

const PILL =
  'inline-flex items-center gap-1.5 rounded-full border border-violet-200/70 bg-white/70 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#581C87] backdrop-blur-md'

export function Screen2Memories({ config, onContinue }: Screen2MemoriesProps) {
  return (
    <ScreenShell>
      <FloatingParticles
        type="star-dust"
        colors={[config.branding.accentColor, config.branding.accentSecondary]}
      />

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative z-10 flex max-w-2xl flex-col items-center gap-5 text-center"
      >
        <span className={PILL}>The Suspense</span>
        <h1 className="font-display text-balance text-3xl font-bold text-[#581C87] sm:text-4xl">
          {config.content.suspenseHeading}
        </h1>
        <p className="max-w-md text-pretty text-sm leading-relaxed text-purple-900/60 sm:text-base">
          {config.content.suspenseSubtext}
        </p>

        <div className="mt-4 flex w-full max-w-sm flex-col gap-4">
          {CARD_LINES.map(([emoji, line], i) => (
            <motion.div
              key={emoji}
              initial={{ opacity: 0, y: 24, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                delay: 0.25 + i * 0.18,
                type: 'spring',
                stiffness: 150,
                damping: 16,
              }}
              className="flex items-center gap-4 rounded-2xl border border-violet-200/70 bg-white/75 px-5 py-4 shadow-sm backdrop-blur"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-violet-200/70 bg-gradient-to-br from-violet-100 to-fuchsia-100 text-2xl">
                {emoji}
              </span>
              <p className="text-left text-sm font-semibold text-purple-900/75 sm:text-base">
                {line}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, type: 'spring', stiffness: 120, damping: 16 }}
        className="relative z-10 mt-10"
      >
        <button
          type="button"
          onClick={onContinue}
          className="group flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400 px-7 text-sm font-bold text-white shadow-lg shadow-violet-500/30 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          Deep Breath… 🫧
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </button>
      </motion.div>
    </ScreenShell>
  )
}