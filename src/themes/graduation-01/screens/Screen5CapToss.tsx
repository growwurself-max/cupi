import { AnimatePresence, motion } from 'framer-motion'
import { RotateCcw, WandSparkles } from 'lucide-react'
import { useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import {
  fireContinuousSparkle,
  fireGoldenRain,
  fireGrandBurst,
  fireSideCannons,
} from '../../../utils/confetti'
import { FloatingEmojis } from '../../shared/FloatingEmojis'
import { FloatingParticles } from '../../shared/FloatingParticles'
import { ScreenShell } from '../../shared/ScreenShell'

interface CapTossScreenProps {
  config: ExperienceConfig
  onReplay: () => void
  onExit: () => void
  onToss: () => void
}

export function CapTossScreen({
  config,
  onReplay,
  onExit,
  onToss,
}: CapTossScreenProps) {
  const [tossed, setTossed] = useState(false)
  const [revealed, setRevealed] = useState(false)

  const toss = () => {
    if (tossed) return
    setTossed(true)
    onToss()
    fireSideCannons()
    fireGoldenRain(2200)
    fireGrandBurst()
    setTimeout(() => fireGoldenRain(1400), 450)
    setTimeout(() => fireContinuousSparkle(1300), 900)
    setTimeout(() => setRevealed(true), 700)
  }

  return (
    <ScreenShell>
      <FloatingParticles
        type="gold-sparkles"
        colors={[config.branding.accentColor, config.branding.accentSecondary]}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(245,194,66,0.16),transparent_55%),radial-gradient(circle_at_50%_70%,rgba(56,189,248,0.12),transparent_50%)]"
      />
      <FloatingEmojis emojis={['🎓', '✨', '🏅', '📚']} count={10} />

      <motion.span
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 inline-flex items-center gap-1.5 rounded-full border border-amber-300/80 bg-white/85 px-3 py-1.5 text-xs font-bold tracking-[0.24em] text-[#854D0E] uppercase backdrop-blur-md"
      >
        The Cap Toss Ritual
      </motion.span>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.6 }}
        className="relative z-10 mt-10 flex h-60 w-60 items-center justify-center"
      >
        <span
          aria-hidden
          className="absolute inset-6 rounded-full bg-[radial-gradient(circle,rgba(245,194,66,0.3),transparent_70%)] blur-xl"
        />
        <AnimatePresence>
          {tossed && (
            <motion.span
              key="flying-cap"
              aria-hidden
              initial={{ y: 0, x: 0, scale: 1, rotate: 0, opacity: 1 }}
              animate={{ y: -210, x: 26, scale: 0.65, rotate: 340, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: 'easeOut' }}
              className="pointer-events-none absolute text-7xl drop-shadow-[0_18px_30px_rgba(30,58,138,0.3)]"
            >
              🎓
            </motion.span>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          onClick={toss}
          disabled={tossed}
          aria-label={tossed ? 'Cap tossed' : 'Throw your cap'}
          whileHover={tossed ? undefined : { scale: 1.08 }}
          whileTap={tossed ? undefined : { scale: 0.82 }}
          animate={tossed ? { y: [0, -26, 0] } : { y: [0, -10, 0] }}
          transition={
            tossed
              ? { duration: 0.8, repeat: Infinity }
              : { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }
          }
          className="flex h-44 w-44 select-none flex-col items-center justify-center gap-1.5 rounded-full bg-gradient-to-b from-blue-500 to-[#1E3A8A] shadow-[0_20px_45px_-15px_rgba(30,58,138,0.6)] outline-none"
          style={{ border: '3px solid rgba(245,194,66,0.75)' }}
        >
          <span className="text-6xl drop-shadow-[0_6px_12px_rgba(0,0,0,0.25)]">🎓</span>
          <span className="text-[11px] font-black tracking-[0.22em] text-amber-200 uppercase">
            {tossed ? 'up it goes!' : 'throw it'}
          </span>
        </motion.button>
      </motion.div>

      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.p
            key="hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0.6, 1] }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="relative z-10 mt-2 max-w-sm text-center text-sm font-semibold text-slate-600"
          >
            {config.content.revealSubtext}
          </motion.p>
        ) : (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative z-10 mt-6 flex max-w-2xl flex-col items-center gap-4 text-center"
          >
            <h2 className="font-display animate-shimmer bg-[length:200%_auto] bg-gradient-to-r from-[#1E3A8A] via-[#F5C242] to-[#1E3A8A] bg-clip-text text-balance text-4xl font-black text-transparent sm:text-6xl">
              {config.content.finalMessage}
            </h2>
            <p className="max-w-md text-pretty text-sm leading-relaxed text-slate-600 sm:text-base">
              {config.content.finalCelebration}
            </p>
            <p className="font-display text-xl font-bold text-[#854D0E]">
              Congrats, {config.recipient.name}! 🎉
            </p>
            <p className="text-sm text-slate-600">— {config.sender.name}</p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-4 flex flex-col items-center gap-4 pb-4 sm:flex-row"
            >
              <button
                type="button"
                onClick={onReplay}
                className="flex min-h-14 items-center gap-2.5 rounded-full border border-blue-200/70 bg-white/80 px-7 text-sm font-semibold text-[#1E3A8A] backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-blue-50 active:scale-95"
              >
                <RotateCcw className="h-5 w-5 text-[#854D0E]" />
                Replay Surprise 🔁
              </button>
              <button
                type="button"
                onClick={onExit}
                className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-blue-500 to-sky-400 px-7 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <WandSparkles className="h-5 w-5" />
                Create a Surprise Like This ✨
              </button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase"
            >
              Crafted with ♥ by Cupi
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </ScreenShell>
  )
}