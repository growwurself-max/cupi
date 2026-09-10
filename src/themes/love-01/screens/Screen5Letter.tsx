import { motion } from 'framer-motion'
import type { ExperienceConfig } from '../../../types/experience'
import { ScreenShell } from '../../shared/ScreenShell'
import { FloatingEmojis } from '../../shared/FloatingEmojis'
import { LetterCard } from '../../shared/LetterCard'

interface LetterScreenProps {
  config: ExperienceConfig
  onContinue: () => void
}

export function LetterScreen({ config, onContinue }: LetterScreenProps) {
  return (
    <ScreenShell className="justify-start pt-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(255,155,179,0.12),transparent_45%),radial-gradient(circle_at_10%_75%,rgba(143,123,255,0.12),transparent_50%)]"
      />
      <FloatingEmojis emojis={['💖', '💗', '✨']} count={10} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mb-8 text-center"
      >
        <p className="text-xs font-bold tracking-[0.3em] uppercase"
          style={{ color: config.branding.accentSecondary }}
        >
          The midnight letter
        </p>
        <h2 className="font-display mt-2 text-3xl font-semibold text-white sm:text-4xl">
          {config.content.letterIntro}
        </h2>
      </motion.div>

      <div className="relative z-10 w-full max-w-xl">
        <FloatingEmojis emojis={['💌', '✨']} count={6} className="opacity-60" />
        <LetterCard
          recipient={config.recipient.name}
          content={config.content}
          sender={config.sender.name}
          headerEmoji="💌"
          accent={config.branding.accentColor}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mt-12 flex flex-col items-center gap-3 pb-4"
      >
        <motion.button
          type="button"
          onClick={onContinue}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-[#8f7bff] to-[#ff9bb3] px-8 text-base font-bold text-obsidian-900 transition-transform duration-200 hover:scale-[1.05] active:scale-95"
        >
          One more thing 💘
        </motion.button>
      </motion.div>
    </ScreenShell>
  )
}