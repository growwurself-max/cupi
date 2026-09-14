import { motion } from 'framer-motion'
import type { ExperienceConfig } from '../../../types/experience'
import { TeddyMascot } from '../components/TeddyMascot'
import { TeddyDecor } from '../TeddyDecor'

interface Screen1ShyTeddyProps {
  config: ExperienceConfig
  onBegin: () => void
}

export function Screen1ShyTeddy({ config, onBegin }: Screen1ShyTeddyProps) {
  return (
    <section className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-5 py-20 text-center sm:px-8">
      <TeddyDecor />

      {/* Teddy peeking from behind a soft blush circle */}
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 80, damping: 14, delay: 0.15 }}
        className="relative z-10 mb-10"
      >
        {/* Glow */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -inset-10 rounded-full bg-[#FFD6E0]/50 blur-3xl"
        />

        {/* Teddy mascot */}
        <motion.div
          animate={{ rotate: [-3, 3, -3] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="relative"
        >
          <TeddyMascot state="shy" className="w-40 h-44 sm:w-48 sm:h-52" />
        </motion.div>

        {/* Tapping feet indicator dots */}
        <motion.div
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1.5 }}
          className="absolute -bottom-4 left-1/2 flex -translate-x-1/2 gap-2"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#D4A574]/60" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#D4A574]/40" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#D4A574]/60" />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.7, ease: 'easeOut' }}
        className="relative z-10 flex max-w-2xl flex-col items-center gap-6"
      >
        <motion.span
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          className="rounded-full border border-[#FFB6C8] bg-white/80 px-4 py-1.5 text-xs font-black tracking-[0.22em] text-[#F43F5E] uppercase shadow-sm backdrop-blur-md"
        >
          Teddy&apos;s Birthday Mission 🧸
        </motion.span>

        <h1 className="font-display text-balance text-4xl leading-tight font-bold text-[#881337] italic sm:text-5xl">
          {config.content.teaserHeading} 👀
        </h1>

        <p className="max-w-md text-pretty text-sm leading-relaxed text-[#7C4A63] sm:text-base">
          {config.content.teaserSubtext}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 mt-11"
      >
        <motion.button
          type="button"
          onClick={onBegin}
          animate={{
            boxShadow: [
              '0 0 24px -4px rgba(244,63,94,0.5)',
              '0 0 52px -6px rgba(251,113,133,0.8)',
              '0 0 24px -4px rgba(244,63,94,0.5)',
            ],
          }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="group flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-[#F43F5E] via-[#E11D48] to-[#FB7185] px-9 text-base font-bold text-white shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <motion.span
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
            className="text-lg"
          >
            🧸
          </motion.span>
          Wake Up Teddy ✨
        </motion.button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.35, 0.8, 0.35] }}
        transition={{ delay: 1.3, duration: 2.4, repeat: Infinity }}
        className="relative z-10 mt-9 text-[11px] font-bold tracking-[0.25em] text-[#F43F5E]/50 uppercase"
      >
        Best experienced with sound on
      </motion.p>
    </section>
  )
}
