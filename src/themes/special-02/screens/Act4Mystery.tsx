import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { fireGoldenRain } from '../../../utils/confetti'
import { ScreenShell } from '../../shared/ScreenShell'

export type MysteryPick = 'camera' | 'bottle' | 'star'

interface Act4MysteryProps {
  onSelect: (type: MysteryPick) => void
}

export function Act4Mystery({ onSelect }: Act4MysteryProps) {
  const [asked, setAsked] = useState(false)
  const [lidOpen, setLidOpen] = useState(false)
  const [showItems, setShowItems] = useState(false)
  const [picked, setPicked] = useState<MysteryPick | null>(null)
  const [overlay, setOverlay] = useState<string | null>(null)
  const [noWobble, setNoWobble] = useState(false)

  const openGift = (yes: boolean) => {
    if (!yes) {
      setNoWobble(true)
      window.setTimeout(() => setNoWobble(false), 620)
      return
    }
    setAsked(true)
  }

  const openBox = () => {
    if (lidOpen) return
    setLidOpen(true)
    setTimeout(() => setShowItems(true), 720)
  }

  const pick = (type: MysteryPick) => {
    if (picked || !showItems) return
    setPicked(type)
    onSelect(type)
    if (type === 'camera') {
      setOverlay('📷 A memory just for you — peek at the polaroid ahead!')
    } else if (type === 'bottle') {
      setOverlay('🍾 Secret note: You are the wish I keep making.')
    } else {
      fireGoldenRain(2200)
      setOverlay('⭐ Gold confetti — because you shine.')
    }
  }

  return (
    <ScreenShell className="bg-[#FCEBEE] py-24">
      {!asked ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 flex flex-col items-center gap-5 text-center"
        >
          <p className="font-serif text-2xl font-bold text-rose-800 sm:text-3xl">
            Do you want to open your gift?
          </p>
          <div className="flex gap-4">
            <motion.button
              type="button"
              onClick={() => openGift(true)}
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.93 }}
              className="min-h-12 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 px-8 text-sm font-bold text-white shadow-lg"
            >
              Yes
            </motion.button>
            <motion.button
              type="button"
              onClick={() => openGift(false)}
              animate={noWobble ? { x: [0, -9, 9, -7, 7, -3, 3, 0], rotate: [0, -4, 4, -3, 3, -1, 1, 0] } : { x: 0, rotate: 0 }}
              transition={noWobble ? { duration: 0.55 } : { duration: 0.2 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="min-h-12 rounded-full border border-rose-200 bg-white/90 px-8 text-sm font-semibold text-rose-600"
            >
              No
            </motion.button>
          </div>
          <AnimatePresence>
            {noWobble && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs font-semibold text-rose-400"
              >
                Nice try — secretly it's a yes 😉
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      ) : (
        <>
          {!showItems ? (
            <motion.button
              type="button"
              onClick={openBox}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative z-10 flex flex-col items-center outline-none"
              aria-label="Tap the gift box"
              style={{ perspective: 720 }}
            >
              <div className="relative h-32 w-36 sm:h-36 sm:w-40">
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute inset-x-0 bottom-0 h-24 rounded-lg bg-gradient-to-b from-rose-300 to-pink-400 shadow-xl"
                />
                <motion.div
                  animate={lidOpen ? { rotateX: -118, y: -10 } : { rotateX: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 16 }}
                  style={{ transformOrigin: '50% 100%', transformStyle: 'preserve-3d' }}
                  className="absolute inset-x-1 bottom-[5.5rem] h-10 origin-bottom rounded-t-lg bg-gradient-to-b from-rose-200 to-rose-300 shadow-md"
                />
                <span className="absolute inset-x-0 bottom-8 text-center text-3xl">🎀</span>
              </div>
              <p className="mt-4 text-sm font-semibold text-rose-600">
                {lidOpen ? 'Opening…' : 'Tap the box to open'}
              </p>
            </motion.button>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="pointer-events-none relative z-10 mb-6 flex justify-center gap-2"
              >
                {['✨', '⭐', '✨', '💫', '✨'].map((s, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: [0, 1, 0], y: [-20, -40] }}
                    transition={{ duration: 0.9, delay: i * 0.06 }}
                  >
                    {s}
                  </motion.span>
                ))}
              </motion.div>
              <p className="relative z-10 mb-8 text-center text-xs font-bold tracking-[0.26em] text-rose-400 uppercase">
                Pick a mystery item
              </p>
              <div className="relative z-10 flex flex-wrap justify-center gap-4">
                {(
                  [
                    { id: 'camera' as const, emoji: '📷', label: 'Camera' },
                    { id: 'bottle' as const, emoji: '🍾', label: 'Wish Bottle' },
                    { id: 'star' as const, emoji: '⭐', label: 'Star' },
                  ] as const
                ).map((item, i) => (
                  <motion.button
                    key={item.id}
                    type="button"
                    onClick={() => pick(item.id)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.1, type: 'spring' }}
                    whileHover={{ scale: 1.05, y: -4 }}
                    whileTap={{ scale: 0.94 }}
                    disabled={picked !== null && picked !== item.id}
                    className="flex h-28 w-28 flex-col items-center justify-center rounded-3xl border-2 border-white bg-white/95 shadow-lg shadow-rose-100 outline-none disabled:opacity-40 sm:h-32 sm:w-32"
                  >
                    <span className="text-4xl">{item.emoji}</span>
                    <span className="mt-1 text-xs font-bold text-rose-600">{item.label}</span>
                  </motion.button>
                ))}
              </div>
            </>
          )}
        </>
      )}

      <AnimatePresence>
        {overlay && (
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="relative z-10 mt-10 max-w-sm text-center text-sm font-medium leading-relaxed text-rose-700/90"
          >
            {overlay}
          </motion.p>
        )}
      </AnimatePresence>
    </ScreenShell>
  )
}
