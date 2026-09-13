import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { FloatingEmojis } from '../../shared/FloatingEmojis'
import { FloatingParticles } from '../../shared/FloatingParticles'
import { ScreenShell } from '../../shared/ScreenShell'

type PickAnswer = 'you' | 'me'

interface QuizScreenProps {
  config: ExperienceConfig
  onPick: () => void
  onContinue: () => void
}

const TOASTS: Record<PickAnswer, string> = {
  you: 'Correct. Absolutely unhinged. 😌🫶',
  me: 'The audacity. I respect it. 😂',
}

export function QuizScreen({ config, onPick, onContinue }: QuizScreenProps) {
  const [picked, setPicked] = useState<PickAnswer | null>(null)

  const pick = (answer: PickAnswer) => {
    if (picked) return
    setPicked(answer)
    onPick()
  }

  return (
    <ScreenShell>
      <FloatingParticles
        type="emoji-stickers"
        colors={[config.branding.accentColor, config.branding.accentSecondary]}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(251,146,60,0.16),transparent_55%)]"
      />
      <FloatingEmojis emojis={['✨', '🍕', '💖', '🤪', '🥳', '🥑']} count={12} />

      <motion.span
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 rounded-full border border-amber-200/70 bg-white/80 px-4 py-1.5 text-xs font-bold tracking-[0.25em] text-rose-500 uppercase backdrop-blur-md"
      >
        The Bestie Quiz
      </motion.span>

      <motion.h1
        initial={{ opacity: 0, scale: 0.9, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 120, damping: 15 }}
        className="font-display relative z-10 mt-6 max-w-xl text-balance text-center text-4xl font-black text-[#9F1239] sm:text-5xl"
      >
        Who is the bad influence in this friendship?
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="relative z-10 mt-4 text-sm font-semibold text-stone-600"
      >
        Choose wisely. The friendship depends on it. 🤨
      </motion.p>

      <div className="relative z-10 mt-10 flex w-full max-w-2xl flex-col gap-4 sm:flex-row">
        <motion.button
          type="button"
          onClick={() => pick('you')}
          disabled={picked !== null}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, type: 'spring', stiffness: 140, damping: 16 }}
          className="flex min-h-24 flex-1 items-center justify-center gap-3 rounded-2xl border-2 border-orange-200/80 bg-white/85 px-6 text-center text-lg font-black text-[#9F1239] shadow-lg shadow-orange-200/40 backdrop-blur-md transition-colors duration-200 hover:border-rose-300 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-28"
        >
          🫵 Definitely You
        </motion.button>
        <motion.button
          type="button"
          onClick={() => pick('me')}
          disabled={picked !== null}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7, type: 'spring', stiffness: 140, damping: 16 }}
          className="flex min-h-24 flex-1 items-center justify-center gap-3 rounded-2xl border-2 border-violet-200/80 bg-white/85 px-6 text-center text-lg font-black text-[#9F1239] shadow-lg shadow-violet-200/40 backdrop-blur-md transition-colors duration-200 hover:border-amber-300 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-28"
        >
          🙋 100% Me
        </motion.button>
      </div>

      {picked && (
        <motion.p
          key={picked}
          initial={{ opacity: 0, y: 14, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 180, damping: 14 }}
          className="relative z-10 mt-7 rounded-full border border-orange-200/80 bg-white/90 px-6 py-2.5 text-sm font-bold text-[#9F1239] shadow-md shadow-rose-200/40 backdrop-blur-md"
        >
          {TOASTS[picked]}
        </motion.p>
      )}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 mt-9"
      >
        <button
          type="button"
          onClick={onContinue}
          disabled={picked === null}
          className="group flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-orange-400 to-rose-400 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-400/30 transition-all duration-200 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
        >
          Prove It
          <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </motion.div>
    </ScreenShell>
  )
}