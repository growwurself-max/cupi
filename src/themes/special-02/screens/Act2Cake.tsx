import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { CandleFlame } from '../../shared/InteractiveCandle'
import { ScreenShell } from '../../shared/ScreenShell'

interface Act2CakeProps {
  config: ExperienceConfig
  onBlowOut: () => void
}

export function Act2Cake({ config, onBlowOut }: Act2CakeProps) {
  const photo = config.content.photos[0]
  const [unwrapped, setUnwrapped] = useState(false)
  const [lit, setLit] = useState(true)
  const [blown, setBlown] = useState(false)

  const blow = useCallback(() => {
    if (!lit || blown) return
    setLit(false)
    setBlown(true)
    setTimeout(onBlowOut, 1400)
  }, [blown, lit, onBlowOut])

  return (
    <ScreenShell className="bg-[#FFF0F3] py-24">
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-xs font-bold tracking-[0.28em] text-rose-400 uppercase"
      >
        Photo & candle wish
      </motion.p>

      <motion.button
        type="button"
        onClick={() => setUnwrapped(true)}
        initial={{ opacity: 0, scale: 0.9, rotate: -4 }}
        animate={{ opacity: 1, scale: 1, rotate: unwrapped ? 0 : -2 }}
        transition={{ type: 'spring', stiffness: 120 }}
        className="relative z-10 mt-8 w-full max-w-xs outline-none"
      >
        <motion.div
          animate={unwrapped ? { scale: 1.02 } : {}}
          className="relative overflow-hidden rounded-2xl border-4 border-white bg-white p-3 shadow-xl shadow-rose-200/50"
        >
          {photo ? (
            <img
              src={photo.src}
              alt={photo.alt}
              className="aspect-[4/5] w-full rounded-lg object-cover"
            />
          ) : (
            <div className="flex aspect-[4/5] items-center justify-center rounded-lg bg-rose-50 text-4xl">
              📷
            </div>
          )}
          <p className="mt-2 text-center text-sm font-semibold text-rose-600">
            {photo?.caption ?? 'For you'}
          </p>
          {!unwrapped && (
            <motion.span
              initial={{ x: '-120%' }}
              animate={{ x: '120%' }}
              transition={{ duration: 1.2, repeat: 2, ease: 'easeInOut' }}
              className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent"
            />
          )}
        </motion.div>
        {!unwrapped && (
          <p className="mt-2 text-center text-xs font-medium text-rose-400">Tap to unwrap 🎀</p>
        )}
      </motion.button>

      <div className="relative z-10 mt-10 flex flex-col items-center">
        <div className="relative flex flex-col items-center">
          <CandleFlame lit={lit} />
          <div className="relative -mt-2 flex flex-col items-center">
            <div className="h-10 w-2 rounded-t bg-gradient-to-b from-rose-300 to-rose-400" />
            <button
              type="button"
              onClick={blow}
              className="relative mt-0 w-44 rounded-2xl border-2 border-rose-200 bg-gradient-to-b from-rose-50 to-pink-100 px-4 py-5 shadow-lg outline-none transition-transform active:scale-[0.98] sm:w-52"
              aria-label="Blow out the candle"
            >
              <div className="absolute inset-x-3 top-0 h-3 rounded-b-xl bg-white/90" />
              <p className="relative z-10 text-center text-xs font-bold tracking-wide text-rose-700 uppercase">
                Happy Birthday
              </p>
              <span className="mt-1 block text-center text-lg">🍓 🎂 🍓</span>
            </button>
          </div>
        </div>

        <motion.button
          type="button"
          onClick={blow}
          disabled={!lit}
          whileTap={{ scale: 0.96 }}
          className="mt-6 rounded-full bg-white/90 px-6 py-2.5 text-sm font-bold text-rose-600 shadow-md disabled:opacity-40"
        >
          Blow 💨
        </motion.button>

        <AnimatePresence>
          {!lit && (
            <motion.div
              initial={{ opacity: 0.8, y: 0 }}
              animate={{ opacity: 0, y: -30 }}
              className="pointer-events-none mt-2 flex gap-2 text-stone-400"
            >
              <span>💨</span>
              <span>✨</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ScreenShell>
  )
}
