import { motion } from 'framer-motion'
import { useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { TeddyMascot } from '../components/TeddyMascot'
import { TeddyDecor } from '../TeddyDecor'

interface Screen5TeddyLetterProps {
  config: ExperienceConfig
  onContinue: () => void
}

export function Screen5TeddyLetter({
  config,
  onContinue,
}: Screen5TeddyLetterProps) {
  const [tappedNotes, setTappedNotes] = useState<Set<string>>(new Set())

  const notes = config.bouquet?.notes ?? []

  const tapNote = (noteId: string) => {
    setTappedNotes((prev) => new Set(prev).add(noteId))
  }

  return (
    <section className="relative flex min-h-[100dvh] flex-col items-center overflow-hidden px-5 py-24 text-center sm:px-8">
      <TeddyDecor subtle />

      <motion.span
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="relative z-10 rounded-full border border-[#FFB6C8] bg-white/80 px-4 py-1.5 text-xs font-black tracking-[0.22em] text-[#F43F5E] uppercase shadow-sm backdrop-blur-md"
      >
        Teddy&apos;s Heartfelt Note 💌
      </motion.span>

      {/* Teddy holding vintage envelope */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 14, delay: 0.1 }}
        className="relative z-10 mt-8 mb-6"
      >
        <TeddyMascot state="letter" className="w-36 h-40 sm:w-44 sm:h-48" />
      </motion.div>

      {/* Interactive micro-notes floating around */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="relative z-10 mb-8 h-0"
      >
        {notes.map((note, i) => {
          const capsulePositions = [
            "top-2 -left-2 sm:top-4 sm:-left-6",     // Top-Left
            "top-2 -right-2 sm:top-4 sm:-right-6",   // Top-Right
            "bottom-4 -left-2 sm:bottom-6 sm:-left-6", // Bottom-Left
            "bottom-4 -right-2 sm:bottom-6 sm:-right-6" // Bottom-Right
          ]
          const pos = capsulePositions[i % capsulePositions.length]
          const isTapped = tappedNotes.has(note.id)

          return (
            <motion.button
              key={note.id}
              type="button"
              onClick={() => tapNote(note.id)}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
                y: [0, -6, 0],
              }}
              transition={{
                scale: { delay: 0.5 + i * 0.15, type: 'spring', stiffness: 200 },
                y: { duration: 2.5, repeat: Infinity, delay: i * 0.4, ease: 'easeInOut' },
              }}
              whileTap={{ scale: 0.92 }}
              className={`absolute ${pos} z-20 bg-white/95 border border-rose-200 text-rose-900 rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-medium shadow-md shadow-rose-200/50 flex items-center gap-1.5 pointer-events-auto select-none whitespace-nowrap transition-colors`}
              style={{
                borderColor: isTapped ? '#F43F5E' : '#FFB6C8',
                background: isTapped ? 'rgba(244,63,94,0.12)' : 'rgba(255,255,255,0.95)',
                color: isTapped ? '#E11D48' : '#881337',
              }}
            >
              <span>{note.emoji ?? '✨'}</span>
              {note.text}
              {isTapped && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.3, 1] }}
                  className="text-[10px]"
                >
                  💕
                </motion.span>
              )}
            </motion.button>
          )
        })}

        {/* Floating hearts when notes are tapped */}
        {Array.from(tappedNotes).map((noteId, i) =>
          Array.from({ length: 3 }).map((_, j) => (
            <motion.span
              key={`heart-${noteId}-${j}`}
              initial={{ opacity: 0.9, scale: 0.5, x: 0, y: 0 }}
              animate={{
                opacity: 0,
                y: -40 - j * 20,
                x: (j - 1) * 15,
                scale: 1.2,
              }}
              transition={{ duration: 1.2, delay: j * 0.15 }}
              className="absolute text-sm"
              style={{
                left: `${20 + i * 20}%`,
                top: '-60px',
              }}
            >
              💖
            </motion.span>
          )),
        )}
      </motion.div>

      {/* Letter card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.7, type: 'spring', stiffness: 90 }}
        className="relative z-10 mt-12 w-full max-w-lg"
      >
        <div className="rounded-3xl border border-[#FFD6E0] bg-white/90 p-7 shadow-[0_20px_50px_-18px_rgba(244,63,94,0.15)] backdrop-blur-md sm:p-9">
          <p className="mb-1 text-xs font-bold tracking-[0.22em] text-[#FB7185] uppercase">
            {config.content.letterIntro}
          </p>
          <p className="mb-6 text-[11px] font-semibold tracking-wide text-[#F4A0B0]">
            From {config.sender.name} to {config.recipient.name}
          </p>

          <div className="space-y-4">
            {config.content.letterLines.map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.15, duration: 0.5 }}
                className="text-left text-sm leading-relaxed text-[#5C3D4F] sm:text-base"
              >
                {line}
              </motion.p>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-6 text-left text-sm font-bold italic text-[#881337]"
          >
            {config.content.letterSignoff}
          </motion.p>
          <p className="mt-1 text-left text-sm font-bold text-[#F43F5E]">
            {config.sender.name} <span className="text-[#FB7185]">♥</span>
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 0.6 }}
        className="relative z-10 mt-10"
      >
        <motion.button
          type="button"
          onClick={onContinue}
          animate={{
            boxShadow: [
              '0 0 24px -4px rgba(244,63,94,0.5)',
              '0 0 52px -6px rgba(251,113,133,0.8)',
              '0 0 24px -4px rgba(244,63,94,0.5)',
            ],
          }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-[#F43F5E] via-[#E11D48] to-[#FB7185] px-9 text-base font-bold text-white shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
        >
          Teddy&apos;s Birthday Cake 🎂
        </motion.button>
      </motion.div>
    </section>
  )
}
