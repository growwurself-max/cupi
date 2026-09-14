import { motion } from 'framer-motion'
import { Mail, Music } from 'lucide-react'
import { useEffect } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { fireContinuousSparkle, fireGrandBurst } from '../../../utils/confetti'
import { BlushDécor } from '../BlushDécor'

interface Screen4RevealProps {
  config: ExperienceConfig
  onContinue: () => void
}

export function Screen4Reveal({ config, onContinue }: Screen4RevealProps) {
  useEffect(() => {
    fireGrandBurst()
    const timer = window.setTimeout(() => {
      fireContinuousSparkle(1500)
    }, 800)
    return () => window.clearTimeout(timer)
  }, [])

  const fanPhotos = config.content.photos.slice(0, 5)

  return (
    <section className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-5 py-24 text-center sm:px-8">
      <BlushDécor />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.4, 0.85, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(247,168,200,0.28),rgba(219,204,255,0.22)_48%,transparent_72%)]"
      />

      <motion.span
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.55 }}
        className="relative z-10 rounded-full border border-[#F4BCD1] bg-white/85 px-4 py-1.5 text-xs font-black tracking-[0.22em] text-[#D9548A] uppercase shadow-sm backdrop-blur-md"
      >
        {config.sender.name} has something to say
      </motion.span>

      <motion.h1
        initial={{ opacity: 0, scale: 0.75, y: 26 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.35, type: 'spring', stiffness: 110, damping: 15 }}
        className="font-display relative z-10 mt-6 text-balance text-5xl leading-tight font-bold italic sm:text-6xl md:text-7xl"
      >
        <span className="bg-gradient-to-br from-[#E85C9B] via-[#D9548A] to-[#8B5CF6] bg-clip-text text-transparent">
          {config.content.revealHeading},
        </span>
        <span className="block text-[#9A3168] md:inline">{' '}{config.recipient.name}!</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="relative z-10 mt-6 max-w-md text-pretty text-base leading-relaxed text-[#7C4A63]"
      >
        {config.content.revealSubtext}
      </motion.p>

      {/* Polaroid fan — the day, so far */}
      <div className="relative z-10 mt-12 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        {fanPhotos.map((photo, i) => {
          const spread = fanPhotos.length === 1 ? 0 : i - (fanPhotos.length - 1) / 2
          return (
            <motion.div
              key={photo.src + i}
              initial={{ opacity: 0, y: 80, scale: 0.6, rotate: 0 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                rotate: photo.rotate + spread * 5,
              }}
              transition={{
                delay: 0.9 + i * 0.18,
                type: 'spring',
                stiffness: 120,
                damping: 13,
              }}
              className="w-32 rounded-2xl bg-white p-2.5 pb-3 shadow-[0_20px_45px_-20px_rgba(231,140,178,0.75)] sm:w-36"
            >
              <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-[#FDE9F1] shadow-inner">
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="h-full w-full object-cover object-center"
                />
              </div>
              <p className="mt-2 line-clamp-1 text-center text-[11px] font-bold text-[#6E3A52]">
                {photo.caption}
              </p>
            </motion.div>
          )
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 0.6 }}
        className="relative z-10 mt-12"
      >
        <motion.button
          type="button"
          onClick={onContinue}
          animate={{
            boxShadow: [
              '0 0 24px -4px rgba(247,168,200,0.55)',
              '0 0 48px -6px rgba(201,189,248,0.85)',
              '0 0 24px -4px rgba(247,168,200,0.55)',
            ],
          }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-[#F472B6] via-[#EC6E9F] to-[#A78BFA] px-9 text-base font-bold text-white shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <Mail className="h-5 w-5" />
          Read the letter 💌
        </motion.button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.35, 0.75, 0.35] }}
        transition={{ delay: 1.9, duration: 2.2, repeat: Infinity }}
        className="relative z-10 mt-8 flex items-center gap-1.5 text-[11px] font-bold tracking-[0.22em] text-[#C46D97]/60 uppercase"
      >
        <Music className="h-3 w-3" /> cinematic confetti, timed
      </motion.p>
    </section>
  )
}