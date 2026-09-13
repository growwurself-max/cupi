import { motion } from 'framer-motion'
import { useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { FloatingParticles } from '../../shared/FloatingParticles'
import { LightLetterCard } from '../../shared/LightLetterCard'
import { PolaroidCard } from '../../shared/PolaroidCard'
import { ScreenShell } from '../../shared/ScreenShell'

const DATE_LABELS = ['then 🥹', 'party 📸', 'home 🏡']

interface VaultScreenProps {
  config: ExperienceConfig
  onContinue: () => void
}

export function VaultScreen({ config, onContinue }: VaultScreenProps) {
  const [tiltedIndex, setTiltedIndex] = useState<number | null>(null)
  const photos = config.content.photos.slice(0, 3)

  return (
    <ScreenShell>
      <FloatingParticles
        type="gold-sparkles"
        colors={[config.branding.accentColor, config.branding.accentSecondary]}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(245,184,97,0.16),transparent_55%)]"
      />

      <span className="relative z-10 rounded-full border border-[#E7C98A] bg-[#FFF3D6]/80 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-[#A16207]">
        Polaroid vault & milestone letter
      </span>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 font-display mt-6 text-center text-3xl font-black text-[#78350F] sm:text-4xl"
      >
        Our favorite frames 🖼️
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.6 }}
        className="relative z-10 mt-3 max-w-md text-center text-sm leading-relaxed text-stone-600"
      >
        Tilt each one — every photo has a little more memory tucked behind it.
      </motion.p>

      {photos.length > 0 && (
        <div className="relative z-10 mt-9 flex flex-wrap items-start justify-center gap-8">
          {photos.map((photo, i) => (
            <PolaroidCard
              key={photo.src + i}
              photo={photo}
              index={i}
              dateLabel={DATE_LABELS[i % DATE_LABELS.length]}
              frameClass="bg-[#FFEFC9] border border-[#E7C98A]"
              captionClass="text-[#78350F]"
              dateClass="text-[#A16207]/70"
              hintClass="text-[#A16207]/50"
              tilted={tiltedIndex === i}
              onTilt={() =>
                setTiltedIndex((prev) => (prev === i ? null : i))
              }
            />
          ))}
        </div>
      )}

      <div className="relative z-10 mt-12 w-full">
        <LightLetterCard
          recipient={config.recipient.name}
          content={config.content}
          sender={config.sender.name}
          headerEmoji="🕰️"
          accent="#b45309"
          accentSecondary="#f5b861"
          className="mx-auto"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 mt-10"
      >
        <button
          type="button"
          onClick={onContinue}
          className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-400 px-7 text-sm font-bold text-white shadow-lg shadow-amber-500/30 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          Time to Toast 🥂
        </button>
      </motion.div>
    </ScreenShell>
  )
}