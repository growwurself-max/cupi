import { motion } from 'framer-motion'
import { useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { FloatingEmojis } from '../../shared/FloatingEmojis'
import { FloatingParticles } from '../../shared/FloatingParticles'
import { LightLetterCard } from '../../shared/LightLetterCard'
import { PolaroidCard } from '../../shared/PolaroidCard'
import { ScreenShell } from '../../shared/ScreenShell'

interface MemoriesScreenProps {
  config: ExperienceConfig
  onContinue: () => void
}

const DATE_LABELS = ['one evening · forever', 'still my favorite', 'always & forever']

export function MemoriesScreen({ config, onContinue }: MemoriesScreenProps) {
  const [tilted, setTilted] = useState(-1)

  const pool = config.content.photos
  const shown = Array.from({ length: Math.min(3, pool.length) }, (_, i) =>
    pool.length > 0 ? pool[i % pool.length] : undefined,
  ).filter((photo): photo is NonNullable<typeof photo> => photo !== undefined)

  return (
    <ScreenShell className="justify-start pb-12">
      <FloatingParticles
        type="heart-petals"
        colors={[config.branding.accentColor, config.branding.accentSecondary]}
      />
      <FloatingEmojis emojis={['💗', '🤍', '🧸', '💌', '✨']} count={12} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(255,155,180,0.16),transparent_45%)]"
      />

      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-xs font-bold tracking-[0.3em] text-[#D65D7A] uppercase"
      >
        Memories & love letters
      </motion.p>

      <div className="relative z-10 mt-10 flex flex-wrap items-start justify-center gap-6 sm:gap-8">
        {shown.map((photo, i) => (
          <PolaroidCard
            key={i}
            photo={photo}
            index={i}
            dateLabel={DATE_LABELS[i % DATE_LABELS.length]}
            frameClass="border border-[#FFC9D4] bg-[#FFF1F4]"
            captionClass="text-[#831843]"
            dateClass="text-[#D65D7A]/70"
            hintClass="text-[#D65D7A]/50"
            tilted={tilted === i}
            onTilt={() => setTilted(i)}
          />
        ))}
      </div>

      <div className="relative z-10 mt-12 w-full max-w-xl">
        <LightLetterCard
          recipient={config.recipient.name}
          content={config.content}
          sender={config.sender.name}
          headerEmoji="💌"
          accent="#d65d7a"
          accentSecondary="#8f7bff"
        />
      </div>

      <motion.button
        type="button"
        onClick={onContinue}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 mt-12 flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-rose-400 to-pink-400 px-7 text-sm font-bold text-white shadow-lg shadow-rose-400/30 transition-all duration-200 hover:scale-105 active:scale-95"
      >
        One more thing 💖
      </motion.button>
    </ScreenShell>
  )
}