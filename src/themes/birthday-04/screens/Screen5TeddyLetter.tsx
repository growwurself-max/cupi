import { motion } from 'framer-motion'
import { useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
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
        <svg width="90" height="100" viewBox="0 0 140 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="scale-75">
          <circle cx="35" cy="30" r="22" fill="#D4A574" />
          <circle cx="35" cy="30" r="14" fill="#F0C9A6" />
          <circle cx="105" cy="30" r="22" fill="#D4A574" />
          <circle cx="105" cy="30" r="14" fill="#F0C9A6" />
          <circle cx="70" cy="62" r="42" fill="#D4A574" />
          <circle cx="70" cy="66" r="30" fill="#F5E6D3" />
          <circle cx="57" cy="58" r="4" fill="#3D2914" />
          <circle cx="83" cy="58" r="4" fill="#3D2914" />
          <circle cx="59" cy="56" r="1.5" fill="white" />
          <circle cx="85" cy="56" r="1.5" fill="white" />
          <ellipse cx="70" cy="68" rx="5" ry="3.5" fill="#C4956A" />
          <path d="M63 74 Q70 79 77 74" stroke="#C4956A" strokeWidth="2" fill="none" strokeLinecap="round" />
          <ellipse cx="48" cy="70" rx="8" ry="5" fill="#F4A0B0" opacity="0.6" />
          <ellipse cx="92" cy="70" rx="8" ry="5" fill="#F4A0B0" opacity="0.6" />
          <ellipse cx="70" cy="125" rx="36" ry="34" fill="#D4A574" />
          <ellipse cx="70" cy="128" rx="24" ry="22" fill="#F5E6D3" />
          {/* Holding envelope */}
          <rect x="42" y="105" width="56" height="36" rx="4" fill="#FFF8E7" stroke="#E8C47C" strokeWidth="1.5" />
          <path d="M42 105 L70 125 L98 105" stroke="#E8C47C" strokeWidth="1.5" fill="none" />
          <text x="70" y="100" textAnchor="middle" fontSize="12" fill="#F43F5E">💌</text>
        </svg>
      </motion.div>

      {/* Interactive micro-notes floating around */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="relative z-10 mb-8 h-0"
      >
        {notes.map((note, i) => {
          const positions = [
            { left: '8%', top: '-100px' },
            { left: '72%', top: '-95px' },
            { left: '5%', top: '-40px' },
            { left: '75%', top: '-35px' },
          ]
          const pos = positions[i] ?? positions[0]
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
              className="absolute flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold shadow-sm backdrop-blur-md transition-colors"
              style={{
                left: pos.left,
                top: pos.top,
                borderColor: isTapped ? '#F43F5E' : '#FFB6C8',
                background: isTapped ? 'rgba(244,63,94,0.12)' : 'rgba(255,255,255,0.85)',
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
