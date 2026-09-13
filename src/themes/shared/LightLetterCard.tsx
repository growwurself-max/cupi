import { motion } from 'framer-motion'
import type { ExperienceContent } from '../../types/experience'

interface LightLetterCardProps {
  recipient: string
  content: ExperienceContent
  sender: string
  headerEmoji: string
  accent: string
  accentSecondary?: string
  className?: string
}

export function LightLetterCard({
  recipient,
  content,
  sender,
  headerEmoji,
  accent,
  accentSecondary,
  className = '',
}: LightLetterCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className={`relative w-full max-w-xl ${className}`}
    >
      <div
        aria-hidden
        className="absolute -inset-1.5 rounded-[2rem] blur-xl"
        style={{
          background: `linear-gradient(120deg, ${accent}55, transparent 45%, ${accentSecondary ?? accent}55)`,
        }}
      />
      <div
        className="relative rounded-[2rem] border bg-white/85 p-7 shadow-[0_18px_50px_-20px_rgba(0,0,0,0.18)] backdrop-blur-md sm:p-9"
        style={{ borderColor: `${accent}66` }}
      >
        <div
          aria-hidden
          className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent"
        />

        <div className="mb-5 flex items-center gap-2.5">
          <span className="text-2xl">{headerEmoji}</span>
          <p className="font-display text-xl italic text-stone-800">
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
              className="text-[15px] leading-relaxed text-stone-600"
            >
              {line}
            </motion.p>
          ))}
        </div>

        <div className="mt-7 flex flex-col items-end">
          <p className="text-sm text-stone-500 italic">{content.letterSignoff}</p>
          <p className="font-display mt-1 text-2xl font-semibold" style={{ color: accent }}>
            {sender}
          </p>
        </div>
      </div>
    </motion.div>
  )
}