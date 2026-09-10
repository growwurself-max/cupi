import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { ScreenShell } from '../../shared/ScreenShell'
import { FloatingEmojis } from '../../shared/FloatingEmojis'

interface BurstScreenProps {
  config: ExperienceConfig
  onBurst: () => void
  onContinue: () => void
}

const SQUAD_EMOJIS = [
  '🕶️', '✨', '🤙', '🔥', '🎧', '📸',
  '😎', '💛', '🚀', '🎈', '🍕', '🫶',
]

const BURSTS_NEEDED = 5

interface Particle {
  id: number
  emoji: string
  x: number
  y: number
  rotate: number
}

let particleId = 0

export function BurstScreen({ config, onBurst, onContinue }: BurstScreenProps) {
  const [bursts, setBursts] = useState(0)
  const [particles, setParticles] = useState<Particle[]>([])
  const [busy, setBusy] = useState(false)

  const full = bursts >= BURSTS_NEEDED

  const burst = () => {
    if (busy || full) return
    setBusy(true)
    onBurst()

    const fresh: Particle[] = SQUAD_EMOJIS.map((emoji, i) => {
      const angle = (i / SQUAD_EMOJIS.length) * Math.PI * 2 + Math.random() * 0.4
      const dist = 100 + Math.random() * 110
      return {
        id: ++particleId,
        emoji,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist * 0.8,
        rotate: (Math.random() - 0.5) * 160,
      }
    })
    setParticles(fresh)
    setBursts((prev) => prev + 1)

    setTimeout(() => setParticles([]), 950)
    setTimeout(() => setBusy(false), 200)
  }

  return (
    <ScreenShell>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(92,214,200,0.14),transparent_55%)]"
      />
      <FloatingEmojis emojis={['✨', '😎']} count={6} />

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7, ease: 'easeOut' }}
        className="relative z-10 mb-10 text-center"
      >
        <h1 className="font-display text-balance text-4xl font-semibold text-white sm:text-5xl">
          {config.content.suspenseHeading}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-pretty text-sm text-white/60 sm:text-base">
          {config.content.suspenseSubtext}
        </p>
      </motion.div>

      {/* Burst arena */}
      <div className="relative z-10 flex h-72 w-full max-w-sm items-center justify-center">
        {particles.map((p) => (
          <motion.span
            key={p.id}
            initial={{ opacity: 1, scale: 0.3, x: 0, y: 0, rotate: 0 }}
            animate={{
              opacity: 0,
              scale: 1.45,
              x: p.x,
              y: p.y,
              rotate: p.rotate,
            }}
            transition={{ duration: 0.85, ease: 'easeOut' }}
            className="pointer-events-none absolute text-4xl"
          >
            {p.emoji}
          </motion.span>
        ))}

        <motion.button
          type="button"
          onClick={burst}
          disabled={busy || full}
          whileTap={busy ? undefined : { scale: 0.82 }}
          whileHover={busy ? undefined : { scale: 1.1 }}
          animate={{ scale: busy ? [1, 1.12, 1] : 1 }}
          className="flex h-40 w-40 select-none flex-col items-center justify-center gap-2 rounded-full bg-gradient-to-br from-[#ff8a5c] to-[#5cd6c8] text-center text-obsidian-900 shadow-[0_24px_70px_-18px_rgba(255,138,92,0.7)] outline-none"
        >
          <span className="text-5xl">💥</span>
          <span className="text-sm font-black tracking-wide uppercase">
            {full ? 'Certified squad!' : 'Mash me!'}
          </span>
        </motion.button>
      </div>

      {/* burst meter */}
      <div className="relative z-10 mt-2 flex items-center gap-2">
        {[...Array(BURSTS_NEEDED)].map((_, i) => (
          <motion.span
            key={i}
            animate={
              bursts > i
                ? { scale: [1.7, 1], rotate: 360, opacity: 1 }
                : { scale: 1, opacity: 0.25 }
            }
            transition={{ type: 'spring', stiffness: 200 }}
            className="h-3.5 w-3.5 rounded-full"
            style={{
              background: bursts > i ? '#5cd6c8' : '#ffffff',
              boxShadow: bursts > i ? '0 0 12px rgba(92,214,200,0.8)' : 'none',
            }}
          />
        ))}
      </div>

      <motion.p
        animate={{ opacity: full ? 0.6 : [0.45, 1, 0.45] }}
        transition={{ duration: 1.6, repeat: Infinity }}
        className="relative z-10 mt-4 text-sm font-semibold text-white/70"
      >
        {full
          ? `Officially the loudest squad. 🏆`
          : `${BURSTS_NEEDED - bursts} more ${BURSTS_NEEDED - bursts === 1 ? 'burst' : 'bursts'} to join the vibe`}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: full ? 1 : 0, y: full ? 0 : 16 }}
        transition={{ duration: 0.35 }}
        className="relative z-10 mt-8"
      >
        <button
          type="button"
          onClick={onContinue}
          disabled={!full}
          className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-[#5cd6c8] to-[#ff8a5c] px-8 text-base font-bold text-obsidian-900 transition-all duration-300 hover:scale-[1.05] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:saturate-0"
        >
          Open the Group Album
          <ArrowRight className="h-5 w-5" />
        </button>
      </motion.div>
    </ScreenShell>
  )
}