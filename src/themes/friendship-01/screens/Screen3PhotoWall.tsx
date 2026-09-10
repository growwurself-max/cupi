import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import type { ExperienceConfig } from '../../../types/experience'
import { ScreenShell } from '../../shared/ScreenShell'
import { FloatingEmojis } from '../../shared/FloatingEmojis'

interface PhotoWallProps {
  config: ExperienceConfig
  onContinue: () => void
}

export function PhotoWall({ config, onContinue }: PhotoWallProps) {
  return (
    <ScreenShell className="justify-start pt-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(92,214,200,0.11),transparent_45%),radial-gradient(circle_at_15%_85%,rgba(255,138,92,0.12),transparent_50%)]"
      />
      <FloatingEmojis emojis={['📸', '✨']} count={8} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mb-10 text-center"
      >
        <p className="text-xs font-bold tracking-[0.3em] uppercase"
          style={{ color: config.branding.accentSecondary }}
        >
          Polaroids from the timeline
        </p>
        <h2 className="font-display mt-2 text-3xl font-semibold text-white sm:text-4xl">
          {config.content.revealHeading}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-pretty text-sm text-white/55">
          {config.content.revealSubtext}
        </p>
      </motion.div>

      <div className="relative z-10 flex w-full max-w-md flex-col gap-7 sm:flex-row sm:flex-wrap sm:justify-center">
        {config.content.photos.map((photo, i) => (
          <motion.figure
            key={photo.src + i}
            initial={{ opacity: 0, y: 60, rotate: 0 }}
            whileInView={{ opacity: 1, y: 0, rotate: photo.rotate }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ delay: i * 0.18, type: 'spring', stiffness: 90, damping: 14 }}
            whileHover={{ scale: 1.06, rotate: 0, zIndex: 30 }}
            className="relative w-56 rounded-2xl bg-white p-3 pb-4 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)]"
          >
            <span
              aria-hidden
              className="absolute -top-3 left-1/2 z-20 -translate-x-1/2 rotate-[-4deg] rounded bg-[#ff8a5c]/85 px-3 py-0.5 text-[10px] font-black tracking-widest text-white uppercase shadow"
            >
              {i === 0 ? 'day one' : i === 1 ? 'inside joke' : 'certified chaos'}
            </span>
            <div className="overflow-hidden rounded-xl">
              <img
                src={photo.src}
                alt={photo.alt}
                loading="lazy"
                className="h-48 w-full object-cover"
              />
            </div>
            <figcaption className="mt-3 text-center text-sm font-semibold text-[#2c2220]">
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
          className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-[#ff8a5c] to-[#5cd6c8] px-8 text-base font-bold text-obsidian-900 transition-transform duration-200 hover:scale-[1.05] active:scale-95"
        >
          Turn the Corners
          <ArrowRight className="h-5 w-5" />
        </motion.button>
      </motion.div>
    </ScreenShell>
  )
}