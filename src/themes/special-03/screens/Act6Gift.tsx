import { AnimatePresence, motion } from 'framer-motion'
import { RotateCcw, Volume2, VolumeX } from 'lucide-react'
import { useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { fireGrandBurst, fireGoldenRain } from '../../../utils/confetti'
import { ScreenShell } from '../../shared/ScreenShell'
import { CoupleIllustration } from '../components/CoupleIllustration'

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
    fireGrandBurst()
    fireGoldenRain(2600)
  }

  return (
    <ScreenShell className="bg-[#FDFBF7] py-24">
      {!opened ? (
        <>
          <p className="relative z-10 font-serif text-xl font-bold text-amber-950 italic sm:text-2xl">
            One Last Thing… Tap the gift
          </p>
          <motion.button
            type="button"
            onClick={tapGift}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            whileTap={{ scale: 0.92 }}
            className="relative z-10 mt-12 outline-none"
            aria-label="Tap the gift box"
          >
            <span className="text-7xl drop-shadow-lg">🎁</span>
          </motion.button>
        </>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 flex flex-col items-center"
          >
            <CoupleIllustration />
            <p className="mt-6 font-serif text-2xl font-bold text-rose-800 sm:text-3xl">
              {config.content.finalMessage}
            </p>
            <p className="mt-2 text-sm text-amber-900/70">{config.content.finalCelebration}</p>
            <p className="mt-1 text-sm font-semibold text-rose-600">
              — {config.sender.name} ♥ {config.recipient.name}
            </p>
          </motion.div>
        </AnimatePresence>
      )}

      {opened && (
        <div className="relative z-10 mt-10 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={onReplay}
            className="flex min-h-12 items-center gap-2 rounded-full bg-gradient-to-r from-amber-600 to-rose-500 px-6 text-sm font-bold text-white shadow-lg"
          >
            <RotateCcw className="h-4 w-4" />
            Replay
          </button>
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute music' : 'Mute music'}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-200 bg-white text-amber-900"
          >
            <MuteIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onExit}
            className="min-h-12 rounded-full border border-amber-200 bg-white px-6 text-sm font-semibold text-amber-900"
          >
            Create your own
          </button>
        </div>
      )}
    </ScreenShell>
  )
}
