import { AnimatePresence, motion } from 'framer-motion'
import { Heart, Mail } from 'lucide-react'
import { useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import type { BouquetNote } from '../../../types/experience'
import { FloatingParticles } from '../../shared/FloatingParticles'
import { ScreenShell } from '../../shared/ScreenShell'
import { FloatingEmojis } from '../../shared/FloatingEmojis'

interface Screen4_5BouquetProps {
  config: ExperienceConfig
  onTagTap: () => void
  onContinue: () => void
}

const FALLBACK_NOTES: BouquetNote[] = [
  { id: 'note-1', text: 'You make every day brighter ☀️', emoji: '🌹' },
  { id: 'note-2', text: 'My favorite person 💖', emoji: '🌸' },
  { id: 'note-3', text: 'Forever lucky to have you 🥺', emoji: '🌷' },
  { id: 'note-4', text: 'The best part of my story 💫', emoji: '🍀' },
  { id: 'note-5', text: 'Your laugh fixes my Mondays 😄', emoji: '🌺' },
  { id: 'note-6', text: 'Happy birthday to my favorite human 🎂', emoji: '🏵️' },
]

const TAG_POSITIONS = [
  { left: '3%', top: '3%' },
  { right: '3%', top: '14%' },
  { left: '4%', top: '44%' },
  { right: '4%', top: '62%' },
  { left: '5%', bottom: '4%' },
  { right: '5%', bottom: '8%' },
]

export function Screen4_5Bouquet({
  config,
  onTagTap,
  onContinue,
}: Screen4_5BouquetProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [tappedIds, setTappedIds] = useState<string[]>([])

  const notes = config.bouquet?.notes ?? FALLBACK_NOTES
  const title = config.bouquet?.title ?? 'Your Birthday Bouquet 🌹'
  const subtitle =
    config.bouquet?.subtitle ??
    'Six little notes, one for every bloom. Tap each tag to make it glow.'
  const allTapped = notes.length > 0 && tappedIds.length >= notes.length

  const toggleNote = (id: string) => {
    if (activeId === id) {
      setActiveId(null)
      return
    }
    setActiveId(id)
    onTagTap()
    setTappedIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }

  return (
    <ScreenShell>
      <FloatingParticles
        type="heart-petals"
        colors={[config.branding.accentColor, config.branding.accentSecondary]}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(246,198,182,0.2),rgba(224,179,242,0.12)_48%,transparent_72%)]"
      />
      <FloatingEmojis emojis={['✨', '🌹']} count={9} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-20 mb-6 text-center"
      >
        <p className="text-xs font-bold tracking-[0.3em] text-rose-gold uppercase">
          From {config.sender.name} — for {config.recipient.name}
        </p>
        <h1 className="font-display mt-2 text-balance text-3xl font-semibold text-white sm:text-4xl">
          {title}
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-pretty text-sm text-white/55">
          {subtitle}
        </p>
      </motion.div>

      {/* Bouquet arena */}
      <div className="relative z-10 h-[24rem] w-full max-w-md sm:h-[27rem]">
        {/* Bloom glow */}
        <motion.div
          aria-hidden
          animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.85, 0.5] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-2 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(246,198,182,0.4) 0%, rgba(224,179,242,0.22) 45%, transparent 70%)',
          }}
        />

        {/* Floating note tags */}
        {notes.slice(0, TAG_POSITIONS.length).map((note, i) => {
          const isActive = activeId === note.id
          const isTapped = tappedIds.includes(note.id)
          return (
            <motion.button
              key={note.id}
              type="button"
              aria-pressed={isActive}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.4 + i * 0.1,
                type: 'spring',
                stiffness: 180,
                damping: 14,
              }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => toggleNote(note.id)}
              style={TAG_POSITIONS[i]}
              className={`absolute z-30 flex max-w-[150px] items-start gap-2 rounded-2xl px-3.5 py-2.5 text-left text-[11px] font-semibold leading-snug shadow-lg transition-colors duration-300 outline-none sm:max-w-[168px] sm:text-[13px] ${
                isActive
                  ? 'border border-rose-gold/70 bg-rose-gold/20 text-white shadow-[0_0_24px_-4px_rgba(246,198,182,0.7)]'
                  : 'glass-panel border border-white/10 text-white/85 hover:border-white/25'
              }`}
            >
              {note.emoji && (
                <span
                  className={`text-sm transition-transform duration-200 ${
                    isActive ? 'scale-125' : ''
                  }`}
                  aria-hidden
                >
                  {note.emoji}
                </span>
              )}
              <span className="flex-1">{note.text}</span>

              {/* Heart indicator */}
              <AnimatePresence>
                {isTapped && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                    className={`h-3 w-3 shrink-0 ${
                      isActive ? 'text-rose-gold' : 'text-soft-violet/60'
                    }`}
                    aria-hidden
                  >
                    <Heart className="h-full w-full fill-current" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )
        })}

        {/* Rose bouquet */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.55, type: 'spring', stiffness: 100, damping: 15 }}
          className="absolute bottom-3 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, -10, 0], rotate: [0, 1.5, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
            className="relative flex flex-col items-center"
          >
            {/* Flower fan */}
            <div className="relative flex items-end gap-1.5">
              {['🌷', '🌹'].map((rose, i) => (
                <motion.span
                  key={`${rose}-${i}`}
                  animate={{ y: [0, -(4 + i * 3), 0], rotate: i % 2 === 0 ? -8 : 8 }}
                  transition={{
                    duration: 3 + i * 0.6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.3,
                  }}
                  className="text-3xl drop-shadow-[0_6px_10px_rgba(0,0,0,0.4)]"
                  aria-hidden
                >
                  {rose}
                </motion.span>
              ))}
              <span className="z-10 -mx-1 text-5xl drop-shadow-[0_8px_14px_rgba(0,0,0,0.5)]">
                💐
              </span>
              <motion.span
                animate={{ y: [0, -(4 + 6), 0], rotate: -8 }}
                transition={{
                  duration: 3.6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.2,
                }}
                className="text-3xl drop-shadow-[0_6px_10px_rgba(0,0,0,0.4)]"
                aria-hidden
              >
                🌺
              </motion.span>
              {['🌷', '🌹'].map((rose, i) => (
                <motion.span
                  key={`${rose}-r${i}`}
                  animate={{ y: [0, -(4 + (1 - i) * 3), 0], rotate: i % 2 === 0 ? 8 : -8 }}
                  transition={{
                    duration: 3 + i * 0.6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.3,
                  }}
                  className="text-3xl drop-shadow-[0_6px_10px_rgba(0,0,0,0.4)]"
                  aria-hidden
                >
                  {rose}
                </motion.span>
              ))}
            </div>

            {/* Wrapper cone */}
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
              className="-mt-2 h-20 w-24 bg-gradient-to-t from-[#c98a6b99] to-transparent"
              style={{
                clipPath: 'polygon(28% 0, 72% 0, 100% 100%, 0 100%)',
                backdropFilter: 'blur(4px)',
              }}
              aria-hidden
            />
            <span
              className="-mt-3 text-xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
              aria-hidden
            >
              🎀
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* Progress hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="relative z-20 mt-3 text-xs font-semibold tracking-wide text-white/40 uppercase"
      >
        {allTapped ? 'Every bloom lit with love 💗' : 'tap the tags to light the blooms'}
      </motion.p>

      {/* Primary action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.15, duration: 0.6 }}
        className="relative z-20 mt-8 mb-4"
      >
        <motion.button
          type="button"
          onClick={onContinue}
          animate={{
            boxShadow: [
              '0 0 22px -4px rgba(246,198,182,0.45)',
              '0 0 42px -4px rgba(246,198,182,0.8)',
              '0 0 22px -4px rgba(246,198,182,0.45)',
            ],
          }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-rose-gold via-soft-amber to-soft-violet px-8 text-base font-bold text-obsidian-900 transition-transform duration-200 hover:scale-[1.05] active:scale-95"
        >
          <Mail className="h-5 w-5" />
          Read Your Full Letter 💌
        </motion.button>
      </motion.div>
    </ScreenShell>
  )
}