import { motion } from 'framer-motion'
import { Headphones } from 'lucide-react'
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
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(201,184,255,0.12),transparent_60%)]"
      />

      <motion.div
        animate={{ scale: [1, 1.06, 1], opacity: [0.35, 0.6, 0.35] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        className="glass-panel relative z-10 mb-10 flex h-24 w-24 items-center justify-center rounded-full"
      >
        <Headphones className="h-10 w-10 text-soft-violet" strokeWidth={1.7} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7, ease: 'easeOut' }}
        className="relative z-10 flex max-w-xl flex-col items-center gap-6 text-center"
      >
        <h1 className="font-display text-balance text-4xl font-semibold text-white sm:text-5xl">
          {config.content.suspenseHeading}
        </h1>
        <p className="max-w-md text-pretty text-sm leading-relaxed text-white/60 sm:text-base">
          {config.content.suspenseSubtext}
        </p>

        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/55">
          <span className="h-2 w-2 rounded-full bg-soft-amber" />
          Sound is{' '}
          {soundEnabled ? 'on — hear that chime? 🔔' : 'unavailable in this browser'}
        </div>

        <PlayfulQuestion
          question="Are you ready for a little magic? ✨"
          onYes={onContinue}
          yesLabel="I'm Ready 💖"
          noLabel="Not yet…"
        />
      </motion.div>
    </ScreenShell>
  )
}