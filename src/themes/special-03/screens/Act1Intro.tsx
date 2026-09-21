import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { ScreenShell } from '../../shared/ScreenShell'
import { CoupleAnimation } from '../components/CoupleIllustration'

interface Act1IntroProps {
  config: ExperienceConfig
  onYes: () => void
}

export function Act1Intro({ config, onYes }: Act1IntroProps) {
  const [noPos, setNoPos] = useState({ x: 0, y: 0 })

  const heading = useMemo(
    () => `Happy Birthday, ${config.recipient.name}`,
    [config.recipient.name],
  )

  const dodgeNo = () => {
    const range = Math.min(window.innerWidth, window.innerHeight) * 0.28
    setNoPos({
      x: (Math.random() - 0.5) * range * 2,
      y: (Math.random() - 0.5) * range,
    })
  }

  return (
    <ScreenShell
      background="linear-gradient(170deg, #FFF6F1 0%, #FCEDE8 52%, #F9DEDF 100%)"
      className="py-24"
    >
      {/* ambient warm auras */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 animate-pulse-glow rounded-full bg-[radial-gradient(circle,rgba(255,204,150,0.5),transparent_62%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-28 -left-24 h-80 w-80 rounded-full bg-[#F6BACB]/35 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -bottom-28 h-80 w-80 rounded-full bg-[#E7C4E4]/30 blur-3xl"
      />

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* eyebrow ornament */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-4 flex items-center gap-3 sm:mb-5"
        >
          <span className="h-px w-9 bg-gradient-to-r from-transparent to-[#C9933F]/70" />
          <p className="font-serif text-[11px] font-semibold tracking-[0.38em] text-[#B07A55] uppercase sm:text-xs">
            ✦ a story for you ✦
          </p>
          <span className="h-px w-9 bg-gradient-to-l from-transparent to-[#C9933F]/70" />
        </motion.div>

        <CoupleAnimation />

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6, ease: 'easeOut' }}
          className="mt-3 max-w-xl px-1 font-display text-4xl leading-tight font-semibold text-balance text-[#4A1525] tracking-wide drop-shadow-[0_2px_14px_rgba(122,45,63,0.14)] sm:text-5xl"
        >
          {heading}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
          className="mt-4 max-w-md px-1 font-serif text-lg tracking-wide text-[#8E4A5E] italic text-balance sm:text-xl"
        >
          Are you excited for what&rsquo;s next?
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.6, ease: 'easeOut' }}
          className="mt-10 flex flex-wrap items-center justify-center gap-5"
        >
          <motion.button
            type="button"
            onClick={onYes}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex min-h-12 items-center gap-2 rounded-full bg-gradient-to-r from-[#6E2739] via-[#932C4F] to-[#B43A5F] px-10 py-3.5 text-sm font-semibold tracking-[0.12em] text-[#FFF6F0] shadow-[0_14px_34px_-12px_rgba(110,39,57,0.65)] ring-1 ring-[#FFF]/25 transition-shadow duration-300 ring-inset hover:shadow-[0_20px_48px_-14px_rgba(110,39,57,0.8)]"
          >
            Yes
          </motion.button>
          <motion.button
            type="button"
            onMouseEnter={dodgeNo}
            onTouchStart={(e) => {
              e.preventDefault()
              dodgeNo()
            }}
            animate={{ x: noPos.x, y: noPos.y, rotate: [0, -2, 2, 0] }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="min-h-12 rounded-full border border-[#B07A6A]/35 bg-white/45 px-9 py-3.5 text-sm font-semibold tracking-[0.12em] text-[#7A2D45] shadow-[0_8px_24px_-14px_rgba(110,39,57,0.4)] backdrop-blur-sm transition-colors duration-300 hover:bg-white/75 hover:shadow-[0_14px_34px_-16px_rgba(110,39,57,0.5)]"
          >
            No
          </motion.button>
        </motion.div>
      </div>
    </ScreenShell>
  )
}