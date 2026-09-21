import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { RotateCcw, Volume2, VolumeX, WandSparkles } from 'lucide-react'
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
  isMuted: boolean
  onToggleMute: () => void
}

export function Act3Tree({
  config,
  onReplay,
  onExit,
  onAmbient,
  onGrow,
  onBloom,
  isMuted,
  onToggleMute,
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
      pink: '#FF6B8B',
      peach: '#FFB3C1',
      magenta: '#FF8E9E',
      gold: '#FFD166',
      bark: '#8a5a44',
    }),
    [],
  )

  const addressee = config.recipient.name?.trim()
  const letterLine = (config.content.letterLines ?? []).find((line) => line.trim())
  const MuteIcon = isMuted ? VolumeX : Volume2

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="relative min-h-[100dvh] overflow-x-hidden"
    >
      <HeartTreeCanvas
        colors={palette}
        onGrowComplete={handleGrow}
        onBloomComplete={handleBloom}
        className="z-[5]"
      />

      {/* narrow left scrim — keeps the tree visible on the right */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[min(100%,380px)] bg-gradient-to-r from-[#FBF1E7]/88 via-[#FBF1E7]/35 to-transparent sm:w-[min(46vw,440px)] sm:from-[#FBF1E7]/82 sm:via-[#FBF1E7]/28"
      />

      <AnimatePresence>
        {grown && (
          <motion.div
            variants={textVariants}
            initial="hidden"
            animate="show"
            className="relative z-20 mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col justify-start px-5 pt-24 sm:px-8 sm:pt-28 lg:justify-center lg:pt-0"
          >
            <div className="max-w-xl text-left">
              <motion.p
                variants={lineVariants}
                className="flex items-center gap-3 text-[11px] font-bold tracking-[0.32em] text-[#A62B4C]/60 uppercase"
              >
                <span className="h-px w-8 bg-[#c89b3c]/60" aria-hidden />
                {config.content.wishPrompt}
              </motion.p>

              <motion.h1
                variants={lineVariants}
                className="font-display mt-4 text-balance bg-gradient-to-br from-[#8B1E3F] via-[#A62B4C] to-[#c23b63] bg-clip-text text-5xl font-bold text-transparent sm:text-6xl lg:text-7xl"
              >
                {config.content.finalMessage}
              </motion.h1>

              <motion.p
                variants={lineVariants}
                className="mt-3 text-[15px] leading-relaxed text-[#8B1E3F]/60 sm:text-base"
              >
                <span className="font-display text-xl text-[#A62B4C] italic sm:text-2xl">
                  {config.content.finalCelebration}
                </span>
              </motion.p>

              {letterLine && (
                <motion.p
                  variants={lineVariants}
                  className="mt-5 border-l-2 border-[#c89b3c]/50 pt-1 pl-3 text-sm leading-relaxed text-[#8B1E3F]/65 italic sm:text-[15px]"
                >
                  {letterLine}
                </motion.p>
              )}

              {addressee && (
                <motion.p
                  variants={lineVariants}
                  className="mt-5 text-sm font-semibold tracking-[0.14em] text-[#A62B4C]/75 uppercase"
                >
                  for {addressee}
                  {config.sender.name?.trim() ? (
                    <span className="text-[#8B1E3F]/45 normal-case"> — {config.sender.name}</span>
                  ) : null}
                </motion.p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* bottom floating controls */}
      <AnimatePresence>
        {bloomed && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7, ease: 'easeOut' }}
            className="absolute inset-x-0 bottom-6 z-30 flex flex-col items-center gap-3 px-5 sm:bottom-8"
          >
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={onReplay}
                className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-[#8B1E3F] via-[#A62B4C] to-[#c23b63] px-7 text-base font-bold text-[#fff9f5] shadow-[0_0_34px_-6px_rgba(139,30,63,0.55)] transition-all duration-200 hover:scale-[1.04] active:scale-95"
              >
                <RotateCcw className="h-5 w-5" />
                Replay the surprise
              </button>
              <button
                type="button"
                onClick={onToggleMute}
                aria-label={isMuted ? 'Unmute music' : 'Mute music'}
                title={isMuted ? 'Unmute music' : 'Mute music'}
                className="flex h-14 w-14 items-center justify-center rounded-full border border-[#8B1E3F]/25 bg-white/70 text-[#8B1E3F] shadow-sm backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-white active:scale-95"
              >
                <MuteIcon className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={onExit}
                className="flex min-h-14 items-center gap-2.5 rounded-full border border-[#A62B4C]/35 bg-[#FBF1E7]/80 px-7 text-base font-semibold text-[#A62B4C] shadow-sm backdrop-blur-sm transition-all duration-200 hover:scale-[1.04] hover:bg-white active:scale-95"
              >
                <WandSparkles className="h-5 w-5 text-[#c89b3c]" />
                Create one of your own
              </button>
            </div>
            <p className="text-[11px] font-medium tracking-[0.22em] text-[#8B1E3F]/40 uppercase">
              crafted with ♥ by Cupi
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  )
}