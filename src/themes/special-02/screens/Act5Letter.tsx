import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, RotateCcw, Volume2, VolumeX } from 'lucide-react'
import { useCallback, useState } from 'react'
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
  const photos = config.content.photos
  const [index, setIndex] = useState(0)
  const MuteIcon = isMuted ? VolumeX : Volume2

  const count = photos.length
  const hasNext = count > 1 && index < count - 1
  const hasPrev = count > 1 && index > 0

  const goPrev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), [])
  const goNext = useCallback(
    () => setIndex((i) => Math.min(photos.length - 1, i + 1)),
    [photos.length],
  )

  const current = photos[index]

  return (
    <ScreenShell className="bg-[#FCEBEE] py-24">
      <div className="relative z-10 w-full max-w-sm" style={{ perspective: 900 }}>
        <div className="relative h-80 overflow-hidden rounded-sm border-8 border-white bg-white p-3 pb-9 shadow-2xl shadow-rose-200/40">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={`photo-${index}`}
              initial={{ opacity: 0, x: count > 1 ? 90 : 0, rotate: 4, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, rotate: -2, scale: 1 }}
              exit={{ opacity: 0, x: count > 1 ? -90 : 0, rotate: -4, scale: 0.96 }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-3"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {current ? (
                <img
                  src={current.src}
                  alt={current.alt}
                  className="h-full w-full rounded-sm object-cover"
                  draggable={false}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-sm bg-rose-50 text-6xl">
                  💌
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <p className="absolute inset-x-3 bottom-2 text-center text-sm font-semibold text-stone-700">
            {current ? current.caption : 'A keepsake just for you'}
          </p>

          {count > 1 && (
            <>
              <motion.button
                type="button"
                onClick={goPrev}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                disabled={!hasPrev}
                aria-label="Previous keepsake"
                className="absolute top-1/2 -left-4 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-rose-200 bg-white text-rose-600 shadow-md disabled:opacity-30"
              >
                <ChevronLeft className="h-5 w-5" />
              </motion.button>
              <motion.button
                type="button"
                onClick={goNext}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                disabled={!hasNext}
                aria-label="Next keepsake"
                className="absolute top-1/2 -right-4 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-rose-200 bg-white text-rose-600 shadow-md disabled:opacity-30"
              >
                <ChevronRight className="h-5 w-5" />
              </motion.button>

              <div className="absolute inset-x-0 -bottom-0 flex items-center justify-center gap-1.5 pb-1">
                {photos.map((p, i) => (
                  <motion.button
                    key={`dot-${p.src}-${i}`}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`Go to keepsake ${i + 1}`}
                    animate={
                      i === index
                        ? { width: 18, backgroundColor: '#fb7185' }
                        : { width: 6, backgroundColor: '#fecdd3' }
                    }
                    whileHover={{ scale: 1.3 }}
                    className="h-1.5 cursor-pointer rounded-full transition-all duration-300"
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-7 font-serif text-xl font-bold text-rose-800"
        >
          {config.content.finalMessage}
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-2 text-sm leading-relaxed text-stone-600"
        >
          {(config.content.letterLines ?? []).slice(0, 2).join(' ')}
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-4 text-right text-sm font-semibold italic text-rose-500"
        >
          — {config.sender.name}
        </motion.p>
      </div>

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