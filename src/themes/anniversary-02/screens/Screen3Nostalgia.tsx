import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { FloatingParticles } from '../../shared/FloatingParticles'
import { PolaroidCard } from '../../shared/PolaroidCard'
import { ScreenShell } from '../../shared/ScreenShell'

interface Screen3NostalgiaProps {
  config: ExperienceConfig
  onFlip: () => void
  onContinue: () => void
}

export function Screen3Nostalgia({
  config,
  onFlip,
  onContinue,
}: Screen3NostalgiaProps) {
  const [flipped, setFlipped] = useState<boolean[]>(() =>
    config.content.photos.map(() => false),
  )

  const flip = (index: number) => {
    if (flipped[index]) return
    onFlip()
    setFlipped((prev) => prev.map((value, i) => (i === index ? true : value)))
  }

  return (
    <ScreenShell className="surface-obsidian">
      <FloatingParticles type="gold-sparkles" count={10} />
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-full border border-amber-200/30 bg-white/5 px-4 py-1.5 text-xs font-bold tracking-[0.3em] text-amber-200/80 uppercase"
      >
        Nostalgia Reel
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.6 }}
        className="font-display mt-5 text-balance text-center text-3xl font-black sm:text-4xl"
      >
        <span className="text-gradient-lux">The reel that never skips</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="mt-3 max-w-md text-center text-sm text-amber-100/60"
      >
        Tap a frame to tilt it — a favorite, always.
      </motion.p>

      <div className="relative z-10 mt-10 flex flex-wrap items-center justify-center gap-8">
        {config.content.photos.map((photo, index) => (
          <PolaroidCard
            key={`${photo.src}-${index}`}
            photo={photo}
            index={index}
            dateLabel={`Frame ${index + 1} · the good years`}
            frameClass="bg-gradient-to-b from-[#1a1e2a] to-[#12151e]"
            captionClass="text-amber-100"
            dateClass="text-amber-200/50"
            hintClass="text-amber-200/40"
            tilted={flipped[index]}
            onTilt={() => flip(index)}
          />
        ))}
      </div>

      <motion.button
        type="button"
        onClick={onContinue}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, type: 'spring', stiffness: 160, damping: 18 }}
        className="relative z-10 mt-12 flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-amber-400 via-rose-400 to-pink-500 px-9 text-base font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.04] active:scale-95"
      >
        Pop the champagne
        <ChevronRight className="h-5 w-5" />
      </motion.button>
    </ScreenShell>
  )
}