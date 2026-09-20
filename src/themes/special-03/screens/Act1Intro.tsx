import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { ScreenShell } from '../../shared/ScreenShell'
import { CoupleIllustration } from '../components/CoupleIllustration'

interface Act1IntroProps {
  config: ExperienceConfig
  onYes: () => void
}

export function Act1Intro({ config, onYes }: Act1IntroProps) {
  const [noPos, setNoPos] = useState({ x: 0, y: 0 })

  const question = useMemo(
    () =>
      `Happy Birthday, ${config.recipient.name} — Are you excited for what's next?`,
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
    <ScreenShell className="bg-[#FDFBF7] py-24">
      <CoupleIllustration />
      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 mt-6 max-w-md text-center font-serif text-xl font-bold text-amber-950/90 italic sm:text-2xl"
      >
        {question}
      </motion.p>
      <div className="relative z-10 mt-8 flex items-center justify-center gap-4">
        <motion.button
          type="button"
          onClick={onYes}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          className="min-h-12 rounded-full bg-gradient-to-r from-amber-600 to-rose-500 px-9 text-sm font-bold text-white shadow-lg"
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
          animate={{ x: noPos.x, y: noPos.y }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className="min-h-12 rounded-full border border-amber-200 bg-white/95 px-8 text-sm font-semibold text-amber-900"
        >
          No
        </motion.button>
      </div>
    </ScreenShell>
  )
}
