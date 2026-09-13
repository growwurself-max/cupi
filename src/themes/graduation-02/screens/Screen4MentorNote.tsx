import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { ScreenShell } from '../../shared/ScreenShell'

const MENTOR_LINES = [
  {
    emoji: '🧭',
    text: 'You asked twice, Googled once, and improvised the rest. That is a degree in real life.',
  },
  {
    emoji: '🤍',
    text: 'You owe nothing to anyone but the version of you that kept going. She is proud of you.',
  },
  {
    emoji: '🚀',
    text: 'Chapters close, but this one doesn‘t. Keep the curiosity — it outranks the certificate.',
  },
]

interface Screen4MentorNoteProps {
  onRead: () => void
  onContinue: () => void
}

export function Screen4MentorNote({
  onRead,
  onContinue,
}: Screen4MentorNoteProps) {
  const [readCount, setReadCount] = useState(0)
  const allRead = readCount >= MENTOR_LINES.length

  const readLine = () => {
    if (allRead) return
    onRead()
    setReadCount((prev) => prev + 1)
  }

  return (
    <ScreenShell className="surface-obsidian">
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-full border border-emerald-200/30 bg-white/5 px-4 py-1.5 text-xs font-bold tracking-[0.3em] text-emerald-200/80 uppercase"
      >
        Mentor & Family Note
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.6 }}
        className="font-display mt-5 text-balance text-center text-3xl font-black sm:text-4xl"
      >
        <span className="text-gradient-lux">Notes that survived graduation</span>
        <span className="mt-3 block text-sm font-sans font-medium text-slate-100/50 normal-case">
          open each one — they were written for you
        </span>
      </motion.h1>

      <div className="relative z-10 mt-10 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
        {MENTOR_LINES.map((line, index) => {
          const isRead = index < readCount
          return (
            <motion.button
              key={line.text}
              type="button"
              onClick={readLine}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + index * 0.15, type: 'spring', stiffness: 120 }}
              whileTap={{ scale: 0.95 }}
              className={`relative flex min-h-48 flex-col justify-between gap-3 rounded-3xl border p-5 text-left transition-all duration-500 ${
                isRead
                  ? 'border-emerald-300/50 bg-emerald-400/10 shadow-[0_0_36px_-8px_rgba(110,231,183,0.45)]'
                  : 'border-white/10 bg-white/[0.04] hover:border-emerald-200/40'
              }`}
            >
              <AnimatePresence mode="wait">
                {!isRead ? (
                  <motion.span
                    key="seal"
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.4, rotate: 12 }}
                    transition={{ duration: 0.35 }}
                    className="self-end rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold text-emerald-200/80 uppercase"
                  >
                    tap to open 🔖
                  </motion.span>
                ) : (
                  <motion.span
                    key="open"
                    initial={{ opacity: 0, scale: 0.5, rotate: -16 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 180 }}
                    className="self-start text-4xl"
                  >
                    {line.emoji}
                  </motion.span>
                )}
              </AnimatePresence>

              {isRead && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-sm leading-relaxed text-emerald-50/90"
                >
                  {line.text}
                </motion.p>
              )}
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence>
        {allRead && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 160, damping: 18 }}
            className="relative z-10 mt-10"
          >
            <motion.button
              type="button"
              onClick={onContinue}
              animate={{ boxShadow: ['0 0 24px -6px rgba(224,178,75,0.5)', '0 0 48px -6px rgba(224,178,75,0.9)', '0 0 24px -6px rgba(224,178,75,0.5)'] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-500 to-emerald-400 px-9 text-base font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.04] active:scale-95"
            >
              Sign the diploma
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </ScreenShell>
  )
}