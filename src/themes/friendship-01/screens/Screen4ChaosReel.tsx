import { motion } from 'framer-motion'
import { useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { FloatingEmojis } from '../../shared/FloatingEmojis'
import { FloatingParticles } from '../../shared/FloatingParticles'
import { LightLetterCard } from '../../shared/LightLetterCard'
import { PolaroidCard } from '../../shared/PolaroidCard'
import { ScreenShell } from '../../shared/ScreenShell'

interface ChaosReelScreenProps {
  config: ExperienceConfig
  onContinue: () => void
}

const DATE_LABELS = ['day one', 'inside joke', 'certified chaos']
const STICKERS = ['juicy 📸', 'core memory 🧠', 'lit 🔥']

export function ChaosReelScreen({ config, onContinue }: ChaosReelScreenProps) {
  const [tilted, setTilted] = useState<Record<number, boolean>>({})

  const source = config.content.photos.slice(0, 3)
  const photos =
    source.length === 0
      ? []
      : Array.from({ length: 3 }, (_, i) => source[i % source.length])

  const tiltCard = (index: number) => {
    setTilted((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  return (
    <ScreenShell>
      <FloatingParticles
        type="emoji-stickers"
        colors={[config.branding.accentColor, config.branding.accentSecondary]}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(251,146,60,0.14),transparent_55%)]"
      />
      <FloatingEmojis emojis={['✨', '🍕', '💖', '🤪', '🥳', '🥑']} count={12} />

      <motion.span
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 rounded-full border border-amber-200/70 bg-white/80 px-4 py-1.5 text-xs font-bold tracking-[0.25em] text-rose-500 uppercase backdrop-blur-md"
      >
        Chaos reel &amp; real talk
      </motion.span>

      <motion.h1
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7, ease: 'easeOut' }}
        className="font-display relative z-10 mt-6 max-w-xl text-balance text-center text-4xl font-black text-[#9F1239] sm:text-5xl"
      >
        {config.content.revealHeading}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45, duration: 0.6 }}
        className="relative z-10 mt-4 max-w-md text-center text-sm font-semibold text-stone-600"
      >
        {config.content.revealSubtext}
      </motion.p>

      {photos.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="relative z-10 mt-10 rounded-2xl border border-orange-200/70 bg-white/80 px-6 py-6 text-center text-sm font-bold text-[#9F1239] backdrop-blur-md"
        >
          No photos yet — just vibes and folklore. ✨
        </motion.p>
      ) : (
        <div className="relative z-10 mt-10 flex flex-wrap justify-center gap-x-6 gap-y-12">
          {photos.map((photo, i) => (
            <div key={i} className="relative">
              <PolaroidCard
                photo={photo}
                index={i}
                dateLabel={DATE_LABELS[i % DATE_LABELS.length]}
                frameClass="bg-white border border-orange-200/70"
                captionClass="text-[#0F172A]"
                dateClass="text-stone-400"
                hintClass="text-orange-300"
                tilted={!!tilted[i]}
                onTilt={() => tiltCard(i)}
              />
              <motion.span
                initial={{ opacity: 0, scale: 0.6, rotate: 20 }}
                animate={{ opacity: 1, scale: 1, rotate: 12 }}
                transition={{ delay: 0.7 + i * 0.2, type: 'spring', stiffness: 180, damping: 14 }}
                className="absolute -top-3 right-2 z-[5] rounded-full bg-gradient-to-r from-amber-300 to-orange-200 px-3 py-1 text-[11px] font-black text-[#7c2d12] shadow-md shadow-amber-200/50"
              >
                {STICKERS[i % STICKERS.length]}
              </motion.span>
            </div>
          ))}
        </div>
      )}

      <div className="relative z-10 mt-14 w-full max-w-xl">
        <LightLetterCard
          recipient={config.recipient.name}
          content={config.content}
          sender={config.sender.name}
          headerEmoji="🫶"
          accent="#e11d48"
          accentSecondary="#fb923c"
        />
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="relative z-10 mt-10 flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-orange-400 to-rose-400 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-400/30 transition-all duration-200 hover:scale-105 active:scale-95"
      >
        FINAL HIGH FIVE 🙌
      </button>
    </ScreenShell>
  )
}