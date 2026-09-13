import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { ScreenShell } from '../../shared/ScreenShell'

const CHAOS_PHRASES = [
  { emoji: '🚨', text: 'RKO OUTTA NOWHERE' },
  { emoji: '🍕', text: 'PIZZA BEFORE DEEP TALK' },
  { emoji: '🤣', text: 'LAUGHED AT A FUNERAL (SORRY)' },
  { emoji: '💸', text: 'POOR BUT MAKE IT CUTE' },
  { emoji: '😴', text: 'CLOWN AT 2AM, FRIEND BY 2:01' },
  { emoji: '🥴', text: 'PLANNING = NOT IN THIS RELATIONSHIP' },
  { emoji: '📵', text: 'LEFT ON READ — BY DESIGN' },
  { emoji: '🐛', text: 'BUGS ARE FEATURES IN FRONT OF YOU' },
]

interface Screen4ChaosReelProps {
  config: ExperienceConfig
  onMash: () => void
  onContinue: () => void
}

export function Screen4ChaosReel({
  config,
  onMash,
  onContinue,
}: Screen4ChaosReelProps) {
  const [tapped, setTapped] = useState<boolean[]>(() => CHAOS_PHRASES.map(() => false))
  const allTapped = tapped.every(Boolean)

  const mash = (index: number) => {
    if (tapped[index]) return
    onMash()
    setTapped((prev) => prev.map((value, i) => (i === index ? true : value)))
  }

  return (
    <ScreenShell className="surface-obsidian">
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-full border border-orange-200/30 bg-white/5 px-4 py-1.5 text-xs font-bold tracking-[0.3em] text-orange-200/80 uppercase"
      >
        Chaos Broadcast Reel
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.6 }}
        className="font-display mt-5 text-balance text-center text-3xl font-black sm:text-4xl"
      >
        <span className="text-gradient-lux">The trauma reels. Mash every clip.</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="mt-3 max-w-md text-center text-sm text-orange-100/60"
      >
        {config.content.revealSubtext}
      </motion.p>

      <div className="relative z-10 mt-10 grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">
        {CHAOS_PHRASES.map((phrase, index) => {
          const isTapped = tapped[index]
          return (
            <motion.button
              key={phrase.text}
              type="button"
              onClick={() => mash(index)}
              initial={{ opacity: 0, x: -20 }}
              animate={{
                opacity: 1,
                x: 0,
                rotate: isTapped ? (index % 2 === 0 ? -2 : 2) : 0,
                scale: isTapped ? 1.02 : 1,
              }}
              transition={{ delay: 0.4 + index * 0.08, duration: 0.4 }}
              whileTap={{ scale: 0.96 }}
              className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all duration-300 ${
                isTapped
                  ? 'border-orange-300/60 bg-orange-400/15'
                  : 'border-white/10 bg-white/[0.04] hover:border-orange-200/40'
              }`}
            >
              <motion.span
                animate={isTapped ? { rotate: [0, -16, 16, 0], scale: [1, 1.4, 1] } : { rotate: 0 }}
                transition={{ duration: 0.5 }}
                className="text-2xl"
              >
                {phrase.emoji}
              </motion.span>
              <span
                className={`flex-1 text-sm font-bold tracking-wide uppercase transition-colors ${
                  isTapped ? 'text-orange-100' : 'text-white/45'
                }`}
              >
                {phrase.text}
                {isTapped && <span className="ml-2 text-orange-300">✓</span>}
              </span>
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence>
        {allTapped && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 160, damping: 18 }}
            className="relative z-10 mt-10"
          >
            <motion.button
              type="button"
              onClick={onContinue}
              animate={{ boxShadow: ['0 0 24px -6px rgba(255,138,92,0.5)', '0 0 48px -6px rgba(255,138,92,0.9)', '0 0 24px -6px rgba(255,138,92,0.5)'] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 px-9 text-base font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.04] active:scale-95"
            >
              Open the bestie letter
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </ScreenShell>
  )
}