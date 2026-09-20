import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useMemo, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { ScreenShell } from '../../shared/ScreenShell'
import { BunnyIllustration } from '../components/BunnyIllustration'

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'] as const

interface Act1PasscodeProps {
  config: ExperienceConfig
  onSuccess: () => void
}

function resolvePin(config: ExperienceConfig) {
  const candidate = config.content.suspenseSubtext?.trim() ?? ''
  return /^\d{4}$/.test(candidate) ? candidate : '1234'
}

export function Act1Passcode({ config, onSuccess }: Act1PasscodeProps) {
  const pin = useMemo(() => resolvePin(config), [config])
  const [digits, setDigits] = useState('')
  const [shake, setShake] = useState(false)
  const [unlocked, setUnlocked] = useState(false)

  const pushKey = useCallback(
    (key: string) => {
      if (unlocked || digits.length >= 4) return
      if (!/^\d$/.test(key)) return
      const next = digits + key
      setDigits(next)
      if (next.length === 4) {
        if (next === pin) {
          setUnlocked(true)
          setTimeout(onSuccess, 650)
        } else {
          setShake(true)
          setTimeout(() => {
            setDigits('')
            setShake(false)
          }, 450)
        }
      }
    },
    [digits, onSuccess, pin, unlocked],
  )

  return (
    <ScreenShell className="justify-center bg-[#FFF0F3] py-24">
      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
        <div className="w-40 sm:w-48 lg:w-56">
          <BunnyIllustration className="mx-auto h-44 w-44 sm:h-52 sm:w-52" />
          <p className="mt-3 text-center font-serif text-sm italic text-rose-400/90">
            {config.content.teaserHeading}
          </p>
        </div>

        <div className="w-full max-w-xs">
          <p className="mb-4 text-center text-xs font-bold tracking-[0.26em] text-rose-500/80 uppercase">
            Enter the secret code
          </p>

          <motion.div
            animate={shake ? { x: [-8, 8, -6, 6, 0] } : { x: 0 }}
            transition={{ duration: 0.35 }}
            className="mb-6 flex justify-center gap-3"
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <span
                key={i}
                className="flex h-12 w-11 items-center justify-center rounded-xl border-2 border-rose-200/80 bg-white/90 text-xl font-bold text-rose-600 shadow-sm"
              >
                {digits[i] ? '•' : ''}
              </span>
            ))}
          </motion.div>

          <div className="grid grid-cols-3 gap-2.5">
            {KEYS.map((key) => (
              <motion.button
                key={key}
                type="button"
                onClick={() => pushKey(key)}
                whileTap={{ scale: 0.92 }}
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
