import { motion } from 'framer-motion'
import { useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { FloatingEmojis } from '../../shared/FloatingEmojis'
import { FloatingParticles } from '../../shared/FloatingParticles'
import { ScreenShell } from '../../shared/ScreenShell'

interface JokesScreenProps {
  config: ExperienceConfig
  onFlip: () => void
  onContinue: () => void
}

const JOKES: { setup: string; punchline: string }[] = [
  {
    setup: 'Why do we always sit next to each other?',
    punchline: 'Because the WiFi is stronger near you. 🫶',
  },
  {
    setup: 'What do you call a squad that never separates?',
    punchline: 'An auto-corrected family. 😌',
  },
  {
    setup: 'Why are you my bestie?',
    punchline: 'Because you laughed when I fell. Then helped me up. 🫂',
  },
]

export function JokesScreen({ config, onFlip, onContinue }: JokesScreenProps) {
  const [flipped, setFlipped] = useState<boolean[]>([false, false, false])

  const flippedCount = flipped.filter(Boolean).length
  const allFlipped = flippedCount === JOKES.length

  const flipCard = (index: number) => {
    if (flipped[index]) return
    setFlipped((prev) => prev.map((f, i) => (i === index ? true : f)))
    onFlip()
  }

  return (
    <ScreenShell>
      <FloatingParticles
        type="emoji-stickers"
        colors={[config.branding.accentColor, config.branding.accentSecondary]}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(251,146,60,0.14),transparent_55%)]"
      />
      <FloatingEmojis emojis={['✨', '🍕', '💖', '🤪', '🥳', '🥑']} count={12} />

      <motion.span
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 rounded-full border border-rose-200/70 bg-white/80 px-4 py-1.5 text-xs font-bold tracking-[0.25em] text-rose-500 uppercase backdrop-blur-md"
      >
        Comedy Corner
      </motion.span>

      <motion.h1
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7, ease: 'easeOut' }}
        className="font-display relative z-10 mt-6 max-w-xl text-balance text-center text-4xl font-black text-[#9F1239] sm:text-5xl"
      >
        Inside-Joke Hall of Fame
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45, duration: 0.6 }}
        className="relative z-10 mt-4 max-w-md text-center text-sm font-semibold text-stone-600"
      >
        Flip them all. Proof of friendship required. 🕵️
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.7, ease: 'easeOut' }}
        className="relative z-10 mt-10 grid w-full max-w-5xl gap-6 md:grid-cols-3"
      >
        {JOKES.map((joke, index) => (
          <div key={index} className="[perspective:1200px]">
            <motion.button
              type="button"
              onClick={() => flipCard(index)}
              animate={{ rotateY: flipped[index] ? 180 : 0 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformStyle: 'preserve-3d' }}
              className="relative h-60 w-full outline-none md:h-64"
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-3xl bg-gradient-to-br from-orange-200/60 to-rose-200/60 p-6 text-center text-[#0F172A] shadow-lg shadow-orange-200/40 [backface-visibility:hidden]">
                <span className="text-3xl">🃏</span>
                <p className="font-display text-lg leading-snug font-bold">{joke.setup}</p>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-3xl border border-orange-200/70 bg-white/85 p-6 text-center shadow-lg shadow-rose-100/60 backdrop-blur-md [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <span className="text-3xl">😂</span>
                <p className="font-display text-lg leading-snug font-bold text-[#9F1239]">
                  {joke.punchline}
                </p>
                <span className="text-[11px] font-semibold tracking-widest text-orange-400 uppercase">
                  certified inside joke ✅
                </span>
              </div>
            </motion.button>
          </div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="relative z-10 mt-8 flex items-center gap-2"
      >
        <div className="flex items-center gap-1.5">
          {JOKES.map((_, i) => (
            <span
              key={i}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                flipped[i] ? 'w-6 bg-rose-400' : 'w-2.5 bg-stone-200'
              }`}
            />
          ))}
        </div>
        <span className="ml-2 text-xs font-bold tracking-widest text-stone-500 uppercase">
          {flippedCount}/{JOKES.length} flipped
        </span>
      </motion.div>

      <button
        type="button"
        onClick={onContinue}
        disabled={!allFlipped}
        className="relative z-10 mt-8 flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-orange-400 to-rose-400 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-400/30 transition-all duration-200 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
      >
        Read the Squad Memo 📝
      </button>
    </ScreenShell>
  )
}