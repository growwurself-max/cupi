import { motion } from 'framer-motion'
import { ChevronRight, FlameKindling } from 'lucide-react'
import type { ExperienceConfig } from '../../../types/experience'
import { BlushDécor } from '../BlushDécor'

interface Screen5LetterProps {
  config: ExperienceConfig
  onContinue: () => void
}

export function Screen5Letter({ config, onContinue }: Screen5LetterProps) {
  const photos = config.content.photos

  return (
    <section className="relative flex min-h-[100dvh] flex-col items-center justify-start overflow-hidden px-5 py-24 text-center sm:px-8">
      <BlushDécor subtle />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center gap-3"
      >
        <span className="rounded-full border border-[#F4BCD1] bg-white/80 px-4 py-1.5 text-xs font-black tracking-[0.22em] text-[#D9548A] uppercase shadow-sm backdrop-blur-md">
          Chapter Three · From {config.sender.name}
        </span>
        <h2 className="font-display text-balance text-3xl font-bold text-[#9A3168] italic sm:text-4xl">
          {config.content.letterIntro}
        </h2>
      </motion.div>

      {/* Photo filmstrip */}
      {photos.length > 0 && (
        <div className="relative z-10 mt-8 w-full max-w-xl">
          <div className="no-scrollbar flex items-end justify-center gap-2.5 overflow-x-auto px-2 pb-1">
            {photos.map((photo, i) => (
              <motion.div
                key={photo.src + i}
                initial={{ opacity: 0, y: 40, rotate: 0 }}
                animate={{ opacity: 1, y: 0, rotate: photo.rotate }}
                transition={{ delay: 0.25 + i * 0.15, type: 'spring', stiffness: 120, damping: 15 }}
                className="shrink-0 rounded-lg bg-white p-1.5 pb-2 shadow-[0_10px_28px_-12px_rgba(231,140,178,0.8)]"
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="h-16 w-16 rounded-md object-cover object-center"
                />
                <span className="mt-1 block h-0.5 w-full rounded-full bg-[#F4BCD1]/60" />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* The letter */}
      <motion.div
        initial={{ opacity: 0, y: 44 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
        className="relative z-10 mt-10 w-full max-w-xl"
      >
        <div
          aria-hidden
          className="absolute -inset-1 rounded-[2rem] bg-gradient-to-br from-[#F9C9DD]/70 via-transparent to-[#E6DBFF]/70 blur-lg"
        />
        <div className="relative rounded-3xl border border-white bg-gradient-to-b from-white to-[#FFFAFC] p-7 text-left shadow-[0_28px_70px_-28px_rgba(231,140,178,0.7)] sm:p-9">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#F7A8C8]/80 to-transparent"
          />

          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#FDE0EC] to-[#EDE2FF] text-2xl shadow-sm">
              🎂
            </span>
            <p className="font-display text-2xl font-bold text-[#9A3168] italic">
              Dear {config.recipient.name},
            </p>
          </div>

          <div className="space-y-4">
            {config.content.letterLines.map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.12 + i * 0.16, duration: 0.5 }}
                className="text-[15px] leading-relaxed text-[#5B3A4E]"
              >
                {line}
              </motion.p>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-end border-t border-[#F4BCD1]/40 pt-5">
            <p className="text-[15px] text-[#8A5A72] italic">
              {config.content.letterSignoff}
            </p>
            <p className="font-display mt-1 bg-gradient-to-r from-[#E85C9B] to-[#8B5CF6] bg-clip-text text-2xl font-bold text-transparent italic">
              {config.sender.name}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.55, delay: 0.25 }}
        className="relative z-10 mt-12 flex flex-col items-center gap-2 pb-4"
      >
        <motion.button
          type="button"
          onClick={onContinue}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-[#F472B6] via-[#EC6E9F] to-[#A78BFA] px-9 text-base font-bold text-white shadow-xl shadow-[#F4BCD1]/60 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <FlameKindling className="h-5 w-5" />
          {config.content.wishPrompt} 🕯️
          <ChevronRight className="h-5 w-5" />
        </motion.button>
        <span className="text-[11px] font-bold tracking-[0.22em] text-[#C46D97]/60 uppercase">
          one last moment
        </span>
      </motion.div>
    </section>
  )
}