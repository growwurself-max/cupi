import { motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion'
import { useState } from 'react'
import type { PhotoItem } from '../../../types/experience'

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
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-180, 0, 180], [-14, 0, 14])

  const current = photos[index % photos.length]
  const hasMore = index < photos.length - 1

  const swipe = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) < 80) return
    if (hasMore) {
      setIndex((i) => i + 1)
    } else {
      onDone?.()
    }
    x.set(0)
  }

  if (!current) {
    return null
  }

  return (
    <div className="relative z-10 w-full max-w-sm">
      <p className="mb-6 text-center font-serif text-xl font-bold text-amber-900/85 italic">
        {title}
      </p>
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.85}
        style={{ x, rotate }}
        onDragEnd={swipe}
        className="cursor-grab touch-pan-y rounded-sm border-[10px] border-white bg-white p-3 pb-8 shadow-2xl active:cursor-grabbing"
      >
        <img
          src={current.src}
          alt={current.alt}
          className="aspect-[4/5] w-full object-cover"
          draggable={false}
        />
        <p className="mt-3 text-center text-sm font-semibold text-stone-700">{current.caption}</p>
      </motion.div>
      <p className="mt-4 text-center text-xs font-medium text-amber-800/50">
        {hasMore ? 'Swipe left or right for the next memory →' : 'Last memory — keep swiping to continue'}
      </p>
    </div>
  )
}
