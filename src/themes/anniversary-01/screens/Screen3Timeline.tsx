import { motion } from 'framer-motion'
import type { ExperienceConfig } from '../../../types/experience'
import { FloatingParticles } from '../../shared/FloatingParticles'
import { ScreenShell } from '../../shared/ScreenShell'
import { FloatingEmojis } from '../../shared/FloatingEmojis'

interface TimelineScreenProps {
  config: ExperienceConfig
  onContinue: () => void
}

const YEARS = [
  { year: 1, note: 'We said yes, awkwardly.' },
  { year: 2, note: 'First trip. Tiny apartment, huge laughs.' },
  { year: 3, note: 'We learned to cook (kind of).' },
  { year: 4, note: 'Deep talks that last till 3am.' },
  { year: 5, note: 'Still laughing at the same jokes.' },
]

export function TimelineScreen({ config, onContinue }: TimelineScreenProps) {
  return (
    <ScreenShell className="justify-start pt-28">
      <FloatingParticles
        type="star-dust"
        colors={[config.branding.accentColor, config.branding.accentSecondary]}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(232,146,74,0.12),transparent_45%),radial-gradient(circle_at_15%_80%,rgba(245,184,97,0.12),transparent_50%)]"
      />
      <FloatingEmojis emojis={['🕊️', '✨']} count={8} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mb-10 text-center"
      >
        <p className="text-xs font-bold tracking-[0.3em] uppercase"
          style={{ color: config.branding.accentColor }}
        >
          Our story so far
        </p>
        <h2 className="font-display mt-2 text-3xl font-semibold text-white sm:text-4xl">
          {config.content.countdownTagline}
        </h2>
      </motion.div>

      <div className="relative z-10 w-full max-w-md">
        <div
          aria-hidden
          className="absolute top-2 bottom-2 left-[27px] w-px bg-gradient-to-b from-amber-300/40 to-amber-300/5"
        />
        <div className="flex flex-col gap-5">
          {YEARS.map((item, i) => (
            <motion.div
              key={item.year}
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: i * 0.12, type: 'spring', stiffness: 120 }}
              className="relative flex items-center gap-4"
            >
              <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-amber-200/30 bg-obsidian-800 text-sm font-black text-amber-200">
                {item.year}
              </span>
              <p className="rounded-2xl border border-amber-200/15 bg-white/[0.04] px-4 py-3 text-sm text-white/75">
                {item.note}
              </p>
            </motion.div>
          ))}
        </div>
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
          className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-[#f5b861] to-[#e8924a] px-8 text-base font-bold text-obsidian-900 transition-transform duration-200 hover:scale-[1.05] active:scale-95"
        >
          Open the Box Again 📦
        </motion.button>
      </motion.div>
    </ScreenShell>
  )
}