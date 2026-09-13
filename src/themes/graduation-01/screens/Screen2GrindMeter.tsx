import { motion, useInView } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { FloatingEmojis } from '../../shared/FloatingEmojis'
import { FloatingParticles } from '../../shared/FloatingParticles'
import { ScreenShell } from '../../shared/ScreenShell'

interface GrindMeterScreenProps {
  config: ExperienceConfig
  onContinue: () => void
}

interface GrindStat {
  emoji: string
  label: string
  target: number
}

const GRIND_STATS: GrindStat[] = [
  { emoji: '☕', label: 'Late-night coffees', target: 487 },
  { emoji: '📝', label: 'Exams survived', target: 61 },
  { emoji: '📅', label: 'Days of dedication', target: 1460 },
]

function AnimatedNumber({
  target,
  active,
  delay,
}: {
  target: number
  active: boolean
  delay: number
}) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!active) return
    let raf = 0
    const start = performance.now() + delay * 1000
    const duration = 1500
    const tick = (now: number) => {
      const t = Math.max(0, Math.min(1, (now - start) / duration))
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(eased * target))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, delay, target])

  return <>{value.toLocaleString()}</>
}

export function GrindMeterScreen({ config, onContinue }: GrindMeterScreenProps) {
  const statsRef = useRef<HTMLDivElement | null>(null)
  const inView = useInView(statsRef, { once: true, amount: 0.4 })

  return (
    <ScreenShell>
      <FloatingParticles
        type="gold-sparkles"
        colors={[config.branding.accentColor, config.branding.accentSecondary]}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_12%,rgba(245,194,66,0.12),transparent_45%),radial-gradient(circle_at_10%_85%,rgba(56,189,248,0.14),transparent_50%)]"
      />
      <FloatingEmojis emojis={['🎓', '✨', '🏅', '📚']} count={10} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mb-10 flex max-w-2xl flex-col items-center gap-4 text-center"
      >
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/80 bg-white/85 px-3 py-1.5 text-xs font-bold tracking-[0.24em] text-[#854D0E] uppercase backdrop-blur-md">
          The Grind Meter
        </span>
        <h2 className="font-display text-balance text-3xl font-black text-[#1E3A8A] sm:text-4xl">
          {config.content.suspenseHeading}
        </h2>
        <p className="max-w-md text-pretty text-sm leading-relaxed text-slate-600 sm:text-base">
          {config.content.suspenseSubtext}
        </p>
      </motion.div>

      <div
        ref={statsRef}
        className="relative z-10 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3"
      >
        {GRIND_STATS.map((stat, i) => (
          <motion.div
            key={stat.emoji + stat.label}
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              delay: 0.15 + i * 0.12,
              type: 'spring',
              stiffness: 120,
              damping: 16,
            }}
            className="flex flex-col items-center gap-2 rounded-2xl border border-blue-200/70 bg-white/80 px-5 py-7 shadow-[0_16px_40px_-24px_rgba(30,58,138,0.35)] backdrop-blur-md"
          >
            <span className="text-3xl">{stat.emoji}</span>
            <p className="font-display text-4xl font-black text-[#1E3A8A] sm:text-5xl">
              <AnimatedNumber target={stat.target} active={inView} delay={i * 0.3} />
            </p>
            <p className="text-xs font-semibold tracking-wide text-slate-600 uppercase">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="relative z-10 mt-12"
      >
        <button
          type="button"
          onClick={onContinue}
          className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-blue-500 to-sky-400 px-7 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          Roll the Credits…
          <ArrowRight className="h-5 w-5" />
        </button>
      </motion.div>
    </ScreenShell>
  )
}