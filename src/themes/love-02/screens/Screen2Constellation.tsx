import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { ScreenShell } from '../../shared/ScreenShell'

const STAR_POINTS = [
  { x: 18, y: 62 },
  { x: 34, y: 44 },
  { x: 50, y: 22 },
  { x: 66, y: 44 },
  { x: 82, y: 62 },
  { x: 50, y: 72 },
]

interface Screen2ConstellationProps {
  config: ExperienceConfig
  onStar: () => void
  onContinue: () => void
}

export function Screen2Constellation({
  config,
  onStar,
  onContinue,
}: Screen2ConstellationProps) {
  const [lit, setLit] = useState<boolean[]>(() => STAR_POINTS.map(() => false))
  const litCount = lit.filter(Boolean).length
  const complete = litCount === STAR_POINTS.length

  const lightStar = (index: number) => {
    if (lit[index]) return
    onStar()
    setLit((prev) => prev.map((value, i) => (i === index ? true : value)))
  }

  return (
    <ScreenShell className="surface-obsidian">
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-full border border-violet-200/30 bg-white/5 px-4 py-1.5 text-xs font-bold tracking-[0.3em] text-violet-200/80 uppercase"
      >
        Constellation Aura
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.6 }}
        className="font-display mt-5 text-balance text-center text-3xl font-black sm:text-4xl"
      >
        <span className="text-gradient-lux">{config.content.suspenseHeading}</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="mt-3 max-w-md text-center text-sm text-violet-100/60"
      >
        {config.content.suspenseSubtext}
      </motion.p>

      <div className="relative z-10 mt-10 w-full max-w-md">
        <div className="relative aspect-square w-full rounded-3xl border border-violet-300/20 bg-violet-950/30">
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(167,139,250,0.12),transparent_60%)]"
          />
          {STAR_POINTS.map((point, index) => {
            const isLit = lit[index]
            return (
              <motion.button
                key={`star-${index}`}
                type="button"
                onClick={() => lightStar(index)}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: isLit ? 1.3 : 1 }}
                transition={{
                  delay: 0.4 + index * 0.14,
                  type: 'spring',
                  stiffness: 180,
                }}
                whileTap={{ scale: 0.7 }}
                className="absolute z-10 -translate-x-1/2 -translate-y-1/2 outline-none"
                style={{ left: `${point.x}%`, top: `${point.y}%` }}
                aria-label={`Star ${index + 1}${isLit ? ', lit' : ''}`}
              >
                {isLit ? (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: [1.4, 1], rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="block text-3xl drop-shadow-[0_0_14px_rgba(167,139,250,1)]"
                  >
                    ⭐
                  </motion.span>
                ) : (
                  <motion.span
                    animate={{ opacity: [0.35, 0.8, 0.35] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                    className="block text-xl text-violet-300"
                  >
                    ✦
                  </motion.span>
                )}
              </motion.button>
            )
          })}

          {/* Connecting lines */}
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {STAR_POINTS.slice(1).map((_, i) => {
              const a = STAR_POINTS[i]
              const b = STAR_POINTS[i + 1]
              const aLit = lit[i]
              const bLit = lit[i + 1]
              return (
                <line
                  key={`line-${i}`}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={aLit && bLit ? '#a78bfa' : '#4a3f63'}
                  strokeWidth={aLit && bLit ? 0.6 : 0.3}
                  strokeOpacity={0.9}
                />
              )
            })}
          </svg>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs">
          <span className="font-semibold tracking-[0.2em] text-violet-200/70 uppercase">
            {litCount} / {STAR_POINTS.length} stars
          </span>
          <AnimatePresence>
            {complete ? (
              <motion.span
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-bold text-violet-300"
              >
                The sky is yours ✨
              </motion.span>
            ) : (
              <motion.span
                exit={{ opacity: 0 }}
                className="text-violet-200/50"
              >
                tap every star
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {complete && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 160, damping: 18 }}
            className="relative z-10 mt-10"
          >
            <motion.button
              type="button"
              onClick={onContinue}
              animate={{ boxShadow: ['0 0 24px -6px rgba(167,139,250,0.5)', '0 0 48px -6px rgba(167,139,250,0.9)', '0 0 24px -6px rgba(167,139,250,0.5)'] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 px-9 text-base font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.04] active:scale-95"
            >
              Break the wax seal
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </ScreenShell>
  )
}