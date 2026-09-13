import { motion } from 'framer-motion'
import { useEffect } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { fireGrandBurst } from '../../../utils/confetti'
import { FloatingParticles } from '../../shared/FloatingParticles'
import { ScreenShell } from '../../shared/ScreenShell'
import { FloatingEmojis } from '../../shared/FloatingEmojis'

interface RevealScreenProps {
  config: ExperienceConfig
  onContinue: () => void
}

export function RevealScreen({ config, onContinue }: RevealScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => fireGrandBurst(), 350)
    return () => clearTimeout(timer)
  }, [])

  return (
    <ScreenShell>
      <FloatingParticles
        type="lavender-mist"
        colors={[config.branding.accentColor, config.branding.accentSecondary]}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,155,179,0.18),rgba(143,123,255,0.1)_45%,transparent_70%)]"
      />
      <FloatingEmojis emojis={['💖', '✨', '💗']} count={10} />

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.6 }}
        className="text-sm font-bold tracking-[0.3em] uppercase"
        style={{ color: config.branding.accentColor }}
      >
        It’s always been about
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, scale: 0.7, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.35, type: 'spring', stiffness: 110, damping: 16 }}
        className="font-display mt-4 text-center text-5xl font-bold sm:text-6xl md:text-7xl"
      >
        <span className="text-gradient-lux block">Ready,</span>
        <span className="text-shimmer animate-shimmer mt-2 block uppercase">
          {config.recipient.name}
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="mt-6 max-w-md text-balance text-center text-white/65"
      >
        {config.content.revealSubtext}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.15, duration: 0.6 }}
        className="relative z-10 mt-12"
      >
        <button
          type="button"
          onClick={onContinue}
          className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-[#ff9bb3] via-[#f6c6b6] to-[#8f7bff] px-8 text-base font-bold text-obsidian-900 transition-transform duration-200 hover:scale-[1.05] active:scale-95"
        >
          💌 Read the Letter
        </button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.35, 0.8, 0.35] }}
        transition={{ delay: 1.5, duration: 2, repeat: Infinity }}
        className="mt-8 text-xs font-semibold tracking-wide text-white/40 uppercase"
      >
        This one is written just for you…
      </motion.p>
    </ScreenShell>
  )
}