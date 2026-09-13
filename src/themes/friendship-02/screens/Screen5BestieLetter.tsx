import { AnimatePresence, motion } from 'framer-motion'
import { RotateCcw, WandSparkles } from 'lucide-react'
import type { ExperienceConfig } from '../../../types/experience'
import { fireSideCannons } from '../../../utils/confetti'
import { FloatingEmojis } from '../../shared/FloatingEmojis'
import { LightLetterCard } from '../../shared/LightLetterCard'
import { ScreenShell } from '../../shared/ScreenShell'

interface Screen5BestieLetterProps {
  config: ExperienceConfig
  onReplay: () => void
  onExit: () => void
}

export function Screen5BestieLetter({
  config,
  onReplay,
  onExit,
}: Screen5BestieLetterProps) {
  return (
    <ScreenShell className="surface-obsidian">
      <FloatingEmojis emojis={['✨', '🍕', '💖', '🎉']} count={12} />

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-full border border-orange-200/30 bg-white/5 px-4 py-1.5 text-xs font-bold tracking-[0.3em] text-orange-200/80 uppercase"
      >
        Bestie Letter
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="relative z-10 mt-10 flex w-full flex-col items-center"
      >
        <LightLetterCard
          recipient={config.recipient.name}
          content={config.content}
          sender={config.sender.name}
          headerEmoji="👋"
          accent={config.branding.accentColor}
          accentSecondary={config.branding.accentSecondary}
        />

        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 140 }}
            className="mt-10 flex flex-col items-center gap-5 text-center"
          >
            <button
              type="button"
              onClick={() => fireSideCannons()}
              className="relative flex h-20 w-20 items-center justify-center rounded-full border border-orange-200/50 bg-gradient-to-br from-orange-500 to-rose-500 text-4xl shadow-[0_0_40px_-6px_rgba(255,138,92,0.8)] transition-transform duration-200 hover:scale-110 active:scale-95"
              aria-label="Celebrate with a firecracker burst"
            >
              🎉
            </button>
            <h2 className="font-display text-balance text-4xl font-black sm:text-5xl">
              <span className="text-gradient-lux">{config.content.finalMessage}</span>
            </h2>
            <p className="max-w-md text-pretty text-orange-100/70">
              {config.content.finalCelebration}
            </p>
            <p className="text-lg text-orange-200/80">
              — {config.sender.name} <span className="text-orange-300">♥</span>
            </p>

            <div className="mt-2 flex flex-col items-center gap-4 pb-2 sm:flex-row">
              <button
                type="button"
                onClick={onReplay}
                className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 px-7 text-base font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.04] active:scale-95"
              >
                <RotateCcw className="h-5 w-5" />
                Replay Experience 🔁
              </button>
              <button
                type="button"
                onClick={onExit}
                className="flex min-h-14 items-center gap-2.5 rounded-full border border-orange-200/40 bg-white/5 px-7 text-base font-semibold text-orange-100 transition-all duration-200 hover:scale-[1.04] hover:bg-white/10 active:scale-95"
              >
                <WandSparkles className="h-5 w-5" />
                Create a Surprise for Someone Else
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </ScreenShell>
  )
}