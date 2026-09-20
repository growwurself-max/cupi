import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { ScreenShell } from '../../shared/ScreenShell'

interface Act5LetterProps {
  config: ExperienceConfig
  onOpen: () => void
  onContinue: () => void
}

export function Act5Letter({ config, onOpen, onContinue }: Act5LetterProps) {
  const [opened, setOpened] = useState(false)

  const unseal = () => {
    if (opened) return
    onOpen()
    setOpened(true)
    setTimeout(onContinue, 4500)
  }

  return (
    <ScreenShell className="bg-[#FDFBF7] py-24">
      {!opened ? (
        <motion.button
          type="button"
          onClick={unseal}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.96 }}
          className="relative z-10 outline-none"
          aria-label="Tap to open the sealed letter"
        >
          <svg viewBox="0 0 240 160" className="h-36 w-56 drop-shadow-lg sm:h-40 sm:w-64">
            <rect x="20" y="40" width="200" height="110" rx="4" fill="#F5E6C8" stroke="#D4AF37" strokeWidth="2" />
            <path d="M20 40 L120 95 L220 40" fill="#EDE0C4" stroke="#D4AF37" strokeWidth="2" />
            <motion.path
              d="M20 40 L120 95 L220 40"
              fill="#EDE0C4"
              animate={{ rotate: opened ? -25 : 0 }}
              style={{ transformOrigin: '120px 40px' }}
            />
            <circle cx="120" cy="88" r="22" fill="#B91C1C" stroke="#991B1B" strokeWidth="2" />
            <text x="120" y="94" textAnchor="middle" fill="#FDE68A" fontSize="14" fontFamily="serif">
              ♥
            </text>
          </svg>
          <p className="mt-4 text-center text-sm font-semibold text-amber-900/70">
            Tap the wax seal to open
          </p>
        </motion.button>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-md rounded-lg border border-amber-200/80 bg-[#FFF9F0] p-6 shadow-xl"
            style={{
              backgroundImage:
                'repeating-linear-gradient(transparent, transparent 27px, rgba(180,140,90,0.08) 28px)',
            }}
          >
            <span className="absolute -top-2 -right-2 text-xl" aria-hidden>
              ✨
            </span>
            <span className="absolute -bottom-1 -left-2 text-lg" aria-hidden>
              💕
            </span>
            <p className="font-serif text-lg font-bold text-amber-950">{config.content.letterIntro}</p>
            <div className="mt-4 space-y-3 font-serif text-sm leading-relaxed text-stone-700 italic">
              {(config.content.letterLines ?? []).map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            <p className="mt-6 text-right text-sm font-semibold text-amber-900/80">
              {config.content.letterSignoff} {config.sender.name}
            </p>
          </motion.div>
        </AnimatePresence>
      )}
    </ScreenShell>
  )
}
