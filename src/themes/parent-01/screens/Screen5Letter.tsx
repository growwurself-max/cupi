import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'

interface Screen5LetterProps {
  config: ExperienceConfig
  onContinue: () => void
}

export function Screen5Letter({ config, onContinue }: Screen5LetterProps) {
  const [showHeading, setShowHeading] = useState(false)
  const [showPhoto1, setShowPhoto1] = useState(false)
  const [showPhoto2, setShowPhoto2] = useState(false)
  const [showPhoto3, setShowPhoto3] = useState(false)
  const [showContinue, setShowContinue] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setShowHeading(true), 800)
    const t2 = setTimeout(() => setShowPhoto1(true), 1800)
    const t3 = setTimeout(() => setShowPhoto2(true), 3500)
    const t4 = setTimeout(() => setShowPhoto3(true), 5200)
    const t5 = setTimeout(() => setShowContinue(true), 6800)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
      clearTimeout(t5)
    }
  }, [])

  const photos = config.content.photos?.slice(1) || []

  return (
    <div className="relative flex h-full flex-col items-center justify-center px-6 bg-[#0a0f1a]/70">
      {/* Subtle background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(10,15,26,0.42)_100%)]" />

      <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center max-w-2xl">
        {/* Heading */}
        {showHeading && (
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="mb-12 font-serif text-2xl font-light text-[#f5f0e8] sm:text-3xl lg:text-4xl tracking-tight"
          >
            Some of my favorite memories have you in them.
          </motion.h2>
        )}

        {/* Photo 1 */}
        {showPhoto1 && photos[0] && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2 }}
            className="mb-8 w-full max-w-lg"
          >
            <div className="relative overflow-hidden rounded-lg bg-[#0a0f1a]/70">
              <img
                src={photos[0].src}
                alt={photos[0].alt || 'Memory'}
                className="h-64 w-full object-contain object-center sm:h-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a]/60 to-transparent" />
              {photos[0].caption && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="absolute bottom-4 left-4 right-4 font-sans text-xs font-light text-[#f5f0e8]/80 tracking-wide"
                >
                  {photos[0].caption}
                </motion.p>
              )}
            </div>
          </motion.div>
        )}

        {/* Photo 2 */}
        {showPhoto2 && photos[1] && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2 }}
            className="mb-8 w-full max-w-lg"
          >
            <div className="relative overflow-hidden rounded-lg bg-[#0a0f1a]/70">
              <img
                src={photos[1].src}
                alt={photos[1].alt || 'Memory'}
                className="h-64 w-full object-contain object-center sm:h-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a]/60 to-transparent" />
              {photos[1].caption && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="absolute bottom-4 left-4 right-4 font-sans text-xs font-light text-[#f5f0e8]/80 tracking-wide"
                >
                  {photos[1].caption}
                </motion.p>
              )}
            </div>
          </motion.div>
        )}

        {/* Photo 3 */}
        {showPhoto3 && photos[2] && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2 }}
            className="mb-12 w-full max-w-lg"
          >
            <div className="relative overflow-hidden rounded-lg bg-[#0a0f1a]/70">
              <img
                src={photos[2].src}
                alt={photos[2].alt || 'Memory'}
                className="h-64 w-full object-contain object-center sm:h-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a]/60 to-transparent" />
              {photos[2].caption && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="absolute bottom-4 left-4 right-4 font-sans text-xs font-light text-[#f5f0e8]/80 tracking-wide"
                >
                  {photos[2].caption}
                </motion.p>
              )}
            </div>
          </motion.div>
        )}

        {/* Continue button */}
        {showContinue && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onContinue}
            className="border border-[#c9a959]/30 bg-[#c9a959]/5 px-10 py-3 font-sans text-xs font-light tracking-[0.25em] text-[#c9a959]/80 transition-all hover:bg-[#c9a959]/10 hover:border-[#c9a959]/40"
          >
            Continue
          </motion.button>
        )}
      </div>
    </div>
  )
}
