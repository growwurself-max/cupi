import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import type { ExperienceConfig } from '../../../types/experience'
import { FloatingParticles } from '../../shared/FloatingParticles'
import { LightLetterCard } from '../../shared/LightLetterCard'
import { ScreenShell } from '../../shared/ScreenShell'

interface Screen4ConfessionProps {
  config: ExperienceConfig
  onContinue: () => void
}

export function Screen4Confession({ config, onContinue }: Screen4ConfessionProps) {
  return (
    <ScreenShell className="surface-obsidian">
      <FloatingParticles
        type="heart-petals"
        colors={[config.branding.accentColor, config.branding.accentSecondary]}
      />
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-full border border-violet-200/30 bg-white/5 px-4 py-1.5 text-xs font-bold tracking-[0.3em] text-violet-200/80 uppercase"
      >
        Deep Confession
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mt-10 flex w-full flex-col items-center"
      >
        <LightLetterCard
          recipient={config.recipient.name}
          content={config.content}
          sender={config.sender.name}
          headerEmoji="💜"
          accent={config.branding.accentColor}
          accentSecondary={config.branding.accentSecondary}
        />
        <motion.button
          type="button"
          onClick={onContinue}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 px-9 text-base font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.04] active:scale-95"
        >
          See my final vow
          <ChevronRight className="h-5 w-5" />
        </motion.button>
      </motion.div>
    </ScreenShell>
  )
}