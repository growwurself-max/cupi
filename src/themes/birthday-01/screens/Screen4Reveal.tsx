import { motion } from 'framer-motion'
import { Mail, PartyPopper, Star, Trophy } from 'lucide-react'
import { useEffect } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { fireGrandBurst } from '../../../utils/confetti'
import { ScreenShell } from '../../shared/ScreenShell'

const BADGES = [
  { icon: PartyPopper, label: 'You made it', className: 'left-[8%] top-[18%]' },
  { icon: Star, label: 'So loved', className: 'right-[8%] top-[22%]' },
  { icon: Trophy, label: 'One of a kind', className: 'left-[12%] bottom-[24%]' },
]

interface Screen4RevealProps {
  config: ExperienceConfig
  onContinue: () => void
}

export function Screen4Reveal({ config, onContinue }: Screen4RevealProps) {
  useEffect(() => {
    fireGrandBurst()
  }, [])

  return (
    <ScreenShell>
      <div
        aria-hidden
        className="animate-pulse-glow pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(246,198,182,0.2),rgba(224,179,242,0.12)_45%,transparent_70%)]"
      />

      {/* Floating badges */}
      {BADGES.map(({ icon: Icon, label, className }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, scale: 0, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.8 + i * 0.22, type: 'spring', stiffness: 140 }}
          className={`absolute z-10 ${className}`}
        >
          <motion.div
            animate={{ y: [0, -10, 0], rotate: [i % 2 === 0 ? -3 : 3, i % 2 === 0 ? 3 : -3, i % 2 === 0 ? -3 : 3] }}
            transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut' }}
            className="glass-panel flex flex-col items-center gap-1.5 rounded-2xl px-4 py-3"
          >
            <Icon className="h-6 w-6 text-rose-gold" strokeWidth={1.8} />
            <span className="text-[11px] font-bold text-white/80">{label}</span>
          </motion.div>
        </motion.div>
      ))}

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.6 }}
        className="text-sm font-bold tracking-[0.3em] text-rose-gold uppercase"
      >
        {config.sender.name} has something to say
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, scale: 0.7, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.35, type: 'spring', stiffness: 110, damping: 16 }}
        className="font-display mt-4 text-center text-5xl font-bold sm:text-6xl md:text-7xl"
      >
        <span className="text-gradient-lux block">{config.content.revealHeading}</span>
        <span className="text-shimmer animate-shimmer mt-2 block uppercase">
          {config.recipient.name}
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="mt-6 max-w-md text-balance text-center text-white/65"
      >
        {config.content.revealSubtext}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.15, duration: 0.6 }}
        className="relative z-10 mt-12"
      >
        <motion.button
          type="button"
          onClick={onContinue}
          animate={{
            boxShadow: [
              '0 0 24px -4px rgba(246,198,182,0.5)',
              '0 0 44px -4px rgba(246,198,182,0.85)',
              '0 0 24px -4px rgba(246,198,182,0.5)',
            ],
          }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-rose-gold via-soft-amber to-soft-violet px-8 text-base font-bold text-obsidian-900 transition-transform duration-200 hover:scale-[1.05] active:scale-95"
        >
          <Mail className="h-5 w-5" />
          Read Your Message 💌
        </motion.button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.35, 0.8, 0.35] }}
        transition={{ delay: 1.5, duration: 2, repeat: Infinity }}
        className="mt-8 text-xs font-semibold tracking-wide text-white/40 uppercase"
      >
        Confetti secured. Keep scrolling…
      </motion.p>
    </ScreenShell>
  )
}