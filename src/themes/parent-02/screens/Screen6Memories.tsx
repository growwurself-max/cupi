import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'

interface Screen6MemoriesProps {
  config: ExperienceConfig
  onContinue: () => void
}

export function Screen6Memories({ config, onContinue }: Screen6MemoriesProps) {
  const [visiblePhotos, setVisiblePhotos] = useState<number[]>([])
  const [showText, setShowText] = useState(false)
  const [showContinue, setShowContinue] = useState(false)

  const photos = config.content.photos?.slice(1) || []

  useEffect(() => {
    // Show text first
    const textTimeout = setTimeout(() => setShowText(true), 600)

    // Then show photos one by one
    photos.forEach((_, index) => {
      const timeout = setTimeout(() => {
        setVisiblePhotos((prev) => [...prev, index])
      }, 1200 + index * 1000)
      return () => clearTimeout(timeout)
    })

    const continueTimeout = setTimeout(() => setShowContinue(true), 4000 + photos.length * 1000)
    return () => {
      clearTimeout(textTimeout)
      clearTimeout(continueTimeout)
    }
  }, [photos.length])

  return (
    <div className="flex h-full flex-col items-center justify-center px-6">
      {/* Text */}
      {showText && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8 text-center"
        >
          <p className="font-display text-lg font-semibold text-rose-700 sm:text-xl">
            A lifetime of beautiful memories...
          </p>
        </motion.div>
      )}

      {/* Photo Gallery */}
      <div className="w-full max-w-md space-y-4">
        {photos.map((photo, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9, rotate: index % 2 === 0 ? -3 : 3 }}
            animate={visiblePhotos.includes(index) ? { opacity: 1, scale: 1, rotate: index % 2 === 0 ? -2 : 2 } : {}}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative aspect-[4/3] overflow-hidden rounded-2xl border-2 border-white/70 bg-rose-50/60 shadow-lg shadow-rose-200/60"
          >
            {photo.src ? (
              <img
                src={photo.src}
                alt={photo.alt || `Memory ${index + 1}`}
                className="h-full w-full object-cover object-center"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-4xl">
                📸
              </div>
            )}
            {photo.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-rose-900/70 to-transparent p-3">
                <p className="font-serif text-sm text-white/95">{photo.caption}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {showContinue && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onContinue}
          className="mt-8 rounded-full border border-white/80 bg-white/75 px-8 py-3 font-display text-base font-semibold text-rose-700 shadow-[0_14px_32px_-16px_rgba(219,39,119,0.55)] backdrop-blur-md transition-all hover:bg-white hover:text-rose-800"
        >
          Continue →
        </motion.button>
      )}
    </div>
  )
}
