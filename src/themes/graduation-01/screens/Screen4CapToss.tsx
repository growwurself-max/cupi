import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { fireGoldenRain, fireSideCannons } from '../../../utils/confetti'
import { ScreenShell } from '../../shared/ScreenShell'
import { FloatingEmojis } from '../../shared/FloatingEmojis'

interface CapTossScreenProps {
  config: ExperienceConfig
  onToss: () => void
  onContinue: () => void
}

export function CapTossScreen({ config, onToss, onContinue }: CapTossScreenProps) {
  const [tossed, setTossed] = useState(false)
  const [show, setShow] = useState(false)

  const toss = () => {
    if (tossed) return
    setTossed(true)
    onToss()
    fireSideCannons()
    fireGoldenRain(2200)
    setTimeout(() => setShow(true), 500)
  }

  return (
    <ScreenShell>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(245,194,102,0.14),transparent_55%)]"
      />
      <FloatingEmojis emojis={['🎉', '✨']} count={9} />

      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-xs font-bold tracking-[0.35em] uppercase"
        style={{ color: config.branding.accentColor }}
      >
        {config.content.revealHeading}
      </motion.p>

      {/* Cap toss */}
      <div className="relative z-10 mt-12 flex h-56 w-56 items-center justify-center">
        {tossed && (
          <motion.span
            aria-hidden
            initial={{ y: 0, scale: 1, rotate: 0, opacity: 1 }}
            animate={{ y: -190, scale: 0.7, rotate: 340, opacity: 0 }}
            transition={{ duration: 2.2, ease: 'easeOut' }}
            className="pointer-events-none absolute text-7xl drop-shadow-[0_18px_30px_rgba(0,0,0,0.5)]"
          >
            🎓
          </motion.span>
        )}
        <motion.button
          type="button"
          onClick={toss}
          disabled={tossed}
          aria-label={tossed ? 'Cap tossed' : 'Throw your cap'}
          whileHover={tossed ? undefined : { scale: 1.08 }}
          whileTap={tossed ? undefined : { scale: 0.8 }}
          animate={tossed ? { y: [0, -26, 0], rotate: [0, -12, 12, 0] } : { y: [0, -10, 0] }}
          transition={
            tossed
              ? { duration: 0.8, repeat: Infinity }
              : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
          }
          className="flex h-40 w-40 select-none flex-col items-center justify-center gap-1 rounded-full bg-gradient-to-b from-[#1b2a3f] to-[#0f1a2b] outline-none "
          style={{ border: '1px solid rgba(245,194,102,0.4)' }}
        >
          <span className="text-5xl">🎓</span>
          <span className="text-xs font-black tracking-[0.2em] text-amber-200 uppercase">
            {tossed ? 'in the air!' : 'throw it'}
          </span>
        </motion.button>
      </div>

      <motion.p
        animate={{ opacity: tossed ? 0.6 : [0.45, 1, 0.45] }}
        transition={{ duration: 1.6, repeat: Infinity }}
        className="relative z-10 mt-6 max-w-sm text-center text-sm font-semibold text-white/70"
      >
        {tossed ? 'And up it goes. 🎉' : config.content.revealSubtext}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: show ? 1 : 0, y: show ? 0 : 16 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 mt-8 flex flex-col items-center gap-3"
      >
        <motion.h2
          initial={{ scale: 0.7 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 130 }}
          className="font-display text-balance text-4xl font-black sm:text-5xl"
        >
          <span className="text-shimmer animate-shimmer">
            {config.recipient.name} approved it! 🎓
          </span>
        </motion.h2>
        <button
          type="button"
          onClick={onContinue}
          className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-[#f5c266] via-[#fff7e6] to-[#61e0c5] px-8 text-base font-bold text-obsidian-900 transition-transform duration-200 hover:scale-[1.05] active:scale-95"
        >
          Receive Your Diploma
          <ArrowRight className="h-5 w-5" />
        </button>
      </motion.div>
    </ScreenShell>
  )
}