import { AnimatePresence, motion } from 'framer-motion'
import { RotateCcw, Volume2, VolumeX } from 'lucide-react'
import { useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { fireGrandBurst, fireGoldenRain, fireSideCannons } from '../../../utils/confetti'
import { ScreenShell } from '../../shared/ScreenShell'
import { CoupleAnimation } from '../components/CoupleIllustration'

interface Act6GiftProps {
  config: ExperienceConfig
  onReplay: () => void
  onExit: () => void
  isMuted: boolean
  onToggleMute: () => void
  onCelebrate: () => void
}

export function Act6Gift({
  config,
  onReplay,
  onExit,
  isMuted,
  onToggleMute,
  onCelebrate,
}: Act6GiftProps) {
  const [opened, setOpened] = useState(false)
  const MuteIcon = isMuted ? VolumeX : Volume2

  const tapGift = () => {
    if (opened) return
    setOpened(true)
    onCelebrate()
    fireSideCannons()
    fireGrandBurst()
    fireGoldenRain(3200)
  }

  return (
    <ScreenShell
      background="linear-gradient(170deg, #FFF6F1 0%, #FCEDE8 52%, #F9DEDF 100%)"
      className="py-24"
    >
      {/* ambient warm auras */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 animate-pulse-glow rounded-full bg-[radial-gradient(circle,rgba(255,204,150,0.5),transparent_62%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-28 -left-24 h-80 w-80 rounded-full bg-[#F6BACB]/35 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -bottom-28 h-80 w-80 rounded-full bg-[#E7C4E4]/30 blur-3xl"
      />

      {!opened ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative z-10 flex flex-col items-center text-center"
        >
          <div className="flex items-center gap-3">
            <span className="h-px w-9 bg-gradient-to-r from-transparent to-[#C9933F]/70" />
            <p className="font-serif text-[11px] font-semibold tracking-[0.38em] text-[#B07A55] uppercase sm:text-xs">
              ✦ one last thing ✦
            </p>
            <span className="h-px w-9 bg-gradient-to-l from-transparent to-[#C9933F]/70" />
          </div>

          <h2 className="mt-4 max-w-md px-1 font-display text-3xl leading-tight font-semibold text-balance text-[#4A1525] tracking-wide drop-shadow-[0_2px_14px_rgba(122,45,63,0.14)] sm:text-4xl">
            This is yours
          </h2>
          <p className="mt-3 font-serif text-lg tracking-wide text-[#8E4A5E] italic sm:text-xl">
            Tap the gift to unwrap it
          </p>

          <motion.button
            type="button"
            onClick={tapGift}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.92 }}
            className="relative z-10 mt-12 outline-none"
            aria-label="Tap the gift box"
          >
            <span className="relative flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-b from-white/70 to-[#FBE4DE]/60 shadow-[0_24px_60px_-28px_rgba(198,106,84,0.6)] ring-1 ring-[#D98B7B]/30 backdrop-blur-sm">
              <span
                className="absolute inset-0 animate-pulse-glow rounded-full"
                style={{
                  background:
                    'radial-gradient(circle, rgba(255,214,150,0.55), transparent 65%)',
                }}
              />
              <span className="relative text-7xl drop-shadow-[0_14px_24px_rgba(150,70,60,0.4)]">
                🎁
              </span>
            </span>
          </motion.button>

          <p className="mt-8 text-[11px] font-medium tracking-[0.3em] text-[#A06A5A]/80 uppercase">
            ❦ go on, it&rsquo;s for you ❦
          </p>
        </motion.div>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex flex-col items-center text-center"
          >
            <div className="mb-4 flex items-center gap-3 sm:mb-5">
              <span className="h-px w-9 bg-gradient-to-r from-transparent to-[#C9933F]/70" />
              <p className="font-serif text-[11px] font-semibold tracking-[0.38em] text-[#B07A55] uppercase sm:text-xs">
                ✦ sealed with love ✦
              </p>
              <span className="h-px w-9 bg-gradient-to-l from-transparent to-[#C9933F]/70" />
            </div>

            <CoupleAnimation />

            <h1 className="mt-4 max-w-xl px-1 font-display text-4xl leading-tight font-semibold text-balance text-[#4A1525] tracking-wide drop-shadow-[0_2px_14px_rgba(122,45,63,0.16)] sm:text-5xl">
              {config.content.finalMessage}
            </h1>
            <p className="mt-4 max-w-md px-1 font-serif text-lg tracking-wide text-[#8E4A5E] text-balance italic sm:text-xl">
              {config.content.finalCelebration}
            </p>

            <div className="mt-7 flex items-center gap-3">
              <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#C9933F]/70" />
              <span className="text-sm text-[#C66C7E]">♥</span>
              <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#C9933F]/70" />
            </div>
            <p className="mt-3 text-xs font-semibold tracking-[0.28em] text-[#6E3A4B]/85 uppercase">
              — {config.sender.name} ♥ {config.recipient.name} —
            </p>
          </motion.div>
        </AnimatePresence>
      )}

      {opened && (
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5, ease: 'easeOut' }}
          className="relative z-10 mt-12 flex flex-wrap items-center justify-center gap-3 pb-2"
        >
          <motion.button
            type="button"
            onClick={onReplay}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex min-h-12 items-center gap-2 rounded-full bg-gradient-to-r from-[#6E2739] via-[#932C4F] to-[#B43A5F] px-8 py-3.5 text-sm font-semibold tracking-[0.12em] text-[#FFF6F0] shadow-[0_14px_34px_-12px_rgba(110,39,57,0.65)] ring-1 ring-[#FFF]/25 transition-shadow duration-300 ring-inset hover:shadow-[0_20px_48px_-14px_rgba(110,39,57,0.8)]"
          >
            <RotateCcw className="h-4 w-4" />
            Replay
          </motion.button>
          <motion.button
            type="button"
            onClick={onToggleMute}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            aria-label={isMuted ? 'Unmute music' : 'Mute music'}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-[#B07A6A]/35 bg-white/45 text-[#7A2D45] shadow-[0_8px_24px_-14px_rgba(110,39,57,0.4)] backdrop-blur-sm transition-colors duration-300 hover:bg-white/80 hover:shadow-[0_14px_34px_-16px_rgba(110,39,57,0.55)]"
          >
            <MuteIcon className="h-5 w-5" />
          </motion.button>
          <motion.button
            type="button"
            onClick={onExit}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="min-h-12 rounded-full border border-[#B07A6A]/35 bg-white/45 px-8 py-3.5 text-sm font-semibold tracking-[0.12em] text-[#7A2D45] shadow-[0_8px_24px_-14px_rgba(110,39,57,0.4)] backdrop-blur-sm transition-colors duration-300 hover:bg-white/75 hover:shadow-[0_14px_34px_-16px_rgba(110,39,57,0.5)]"
          >
            Create your own
          </motion.button>
        </motion.div>
      )}
    </ScreenShell>
  )
}