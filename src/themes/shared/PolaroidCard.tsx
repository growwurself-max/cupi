import { AnimatePresence, motion } from 'framer-motion'
import type { PhotoItem } from '../../types/experience'

interface PolaroidCardProps {
  photo: PhotoItem
  index: number
  dateLabel: string
  frameClass: string
  captionClass?: string
  dateClass?: string
  hintClass?: string
  tilted?: boolean
  onTilt?: () => void
}

export function PolaroidCard({
  photo,
  index,
  dateLabel,
  frameClass,
  captionClass = 'text-stone-700',
  dateClass = 'text-stone-400',
  hintClass = 'text-stone-300',
  tilted = false,
  onTilt,
}: PolaroidCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onTilt}
      initial={{ opacity: 0, y: 60, rotate: 0 }}
      animate={{ opacity: 1, y: 0, rotate: photo.rotate }}
      transition={{ delay: 0.3 + index * 0.2, type: 'spring', stiffness: 90, damping: 14 }}
      whileTap={{ scale: 0.97 }}
      aria-label={`Tap to tilt photo: ${photo.caption}`}
      className="group relative w-52 select-none text-left outline-none sm:w-56"
    >
      <motion.div
        animate={{
          rotate: tilted ? Math.sign(photo.rotate) * 9 : photo.rotate,
          scale: tilted ? 1.07 : 1,
          zIndex: tilted ? 30 : 1,
        }}
        transition={{ type: 'spring', stiffness: 170, damping: 15 }}
        className={`rounded-2xl p-3 pb-4 shadow-[0_18px_45px_-18px_rgba(0,0,0,0.35)] ${frameClass}`}
      >
        <div className="relative overflow-hidden rounded-xl">
          <img
            src={photo.src}
            alt={photo.alt}
            loading="lazy"
            className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <p className={`mt-3 text-center text-sm font-semibold ${captionClass}`}>
          {photo.caption}
        </p>
        <span className={`mt-1 block text-center text-[11px] font-medium ${dateClass}`}>
          {dateLabel}
        </span>
        {onTilt && (
          <span className={`mt-1 block text-center text-[11px] font-semibold ${hintClass}`}>
            {tilted ? 'a favorite, always ↺' : 'tap to tilt'}
          </span>
        )}
      </motion.div>

      <AnimatePresence>
        {tilted && (
          <motion.span
            key="glow"
            initial={{ opacity: 1, scale: 0.4 }}
            animate={{ opacity: 0, scale: 1.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="pointer-events-none absolute -inset-2 rounded-3xl bg-gradient-to-br from-rose-200/60 to-violet-200/60 blur-md"
          />
        )}
      </AnimatePresence>
    </motion.button>
  )
}