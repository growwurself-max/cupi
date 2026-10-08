import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'

interface Screen9FinalProps {
  config: ExperienceConfig
  onExit: () => void
}

export function Screen9Final({ config, onExit }: Screen9FinalProps) {
  const [showPhoto, setShowPhoto] = useState(false)
  const [showLine1, setShowLine1] = useState(false)
  const [showLine2, setShowLine2] = useState(false)
  const [showHeading, setShowHeading] = useState(false)
  const [showSignoff, setShowSignoff] = useState(false)
  const [showFooter, setShowFooter] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setShowPhoto(true), 600)
    const t2 = setTimeout(() => setShowLine1(true), 1500)
    const t3 = setTimeout(() => setShowLine2(true), 2500)
    const t4 = setTimeout(() => setShowHeading(true), 3800)
    const t5 = setTimeout(() => setShowSignoff(true), 4800)
    const t6 = setTimeout(() => setShowFooter(true), 6000)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
      clearTimeout(t5)
      clearTimeout(t6)
    }
  }, [])

  const mainPhoto = config.content.photos?.[0]
  const senderName = config.sender.name || 'Your son'

  return (
    <div className="relative flex h-full flex-col items-center justify-center px-6 bg-[#0a0f1a]/70">
      {/* Cinematic photo background */}
      <div className="absolute inset-0 overflow-hidden bg-[#0a0f1a]/70">
        {showPhoto && mainPhoto?.src ? (
          <motion.img
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2 }}
            src={mainPhoto.src}
            alt={mainPhoto.alt || 'Dad\'s photo'}
            className="h-full w-full object-contain object-center"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-b from-[#1a1f2e] to-[#0a0f1a]">
            <span className="text-8xl text-[#c9a959]/20">👨</span>
          </div>
        )}
        
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a] via-[#0a0f1a]/70 to-[#0a0f1a]/50" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center max-w-2xl">
        {/* Line 1 */}
        {showLine1 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="mb-6 font-serif text-2xl font-light text-[#f5f0e8] sm:text-3xl lg:text-4xl tracking-tight"
          >
            Whatever I become,
          </motion.p>
        )}

        {/* Line 2 */}
        {showLine2 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="mb-16 font-serif text-2xl font-light text-[#f5f0e8] sm:text-3xl lg:text-4xl tracking-tight"
          >
            I'll always be your son.
          </motion.p>
        )}

        {/* Final birthday heading */}
        {showHeading && (
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="mb-12 font-serif text-4xl font-light text-[#c9a959] sm:text-5xl lg:text-6xl tracking-tight"
          >
            Happy Birthday, Dad. ❤️
          </motion.h2>
        )}

        {/* Signoff */}
        {showSignoff && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
            className="mb-20 font-sans text-sm font-light text-[#f5f0e8]/60 tracking-wide"
          >
            With love, {senderName}
          </motion.p>
        )}

        {/* Footer */}
        {showFooter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="space-y-6"
          >
            <button
              onClick={onExit}
              className="border border-[#c9a959]/30 bg-[#c9a959]/5 px-10 py-3 font-sans text-xs font-light tracking-[0.25em] text-[#c9a959]/80 transition-all hover:bg-[#c9a959]/10 hover:border-[#c9a959]/40"
            >
              Close
            </button>
            <p className="font-sans text-xs font-light text-[#f5f0e8]/30 tracking-wide">
              Made with ❤️ on Cupi
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
