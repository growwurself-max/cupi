import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { useEffect } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { fireHeartRain } from '../../../utils/confetti'
import { FloatingParticles } from '../../shared/FloatingParticles'
import { ScreenShell } from '../../shared/ScreenShell'

interface Screen4QuestionProps {
  config: ExperienceConfig
  onContinue: () => void
}

const PILL =
  'inline-flex items-center gap-1.5 rounded-full border border-violet-200/70 bg-white/70 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#581C87] backdrop-blur-md'

export function Screen4Question({ config, onContinue }: Screen4QuestionProps) {
  useEffect(() => {
    fireHeartRain(1600)
  }, [])

  return (
    <ScreenShell>
      <FloatingParticles
        type="star-dust"
        colors={[config.branding.accentColor, config.branding.accentSecondary]}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 90, damping: 15, delay: 0.15 }}
        className="relative z-10 flex max-w-2xl flex-col items-center gap-6 text-center"
      >
        <span className={PILL}>The Question</span>

        <div className="relative pt-6">
          <motion.div
            aria-hidden
            animate={{ rotate: 360 }}
            transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
            className="absolute -inset-12 rounded-full opacity-70 blur-2xl"
            style={{
              background:
                'conic-gradient(from 0deg, transparent 0deg, rgba(240,171,252,0.8) 40deg, transparent 80deg, rgba(167,139,250,0.8) 140deg, transparent 180deg, rgba(249,168,212,0.8) 250deg, transparent 300deg, rgba(167,139,250,0.7) 330deg, transparent 360deg)',
            }}
          />
          <h1 className="font-display relative text-balance text-4xl italic text-[#581C87] sm:text-5xl md:text-6xl">
            Will you marry me,
            <br />
            {config.recipient.name}?
          </h1>
          <motion.span
            aria-hidden
            animate={{ y: [0, -6, 0], rotate: [0, 8, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -right-10 -top-4 text-4xl sm:-right-14 sm:text-5xl"
            style={{
              filter: 'drop-shadow(0 0 18px rgba(240,171,252,0.8))',
            }}
          >
            💎
          </motion.span>
        </div>

        <p className="max-w-md text-pretty text-sm leading-relaxed text-purple-900/60 sm:text-base">
          {config.content.revealSubtext}
        </p>
      </motion.div>

      <motion.button
        type="button"
        onClick={onContinue}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, type: 'spring', stiffness: 140, damping: 16 }}
        className="relative z-10 mt-12 flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400 px-7 text-sm font-bold text-white shadow-lg shadow-violet-500/30 transition-all duration-200 hover:scale-105 active:scale-95"
      >
        <Heart className="h-5 w-5 fill-white text-white" />
        Answer time 💍
      </motion.button>
    </ScreenShell>
  )
}