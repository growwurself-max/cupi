import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { FloatingParticles } from '../../shared/FloatingParticles'
import { ScreenShell } from '../../shared/ScreenShell'

const DIGIT_H = 64

const TICKER = [
  { label: 'Years', value: 6 },
  { label: 'Months', value: 4 },
  { label: 'Days', value: 12 },
]

interface TickerScreenProps {
  config: ExperienceConfig
  onContinue: () => void
}

export function TickerScreen({ config, onContinue }: TickerScreenProps) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), 1600)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <ScreenShell>
      <FloatingParticles
        type="gold-sparkles"
        colors={[config.branding.accentColor, config.branding.accentSecondary]}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_32%,rgba(245,184,97,0.18),transparent_55%)]"
      />

      <span className="relative z-10 rounded-full border border-[#E7C98A] bg-[#FFF3D6]/80 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-[#A16207]">
        Golden Odometer
      </span>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 font-display mt-6 text-balance text-center text-3xl font-black text-[#78350F] sm:text-4xl"
      >
        Our Little Story keeps counting
      </motion.h1>

      <div className="relative z-10 mt-8 flex items-end gap-3 sm:gap-5">
        {TICKER.map((t, i) => (
          <motion.div
            key={t.label}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + i * 0.15, type: 'spring', stiffness: 110, damping: 14 }}
            className="flex flex-col items-center gap-3"
          >
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#A16207]">
              {t.label}
            </span>
            <div className="relative h-16 w-20 overflow-hidden rounded-2xl border border-[#E7C98A] bg-[#FFEFC9] shadow-[0_12px_26px_-14px_rgba(180,83,9,0.5)] sm:w-24">
              <motion.div
                initial={{ y: 0 }}
                animate={{ y: -t.value * DIGIT_H }}
                transition={{
                  delay: 0.5 + i * 0.2,
                  duration: 1.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="flex flex-col"
              >
                {Array.from({ length: t.value + 1 }).map((_, d) => (
                  <span
                    key={d}
                    className="flex h-16 items-center justify-center font-display text-5xl font-black text-[#B45309]"
                  >
                    {d}
                  </span>
                ))}
              </motion.div>
              <div className="pointer-events-none absolute inset-0 animate-shimmer rounded-2xl bg-[length:200%_100%] bg-gradient-to-r from-transparent via-[#FFE9B8]/90 to-transparent" />
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.8 }}
        className="relative z-10 mt-8 h-1.5 w-64 animate-shimmer rounded-full bg-[length:200%_auto] bg-gradient-to-r from-[#FCE3A6] via-[#F5B861] to-[#FCE3A6] shadow-[0_0_14px_rgba(245,184,97,0.45)] sm:w-80"
      />

      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.05, duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 font-display mt-5 text-center text-lg font-bold text-[#78350F] sm:text-xl"
      >
        6 Years • 4 Months • 12 Days of Loving You
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: ready ? 1 : 0.35, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 mt-9"
      >
        <button
          type="button"
          onClick={onContinue}
          disabled={!ready}
          aria-disabled={!ready}
          className="group flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-400 px-7 text-sm font-bold text-white shadow-lg shadow-amber-500/30 transition-all duration-200 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 disabled:active:scale-100"
        >
          Keep the Story Going 🕰️
          <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5" />
        </button>
      </motion.div>
    </ScreenShell>
  )
}