import { motion } from 'framer-motion'
import type { ExperienceConfig } from '../../../types/experience'
import { FloatingEmojis } from '../../shared/FloatingEmojis'
import { FloatingParticles } from '../../shared/FloatingParticles'
import { ScreenShell } from '../../shared/ScreenShell'

interface ChapterScreenProps {
  config: ExperienceConfig
  onBegin: () => void
}

export function ChapterScreen({ config, onBegin }: ChapterScreenProps) {
  return (
    <ScreenShell>
      <FloatingParticles
        type="gold-sparkles"
        colors={[config.branding.accentColor, config.branding.accentSecondary]}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_26%,rgba(245,184,97,0.18),transparent_55%)]"
      />
      <FloatingEmojis emojis={['🕊️', '✨', '🌟']} count={8} />

      <span className="relative z-10 rounded-full border border-[#E7C98A] bg-[#FFF3D6]/80 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-[#A16207]">
        Chapter Cover
      </span>

      <div className="relative z-10 mt-8 [perspective:1400px]">
        <motion.div
          initial={{ rotateY: 0 }}
          animate={{ rotateY: -176 }}
          transition={{ delay: 0.45, type: 'spring', stiffness: 55, damping: 15 }}
          className="relative h-52 w-64 [transform-style:preserve-3d] sm:h-60 sm:w-72"
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl border-[3px] border-[#B45309]/40 bg-gradient-to-br from-[#F5B861] via-[#E8924A] to-[#C96F1D] px-6 text-center shadow-[0_26px_50px_-20px_rgba(180,83,9,0.55)] [backface-visibility:hidden]">
            <span className="text-lg tracking-[0.3em] text-[#FFFDF7]/90">✦ ⸙ ✦</span>
            <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.3em] text-[#FFFDF7]/85">
              A Storybook Keepsake
            </p>
            <h2 className="font-display mt-2 text-3xl font-black leading-tight text-[#FFFDF7]">
              Our Little Story
            </h2>
            <p className="font-display mt-1 text-sm font-semibold italic text-[#FFFDF7]/90">
              · Chapter I ·
            </p>
            <span className="mt-4 inline-block rounded-full border border-[#FFFDF7]/60 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#FFFDF7]">
              Est. with love · 2019
            </span>
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-3xl border border-[#E7C98A] bg-[#FFF9EE] px-6 text-center shadow-[0_26px_50px_-20px_rgba(180,83,9,0.35)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <span className="text-xl text-[#B45309]">✦</span>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#A16207]/70">
              The story begins
            </p>
            <p className="font-display text-xl font-black text-[#78350F]">Chapter I</p>
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-[#E7C98A] to-transparent" />
            <p className="max-w-[12rem] text-xs leading-relaxed text-stone-600">
              Turn the page, and the years unfold…
            </p>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.7, ease: 'easeOut' }}
        className="relative z-10 mt-10 flex max-w-2xl flex-col items-center gap-5 text-center"
      >
        <h1 className="font-display text-balance text-4xl font-black text-[#78350F] sm:text-5xl">
          {config.content.teaserHeading}
        </h1>
        <p className="max-w-md text-pretty text-sm leading-relaxed text-stone-600 sm:text-base">
          {config.content.teaserSubtext}
        </p>
      </motion.div>

      <motion.button
        type="button"
        onClick={onBegin}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 mt-9 flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-400 px-7 text-sm font-bold text-white shadow-lg shadow-amber-500/30 transition-all duration-200 hover:scale-105 active:scale-95"
      >
        Open the Book 📖
      </motion.button>
    </ScreenShell>
  )
}