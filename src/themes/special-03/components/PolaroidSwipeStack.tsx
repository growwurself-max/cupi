import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from 'framer-motion'
import { useCallback, useState } from 'react'
import type { PhotoItem } from '../../../types/experience'

const STACK_ROTATIONS = [-4, 3, -2, 2, -3]

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
  const [exitX, setExitX] = useState(0)
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 0, 200], [-18, 0, 18])

  const visible = photos.slice(index)
  const hasMore = index < photos.length - 1

  const advance = useCallback(
    (direction: number) => {
      setExitX(direction > 0 ? 420 : -420)
      if (hasMore) {
        setTimeout(() => {
          setIndex((i) => i + 1)
          setExitX(0)
          x.set(0)
        }, 280)
      } else {
        setTimeout(() => onDone?.(), 320)
      }
    },
    [hasMore, onDone, x],
  )

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const offset = info.offset.x
    const velocity = info.velocity.x
    if (Math.abs(offset) > 90 || Math.abs(velocity) > 500) {
      advance(offset || velocity)
      return
    }
    animate(x, 0, { type: 'spring', stiffness: 420, damping: 32 })
  }

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
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.75}
                style={{ x, rotate, zIndex: 20 }}
                onDragEnd={onDragEnd}
                animate={
                  exitX !== 0
                    ? { x: exitX, opacity: 0, rotate: exitX > 0 ? 22 : -22 }
                    : { scale: [1, 1.005, 1] }
                }
                transition={{ type: 'spring', stiffness: 260, damping: 26 }}
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
