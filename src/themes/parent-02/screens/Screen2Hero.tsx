import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'

interface Screen2HeroProps {
  config: ExperienceConfig
  onContinue: () => void
}

export function Screen2Hero({ config, onContinue }: Screen2HeroProps) {
  const [showText, setShowText] = useState(false)
  const [showContinue, setShowContinue] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setShowText(true), 1200)
    const t2 = setTimeout(() => setShowContinue(true), 2800)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  const mainPhoto = config.content.photos?.[0]

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      {/* Photo with floral frame */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="relative mb-8"
      >
        <div className="relative aspect-[4/5] w-64 overflow-hidden rounded-lg border-4 border-pink-400/30 bg-rose-50/50 shadow-2xl shadow-pink-900/20 sm:w-80">
          {mainPhoto?.src ? (
            <motion.img
              initial={{ filter: 'blur(8px)' }}
              animate={{ filter: 'blur(0px)' }}
              transition={{ duration: 1.5, delay: 0.5 }}
              src={mainPhoto.src}
              alt={mainPhoto.alt || 'Mom\'s photo'}
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-6xl">
              👩
            </div>
          )}
          {/* Soft glow overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-pink-200/20 to-transparent" />
        </div>
      </motion.div>

      {/* Text */}
      {showText && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-3"
        >
          <p className="font-serif text-xl font-semibold text-pink-100/90">
            My first home.
          </p>
          <p className="font-serif text-xl text-pink-200">
            My forever comfort.
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
          className="mt-12 rounded-full border-2 border-pink-400/50 bg-pink-500/20 px-8 py-3 font-serif text-base font-semibold text-pink-100 backdrop-blur-sm transition-all hover:bg-pink-500/30"
        >
          Continue →
        </motion.button>
      )}
    </div>
  )
}
