import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import type { ExperienceConfig } from '../../../types/experience'
import { FloatingParticles } from '../../shared/FloatingParticles'
import { ScreenShell } from '../../shared/ScreenShell'
import { FloatingEmojis } from '../../shared/FloatingEmojis'

interface ReelScreenProps {
  config: ExperienceConfig
  onContinue: () => void
}

const MILESTONES = [
  'Day 1 · moved in with 4 bags and big dreams',
  'Year 2 · found “the” study spot (and the good coffee)',
  'Year 3 · group project survived (all limbs intact)',
  'Now · cap on, gown on, world waiting',
]

export function ReelScreen({ config, onContinue }: ReelScreenProps) {
  return (
    <ScreenShell className="justify-start pt-28">
      <FloatingParticles
        type="gold-sparkles"
        colors={[config.branding.accentColor, config.branding.accentSecondary]}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(97,224,197,0.12),transparent_45%),radial-gradient(circle_at_15%_80%,rgba(245,194,102,0.12),transparent_50%)]"
      />
      <FloatingEmojis emojis={['📽️', '✨']} count={8} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mb-10 text-center"
      >
        <p className="text-xs font-bold tracking-[0.3em] uppercase"
          style={{ color: config.branding.accentSecondary }}
        >
          The highlight reel
        </p>
        <h2 className="font-display mt-2 text-3xl font-semibold text-white sm:text-4xl">
          {config.content.suspenseHeading}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-pretty text-sm text-white/55">
          {config.content.suspenseSubtext}
        </p>
      </motion.div>

      {/* Filmstrip ticker */}
      <div className="relative z-10 mb-8 w-full max-w-xl overflow-hidden">
        <motion.div
          animate={{ x: ['0%', '-50%', '0%'] }}
          transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
          className="flex gap-3 whitespace-nowrap"
          aria-hidden
        >
          {[...MILESTONES, ...MILESTONES].map((label, i) => (
            <span
              key={i}
              className="rounded-full border border-amber-200/20 bg-white/[0.03] px-4 py-1.5 text-xs font-semibold text-white/55"
            >
              {label}
            </span>
          ))}
        </motion.div>
      </div>

      <div className="relative z-10 flex w-full max-w-md flex-col gap-7 sm:flex-row sm:flex-wrap sm:justify-center">
        {config.content.photos.map((photo, i) => (
          <motion.figure
            key={photo.src + i}
            initial={{ opacity: 0, y: 60, rotate: 0 }}
            whileInView={{ opacity: 1, y: 0, rotate: photo.rotate }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ delay: i * 0.16, type: 'spring', stiffness: 90, damping: 14 }}
            whileHover={{ scale: 1.05, rotate: 0, zIndex: 30 }}
            className="relative w-52 rounded-xl border-2 border-[#f5c266] bg-[#fdf4db] p-2.5 pb-3 shadow-[0_22px_55px_-18px_rgba(0,0,0,0.85)]"
          >
            <span
              aria-hidden
              className="absolute -bottom-2 left-1/2 z-20 h-4 w-24 -translate-x-1/2 rotate-[-2deg] rounded-sm bg-[#f5c266]/80 opacity-90 shadow"
            />
            <div className="overflow-hidden rounded-lg">
              <img
                src={photo.src}
                alt={photo.alt}
                loading="lazy"
                className="h-44 w-full object-cover saturate-90"
              />
            </div>
            <figcaption className="mt-2.5 text-center text-xs font-semibold text-[#334155]">
              {photo.caption}
            </figcaption>
          </motion.figure>
        ))}
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
          className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-[#f5c266] to-[#61e0c5] px-8 text-base font-bold text-obsidian-900 transition-transform duration-200 hover:scale-[1.05] active:scale-95"
        >
          Roll the Credits
          <ArrowRight className="h-5 w-5" />
        </motion.button>
      </motion.div>
    </ScreenShell>
  )
}