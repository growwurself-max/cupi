import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { FloatingParticles } from '../../shared/FloatingParticles'
import { ScreenShell } from '../../shared/ScreenShell'
import { LetterCard } from '../../shared/LetterCard'

interface MemoriesScreenProps {
  config: ExperienceConfig
  onContinue: () => void
}

export function MemoriesScreen({ config, onContinue }: MemoriesScreenProps) {
  const [tilted, setTilted] = useState<number | null>(null)

  return (
    <ScreenShell className="justify-start pt-28">
      <FloatingParticles
        type="star-dust"
        colors={[config.branding.accentColor, config.branding.accentSecondary]}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(245,184,97,0.12),transparent_45%),radial-gradient(circle_at_10%_75%,rgba(232,146,74,0.1),transparent_50%)]"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mb-8 text-center"
      >
        <p className="text-xs font-bold tracking-[0.3em] uppercase"
          style={{ color: config.branding.accentSecondary }}
        >
          Polaroids &amp; words
        </p>
        <h2 className="font-display mt-2 text-3xl font-semibold text-white sm:text-4xl">
          {config.content.letterIntro}
        </h2>
      </motion.div>

      {/* Polaroids */}
      <div className="relative z-10 mt-6 flex flex-col items-center gap-8 sm:flex-row sm:items-end">
        {config.content.photos.map((photo, i) => (
          <motion.button
            key={photo.src + i}
            type="button"
            onClick={() => setTilted((prev) => (prev === i ? null : i))}
            initial={{ opacity: 0, y: 60, rotate: 0 }}
            animate={{ opacity: 1, y: 0, rotate: photo.rotate }}
            transition={{
              delay: 0.3 + i * 0.22,
              type: 'spring',
              stiffness: 90,
              damping: 14,
            }}
            whileTap={{ scale: 0.97 }}
            aria-label={`Tap to tilt photo: ${photo.caption}`}
            className="group relative w-56 select-none text-left outline-none"
          >
            <motion.div
              animate={{
                rotate: tilted === i ? Math.sign(photo.rotate) * 10 : photo.rotate,
                scale: tilted === i ? 1.06 : 1,
                zIndex: tilted === i ? 20 : 1,
              }}
              transition={{ type: 'spring', stiffness: 160, damping: 15 }}
              className="rounded-2xl border-2 border-[#ffe9c9] bg-[#ffe9c9] p-3 pb-4 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)]"
            >
              <div className="overflow-hidden rounded-xl">
                <img
                  src={photo.src}
                  alt={photo.alt}
                  loading="lazy"
                  className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <p className="mt-3 text-center text-sm font-semibold text-[#6b4b1d]">
                {photo.caption}
              </p>
              <span className="mt-1 block text-center text-[11px] text-[#6b4b1d]/50">
                {tilted === i ? 'a favorite, always ↺' : 'tap to tilt'}
              </span>
            </motion.div>

            <AnimatePresence>
              {tilted === i && (
                <motion.span
                  key="spark"
                  initial={{ opacity: 1, scale: 0.4 }}
                  animate={{ opacity: 0, scale: 1.6 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="pointer-events-none absolute -inset-2 rounded-3xl bg-gradient-to-br from-[#f5b861]/40 to-[#e8924a]/40 blur-md"
                />
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>

      <div className="relative z-10 mt-10 w-full max-w-xl">
        <LetterCard
          recipient={config.recipient.name}
          content={config.content}
          sender={config.sender.name}
          headerEmoji="🕰️"
          accent={config.branding.accentColor}
        />
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
          className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-[#e8924a] to-[#f5b861] px-8 text-base font-bold text-obsidian-900 transition-transform duration-200 hover:scale-[1.05] active:scale-95"
        >
          Light Our Candle 🕯️
        </motion.button>
      </motion.div>
    </ScreenShell>
  )
}