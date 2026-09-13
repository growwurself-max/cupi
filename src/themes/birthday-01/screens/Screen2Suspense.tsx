import { motion } from 'framer-motion'
import type { ExperienceConfig } from '../../../types/experience'
import { PlayfulQuestion } from '../../shared/PlayfulQuestion'
import { ScreenShell } from '../../shared/ScreenShell'

interface Screen2SuspenseProps {
  config: ExperienceConfig
  soundEnabled: boolean
  onContinue: () => void
}

export function Screen2Suspense({
  config,
  soundEnabled,
  onContinue,
}: Screen2SuspenseProps) {
  return (
    <ScreenShell>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(251,113,133,0.14),transparent_60%)]"
      />

      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 14 }}
        className="relative z-10 mb-10"
      >
        <motion.div
          aria-hidden
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -inset-4 rounded-full bg-pink-300/30 blur-2xl"
        />
        <span className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-rose-200 bg-white/80 text-5xl shadow-xl shadow-rose-200/50">
          {config.branding.emojiPrimary}
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7, ease: 'easeOut' }}
        className="relative z-10 flex max-w-xl flex-col items-center gap-6 text-center"
      >
        <h1 className="font-serif text-balance text-4xl font-bold italic text-[#881337] sm:text-5xl">
          {config.content.suspenseHeading}
        </h1>
        <p className="max-w-md text-pretty text-sm leading-relaxed text-rose-950/70 sm:text-base">
          {config.content.suspenseSubtext}
        </p>

        <div className="flex items-center gap-2 rounded-full border border-rose-200 bg-white/80 px-4 py-2 text-xs font-semibold text-rose-800 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-rose-500" />
          Sound is{' '}
          {soundEnabled ? 'on — hear that chime? 🔔' : 'unavailable in this browser'}
        </div>

        <PlayfulQuestion
          question="Are you excited for what's next?"
          onYes={onContinue}
          yesLabel="Yes 💖"
          noLabel="No"
        />
      </motion.div>
    </ScreenShell>
  )
}