import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import type { ExperienceConfig } from '../../../types/experience'
import { FloatingParticles } from '../../shared/FloatingParticles'
import { ScreenShell } from '../../shared/ScreenShell'
import { FloatingEmojis } from '../../shared/FloatingEmojis'

interface TeaserProps {
  config: ExperienceConfig
  onBegin: () => void
}

const STARS = Array.from({ length: 26 }, (_, i) => i)

export function TeaserScreen({ config, onBegin }: TeaserProps) {
  return (
    <ScreenShell>
      <FloatingParticles
        type="gold-sparkles"
        colors={[config.branding.accentColor, config.branding.accentSecondary]}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,179,186,0.14),transparent_55%)]"
      />
      <FloatingEmojis emojis={['✨', '💫', '🌙']} count={10} />

      {/* Twinkling stars */}
      {STARS.map((i) => (
        <motion.span
          key={i}
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.9, 0],
            y: [0, -6, 0],
          }}
          transition={{
            duration: 3 + (i % 5) * 0.6,
            repeat: Infinity,
            delay: (i % 9) * 0.4,
            ease: 'easeInOut',
          }}
          className="pointer-events-none absolute h-1 w-1 rounded-full bg-white"
          style={{
            left: `${(i * 37) % 100}%`,
            top: `${(i * 53) % 72}%`,
            background: i % 3 === 0 ? '#ffd98a' : '#ffffff',
          }}
        />
      ))}

      <motion.div
        initial={{ scale: 0, rotate: -18 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 0.1 }}
        className="relative z-10 mb-10"
      >
        <motion.div
          aria-hidden
          animate={{ scale: [1, 1.35, 1], opacity: [0.45, 0.9, 0.45] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -inset-6 rounded-full blur-2xl"
          style={{ background: 'radial-gradient(circle, rgba(255,179,186,0.35), transparent 70%)' }}
        />
        <span
          className="animate-pulse-glow relative flex h-32 w-32 items-center justify-center rounded-full text-6xl shadow-2xl"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,179,186,0.16), rgba(224,179,242,0.1))',
            border: '1px solid rgba(255,179,186,0.35)',
            backdropFilter: 'blur(16px)',
          }}
        >
          💍
        </span>
        <motion.div
          aria-hidden
          animate={{ rotate: 360 }}
          transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border border-dashed border-rose-200/25"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.7, ease: 'easeOut' }}
        className="relative z-10 flex max-w-2xl flex-col items-center gap-6 text-center"
      >
        <span
          className="rounded-full border border-rose-200/30 px-4 py-1.5 text-xs font-bold tracking-[0.2em] uppercase"
          style={{ color: config.branding.accentColor }}
        >
          {config.branding.themeLabel}
        </span>
        <h1 className="font-display text-balance text-4xl font-semibold text-white sm:text-5xl">
          {config.content.teaserHeading}
        </h1>
        <p className="max-w-md text-pretty text-sm leading-relaxed text-white/60 sm:text-base">
          {config.content.teaserSubtext}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 mt-10"
      >
        <button
          type="button"
          onClick={onBegin}
          className="group flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-[#ffb3ba] via-[#f6c6b6] to-[#e0b3f2] px-8 text-base font-bold text-obsidian-900 transition-transform duration-200 hover:scale-[1.05] active:scale-95"
        >
          <Sparkles className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
          Begin the Question
        </button>
      </motion.div>
    </ScreenShell>
  )
}