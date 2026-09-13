import { motion } from 'framer-motion'
import type { ExperienceConfig } from '../../../types/experience'
import { FloatingEmojis } from '../../shared/FloatingEmojis'
import { FloatingParticles } from '../../shared/FloatingParticles'
import { ScreenShell } from '../../shared/ScreenShell'

interface WhisperScreenProps {
  config: ExperienceConfig
  onBegin: () => void
}

export function WhisperScreen({ config, onBegin }: WhisperScreenProps) {
  return (
    <ScreenShell>
      <FloatingParticles
        type="heart-petals"
        colors={[config.branding.accentColor, config.branding.accentSecondary]}
      />
      <FloatingEmojis emojis={['💗', '🤍', '🧸', '💌', '✨']} count={12} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_32%,rgba(255,155,180,0.18),transparent_55%)]"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.7, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center text-center"
      >
        <span className="flex min-h-9 items-center rounded-full border border-[#FFC9D4] bg-white/80 px-4 text-[11px] font-bold tracking-[0.3em] text-[#D65D7A] uppercase shadow-sm backdrop-blur-md">
          The Whisper
        </span>

        <div className="relative mt-10 flex h-40 w-40 items-center justify-center sm:h-44 sm:w-44">
          <span
            aria-hidden
            className="absolute inset-0 rounded-full bg-gradient-to-br from-rose-300/60 to-pink-300/60 blur-2xl"
          />
          <span
            aria-hidden
            className="absolute inset-0 animate-pulse-glow rounded-full border border-rose-300/70 bg-rose-100/70 shadow-[0_0_45px_-8px_rgba(255,155,180,0.6)]"
          />
          <motion.span
            animate={{ y: [0, -30, 0], opacity: [0.3, 1, 0.3], scale: [1, 1.25, 1] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-3 text-2xl sm:text-3xl"
          >
            💓
          </motion.span>
          <span className="relative select-none text-4xl tracking-wide sm:text-5xl">
            🧸🤍🧸
          </span>
        </div>

        <h1 className="font-display mt-12 max-w-md text-balance text-4xl font-black text-[#831843] sm:text-5xl">
          {config.content.teaserHeading}
        </h1>
        <p className="mx-auto mt-5 max-w-md text-pretty text-sm leading-relaxed text-stone-600 sm:text-base">
          {config.content.teaserSubtext}
        </p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-8 text-sm font-semibold tracking-wide text-[#D65D7A] italic"
        >
          “A little something for my favorite person… 🤍”
        </motion.p>

        <motion.button
          type="button"
          onClick={onBegin}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.4, duration: 0.5 }}
          className="mt-10 flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-rose-400 to-pink-400 px-7 text-sm font-bold text-white shadow-lg shadow-rose-400/30 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          Begin 🤍
        </motion.button>
      </motion.div>
    </ScreenShell>
  )
}