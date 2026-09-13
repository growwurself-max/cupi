import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { FloatingEmojis } from '../../shared/FloatingEmojis'
import { FloatingParticles } from '../../shared/FloatingParticles'
import { ScreenShell } from '../../shared/ScreenShell'

interface BestieAlertProps {
  config: ExperienceConfig
  onBegin: () => void
}

export function BestieAlertScreen({ config, onBegin }: BestieAlertProps) {
  const [slammed, setSlammed] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setSlammed(true), 1250)
    return () => clearTimeout(t)
  }, [])

  return (
    <ScreenShell>
      <FloatingParticles
        type="emoji-stickers"
        colors={[config.branding.accentColor, config.branding.accentSecondary]}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(251,146,60,0.16),transparent_55%)]"
      />
      <FloatingEmojis emojis={['✨', '🍕', '💖', '🤪', '🥳', '🥑']} count={12} />

      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-10 mb-8 flex flex-col items-center"
      >
        <motion.span
          animate={{ rotate: [-3, 3, -3] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border-2 border-rose-300 bg-white/85 px-5 py-2 text-sm font-black tracking-widest text-rose-600 uppercase shadow-lg shadow-rose-200/60 backdrop-blur-md"
        >
          🚨 Bestie Alert 🚨
        </motion.span>

        <div className="relative flex items-center justify-center">
          <motion.div
            initial={{ x: -220, y: 50, rotate: 24 }}
            animate={{ x: 0, y: 0, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 250, damping: 14, delay: 0.35 }}
            className="relative z-[1] -mr-7 flex h-32 w-32 items-center justify-center rounded-full border border-orange-200/80 bg-white/85 text-7xl shadow-[0_18px_40px_-16px_rgba(251,146,60,0.65)] backdrop-blur-md"
          >
            🙌
          </motion.div>
          <motion.div
            initial={{ x: 220, y: 50, rotate: -24 }}
            animate={{ x: 0, y: 0, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 250, damping: 14, delay: 0.55 }}
            className="relative z-[1] -ml-7 flex h-32 w-32 items-center justify-center rounded-full border border-rose-200/80 bg-white/85 text-7xl shadow-[0_18px_40px_-16px_rgba(244,63,94,0.55)] backdrop-blur-md"
          >
            🙌
          </motion.div>

          <div className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center">
            <AnimatePresence>
              {slammed && (
                <motion.span
                  key="smack"
                  initial={{ opacity: 0, scale: 0.2 }}
                  animate={{ opacity: [0, 1, 0], scale: [0.2, 1.5, 1.05] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.15, times: [0, 0.4, 1] }}
                  className="text-5xl"
                >
                  💥
                </motion.span>
              )}
            </AnimatePresence>
            {slammed && (
              <motion.span
                key="ring"
                initial={{ scale: 0.3, opacity: 0.9 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="absolute h-24 w-24 rounded-full border-4 border-orange-300/70"
              />
            )}
            {slammed && (
              <motion.span
                key="ring2"
                initial={{ scale: 0.4, opacity: 0.7 }}
                animate={{ scale: 2.4, opacity: 0 }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.12 }}
                className="absolute h-20 w-20 rounded-full border-2 border-rose-300/60"
              />
            )}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.7, ease: 'easeOut' }}
        className="relative z-10 flex max-w-2xl flex-col items-center gap-4 text-center"
      >
        <span className="rounded-full border border-orange-200/70 bg-white/70 px-4 py-1.5 text-xs font-bold tracking-[0.25em] text-rose-500 uppercase backdrop-blur-md">
          Emergency Broadcast
        </span>
        <h1 className="font-display text-balance text-4xl font-black text-[#9F1239] sm:text-5xl">
          {config.content.teaserHeading}
        </h1>
        <p className="max-w-md text-pretty text-sm leading-relaxed text-stone-600 sm:text-base">
          {config.content.teaserSubtext}
        </p>
        <motion.p
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.4, duration: 0.5 }}
          className="mt-2 rounded-full border border-violet-200/70 bg-white/80 px-5 py-2 text-sm font-bold text-violet-600 shadow-md shadow-violet-100 backdrop-blur-md"
        >
          Someone thinks you are an absolute legend.
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.95, duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 mt-10"
      >
        <button
          type="button"
          onClick={onBegin}
          className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-orange-400 to-rose-400 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-400/30 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          Answer the Call 📞
        </button>
      </motion.div>
    </ScreenShell>
  )
}