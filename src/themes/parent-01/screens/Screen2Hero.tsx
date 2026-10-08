import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'

interface Screen2HeroProps {
  config: ExperienceConfig
  onContinue: () => void
}

export function Screen2Hero({ config, onContinue }: Screen2HeroProps) {
  const [showName, setShowName] = useState(false)
  const [showMessage, setShowMessage] = useState(false)
  const [showContinue, setShowContinue] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setShowName(true), 1500)
    const t2 = setTimeout(() => setShowMessage(true), 2500)
    const t3 = setTimeout(() => setShowContinue(true), 4000)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [])

  const mainPhoto = config.content.photos?.[0]

  return (
    <div className="relative flex h-full flex-col items-center justify-center bg-[#0a0f1a]/70">
      {/* Cinematic photo container - full width with slow zoom */}
      <div className="absolute inset-0 overflow-hidden bg-[#0a0f1a]/30">
        {mainPhoto?.src ? (
          <motion.img
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 8, ease: 'easeOut' }}
            src={mainPhoto.src}
            alt={mainPhoto.alt || 'Dad\'s photo'}
            className="h-full w-full object-contain object-center"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-b from-[#1a1f2e] to-[#0a0f1a]">
            <span className="text-8xl text-[#c9a959]/20">👨</span>
          </div>
        )}
        
        {/* Cinematic dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a] via-[#0a0f1a]/40 to-[#0a0f1a]/60" />
        
        {/* Soft vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(10,15,26,0.4)_100%)]" />
      </div>

      {/* Text overlay - elegant typography */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center max-w-2xl">
        {/* Name - elegant serif */}
        {showName && (
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="mb-8 font-serif text-5xl font-light text-[#f5f0e8] sm:text-6xl lg:text-7xl tracking-tight"
          >
            {config.content.suspenseHeading}
          </motion.h2>
        )}

        {/* Message - clean sans-serif */}
        {showMessage && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
            className="mb-16 font-sans text-base font-light text-[#f5f0e8]/80 leading-relaxed sm:text-lg"
          >
            {config.content.suspenseSubtext}
          </motion.p>
        )}

        {/* Continue button - minimal */}
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
