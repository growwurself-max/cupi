import { motion } from 'framer-motion'
import { RotateCcw, WandSparkles } from 'lucide-react'
import { useEffect } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { fireGrandBurst } from '../../../utils/confetti'
import { ScreenShell } from '../../shared/ScreenShell'
import { LetterCard } from '../../shared/LetterCard'
import { FloatingEmojis } from '../../shared/FloatingEmojis'

interface DiplomaScreenProps {
  config: ExperienceConfig
  onReplay: () => void
  onExit: () => void
}

export function DiplomaScreen({ config, onReplay, onExit }: DiplomaScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => fireGrandBurst(), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <ScreenShell className="justify-start pt-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(245,194,102,0.14),transparent_45%)]"
      />
      <FloatingEmojis emojis={['🎓', '🎉', '✨', '💐']} count={11} />

      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-xs font-bold tracking-[0.35em] uppercase"
        style={{ color: config.branding.accentColor }}
      >
        The official paperwork 🧾
      </motion.p>

      {/* Diploma unroll */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, type: 'spring', stiffness: 90, damping: 15 }}
        style={{ perspective: 1200 }}
        className="relative z-10 mt-10 w-full max-w-lg overflow-hidden rounded-xl shadow-[0_28px_70px_-24px_rgba(0,0,0,0.85)]"
      >
        <div
          aria-hidden
          className="absolute inset-x-0 top-3 bottom-3 bg-[#2e1f10]"
        />
        <div className="absolute inset-x-2 top-2 bottom-2 bg-[#fdf4db] px-8 py-10 text-center"
          style={{ boxShadow: 'inset 0 0 0 2px rgba(245,194,102,0.4)' }}
        >
          <p className="font-display text-xs font-bold tracking-[0.35em] text-[#9a7b3f] uppercase">
            Cupi University of Victories
          </p>
          <p className="mt-6 text-sm font-semibold text-[#334155]">
            proudly certifies that
          </p>
          <motion.h2
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 120 }}
            className="font-display mt-3 text-3xl font-black text-[#1b2a3f] sm:text-4xl"
          >
            {config.recipient.name}
          </motion.h2>
          <p className="mt-3 text-sm font-medium text-[#334155]/80">
            has completed the extremely long, occasionally absurd journey of
            making everyone around them proud.
          </p>
          <p className="mt-6 text-sm font-black tracking-[0.2em] text-[#9a7b3f] uppercase">
            {config.content.finalMessage}
          </p>
          <p className="mt-2 text-xs font-semibold text-[#334155]/60">
            {config.content.finalCelebration}
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-bold tracking-widest text-[#9a7b3f]/70 uppercase">
            <span>Signed</span>
            <span className="h-px w-16 bg-[#9a7b3f]/40" />
            <span>Cupi</span>
          </div>
        </div>
      </motion.div>

      <div className="relative z-10 mt-10 w-full max-w-xl">
        <LetterCard
          recipient={config.recipient.name}
          content={config.content}
          sender={config.sender.name}
          headerEmoji="🎓"
          accent={config.branding.accentColor}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mt-12 flex flex-col items-center gap-4 pb-6 sm:flex-row"
      >
        <button
          type="button"
          onClick={onReplay}
          className="glass-panel glow-primary flex min-h-14 items-center gap-2.5 rounded-full px-7 text-base font-bold text-white transition-transform duration-200 hover:scale-[1.04] active:scale-95"
        >
          <RotateCcw className="h-5 w-5 text-rose-gold" />
          Relive the Reel 🔁
        </button>
        <button
          type="button"
          onClick={onExit}
          className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-[#f5c266] to-[#61e0c5] px-7 text-base font-bold text-obsidian-900 shadow-lg transition-transform duration-200 hover:scale-[1.04] active:scale-95"
        >
          <WandSparkles className="h-5 w-5" />
          Plan Another Surprise
        </button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="mt-4 text-xs font-semibold tracking-[0.2em] text-white/35 uppercase"
      >
        Crafted with ♥ by Cupi
      </motion.p>
    </ScreenShell>
  )
}