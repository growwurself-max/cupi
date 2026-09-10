import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { ScreenShell } from '../../shared/ScreenShell'

interface JokesScreenProps {
  config: ExperienceConfig
  onFlip: () => void
  onContinue: () => void
}

const PUNCHLINES = [
  { setup: 'Why do we always sit next to each other?', punchline: 'Because the WiFi is stronger near you. 🫶' },
  { setup: 'What do you call a squad that never separates?', punchline: 'An auto-corrected family. 😌' },
  { setup: 'Why are you my best friend?', punchline: 'Because you laughed when I fell. Then helped me up. 🫂' },
]

export function JokesScreen({ config, onFlip, onContinue }: JokesScreenProps) {
  const [flipped, setFlipped] = useState<boolean[]>(PUNCHLINES.map(() => false))
  const allFlipped = flipped.every(Boolean)

  const toggleCard = (i: number) => {
    if (flipped[i]) return
    setFlipped((prev) => prev.map((f, idx) => (idx === i ? true : f)))
    onFlip()
  }

  return (
    <ScreenShell className="justify-start pt-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(255,138,92,0.11),transparent_45%),radial-gradient(circle_at_10%_80%,rgba(92,214,200,0.1),transparent_50%)]"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mb-10 text-center"
      >
        <p className="text-xs font-bold tracking-[0.3em] uppercase"
          style={{ color: config.branding.accentColor }}
        >
          Annual roast proceedings
        </p>
        <h2 className="font-display mt-2 text-3xl font-semibold text-white sm:text-4xl">
          Inside Jokes, on the record
        </h2>
        <p className="mx-auto mt-3 max-w-md text-pretty text-sm text-white/55">
          Flip each card. You will not recover.
        </p>
      </motion.div>

      <div className="relative z-10 flex w-full max-w-lg flex-col gap-4">
        {PUNCHLINES.map((joke, i) => (
          <motion.button
            key={joke.setup}
            type="button"
            onClick={() => toggleCard(i)}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ delay: i * 0.12, type: 'spring', stiffness: 110 }}
            whileTap={{ scale: 0.97 }}
            aria-label={flipped[i] ? `Punchline: ${joke.punchline}` : `Flip card: ${joke.setup}`}
            style={{ perspective: 900 }}
            className="h-28 w-full outline-none"
          >
            <motion.div
              animate={{ rotateY: flipped[i] ? 180 : 0 }}
              transition={{ type: 'spring', stiffness: 130, damping: 15 }}
              style={{ transformStyle: 'preserve-3d' }}
              className="relative h-full w-full"
            >
              {/* Front */}
              <div
                style={{ backfaceVisibility: 'hidden' }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-2xl border border-white/12 bg-gradient-to-br from-[#ff8a5c]/20 to-[#5cd6c8]/20"
              >
                <span className="text-2xl">🃏</span>
                <p className="px-6 text-center text-sm font-semibold text-white/80">
                  {joke.setup}
                </p>
                <span className="mt-1 text-[11px] font-bold tracking-widest text-white/40 uppercase">
                  tap to flip
                </span>
              </div>
              {/* Back */}
              <div
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
                className="absolute inset-0 flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#5cd6c8]/30 to-[#ff8a5c]/30 px-6 text-center text-base font-bold text-white/90"
              >
                {joke.punchline}
              </div>
            </motion.div>
          </motion.button>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 mt-12 flex flex-col items-center gap-3 pb-4"
      >
        <button
          type="button"
          onClick={onContinue}
          disabled={!allFlipped}
          className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-[#ff8a5c] to-[#5cd6c8] px-8 text-base font-bold text-obsidian-900 transition-all duration-300 hover:scale-[1.05] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:saturate-0"
        >
          Read the Squad Memo
          <ArrowRight className="h-5 w-5" />
        </button>
        {!allFlipped && (
          <p className="text-xs font-semibold tracking-wide text-white/35 uppercase">
            flip all {PUNCHLINES.length} cards first
          </p>
        )}
      </motion.div>
    </ScreenShell>
  )
}