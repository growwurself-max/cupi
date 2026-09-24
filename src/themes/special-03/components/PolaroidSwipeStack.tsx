import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from 'framer-motion'
import { useCallback, useRef, useState } from 'react'
import type { PhotoItem } from '../../../types/experience'

const STACK_ROTATIONS = [-4, 3, -2, 2, -3]

// A swipe triggers when the card moves past ~25% of its own width OR gets a
// quick flick (velocity). Both feel natural on touch and mouse.
const SWIPE_FRACTION = 0.25
const SWIPE_VELOCITY = 450

const SNAP_SPRING = { type: 'spring', stiffness: 360, damping: 30, restDelta: 0.5 } as const
const THROW_SPRING = { type: 'spring', stiffness: 300, damping: 26, mass: 0.9 } as const

interface PolaroidSwipeStackProps {
  photos: PhotoItem[]
  title?: string
  onDone?: () => void
}

export function PolaroidSwipeStack({
  photos,
  title = 'Some Sweet Moments',
  onDone,
}: PolaroidSwipeStackProps) {
  const [index, setIndex] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const cardRef = useRef<HTMLDivElement | null>(null)

  const x = useMotionValue(0)
  const rotate = useTransform(x, [-260, 0, 260], [-22, 0, 22])
  const opacity = useTransform(x, [-220, -150, 0, 150, 220], [0.05, 0.45, 1, 0.45, 0.05])

  const visible = photos.slice(index)
  const hasMore = index < photos.length - 1

  const throwCard = useCallback(
    (direction: number) => {
      const width = cardRef.current?.offsetWidth ?? 272
      const travel = Math.max(width * 1.5, window.innerWidth * 0.9 + width / 2)
      const target = (direction > 0 ? 1 : -1) * travel
      setLeaving(true)
      animate(x, target, THROW_SPRING).then(() => {
        if (hasMore) {
          setIndex((i) => i + 1)
          x.set(0)
          setLeaving(false)
        } else {
          onDone?.()
        }
      })
    },
    [hasMore, onDone, x],
  )

  const onDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      if (leaving) return
      const width = cardRef.current?.offsetWidth ?? 272
      const offset = info.offset.x
      const velocity = info.velocity.x
      const pastThreshold = Math.abs(offset) > width * SWIPE_FRACTION
      const isFlick = Math.abs(velocity) > SWIPE_VELOCITY
      if (pastThreshold || isFlick) {
        throwCard(offset || velocity)
        return
      }
      animate(x, 0, SNAP_SPRING)
    },
    [leaving, x, throwCard],
  )

  if (photos.length === 0) return null

  return (
    <div className="relative z-10 w-full max-w-sm touch-pan-y">
      <p className="mb-6 text-center font-serif text-xl font-bold text-amber-900/85 italic">
        {title}
      </p>

      <div className="relative mx-auto h-[22rem] w-full max-w-[17rem] sm:h-[23rem]">
        {visible
          .slice(0, 4)
          .map((photo, stackIdx) => {
            const isTop = stackIdx === 0
            const rot = STACK_ROTATIONS[(index + stackIdx) % STACK_ROTATIONS.length]
            const offsetY = stackIdx * 6
            const offsetX = stackIdx * 4

            if (!isTop) {
              return (
                <motion.div
                  key={`${photo.src}-back-${index + stackIdx}`}
                  initial={{ opacity: 0, scale: 0.92, y: 18 }}
                  animate={{ opacity: 0.9, scale: 1, y: 0 }}
                  transition={{ delay: stackIdx * 0.08, duration: 0.35 }}
                  className="pointer-events-none absolute inset-x-0 top-0 rounded-sm border-[10px] border-white bg-white p-3 pb-8 shadow-lg"
                  style={{
                    transform: `translate(${offsetX}px, ${offsetY}px) rotate(${rot}deg)`,
                    zIndex: 10 - stackIdx,
                  }}
                >
                  <img
                    src={photo.src}
                    alt=""
                    className="aspect-[4/5] w-full object-cover opacity-90"
                    draggable={false}
                  />
                </motion.div>
              )
            }

            return (
              <motion.div
                key={`${photo.src}-top-${index}`}
                ref={cardRef}
                drag="x"
                dragMomentum={false}
                style={{ x, rotate, opacity, zIndex: 20 }}
                onDragEnd={onDragEnd}
                className="absolute inset-x-0 top-0 cursor-grab rounded-sm border-[10px] border-white bg-white p-3 pb-8 shadow-2xl active:cursor-grabbing"
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="aspect-[4/5] w-full object-cover"
                  draggable={false}
                />
                <p className="mt-3 text-center text-sm font-semibold text-stone-700">
                  {photo.caption}
                </p>
              </motion.div>
            )
          })}
      </div>

      <p className="mt-4 text-center text-xs font-medium text-amber-800/50">
        {hasMore
          ? 'Drag the top card left or right →'
          : 'Last memory — swipe once more to continue'}
      </p>
    </div>
  )
}