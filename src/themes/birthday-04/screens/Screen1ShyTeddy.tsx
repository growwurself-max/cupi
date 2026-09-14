import { motion } from 'framer-motion'
import type { ExperienceConfig } from '../../../types/experience'
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

        {/* Teddy SVG */}
        <motion.div
          animate={{ rotate: [-3, 3, -3] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="relative"
        >
          <svg width="140" height="160" viewBox="0 0 140 160" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Ears */}
            <circle cx="35" cy="30" r="22" fill="#D4A574" />
            <circle cx="35" cy="30" r="14" fill="#F0C9A6" />
            <circle cx="105" cy="30" r="22" fill="#D4A574" />
            <circle cx="105" cy="30" r="14" fill="#F0C9A6" />
            {/* Head */}
            <circle cx="70" cy="62" r="42" fill="#D4A574" />
            {/* Face */}
            <circle cx="70" cy="66" r="30" fill="#F5E6D3" />
            {/* Eyes */}
            <motion.g animate={{ scaleY: [1, 0.1, 1] }} transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 2.5 }}>
              <circle cx="57" cy="58" r="4.5" fill="#3D2914" />
              <circle cx="83" cy="58" r="4.5" fill="#3D2914" />
            </motion.g>
            {/* Eye shine */}
            <circle cx="59" cy="56" r="1.5" fill="white" />
            <circle cx="85" cy="56" r="1.5" fill="white" />
            {/* Nose */}
            <ellipse cx="70" cy="68" rx="5" ry="3.5" fill="#C4956A" />
            {/* Mouth — shy smile */}
            <path d="M63 74 Q70 80 77 74" stroke="#C4956A" strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* Blush cheeks */}
            <motion.ellipse
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              cx="48" cy="70" rx="8" ry="5" fill="#F4A0B0" opacity="0.6"
            />
            <motion.ellipse
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
              cx="92" cy="70" rx="8" ry="5" fill="#F4A0B0" opacity="0.6"
            />
            {/* Body */}
            <ellipse cx="70" cy="125" rx="36" ry="34" fill="#D4A574" />
            <ellipse cx="70" cy="128" rx="24" ry="22" fill="#F5E6D3" />
            {/* Paws */}
            <motion.g animate={{ rotate: [-8, 8, -8] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}>
              <ellipse cx="40" cy="138" rx="14" ry="10" fill="#D4A574" />
              <ellipse cx="40" cy="140" rx="8" ry="6" fill="#F0C9A6" />
            </motion.g>
            <motion.g animate={{ rotate: [8, -8, 8] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}>
              <ellipse cx="100" cy="138" rx="14" ry="10" fill="#D4A574" />
              <ellipse cx="100" cy="140" rx="8" ry="6" fill="#F0C9A6" />
            </motion.g>
            {/* Little heart above head */}
            <motion.text
              animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4], scale: [0.9, 1.1, 0.9] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              fontSize="18" x="70" y="14" textAnchor="middle"
            >
              💕
            </motion.text>
          </svg>
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
