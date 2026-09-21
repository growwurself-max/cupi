import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useMemo, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { ScreenShell } from '../../shared/ScreenShell'
import { BunnyIllustration } from '../components/BunnyIllustration'

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'] as const

interface Act1PasscodeProps {
  config: ExperienceConfig
  /** Store demo / customizer preview — any 4 digits unlock. */
  demoPreview?: boolean
  onKeyTap?: () => void
  onSuccess: () => void
  onSkip?: () => void
}

function resolvePin(config: ExperienceConfig) {
  const candidate = config.content.suspenseSubtext?.trim() ?? ''
  return /^\d{4}$/.test(candidate) ? candidate : '1234'
}

export function Act1Passcode({
  config,
  demoPreview = false,
  onKeyTap,
  onSuccess,
  onSkip,
}: Act1PasscodeProps) {
  const pin = useMemo(() => resolvePin(config), [config])
  const [digits, setDigits] = useState('')
  const [shake, setShake] = useState(false)
  const [unlocked, setUnlocked] = useState(false)
  const [demoSuccess, setDemoSuccess] = useState(false)

  const acceptCode = useCallback(
    (code: string) => {
      if (demoPreview) return true
      return code === pin
    },
    [demoPreview, pin],
  )

  const unlock = useCallback(() => {
    setUnlocked(true)
    if (demoPreview) {
      setDemoSuccess(true)
      setTimeout(() => setDemoSuccess(false), 700)
    }
    setTimeout(onSuccess, 650)
  }, [demoPreview, onSuccess])

  const pushKey = useCallback(
    (key: string) => {
      if (unlocked || digits.length >= 4) return
      if (!/^\d$/.test(key)) return
      onKeyTap?.()
      const next = digits + key
      setDigits(next)
      if (next.length === 4) {
        if (acceptCode(next)) {
          unlock()
          return
        }

        setShake(true)
        setTimeout(() => {
          setDigits('')
          setShake(false)
        }, 450)
      }
    },
    [acceptCode, digits, onKeyTap, unlock, unlocked],
  )

  return (
    <ScreenShell className="justify-center bg-[#FCEBEE] py-24">
      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
        <div className="w-40 sm:w-48 lg:w-56">
          <div className={demoSuccess ? 'animate-[pulse_0.8s_ease-in-out_2]' : ''}>
            <BunnyIllustration className="mx-auto h-44 w-44 sm:h-52 sm:w-52" />
          </div>
          <p className="mt-3 text-center font-serif text-sm italic text-rose-400/90">
            {config.content.teaserHeading}
          </p>
        </div>

        <div className={`w-full max-w-xs ${demoSuccess ? 'rounded-2xl border border-emerald-200 bg-emerald-50/70 p-2 shadow-[0_0_25px_rgba(16,185,129,0.2)] transition-all duration-300' : ''}`}>
          {demoPreview && (
            <p className="mb-3 text-center">
              <span className="inline-block rounded-full border border-rose-200/80 bg-white/90 px-3 py-1 text-[11px] font-semibold text-rose-600 shadow-sm">
                Demo PIN: Any 4 digits (e.g., 1234)
              </span>
            </p>
          )}

          <p className="mb-4 text-center text-xs font-bold tracking-[0.26em] text-rose-500/80 uppercase">
            Enter the secret code
          </p>

          <motion.div
            animate={
              shake
                ? { x: [-8, 8, -6, 6, 0] }
                : demoSuccess
                  ? { scale: [1, 1.04, 1], boxShadow: '0 0 0 0 rgba(16,185,129,0.45)' }
                  : { scale: 1, boxShadow: '0 0 0 0 rgba(16,185,129,0)' }
            }
            transition={{ duration: 0.35 }}
            className="mb-6 flex justify-center gap-3"
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <span
                key={i}
                className="relative flex h-12 w-11 items-center justify-center overflow-hidden rounded-xl border-2 border-rose-200/80 bg-white/90 shadow-sm"
              >
                <AnimatePresence mode="popLayout">
                  {digits[i] ? (
                    <motion.span
                      key="star"
                      initial={{ scale: 0.4, rotate: -40, y: 8, opacity: 0 }}
                      animate={{ scale: 1, rotate: 0, y: 0, opacity: 1 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 520, damping: 18 }}
                      className="text-xl leading-none text-rose-500 drop-shadow-sm"
                    >
                      ✦
                    </motion.span>
                  ) : (
                    <motion.span
                      key="blank"
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 0.25 }}
                      exit={{ scale: 0.7, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="h-1.5 w-1.5 rounded-full bg-rose-200"
                    />
                  )}
                </AnimatePresence>
                {digits[i] && (
                  <motion.span
                    key="spark"
                    initial={{ opacity: 0.9, scale: 1, rotate: 0 }}
                    animate={{ opacity: 0, scale: 1.9, rotate: 24 }}
                    transition={{ duration: 0.55, ease: 'easeOut' }}
                    className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-rose-300"
                  >
                    ✨
                  </motion.span>
                )}
              </span>
            ))}
          </motion.div>

          <div className={`grid grid-cols-3 gap-2.5 ${demoSuccess ? 'ring-2 ring-emerald-300/80 ring-offset-2 ring-offset-[#FFF0F3]' : ''}`}>
            {KEYS.map((key) => (
              <motion.button
                key={key}
                type="button"
                onClick={() => pushKey(key)}
                whileHover={{ scale: 1.06, y: -2, boxShadow: '0 10px 22px -8px rgba(244,114,182,0.55)' }}
                whileTap={{ scale: 0.9, y: 1 }}
                transition={{ type: 'spring', stiffness: 420, damping: 17 }}
                className="flex h-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-300 to-pink-400 text-lg font-bold text-white shadow-md shadow-rose-200/60 outline-none"
                style={{
                  clipPath:
                    'polygon(50% 0%, 62% 12%, 78% 8%, 88% 22%, 100% 28%, 92% 44%, 100% 58%, 88% 68%, 78% 88%, 50% 100%, 22% 88%, 12% 68%, 0% 58%, 8% 44%, 0% 28%, 12% 22%, 22% 8%, 38% 12%)',
                }}
                aria-label={`Key ${key}`}
              >
                {key}
              </motion.button>
            ))}
          </div>

          {demoPreview && onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="mt-4 w-full text-center text-xs font-semibold text-rose-400/90 underline-offset-2 hover:text-rose-600 hover:underline"
            >
              Skip passcode → Screen 2
            </button>
          )}

          <AnimatePresence>
            {unlocked && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 text-center text-sm font-semibold text-emerald-600"
              >
                Unlocked! 🐰✨
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </ScreenShell>
  )
}
