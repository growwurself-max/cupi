import { motion } from 'framer-motion'
import { GraduationCap } from 'lucide-react'
import type { ExperienceConfig } from '../../../types/experience'
import { FloatingEmojis } from '../../shared/FloatingEmojis'
import { FloatingParticles } from '../../shared/FloatingParticles'
import { ScreenShell } from '../../shared/ScreenShell'

interface MilestoneScreenProps {
  config: ExperienceConfig
  onBegin: () => void
}

export function MilestoneScreen({ config, onBegin }: MilestoneScreenProps) {
  return (
    <ScreenShell>
      <FloatingParticles
        type="gold-sparkles"
        colors={[config.branding.accentColor, config.branding.accentSecondary]}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_34%,rgba(245,194,66,0.16),transparent_55%)]"
      />
      <FloatingEmojis emojis={['🎓', '✨', '🏅', '📚']} count={10} />

      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 0.1 }}
        className="relative z-10 mb-10 flex h-44 w-44 items-center justify-center"
      >
        <span
          aria-hidden
          className="animate-pulse-glow absolute -inset-7 rounded-full blur-2xl"
          style={{
            background:
              'radial-gradient(circle, rgba(245,194,66,0.4), rgba(59,130,246,0.12) 60%, transparent 72%)',
          }}
        />
        <span
          aria-hidden
          className="absolute inset-0 rounded-full border-[3px] border-[#F5C242]/80 shadow-[0_0_0_4px_rgba(245,194,66,0.25),0_0_30px_rgba(245,194,66,0.35)]"
        />
        <motion.span
          aria-hidden
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="absolute -inset-3.5 rounded-full border-2 border-dashed border-amber-300/80"
        />
        <span
          aria-hidden
          className="absolute -left-3 -top-2 animate-float-slow text-2xl"
        >
          ✨
        </span>
        <span
          aria-hidden
          className="absolute -bottom-1 -right-2 animate-float-slow text-xl [animation-delay:1.6s]"
        >
          ✨
        </span>
        <span
          aria-hidden
          className="animate-pulse-glow absolute -left-1 top-8 text-lg [animation-delay:0.8s]"
        >
          🏅
        </span>
        <span className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 via-[#FEF9C3] to-sky-100 text-6xl shadow-[inset_0_0_0_2px_rgba(245,194,66,0.55)]">
          🎓
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.7, ease: 'easeOut' }}
        className="relative z-10 flex max-w-2xl flex-col items-center gap-5 text-center"
      >
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/80 bg-white/85 px-3 py-1.5 text-xs font-bold tracking-[0.24em] text-[#854D0E] uppercase backdrop-blur-md">
          The Milestone
        </span>
        <h1 className="font-display text-balance text-4xl font-black text-[#1E3A8A] sm:text-5xl md:text-6xl">
          {config.content.teaserHeading}
        </h1>
        <p className="max-w-xl text-pretty text-sm leading-relaxed text-slate-600 sm:text-base">
          {config.content.teaserSubtext}
        </p>
        <p className="font-display text-base italic text-[#854D0E]/80 sm:text-lg">
          All the late nights and hard work led to this moment.
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
          className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-blue-500 to-sky-400 px-7 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <GraduationCap className="h-5 w-5" />
          Enter the Ceremony 🎓
        </button>
      </motion.div>
    </ScreenShell>
  )
}