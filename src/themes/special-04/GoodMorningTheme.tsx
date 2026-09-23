import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useSoundEffects } from '../../hooks/useSoundEffects'
import { resolveConfigPlaceholders } from '../../utils/placeholders'
import type { ExperienceConfig } from '../../types/experience'
import { FloatingParticles } from '../shared/FloatingParticles'
import { ThemeToolbar } from '../shared/ThemeToolbar'
import { defaultGoodMorningConfig } from './defaultData'

const TOTAL_STEPS = 1

interface GoodMorningThemeProps {
  config?: ExperienceConfig
  onExit: () => void
  isSharedLink?: boolean
}

const SUN_CORE =
  'radial-gradient(circle at 50% 50%, #fff6df 0%, #ffe9b8 34%, #ffd98a 58%, rgba(255,201,147,0) 78%)'

const SUN_RAYS =
  'repeating-conic-gradient(from 0deg, rgba(255,200,120,0.34) 0deg 12deg, rgba(255,217,166,0) 12deg 28deg)'

const EASE = [0.22, 1, 0.36, 1] as const

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.16,
      delayChildren: 0.25,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: EASE },
  },
}

export function GoodMorningTheme({
  config,
  onExit,
  isSharedLink,
}: GoodMorningThemeProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const resolvedConfig = useMemo(
    () => config ?? resolveConfigPlaceholders(defaultGoodMorningConfig),
    [config],
  )

  const sound = useSoundEffects({
    audio: resolvedConfig.audio,
    enabled: resolvedConfig.audio.enabled,
  })

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
    const joy = (id: number) =>
      window.setTimeout(() => sound.playRevealChime(), 450 + id * 140)
    const timers = [0, 1].map(joy)
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [sound])

  const handleExit = useCallback(() => {
    sound.resume()
    onExit()
  }, [onExit, sound])

  const recipient = resolvedConfig.recipient.name.trim() || 'you'
  const message = resolvedConfig.content.letterLines

  return (
    <div
      ref={scrollRef}
      className="relative h-dvh overflow-x-hidden overflow-y-auto"
      style={{
        color: '#4a3218',
        background: 'linear-gradient(180deg, #fdf6e9 0%, #ffe9cd 42%, #ffd9a8 78%, #ffc993 100%)',
      }}
    >
      {/* Sun — soft core with a slow turning ray halo */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[12%] flex justify-center">
        <div
          className="relative h-56 w-56 sm:h-72 sm:w-72"
          style={{ filter: 'blur(0px)' }}
        >
          <motion.div
            className="absolute inset-[-70%]"
            style={{ background: SUN_RAYS, WebkitMaskImage: 'radial-gradient(circle, black 30%, transparent 72%)' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
          />
          <div
            className="absolute inset-0 animate-pulse-glow rounded-full"
            style={{ background: SUN_CORE }}
          />
        </div>
      </div>

      {/* Gentle drifting light bands */}
      {['8%', '26%', '67%', '85%'].map((top, index) => (
        <motion.div
          key={top}
          aria-hidden
          className="pointer-events-none absolute h-10 rounded-full bg-white/30 blur-2xl"
          style={{ top, width: index % 2 === 0 ? '42%' : '34%', left: index % 2 === 0 ? '-8%' : '62%' }}
          animate={{ x: [0, index % 2 === 0 ? 110 : -110, 0] }}
          transition={{
            duration: 16 + index * 4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: index * 1.6,
          }}
        />
      ))}

      {/* Floating golden morning light */}
      <FloatingParticles
        type="gold-sparkles"
        count={14}
        colors={['#ffd166', '#f7b267']}
        className="absolute inset-0"
      />

      <ThemeToolbar
        themeLabel={resolvedConfig.branding.themeLabel}
        step={1}
        totalSteps={TOTAL_STEPS}
        isMuted={sound.isMuted}
        soundEnabled={sound.isEnabled}
        onToggleMute={sound.toggleMute}
        onExit={handleExit}
        variant={isSharedLink ? 'shared' : 'demo'}
      />

      <main className="relative z-10 mx-auto flex min-h-full w-full max-w-lg flex-col items-center justify-center px-5 pb-10 pt-24">
        <AnimatePresence mode="wait">
          <motion.div
            key="good-morning"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: -16, transition: { duration: 0.3 } }}
            className="w-full rounded-[2rem] border border-white/60 bg-white/45 px-6 py-9 text-center shadow-[0_24px_60px_-32px_rgba(214,148,58,0.45)] backdrop-blur-md sm:px-10 sm:py-12"
          >
            <motion.p
              variants={itemVariants}
              className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#d98e2b]"
            >
              {resolvedConfig.content.revealHeading}
            </motion.p>

            <motion.h1
              variants={itemVariants}
              className="mt-4 bg-gradient-to-br from-[#8a5717] via-[#c07a24] to-[#e09a3c] bg-clip-text font-display text-5xl leading-none font-bold tracking-tight text-transparent sm:text-6xl"
            >
              {recipient}
            </motion.h1>

            <motion.div
              variants={itemVariants}
              className="mx-auto mt-6 flex max-w-[16rem] items-center gap-3"
              aria-hidden
            >
              <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#e8b25f]" />
              <span className="text-sm">☀️</span>
              <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#e8b25f]" />
            </motion.div>

            {message.length > 0 && (
              <motion.div
                variants={itemVariants}
                className="mt-6 space-y-3 text-balance text-[15.5px] leading-relaxed font-medium text-[#5a3d1c] sm:text-[16.5px]"
              >
                {message.map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </motion.div>
            )}

            <motion.p
              variants={itemVariants}
              className="mt-8 font-script text-2xl text-[#b06f22]"
            >
              {resolvedConfig.content.letterSignoff}
            </motion.p>
            <motion.p
              variants={itemVariants}
              className="mt-1 text-sm font-bold tracking-wide text-[#4a3218] uppercase"
            >
              {resolvedConfig.sender.name}
            </motion.p>
          </motion.div>
        </AnimatePresence>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="mt-6 text-center text-[11px] font-semibold tracking-wide text-[#a4651f]/70 uppercase"
        >
          {resolvedConfig.content.revealSubtext}
        </motion.p>
      </main>
    </div>
  )
}