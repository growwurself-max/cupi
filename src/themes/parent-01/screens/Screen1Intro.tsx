import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'

interface Screen1IntroProps {
  config: ExperienceConfig
  onBegin: () => void
}

export function Screen1Intro({ config, onBegin }: Screen1IntroProps) {
  const [showLine1, setShowLine1] = useState(false)
  const [showHeading, setShowHeading] = useState(false)
  const [showSubtext, setShowSubtext] = useState(false)
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setShowLine1(true), 2000)
    const t2 = setTimeout(() => setShowHeading(true), 4500)
    const t3 = setTimeout(() => setShowSubtext(true), 5500)
    const t4 = setTimeout(() => setShowButton(true), 6500)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
    }
  }, [])

  return (
    <div className="relative flex h-full flex-col items-center justify-center px-6 bg-[#0a0f1a]/70">
      {/* Subtle cinematic light sweep */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <motion.div
          animate={{
            x: ['-30%', '130%'],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute top-0 h-full w-1/4 bg-gradient-to-r from-transparent via-[#c9a959]/8 to-transparent"
        />
      </motion.div>

      {/* Subtle vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(10,15,26,0.4)_100%)]" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl">
        {/* Opening line - small, cinematic */}
        {showLine1 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
            className="mb-20 font-sans text-[11px] font-light tracking-[0.35em] text-[#c9a959]/50 uppercase"
          >
            {config.content.teaserHeading}
          </motion.p>
        )}

        {/* Main heading - elegant serif */}
        {showHeading && (
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.8, ease: 'easeOut' }}
            className="mb-8 font-serif text-4xl font-light text-[#f5f0e8] sm:text-5xl lg:text-6xl tracking-tight leading-tight"
          >
            Happy Birthday, Dad.
          </motion.h1>
        )}

        {/* Subtext - clean sans-serif */}
        {showSubtext && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="mb-16 font-sans text-sm font-light text-[#f5f0e8]/60 tracking-wide"
          >
            {config.content.teaserSubtext}
          </motion.p>
        )}

        {/* Begin button - minimal and elegant */}
        {showButton && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onBegin}
            className="border border-[#c9a959]/30 bg-[#c9a959]/5 px-14 py-4 font-sans text-xs font-light tracking-[0.25em] text-[#c9a959]/80 transition-all hover:bg-[#c9a959]/10 hover:border-[#c9a959]/40"
          >
            Begin
          </motion.button>
        )}
      </div>
    </div>
  )
}
