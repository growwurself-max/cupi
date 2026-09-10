import { motion } from 'framer-motion'
import { Heart, X } from 'lucide-react'
import { useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { fireContinuousSparkle, fireHeartRain } from '../../../utils/confetti'
import { ScreenShell } from '../../shared/ScreenShell'
import { FloatingEmojis } from '../../shared/FloatingEmojis'

const QUESTION = 'Will you marry me?'

interface QuestionScreenProps {
  config: ExperienceConfig
  onYes: () => void
}

export function QuestionScreen({ config, onYes }: QuestionScreenProps) {
  const [dodge, setDodge] = useState({ x: 0, y: 0 })
  const [dodges, setDodges] = useState(0)
  const [sayingYes, setSayingYes] = useState(false)

  const yes = () => {
    if (sayingYes) return
    setSayingYes(true)
    fireHeartRain(1600)
    fireContinuousSparkle()
    setTimeout(onYes, 950)
  }

  const notYet = () => {
    const x = (Math.random() - 0.5) * 170
    const y = (Math.random() - 0.5) * 130
    setDodge({ x, y })
    setDodges((prev) => prev + 1)
  }

  return (
    <ScreenShell>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(224,179,242,0.15),transparent_55%)]"
      />
      <FloatingEmojis emojis={['💗', '✨']} count={9} />

      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-xs font-bold tracking-[0.35em] uppercase"
        style={{ color: config.branding.accentColor }}
      >
        {config.recipient.name}, I have to ask…
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, scale: 0.8, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 110, damping: 16 }}
        className="font-display mt-6 text-center text-5xl font-bold sm:text-6xl md:text-7xl"
      >
        <span className="text-gradient-lux block">{QUESTION}</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-6 text-sm font-semibold text-white/45"
      >
        {dodges === 0
          ? 'Take a breath. Then answer honestly. 💗'
          : dodges >= 3
            ? 'The “Not yet” button is getting shy… 😏'
            : 'Nice try. 😌'}
      </motion.p>

      {/* YES button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={sayingYes ? { scale: [1, 1.08, 1] } : { opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="relative z-10 mt-12"
      >
        <button
          type="button"
          onClick={yes}
          disabled={sayingYes}
          className="flex min-h-16 items-center gap-3 rounded-full bg-gradient-to-r from-[#ff9bb3] via-[#ffb3ba] to-[#e0b3f2] px-10 text-xl font-black text-obsidian-900 shadow-[0_18px_50px_-15px_rgba(255,155,179,0.65)] transition-transform duration-200 hover:scale-[1.07] active:scale-95"
        >
          <Heart className="h-6 w-6 fill-current" />
          YES!
        </button>
      </motion.div>

      {/* Dodging not-yet */}
      <motion.button
        type="button"
        onClick={notYet}
        animate={{ x: dodge.x, y: dodge.y }}
        transition={{ type: 'spring', stiffness: 240, damping: 14 }}
        whileHover={{ scale: 0.96 }}
        whileTap={{ scale: 0.9 }}
        disabled={dodges >= 4}
        className="mt-8 flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.04] px-6 py-2.5 text-sm font-semibold text-white/60 transition-colors hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <X className="h-4 w-4" />
        Not yet…
      </motion.button>

      {dodges >= 4 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 text-xs font-semibold tracking-[0.2em] text-white/35 uppercase"
        >
          Some answers write themselves. 😌💍
        </motion.p>
      )}
    </ScreenShell>
  )
}