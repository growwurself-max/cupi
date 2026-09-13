import { AnimatePresence, motion } from 'framer-motion'
import { RotateCcw, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import {
  fireContinuousSparkle,
  fireGrandBurst,
  fireHeartRain,
} from '../../../utils/confetti'
import { FloatingEmojis } from '../../shared/FloatingEmojis'
import { FloatingParticles } from '../../shared/FloatingParticles'
import { ScreenShell } from '../../shared/ScreenShell'

interface ConstellationScreenProps {
  config: ExperienceConfig
  onReplay: () => void
  onExit: () => void
  onTap: () => void
}

interface HeartBurst {
  id: number
  emoji: string
  color: string
  left: number
  top: number
  size: number
  driftX: number
  driftY: number
  rotate: number
}

const HEART_EMOJIS = ['💗', '💕', '💞', '💖', '🤍', '💘']
const HEART_COLORS = ['#D65D7A', '#8F7BFF', '#F6C6B6', '#FFB3BA', '#F472B6']

const SEED_HEARTS = Array.from({ length: 10 }).map((_, i) => ({
  left: 8 + ((i * 29) % 84),
  top: 6 + ((i * 37) % 78),
  size: 10 + ((i * 7) % 12),
  emoji: HEART_EMOJIS[i % HEART_EMOJIS.length],
}))

export function ConstellationScreen({
  config,
  onReplay,
  onExit,
  onTap,
}: ConstellationScreenProps) {
  const nextId = useRef(0)
  const [bursts, setBursts] = useState<HeartBurst[]>([])

  useEffect(() => {
    const timer = setTimeout(() => fireGrandBurst(), 350)
    fireHeartRain(1600)
    return () => clearTimeout(timer)
  }, [])

  const handleTap = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const left = ((event.clientX - rect.left) / rect.width) * 100
    const top = ((event.clientY - rect.top) / rect.height) * 100
    const id = nextId.current++
    const burst: HeartBurst = {
      id,
      emoji: HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)],
      color: HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)],
      left,
      top,
      size: 18 + Math.random() * 22,
      driftX: (Math.random() - 0.5) * 150,
      driftY: -(45 + Math.random() * 95),
      rotate: (Math.random() - 0.5) * 60,
    }
    setBursts((prev) => [...prev, burst])
    onTap()
    fireContinuousSparkle(300)
    window.setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.id !== id))
    }, 1500)
  }

  return (
    <ScreenShell className="justify-start pb-12">
      <FloatingParticles
        type="heart-petals"
        colors={[config.branding.accentColor, config.branding.accentSecondary]}
      />
      <FloatingEmojis emojis={['💗', '🤍', '🧸', '💌', '✨']} count={12} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex flex-col items-center pt-10 text-center"
      >
        <span className="flex min-h-9 items-center rounded-full border border-[#FFC9D4] bg-white/80 px-4 text-[11px] font-bold tracking-[0.3em] text-[#D65D7A] uppercase shadow-sm backdrop-blur-md">
          💫 The final piece of the sky
        </span>

        <div
          role="button"
          tabIndex={0}
          onClick={handleTap}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              handleTap(event as unknown as MouseEvent<HTMLDivElement>)
            }
          }}
          className="mt-8 h-64 w-full max-w-md cursor-pointer overflow-hidden rounded-[2rem] border border-[#FFC9D4] bg-[#FFF1F4]/70 shadow-[inset_0_2px_20px_-8px_rgba(255,155,180,0.5)] select-none"
        >
          {SEED_HEARTS.map((heart, i) => (
            <motion.span
              key={i}
              className="pointer-events-none absolute opacity-60"
              style={{ left: `${heart.left}%`, top: `${heart.top}%`, fontSize: heart.size }}
              animate={{ opacity: [0.3, 0.85, 0.3], scale: [1, 1.18, 1] }}
              transition={{
                duration: 3 + (i % 4),
                repeat: Infinity,
                delay: i * 0.35,
                ease: 'easeInOut',
              }}
            >
              {heart.emoji}
            </motion.span>
          ))}

          <AnimatePresence>
            {bursts.map((burst) => (
              <motion.span
                key={burst.id}
                initial={{ opacity: 1, scale: 0.5, x: 0, y: 0, rotate: 0 }}
                animate={{
                  opacity: 0,
                  scale: 1.9,
                  x: burst.driftX,
                  y: burst.driftY,
                  rotate: burst.rotate,
                }}
                exit={{ opacity: 0, scale: 0.2 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="pointer-events-none absolute"
                style={{
                  left: `${burst.left}%`,
                  top: `${burst.top}%`,
                  fontSize: burst.size,
                  filter: `drop-shadow(0 0 8px ${burst.color})`,
                }}
              >
                {burst.emoji}
              </motion.span>
            ))}
          </AnimatePresence>

          <span className="pointer-events-none absolute inset-x-0 bottom-4 text-center text-[11px] font-semibold tracking-[0.25em] text-[#D65D7A]/60 uppercase">
            tap the sky to scatter hearts
          </span>
        </div>

        <h1 className="font-display mt-10 max-w-lg text-balance text-4xl font-black sm:text-5xl">
          <span className="animate-shimmer bg-gradient-to-r from-[#D65D7A] via-[#8F7BFF] to-[#F6C6B6] bg-clip-text text-transparent bg-[length:200%_auto]">
            {config.content.finalMessage}
          </span>
        </h1>

        <p className="mt-5 text-sm font-semibold tracking-wide text-[#D65D7A]">
          Always &amp; forever yours ❤️
        </p>
        <p className="mt-3 max-w-md text-pretty text-sm leading-relaxed text-stone-600 sm:text-base">
          {config.content.finalCelebration}
        </p>

        <p className="font-display mt-8 text-2xl font-semibold text-[#831843]">
          — {config.sender.name}
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <button
            type="button"
            onClick={onReplay}
            className="flex min-h-14 items-center gap-2.5 rounded-full border border-[#F0A8BC] bg-white/80 px-7 text-sm font-bold text-[#B23A5F] backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-rose-50 active:scale-95"
          >
            <RotateCcw className="h-5 w-5" />
            Replay Surprise 🔁
          </button>
          <button
            type="button"
            onClick={onExit}
            className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-rose-400 to-pink-400 px-7 text-sm font-bold text-white shadow-lg shadow-rose-400/30 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <Sparkles className="h-5 w-5" />
            Create a Surprise Like This ✨
          </button>
        </div>

        <p className="mt-8 text-xs font-semibold tracking-[0.2em] text-stone-500 uppercase">
          Crafted with ♥ by Cupi
        </p>
      </motion.div>
    </ScreenShell>
  )
}