import { motion } from 'framer-motion'
import { RotateCcw, Volume2, VolumeX } from 'lucide-react'
import type { ExperienceConfig } from '../../../types/experience'
import { ScreenShell } from '../../shared/ScreenShell'

interface Act5LetterProps {
  config: ExperienceConfig
  onReplay: () => void
  onExit: () => void
  isMuted: boolean
  onToggleMute: () => void
}

export function Act5Letter({
  config,
  onReplay,
  onExit,
  isMuted,
  onToggleMute,
}: Act5LetterProps) {
  const photo = config.content.photos[1] ?? config.content.photos[0]
  const MuteIcon = isMuted ? VolumeX : Volume2

  return (
    <ScreenShell className="bg-[#FFF0F3] py-24">
      <motion.div
        initial={{ opacity: 0, y: 24, rotate: -3 }}
        animate={{ opacity: 1, y: 0, rotate: -2 }}
        transition={{ type: 'spring', stiffness: 100 }}
        className="relative z-10 w-full max-w-sm rounded-sm border-8 border-white bg-white p-4 pb-10 shadow-2xl shadow-rose-200/40"
      >
        {photo ? (
          <img
            src={photo.src}
            alt={photo.alt}
            className="aspect-square w-full object-cover"
          />
        ) : (
          <div className="flex aspect-square items-center justify-center bg-rose-50 text-5xl">💌</div>
        )}
        <p className="mt-4 font-serif text-lg font-bold text-rose-800">
          {config.content.finalMessage}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">
          {(config.content.letterLines ?? []).slice(0, 2).join(' ')}
        </p>
        <p className="mt-4 text-right text-sm font-semibold italic text-rose-500">
          — {config.sender.name}
        </p>
      </motion.div>

      <div className="relative z-10 mt-10 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onReplay}
          className="flex min-h-12 items-center gap-2 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 px-6 text-sm font-bold text-white shadow-lg"
        >
          <RotateCcw className="h-4 w-4" />
          Replay
        </button>
        <button
          type="button"
          onClick={onToggleMute}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-rose-200 bg-white text-rose-600"
        >
          <MuteIcon className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={onExit}
          className="min-h-12 rounded-full border border-rose-200 bg-white/90 px-6 text-sm font-semibold text-rose-700"
        >
          Create your own
        </button>
      </div>
    </ScreenShell>
  )
}
