import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { BlushDécor } from '../BlushDécor'

interface Screen2MemoryReelProps {
  config: ExperienceConfig
  onTilt: () => void
  onContinue: () => void
}

export function Screen2MemoryReel({
  config,
  onTilt,
  onContinue,
}: Screen2MemoryReelProps) {
  const photos = config.content.photos
  const [index, setIndex] = useState(0)
  const [tilted, setTilted] = useState(false)
  const [paused, setPaused] = useState(false)

  const goTo = useCallback((next: number) => {
    setIndex(((next % photos.length) + photos.length) % photos.length)
    setTilted(false)
  }, [photos.length])

  useEffect(() => {
    if (paused || photos.length <= 1) return
    const timer = setTimeout(
      () => setIndex((prev) => (prev + 1) % photos.length),
      4200,
    )
    return () => clearTimeout(timer)
  }, [index, paused, photos.length])

  const interact = (next: number) => {
    goTo(next)
    setPaused(true)
    window.setTimeout(() => setPaused(false), 7000)
  }

  const toggleTilt = () => {
    if (tilted) return
    setTilted(true)
    onTilt()
  }

  const current = photos[index]

  return (
    <section className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-5 py-24 text-center sm:px-8">
      <BlushDécor />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center gap-3"
      >
        <span className="rounded-full border border-[#F4BCD1] bg-white/80 px-4 py-1.5 text-xs font-black tracking-[0.22em] text-[#D9548A] uppercase shadow-sm backdrop-blur-md">
          Chapter One · Your Moments
        </span>
        <h2 className="font-display text-balance text-3xl font-bold text-[#9A3168] italic sm:text-4xl">
          A tiny reel of {config.recipient.name} &amp; me 💫
        </h2>
        <p className="max-w-md text-sm leading-relaxed text-[#7C4A63]">
          The photos you picked are now part of this story — one memory at a
          time.
        </p>
      </motion.div>

      {/* Main polaroid stage */}
      <div className="relative z-10 mt-12 flex w-full max-w-md flex-col items-center">
        <div className="flex w-full items-center gap-3">
          {photos.length > 1 && (
            <button
              type="button"
              onClick={() => interact(index - 1)}
              aria-label="Previous photo"
              className="group flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white bg-white/85 text-[#D9548A] shadow-md backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-white active:scale-95"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={current.src + current.caption}
              initial={{ opacity: 0, x: 60, rotate: 6 }}
              animate={{ opacity: 1, x: 0, rotate: current.rotate }}
              exit={{ opacity: 0, x: -60, rotate: -6 }}
              transition={{
                type: 'spring',
                stiffness: 150,
                damping: 20,
              }}
              className="relative min-w-0 flex-1"
            >
              <motion.button
                type="button"
                onClick={toggleTilt}
                animate={{
                  rotate: tilted ? Math.sign(current.rotate) * 9 : current.rotate,
                  scale: tilted ? 1.05 : 1,
                }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 170, damping: 15 }}
                className="relative w-full select-none rounded-3xl bg-white p-4 pb-5 text-left shadow-[0_30px_70px_-24px_rgba(231,140,178,0.65)] outline-none"
                aria-label={`Tap to tilt photo: ${current.caption}`}
              >
                <AnimatePresence>
                  {tilted && (
                    <motion.span
                      key="tilt-glow"
                      initial={{ opacity: 1, scale: 0.4 }}
                      animate={{ opacity: 0, scale: 1.5 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8 }}
                      className="pointer-events-none absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-[#FFD9E6]/70 to-[#EDE2FF]/70 blur-lg"
                    />
                  )}
                </AnimatePresence>
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#FDE9F1] shadow-inner">
                  <img
                    src={current.src}
                    alt={current.alt}
                    className="h-full w-full object-cover object-center"
                  />
                  <span className="absolute inset-x-0 bottom-0 flex h-16 items-end justify-between bg-gradient-to-t from-[#9A3168]/35 via-transparent to-transparent p-3">
                    <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black tracking-wider text-[#B9447D] uppercase">
                      Memory {index + 1} · {photos.length}
                    </span>
                  </span>
                </div>
                <p className="mt-4 text-center text-[15px] font-bold text-[#6E3A52]">
                  {current.caption}
                </p>
                <span className="mt-1 block text-center text-[11px] font-bold text-[#C46D97]/60">
                  {tilted ? 'a favourite, always ↺' : 'tap to tilt'}
                </span>
              </motion.button>
            </motion.div>
          </AnimatePresence>

          {photos.length > 1 && (
            <button
              type="button"
              onClick={() => interact(index + 1)}
              aria-label="Next photo"
              className="group flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white bg-white/85 text-[#D9548A] shadow-md backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-white active:scale-95"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>

        {photos.length > 1 && (
          <div className="mt-5 flex items-center gap-1.5">
            {photos.map((photo, i) => (
              <button
                key={photo.src + i}
                type="button"
                disabled={i === index}
                onClick={() => interact(i)}
                aria-label={`Jump to photo ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === index
                    ? 'w-7 bg-gradient-to-r from-[#F472B6] to-[#A78BFA]'
                    : 'w-2 bg-[#F4BCD1] hover:bg-[#E890B4]'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail filmstrip */}
      {photos.length > 1 && (
        <div className="no-scrollbar relative z-10 mt-7 flex max-w-full items-center gap-3 overflow-x-auto px-2 pb-2">
          {photos.map((photo, i) => (
            <motion.button
              key={`thumb-${photo.src + i}`}
              type="button"
              onClick={() => interact(i)}
              whileHover={{ y: -4, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`shrink-0 overflow-hidden rounded-xl bg-white p-1.5 shadow-md transition-all duration-200 ${
                i === index
                  ? 'ring-2 ring-[#F472B6]'
                  : 'opacity-60 ring-1 ring-transparent hover:opacity-100'
              }`}
              aria-label={`Show photo ${i + 1}`}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                className="h-14 w-14 rounded-lg object-cover object-center"
              />
            </motion.button>
          ))}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.55, delay: 0.2 }}
        className="relative z-10 mt-10"
      >
        <button
          type="button"
          onClick={onContinue}
          className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-[#F472B6] via-[#EC6E9F] to-[#A78BFA] px-9 text-base font-bold text-white shadow-xl shadow-[#F4BCD1]/60 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          Our moments, sealed 💌
          <ChevronRight className="h-5 w-5" />
        </button>
      </motion.div>
    </section>
  )
}