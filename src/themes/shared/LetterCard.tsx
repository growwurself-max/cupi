import { motion } from 'framer-motion'
import { GlassCard } from '../../components/ui/GlassCard'
import type { ExperienceContent } from '../../types/experience'

interface LetterCardProps {
  recipient: string
  content: ExperienceContent
  sender: string
  headerEmoji: string
  accent: string
  className?: string
}

export function LetterCard({
  recipient,
  content,
  sender,
  headerEmoji,
  accent,
  className = '',
}: LetterCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className={`relative w-full max-w-xl ${className}`}
    >
      <div
        aria-hidden
        className="absolute -inset-1 rounded-[2rem] bg-gradient-to-br from-rose-gold/25 via-transparent to-soft-violet/25 blur-lg"
      />
      <GlassCard className="relative p-7 sm:p-9">
        <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

        <div className="mb-5 flex items-center gap-2">
          <span className="text-2xl">{headerEmoji}</span>
          <p className="font-display text-xl italic text-white/90">
            Dear {recipient},
          </p>
        </div>

        <div className="space-y-4">
          {content.letterLines.map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 + i * 0.16, duration: 0.5 }}
              className="text-[15px] leading-relaxed text-white/75"
            >
              {line}
            </motion.p>
          ))}
        </div>

        <div className="mt-7 flex flex-col items-end">
          <p className="text-[15px] text-white/60 italic">{content.letterSignoff}</p>
          <p
            className="font-display mt-1 text-2xl font-semibold"
            style={{ color: accent }}
          >
            {sender}
          </p>
        </div>
      </GlassCard>
    </motion.div>
  )
}