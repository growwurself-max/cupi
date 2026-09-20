import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { RotateCcw, WandSparkles } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { HeartTreeCanvas, type HeartTreePalette } from '../components/HeartTreeCanvas'

const textVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.28, delayChildren: 0.3 },
  },
}

const lineVariants: Variants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(7px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
}

interface Act3TreeProps {
  config: ExperienceConfig
  onReplay: () => void
  onExit: () => void
  onAmbient: () => void
  onGrow: () => void
  onBloom: () => void
}

export function Act3Tree({
  config,
  onReplay,
  onExit,
  onAmbient,
  onGrow,
  onBloom,
}: Act3TreeProps) {
  const [grown, setGrown] = useState(false)
  const [bloomed, setBloomed] = useState(false)

  useEffect(() => {
    onAmbient()
    onGrow()
  }, [onAmbient, onGrow])

  const handleGrow = useCallback(() => {
    setGrown(true)
  }, [])

  const handleBloom = useCallback(() => {
    setBloomed(true)
    onBloom()
  }, [onBloom])

  const palette = useMemo<HeartTreePalette>(
    () => ({
      pink: config.branding.accentColor,
      peach: config.branding.accentSecondary,
      gold: '#f5b861',
      bark: '#8a5a44',
    }),
    [config.branding.accentColor, config.branding.accentSecondary],
  )

  const addressee = config.recipient.name?.trim()

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="relative min-h-[100dvh] overflow-hidden"
    >
      {/* gradient atmosphere */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 55% at 50% 42%, rgba(255,140,172,0.1), transparent 66%), radial-gradient(ellipse 46% 30% at 50% 108%, rgba(247,184,97,0.12), transparent 70%), linear-gradient(180deg, #1a120d 0%, #15100c 55%, #100c09 100%)',
        }}
      />

      <HeartTreeCanvas
        colors={palette}
        onGrowComplete={handleGrow}
        onBloomComplete={handleBloom}
        className="z-[5]"
      />

      {/* legibility vignette behind the header text */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-56 bg-gradient-to-b from-[#16100c]/90 via-[#16100c]/45 to-transparent"
      />

      <AnimatePresence>
        {grown && (
          <motion.div
            variants={textVariants}
            initial="hidden"
            animate="show"
            className="relative z-20 flex w-full flex-col items-center gap-5 px-5 pt-24 text-center sm:px-8 sm:pt-28"
          >
            <motion.p
              variants={lineVariants}
              className="flex items-center gap-3 text-[11px] font-bold tracking-[0.32em] text-[#f3e7da]/40 uppercase"
            >
              <span className="h-px w-8 bg-[#ffd9a6]/40" aria-hidden />
              Act Three · The Bloom
              <span className="h-px w-8 bg-[#ffd9a6]/40" aria-hidden />
            </motion.p>

            <motion.h2
              variants={lineVariants}
              className="font-display text-3xl font-medium text-[#f3e7da]/85 italic sm:text-4xl"
            >
              {config.content.revealSubtext}
            </motion.h2>

            <motion.h1
              variants={lineVariants}
              className="font-display text-balance text-4xl font-semibold sm:text-5xl md:text-6xl"
            >
              <span className="bg-gradient-to-br from-[#ffd9a6] via-[#ff8fb0] to-[#ff5c8a] bg-clip-text text-transparent">
                {config.content.finalCelebration}
              </span>
            </motion.h1>

            {addressee && (
              <motion.p
                variants={lineVariants}
                className="text-sm font-semibold tracking-[0.14em] text-[#e7cfb8]/70"
              >
                for {addressee}
                {config.sender.name?.trim() ? (
                  <span className="text-[#f3e7da]/40"> — {config.sender.name}</span>
                ) : null}
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* bottom controls */}
      <AnimatePresence>
        {bloomed && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7, ease: 'easeOut' }}
            className="absolute inset-x-0 bottom-6 z-30 flex flex-col items-center gap-2 px-5 sm:bottom-8"
          >
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onReplay}
                className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-[#ff5c8a] via-[#ff8fb0] to-[#f5b861] px-7 text-base font-bold text-[#24150d] shadow-[0_0_34px_-6px_rgba(255,92,138,0.75)] transition-all duration-200 hover:scale-[1.04] active:scale-95"
              >
                <RotateCcw className="h-5 w-5" />
                Replay the surprise
              </button>
              <button
                type="button"
                onClick={onExit}
                className="flex min-h-14 items-center gap-2.5 rounded-full border border-[#f3e7da]/20 bg-white/[0.04] px-7 text-base font-semibold text-[#f3e7da] backdrop-blur-sm transition-all duration-200 hover:scale-[1.04] hover:bg-white/[0.08] active:scale-95"
              >
                <WandSparkles className="h-5 w-5 text-[#ffd9a6]" />
                Create one of your own
              </button>
            </div>
            <p className="text-[11px] font-medium tracking-[0.22em] text-[#f3e7da]/35 uppercase">
              crafted with ♥ by Cupi
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  )
}