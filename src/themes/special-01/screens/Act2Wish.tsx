import { motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { HeartBurstOverlay } from '../components/HeartBurstOverlay'

interface Act2WishProps {
  config: ExperienceConfig
  onShimmer: () => void
  onContinue: () => void
}

export function Act2Wish({ config, onShimmer, onContinue }: Act2WishProps) {
  const [heartGone, setHeartGone] = useState(false)
  const advanceTimerRef = useRef<number | null>(null)

  useEffect(() => {
    onShimmer()
    advanceTimerRef.current = window.setTimeout(() => {
      onContinue()
    }, 2500)
    return () => {
      if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current)
    }
  }, [onContinue, onShimmer])

  const burstColors = useMemo(
    () => [
      config.branding.accentColor,
      '#ffb3c1',
      '#ffd6c9',
      config.branding.accentSecondary,
      '#e3b35b',
      '#e7557e',
    ],
    [config.branding.accentColor, config.branding.accentSecondary],
  )

  const headline =
    config.content.finalMessage.trim() || 'Happy Birthday'

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      onClick={onContinue}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onContinue()
        }
      }}
      role="button"
      tabIndex={0}
      aria-label="Continue to the blooming heart-tree finale"
      className="relative flex min-h-[100dvh] cursor-pointer flex-col items-center justify-center overflow-x-hidden px-5 py-16 text-center select-none focus:outline-none sm:px-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 72% 46% at 50% 30%, rgba(233,183,132,0.18), transparent 64%), radial-gradient(ellipse 55% 40% at 50% 100%, rgba(255,130,150,0.12), transparent 60%)',
        }}
      />

      <HeartBurstOverlay colors={burstColors} />

      {/* exploded heart */}
      {!heartGone && (
        <div
          className="pointer-events-none absolute top-[30%] left-1/2 z-10 -translate-x-1/2"
          aria-hidden
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 1, y: 0 }}
            animate={{ scale: 1.8, opacity: 0, y: -30, rotate: -10 }}
            transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
            onAnimationComplete={() => setHeartGone(true)}
          >
            <svg width={110} height={110} viewBox="0 0 24 24" style={{ filter: 'drop-shadow(0 0 26px rgba(255,130,150,0.8))' }}>
              <path
                d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
                fill={config.branding.accentColor}
              />
            </svg>
          </motion.div>
        </div>
      )}

      <div className="relative z-30 flex w-full max-w-lg flex-col items-center gap-5">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.08 }}
          className="text-[11px] font-bold tracking-[0.32em] text-[#A62B4C]/55 uppercase"
        >
          for {config.recipient.name}
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 16, filter: 'blur(5px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-2xl text-[#8B1E3F]/75 italic sm:text-3xl"
        >
          {config.content.revealHeading}
        </motion.h2>

        <motion.h1
          initial={{ opacity: 0, scale: 0.92, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-balance bg-gradient-to-br from-[#8B1E3F] via-[#A62B4C] to-[#c23b63] bg-clip-text text-6xl font-bold text-transparent sm:text-7xl md:text-8xl"
        >
          {headline}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16, filter: 'blur(5px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, delay: 1, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-xl text-[#8B1E3F]/70 italic sm:text-2xl"
        >
          {config.content.revealSubtext}
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="mt-3 text-[11px] font-medium tracking-[0.24em] text-[#8B1E3F]/35 uppercase"
        >
          tap anywhere to bloom
        </motion.p>
      </div>
    </motion.section>
  )
}