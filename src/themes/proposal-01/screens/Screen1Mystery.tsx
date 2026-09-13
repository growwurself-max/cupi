import { motion } from 'framer-motion'
import type { ExperienceConfig } from '../../../types/experience'
import { FloatingEmojis } from '../../shared/FloatingEmojis'
import { FloatingParticles } from '../../shared/FloatingParticles'
import { ScreenShell } from '../../shared/ScreenShell'

interface Screen1MysteryProps {
  config: ExperienceConfig
  onBegin: () => void
}

const TWINKLES = Array.from({ length: 18 }).map((_, i) => ({
  id: i,
  left: (i * 41 + 3) % 100,
  top: (i * 29 + 6) % 100,
  size: 2 + (i % 3),
  duration: 1.6 + (i % 4) * 0.5,
  delay: (i % 9) * 0.4,
}))

const PILL =
  'inline-flex items-center gap-1.5 rounded-full border border-violet-200/70 bg-white/70 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#581C87] backdrop-blur-md'

export function Screen1Mystery({ config, onBegin }: Screen1MysteryProps) {
  return (
    <ScreenShell>
      <FloatingParticles
        type="star-dust"
        colors={[config.branding.accentColor, config.branding.accentSecondary]}
      />
      <FloatingParticles
        type="lavender-mist"
        count={8}
        colors={['#a78bfa', '#f0abfc']}
      />
      <FloatingEmojis emojis={['✨', '💫', '💍', '💗']} count={9} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_32%,rgba(167,139,250,0.16),transparent_55%)]"
      />

      <div aria-hidden className="pointer-events-none absolute inset-0">
        {TWINKLES.map((star) => (
          <motion.span
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: star.size,
              height: star.size,
              boxShadow: '0 0 8px 1px rgba(240,171,252,0.85)',
            }}
            animate={{ opacity: [0.15, 1, 0.15], scale: [0.6, 1.25, 0.6] }}
            transition={{
              duration: star.duration,
              delay: star.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 110, damping: 15, delay: 0.1 }}
        className="relative z-10 mb-9"
      >
        <motion.div
          aria-hidden
          animate={{ scale: [1, 1.28, 1], opacity: [0.45, 0.85, 0.45] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -inset-6 rounded-full bg-violet-300/40 blur-3xl"
        />
        <motion.div
          aria-hidden
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
          className="relative flex h-40 w-40 items-center justify-center rounded-full sm:h-44 sm:w-44"
          style={{
            background:
              'radial-gradient(circle at 35% 30%, #ffffff 0%, #f5ecff 40%, #e9d5ff 70%, #a78bfa 100%)',
            boxShadow:
              'inset -14px -16px 30px rgba(167,139,250,0.5), inset 12px 14px 26px rgba(255,255,255,0.95), 0 20px 48px -14px rgba(167,139,250,0.6)',
          }}
        >
          <div
            aria-hidden
            className="absolute rounded-full"
            style={{
              width: '52%',
              height: '52%',
              top: '12%',
              left: '16%',
              background:
                'radial-gradient(circle at 40% 35%, rgba(255,255,255,0.98), rgba(255,255,255,0.15) 60%, transparent 70%)',
            }}
          />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.7, ease: 'easeOut' }}
        className="relative z-10 flex max-w-2xl flex-col items-center gap-5 text-center"
      >
        <span className={PILL}>The Mystery</span>
        <h1 className="font-display text-balance text-4xl font-bold text-[#581C87] sm:text-5xl">
          {config.content.teaserHeading}
        </h1>
        <p className="max-w-md text-pretty text-sm leading-relaxed text-purple-900/60 sm:text-base">
          {config.content.teaserSubtext}
        </p>
        <p className="font-display max-w-sm text-pretty text-xl italic text-[#581C87]">
          “I have a question I've been waiting my whole life to ask you…”
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
          className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400 px-7 text-sm font-bold text-white shadow-lg shadow-violet-500/30 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          Take My Hand 💍
        </button>
      </motion.div>
    </ScreenShell>
  )
}