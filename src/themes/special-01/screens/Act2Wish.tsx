import { motion, type Variants } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { HeartBurstOverlay } from '../components/HeartBurstOverlay'

interface Act2WishProps {
  config: ExperienceConfig
  onShimmer: () => void
  onContinue: () => void
}

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: { delayChildren: 0.95, staggerChildren: 0.26 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 22, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
  },
}

export function Act2Wish({ config, onShimmer, onContinue }: Act2WishProps) {
  const [heartGone, setHeartGone] = useState(false)
  const advanceTimerRef = useRef<number | null>(null)

  useEffect(() => {
    onShimmer()
    advanceTimerRef.current = window.setTimeout(() => {
      onContinue()
    }, 7200)
    return () => {
      if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current)
    }
  }, [onContinue, onShimmer])

  const subLines = (config.content.letterLines ?? [])
    .filter((line) => line.trim())
    .slice(0, 2)

  const burstColors = useMemo(
    () => [
      config.branding.accentColor,
      '#ff8fb0',
      '#ffb9cd',
      config.branding.accentSecondary,
      '#f5b861',
    ],
    [config.branding.accentColor, config.branding.accentSecondary],
  )

  const headline =
    config.content.finalMessage.trim() ||
    `Happy Birthday to someone worth celebrating`

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-5 py-16 text-center sm:px-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 72% 46% at 50% 30%, rgba(255,217,166,0.14), transparent 64%), radial-gradient(ellipse 55% 40% at 50% 100%, rgba(255,92,138,0.1), transparent 60%)',
        }}
      />

      <HeartBurstOverlay colors={burstColors} />

      {/* exploding heart */}
      {!heartGone && (
        <motion.div
          initial={{ scale: 0.7, opacity: 1, y: 0 }}
          animate={{ scale: 1.8, opacity: 0, y: -30, rotate: -10 }}
          transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
          onAnimationComplete={() => setHeartGone(true)}
          className="pointer-events-none absolute top-[30%] left-1/2 z-10 -translate-x-1/2"
          aria-hidden
        >
          <svg width={120} height={120} viewBox="0 0 24 24" style={{ filter: 'drop-shadow(0 0 26px rgba(255,92,138,0.85))' }}>
            <path
              d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
              fill={config.branding.accentColor}
            />
          </svg>
        </motion.div>
      )}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-30 flex w-full max-w-lg flex-col items-center gap-6"
      >
        <motion.span
          variants={itemVariants}
          className="rounded-full border border-[#ffd9a6]/30 bg-[#ffd9a6]/10 px-4 py-1.5 text-[11px] font-bold tracking-[0.3em] text-[#ffd9a6] uppercase"
        >
          for {config.recipient.name}
        </motion.span>

        <motion.h1
          variants={itemVariants}
          className="font-display text-balance text-3xl font-medium text-[#f3e7da]/80 italic sm:text-4xl"
        >
          {config.content.revealHeading}
        </motion.h1>

        <motion.h2
          variants={itemVariants}
          className="font-display text-balance text-4xl font-semibold text-[#f3e7da] sm:text-5xl md:text-6xl"
        >
          <span className="bg-gradient-to-br from-[#ffd9a6] via-[#ff8fb0] to-[#ff5c8a] bg-clip-text text-transparent">
            {headline}
          </span>
        </motion.h2>

        {subLines.length > 0 && (
          <motion.p
            variants={itemVariants}
            className="max-w-md text-pretty text-sm leading-relaxed text-[#e7cfb8]/65 sm:text-base"
          >
            {subLines[0]}
          </motion.p>
        )}

        <motion.button
          variants={itemVariants}
          type="button"
          onClick={onContinue}
          className="mt-2 flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-[#ff5c8a] via-[#ff8fb0] to-[#f5b861] px-8 text-base font-bold text-[#24150d] shadow-[0_0_34px_-6px_rgba(255,92,138,0.75)] transition-all duration-200 hover:scale-[1.04] active:scale-95"
        >
          {config.content.wishPrompt}
          <Sparkles className="h-4 w-4" />
        </motion.button>

        <motion.p
          variants={itemVariants}
          className="text-[11px] font-medium tracking-[0.22em] text-[#f3e7da]/30 uppercase"
        >
          — {config.sender.name} · '{config.branding.emojiPrimary}'
        </motion.p>
      </motion.div>
    </motion.section>
  )
}