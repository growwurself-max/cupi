import { AnimatePresence, motion } from 'framer-motion'
import { Cake, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { GlassCard } from '../../../components/ui/GlassCard'
import { FloatingParticles } from '../../shared/FloatingParticles'
import { ScreenShell } from '../../shared/ScreenShell'

interface Screen5LetterMemoriesProps {
  config: ExperienceConfig
  onContinue: () => void
}

export function Screen5LetterMemories({
  config,
  onContinue,
}: Screen5LetterMemoriesProps) {
  const [tilted, setTilted] = useState<number | null>(null)
  const [sparkleKey, setSparkleKey] = useState(0)

  const toggleTilt = (index: number) => {
    setTilted((prev) => (prev === index ? null : index))
    setSparkleKey((k) => k + 1)
  }

  return (
    <ScreenShell className="justify-start pt-28">
      <FloatingParticles
        type="heart-petals"
        colors={[config.branding.accentColor, config.branding.accentSecondary]}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(252,217,166,0.12),transparent_45%),radial-gradient(circle_at_10%_75%,rgba(201,184,255,0.12),transparent_50%)]"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mb-2 text-center"
      >
        <p className="text-xs font-bold tracking-[0.3em] text-soft-amber uppercase">
          Some memories
        </p>
        <h2 className="font-display mt-2 text-3xl font-semibold text-white sm:text-4xl">
          {config.content.letterIntro}
        </h2>
      </motion.div>

      {/* Polaroids */}
      <div className="relative z-10 mt-10 flex flex-col items-center gap-8 sm:flex-row sm:items-end sm:justify-center">
        {config.content.photos.map((photo, i) => (
          <motion.button
            key={photo.src + i}
            type="button"
            onClick={() => toggleTilt(i)}
            initial={{ opacity: 0, y: 60, rotate: 0 }}
            animate={{ opacity: 1, y: 0, rotate: photo.rotate }}
            transition={{
              delay: 0.3 + i * 0.22,
              type: 'spring',
              stiffness: 90,
              damping: 14,
            }}
            whileTap={{ scale: 0.97 }}
            className="group relative w-56 select-none text-left focus:outline-none"
            aria-label={`Tap to tilt photo: ${photo.caption}`}
          >
            <AnimatePresence>
              {tilted === i && (
                <motion.span
                  key="spark"
                  initial={{ opacity: 1, scale: 0.4 }}
                  animate={{ opacity: 0, scale: 1.6 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="pointer-events-none absolute -inset-2 z-20 rounded-3xl bg-gradient-to-br from-rose-gold/40 to-soft-violet/40 blur-md"
                />
              )}
            </AnimatePresence>

            <motion.div
              animate={{
                rotate:
                  tilted === i
                    ? Math.sign(photo.rotate) * 10
                    : photo.rotate,
                scale: tilted === i ? 1.06 : 1,
                zIndex: tilted === i ? 20 : 1,
              }}
              transition={{ type: 'spring', stiffness: 160, damping: 15 }}
              className="relative rounded-2xl bg-white p-3 pb-4 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)]"
            >
              <div className="overflow-hidden rounded-xl bg-obsidian-800">
                <img
                  src={photo.src}
                  alt={photo.alt}
                  loading="lazy"
                  className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <p className="mt-3 text-center text-sm font-semibold text-obsidian-800">
                {photo.caption}
              </p>
              <span className="mt-1 block text-center text-[11px] text-obsidian-800/50">
                {tilted === i ? 'nice angle, huh? ↺' : 'tap to tilt'}
              </span>
            </motion.div>
          </motion.button>
        ))}
      </div>
      <span key={`sparkle-${sparkleKey}`} className="sr-only">
        tilted
      </span>

      {/* Letter */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, delay: 0.25, ease: 'easeOut' }}
        className="relative z-10 mt-14 w-full max-w-xl"
      >
        <div
          aria-hidden
          className="absolute -inset-1 rounded-[2rem] bg-gradient-to-br from-rose-gold/30 via-transparent to-soft-violet/30 blur-lg"
        />
        <GlassCard glow="primary" className="relative p-7 sm:p-9">
          <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

          <div className="mb-5 flex items-center gap-2">
            <span className="text-2xl">💌</span>
            <p className="font-display text-xl italic text-white/90">
              Dear {config.recipient.name},
            </p>
          </div>

          <div className="space-y-4">
            {config.content.letterLines.map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 + i * 0.18, duration: 0.5 }}
                className="text-[15px] leading-relaxed text-white/75"
              >
                {line}
              </motion.p>
            ))}
          </div>

          <div className="mt-7 flex flex-col items-end">
            <p className="text-[15px] text-white/60 italic">
              {config.content.letterSignoff}
            </p>
            <p className="text-gradient-lux font-display mt-1 text-2xl font-semibold">
              {config.sender.name}
            </p>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="relative z-10 mt-12 flex flex-col items-center gap-3 pb-4"
      >
        <motion.button
          type="button"
          onClick={onContinue}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="glow-violet flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-soft-violet to-rose-gold px-8 text-base font-bold text-obsidian-900 transition-transform duration-200 hover:scale-[1.05] active:scale-95"
        >
          <Cake className="h-5 w-5" />
          Make a Birthday Wish 🎂
        </motion.button>
        <span className="flex items-center gap-1 text-[11px] font-semibold tracking-wide text-white/35 uppercase">
          almost there <ChevronDown className="h-3.5 w-3.5" />
        </span>
      </motion.div>
    </ScreenShell>
  )
}