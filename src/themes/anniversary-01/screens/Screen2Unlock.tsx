import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { FloatingParticles } from '../../shared/FloatingParticles'
import { ScreenShell } from '../../shared/ScreenShell'

interface UnlockScreenProps {
  config: ExperienceConfig
  onTurnKey: () => void
  onContinue: () => void
}

export function UnlockScreen({
  config,
  onTurnKey,
  onContinue,
}: UnlockScreenProps) {
  const [opened, setOpened] = useState(false)

  const turnKey = () => {
    if (opened) return
    setOpened(true)
    onTurnKey()
  }

  return (
    <ScreenShell>
      <FloatingParticles
        type="star-dust"
        colors={[config.branding.accentColor, config.branding.accentSecondary]}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(232,146,74,0.16),transparent_55%)]"
      />

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7, ease: 'easeOut' }}
        className="relative z-10 mb-8 text-center"
      >
        <h1 className="font-display text-balance text-4xl font-semibold text-white sm:text-5xl">
          {config.content.suspenseHeading}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-pretty text-sm leading-relaxed text-white/60 sm:text-base">
          {config.content.suspenseSubtext}
        </p>
      </motion.div>

      {/* Treasure box */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 90, damping: 15 }}
        style={{ perspective: 900 }}
        className="relative z-10 mt-2 w-full max-w-sm"
      >
        <div className="relative mx-auto flex h-56 w-56 flex-col items-center justify-center rounded-3xl border border-amber-200/25 bg-gradient-to-b from-[#3a2f24] to-[#241c14] shadow-2xl">
          {/* Lid */}
          <motion.div
            animate={opened ? { rotateX: -78, y: -70 } : { rotateX: 0, y: 0 }}
            transition={{ type: 'spring', stiffness: 90, damping: 12 }}
            style={{ transformOrigin: 'top center' }}
            className="absolute inset-x-4 top-4 h-8 rounded-xl bg-gradient-to-b from-[#f5b861] to-[#c98a3a] shadow-lg"
          >
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black tracking-[0.3em] text-obsidian-900/60 uppercase">
              {opened ? 'open' : 'years inside'}
            </span>
          </motion.div>

          {/* Body */}
          <div className="mt-10 flex flex-col items-center gap-2 text-center">
            <motion.span
              animate={opened ? { scale: 1.4, rotate: [0, 8, -8, 0] } : { scale: 1 }}
              transition={{ duration: 1.2 }}
              className="text-4xl"
            >
              🗝️
            </motion.span>
            <span className="text-xs font-semibold text-amber-100/70">
              {opened ? 'All our years, unlocked.' : 'Tap the key to turn it'}
            </span>
          </div>
        </div>

        {/* Key interaction */}
        <motion.button
          type="button"
          onClick={turnKey}
          aria-label={opened ? 'Box unlocked' : 'Turn the golden key'}
          whileTap={{ scale: 0.85 }}
          style={{ transformPerspective: 400 }}
          animate={opened ? { rotate: -100 } : { rotate: 0 }}
          transition={{ type: 'spring', stiffness: 140, damping: 10 }}
          className="absolute -right-4 bottom-2 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#ffd98a] to-[#c98a3a] text-3xl shadow-xl shadow-amber-500/20 outline-none"
        >
          🔑
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: opened ? 1 : 0, y: opened ? 0 : 16 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 mt-10"
      >
        <button
          type="button"
          onClick={onContinue}
          disabled={!opened}
          className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-[#f5b861] to-[#e8924a] px-8 text-base font-bold text-obsidian-900 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:saturate-0 hover:scale-[1.05] active:scale-95"
        >
          Open the Memory Box
          <ArrowRight className="h-5 w-5" />
        </button>
      </motion.div>

      {opened && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 text-xs font-semibold tracking-wide text-white/40 uppercase"
        >
          The lid lifts… run toward it ✨
        </motion.p>
      )}
    </ScreenShell>
  )
}