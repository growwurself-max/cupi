import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'

interface Screen3QueenPresentationProps {
  config: ExperienceConfig
  onContinue: () => void
}

export function Screen3QueenPresentation({ config, onContinue }: Screen3QueenPresentationProps) {
  const [showFlowers, setShowFlowers] = useState(false)
  const [showPhoto, setShowPhoto] = useState(false)
  const [showCrown, setShowCrown] = useState(false)
  const [showText, setShowText] = useState(false)
  const [showContinue, setShowContinue] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setShowFlowers(true), 400)
    const t2 = setTimeout(() => setShowPhoto(true), 1000)
    const t3 = setTimeout(() => setShowCrown(true), 1600)
    const t4 = setTimeout(() => setShowText(true), 2200)
    const t5 = setTimeout(() => setShowContinue(true), 3400)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
      clearTimeout(t5)
    }
  }, [])

  const mainPhoto = config.content.photos?.[0]

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      {/* Garden Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Soft light effect */}
        {showFlowers && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            className="absolute top-1/4 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-rose-200/30 blur-3xl"
          />
        )}
      </div>

      {/* Queen Garden Frame */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="relative mb-6"
      >
        {/* Decorative floral frame */}
        <div className="relative aspect-[3/4] w-56 overflow-hidden rounded-2xl border-4 border-white/80 bg-rose-50/60 shadow-2xl shadow-rose-300/40 sm:w-72">
          {/* Photo */}
          {showPhoto && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative h-full w-full"
            >
              {mainPhoto?.src ? (
                <img
                  src={mainPhoto.src}
                  alt={mainPhoto.alt || 'Mom\'s photo'}
                  className="h-full w-full object-cover object-center"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-6xl">
                  👩
                </div>
              )}
              {/* Soft overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-rose-200/30 via-transparent to-white/20" />
            </motion.div>
          )}

          {/* Crown */}
          {showCrown && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, type: 'spring' }}
              className="absolute -top-8 left-1/2 -translate-x-1/2 text-5xl drop-shadow-lg"
            >
              👑
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Queen Text */}
      {showText && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-3"
        >
          <p className="font-display text-xl font-semibold text-rose-800 sm:text-2xl">
            Every home has a heart.
          </p>
          <p className="font-script text-3xl text-rose-600 sm:text-4xl">
            Ours is you. 👑
          </p>
        </motion.div>
      )}

      {/* Continue indicator */}
      {showContinue && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onContinue}
          className="mt-12 rounded-full border border-white/80 bg-white/75 px-8 py-3 font-display text-base font-semibold text-rose-700 shadow-[0_14px_32px_-16px_rgba(219,39,119,0.55)] backdrop-blur-md transition-all hover:bg-white hover:text-rose-800"
        >
          Continue →
        </motion.button>
      )}
    </div>
  )
}
