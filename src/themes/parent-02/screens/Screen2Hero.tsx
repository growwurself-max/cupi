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
        <div className="relative aspect-[4/5] w-64 overflow-hidden rounded-2xl border-4 border-white/80 bg-rose-50/50 shadow-2xl shadow-rose-300/40 sm:w-80">
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
          <div className="absolute inset-0 bg-gradient-to-t from-rose-200/30 to-transparent" />
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
          <p className="font-display text-xl font-semibold text-rose-800 sm:text-2xl">
            My first home.
          </p>
          <p className="font-script text-2xl text-rose-500 sm:text-3xl">
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
          className="mt-12 rounded-full border border-white/80 bg-white/75 px-8 py-3 font-display text-base font-semibold text-rose-700 shadow-[0_14px_32px_-16px_rgba(219,39,119,0.55)] backdrop-blur-md transition-all hover:bg-white hover:text-rose-800"
        >
          Continue →
        </motion.button>
      )}
    </div>
  )
}
