import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import type {
  ExperienceConfig,
  PhotoItem,
} from '../../../types/experience'
import { FloatingEmojis } from '../../shared/FloatingEmojis'
import { FloatingParticles } from '../../shared/FloatingParticles'
import { LightLetterCard } from '../../shared/LightLetterCard'
import { PolaroidCard } from '../../shared/PolaroidCard'
import { ScreenShell } from '../../shared/ScreenShell'

interface JourneyScreenProps {
  config: ExperienceConfig
  onContinue: () => void
}

const FALLBACK_PHOTOS: PhotoItem[] = [
  {
    src: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop',
    alt: 'Graduation caps thrown into the air',
    caption: 'Toss one for every all-nighter.',
    rotate: -3,
  },
  {
    src: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop',
    alt: 'Row of empty desks in a lecture hall',
    caption: 'The seat that knew you best.',
    rotate: 3,
  },
  {
    src: 'https://images.unsplash.com/photo-1541123356219-284ebe98ae3b?q=80&w=800&auto=format&fit=crop',
    alt: 'Group of students celebrating with caps',
    caption: 'Same crew. Bigger chapter.',
    rotate: -2,
  },
]

const DATE_LABELS = ['first day', 'midnights', 'graduation day']
const STICKERS = ['then 📸', 'study grind ☕', 'now 🎓']

export function JourneyScreen({ config, onContinue }: JourneyScreenProps) {
  const [tilted, setTilted] = useState<boolean[]>([false, false, false])

  const photos = useMemo(() => {
    const base = config.content.photos.length
      ? config.content.photos
      : FALLBACK_PHOTOS
    return Array.from({ length: 3 }, (_, i) => base[i % base.length])
  }, [config.content.photos])

  const toggleTilt = (i: number) => {
    setTilted((prev) => {
      const next = [...prev]
      next[i] = !next[i]
      return next
    })
  }

  return (
    <ScreenShell className="justify-start pt-28">
      <FloatingParticles
        type="gold-sparkles"
        colors={[config.branding.accentColor, config.branding.accentSecondary]}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_8%,rgba(56,189,248,0.12),transparent_45%),radial-gradient(circle_at_12%_50%,rgba(245,194,66,0.12),transparent_50%)]"
      />
      <FloatingEmojis emojis={['🎓', '✨', '🏅', '📚']} count={10} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mb-10 flex flex-col items-center gap-3 text-center"
      >
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/80 bg-white/85 px-3 py-1.5 text-xs font-bold tracking-[0.24em] text-[#854D0E] uppercase backdrop-blur-md">
          Journey &amp; letter of pride
        </span>
        <h2 className="font-display text-balance text-3xl font-black text-[#1E3A8A] sm:text-4xl">
          Same dreams. Bigger ending.
        </h2>
      </motion.div>

      <div className="relative z-10 flex w-full flex-wrap items-start justify-center gap-8">
        {photos.map((photo, i) => (
          <div key={photo.src + i} className="relative">
            <span
              aria-hidden
              className="absolute -top-3 right-0 z-30 -rotate-6 rounded-full border border-amber-300/80 bg-[#FEF9C3] px-3 py-1 text-[11px] font-bold text-[#854D0E] shadow-sm"
            >
              {STICKERS[i % STICKERS.length]}
            </span>
            <PolaroidCard
              photo={photo}
              index={i}
              dateLabel={DATE_LABELS[i % DATE_LABELS.length]}
              frameClass="border border-blue-200/70 bg-white"
              captionClass="text-[#1E3A8A]"
              dateClass="text-[#854D0E]/70"
              hintClass="text-blue-300"
              tilted={tilted[i]}
              onTilt={() => toggleTilt(i)}
            />
          </div>
        ))}
      </div>

      <div className="relative z-10 mt-14 w-full max-w-xl">
        <LightLetterCard
          recipient={config.recipient.name}
          content={config.content}
          sender={config.sender.name}
          headerEmoji="🎓"
          accent="#854D0E"
          accentSecondary="#3b82f6"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mt-12 pb-4"
      >
        <button
          type="button"
          onClick={onContinue}
          className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-blue-500 to-sky-400 px-7 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          THROW THE CAP 🎓
        </button>
      </motion.div>
    </ScreenShell>
  )
}