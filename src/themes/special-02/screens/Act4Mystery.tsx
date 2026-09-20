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
  const [picked, setPicked] = useState<MysteryPick | null>(null)
  const [overlay, setOverlay] = useState<string | null>(null)

  const openGift = (yes: boolean) => {
    if (!yes) return
    setAsked(true)
  }

  const pick = (type: MysteryPick) => {
    if (picked) return
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
    <ScreenShell className="bg-[#FFF0F3] py-24">
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
            <button
              type="button"
              onClick={() => openGift(true)}
              className="min-h-12 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 px-8 text-sm font-bold text-white shadow-lg"
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => openGift(false)}
              className="min-h-12 rounded-full border border-rose-200 bg-white/90 px-8 text-sm font-semibold text-rose-600"
            >
              No
            </button>
          </div>
          <p className="text-xs text-rose-400/80">(Psst… Yes is the way 🎁)</p>
        </motion.div>
      ) : (
        <>
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
            ).map((item) => (
              <motion.button
                key={item.id}
                type="button"
                onClick={() => pick(item.id)}
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
