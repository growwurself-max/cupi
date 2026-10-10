import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import type { ExperienceConfig, PhotoItem } from '../../../types/experience'
import { PALETTE } from '../palette'
import { Eyebrow, PrimaryButton, SceneTitle, StageScene } from '../components/Stage'
import { Heart, Sparkle } from '../components/Decor'

interface Act5MemoriesProps {
  config: ExperienceConfig
  reduce: boolean
  onContinue: () => void
}

interface Slide {
  src?: string
  alt: string
  caption: string
  rotate: number
  art: number
}

export function Act5Memories({ config, reduce, onContinue }: Act5MemoriesProps) {
  const slides = useMemo<Slide[]>(() => {
    const photos = config.content.photos ?? []
    if (photos.length > 0) {
      return photos.slice(0, 8).map((p: PhotoItem, i) => ({
        src: p.src,
        alt: p.alt || 'A treasured memory',
        caption: p.caption,
        rotate: p.rotate ?? (i % 2 === 0 ? -4 : 4),
        art: i % 3,
      }))
    }
    const tag = config.content.memoryTag
    return [
      { alt: 'A memory', caption: tag || 'the day it all began', rotate: -5, art: 0 },
      { alt: 'A memory', caption: config.content.memoryDate || 'little moments, big joy', rotate: 4, art: 1 },
      { alt: 'A memory', caption: 'you & me, always', rotate: -3, art: 2 },
    ]
  }, [config.content.photos, config.content.memoryTag, config.content.memoryDate])

  const [index, setIndex] = useState(0)
  const total = slides.length

  const go = (dir: 1 | -1) => setIndex((prev) => Math.min(Math.max(prev + dir, 0), total - 1))

  return (
    <StageScene
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: reduce ? 0.35 : 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <Eyebrow>the picture wall</Eyebrow>
      <SceneTitle className="mt-4">Little moments, kept safe</SceneTitle>

      <div className="relative mt-8 flex h-[52vh] max-h-[400px] min-h-[320px] w-full max-w-sm items-center justify-center">
        {/* behind cards for depth */}
        {[2, 1].map((depth) => {
          const s = slides[Math.min(index + depth, total - 1)]
          return (
            <div
              key={`ghost-${depth}`}
              aria-hidden
              className="absolute h-[92%] w-[86%] rounded-[18px] border"
              style={{
                background: 'rgba(255,255,255,0.7)',
                borderColor: 'rgba(194,104,140,0.25)',
                transform: `translateY(${depth * 10}px) rotate(${(depth % 2 === 0 ? -1 : 1) * (depth * 2)}deg)`,
                zIndex: 5 - depth,
              }}
            >
              {s && null}
            </div>
          )
        })}

        <AnimatePresence mode="popLayout">
          {slides.map((slide, i) => {
            if (i !== index) return null
            return (
              <motion.div
                key={i}
                drag={reduce ? false : 'x'}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.5}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -80) go(1)
                  else if (info.offset.x > 80) go(-1)
                }}
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9, rotate: slide.rotate - 3 }}
                animate={{ opacity: 1, scale: 1, rotate: slide.rotate }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, x: -140, rotate: slide.rotate - 12 }}
                transition={{ duration: reduce ? 0.3 : 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 w-[86%] cursor-grab touch-pan-y rounded-[16px] bg-white p-3 pb-14 active:cursor-grabbing"
                style={{
                  boxShadow: '0 30px 60px -30px rgba(110,36,64,0.55)',
                }}
              >
                <div className="relative h-[36vh] max-h-[280px] min-h-[220px] w-full overflow-hidden rounded-[10px]">
                  {slide.src ? (
                    <img src={slide.src} alt={slide.alt} className="h-full w-full object-cover" loading="lazy" draggable={false} />
                  ) : (
                    <PlaceholderArt art={slide.art} />
                  )}
                </div>
                <p className="font-script absolute bottom-3 left-0 right-0 text-center text-xl" style={{ color: PALETTE.berry }}>
                  {slide.caption || 'a favourite memory'}
                </p>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <div className="mt-8 flex items-center gap-4">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={index === 0}
          aria-label="Previous memory"
          className="flex h-11 w-11 items-center justify-center rounded-full border bg-white/70 disabled:opacity-40"
          style={{ borderColor: 'rgba(194,104,140,0.35)' }}
        >
          <Arrow dir="left" />
        </button>

        <div className="flex items-center gap-1.5" aria-hidden>
          {slides.map((_, i) => (
            <span
              key={i}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === index ? 18 : 6,
                background: i === index ? PALETTE.roseDeep : 'rgba(194,104,140,0.3)',
              }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => go(1)}
          disabled={index === total - 1}
          aria-label="Next memory"
          className="flex h-11 w-11 items-center justify-center rounded-full border bg-white/70 disabled:opacity-40"
          style={{ borderColor: 'rgba(194,104,140,0.35)' }}
        >
          <Arrow dir="right" />
        </button>
      </div>

      <div className="mt-7">
        <PrimaryButton onClick={onContinue}>Open the note</PrimaryButton>
      </div>
    </StageScene>
  )
}

function Arrow({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" style={{ transform: dir === 'left' ? 'scaleX(-1)' : undefined }} aria-hidden>
      <path d="M9 6 L15 12 L9 18" stroke={PALETTE.berrySoft} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PlaceholderArt({ art }: { art: number }) {
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{
        background:
          art === 0
            ? `linear-gradient(150deg, ${PALETTE.blush} 0%, ${PALETTE.rose} 100%)`
            : art === 1
              ? `linear-gradient(150deg, #FFF3DC 0%, ${PALETTE.gold} 100%)`
              : `linear-gradient(150deg, #F1E7FF 0%, ${PALETTE.roseMid} 100%)`,
      }}
    >
      <div className="flex flex-col items-center gap-3 opacity-90">
        {art === 1 ? <Sparkle size={54} color="#FFF7E6" /> : <Heart size={54} color="#FFF7E6" />}
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/90">
          keep this one
        </span>
      </div>
    </div>
  )
}
