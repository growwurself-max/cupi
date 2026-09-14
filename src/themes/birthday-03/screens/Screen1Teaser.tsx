import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import type { ExperienceConfig } from '../../../types/experience'
import { BlushDécor } from '../BlushDécor'

interface Screen1TeaserProps {
  config: ExperienceConfig
  onBegin: () => void
}

export function Screen1Teaser({ config, onBegin }: Screen1TeaserProps) {
  return (
    <section className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-5 py-20 text-center sm:px-8">
      <BlushDécor />

      {/* Gift bundle */}
      <motion.div
        initial={{ scale: 0, rotate: -12, y: 30 }}
        animate={{ scale: 1, rotate: 0, y: 0 }}
        transition={{ type: 'spring', stiffness: 110, damping: 13, delay: 0.1 }}
        className="relative z-10 mb-11"
      >
        <motion.div
          animate={{ scale: [1, 1.18, 1], opacity: [0.45, 0.75, 0.45] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -inset-8 rounded-full bg-[#F9C9DD]/45 blur-3xl"
        />
        <motion.span
          animate={{ rotate: [0, -6, 6, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="relative flex h-32 w-32 items-center justify-center rounded-full border border-white bg-gradient-to-br from-[#FFE3EC] to-[#EBDDFF] text-6xl shadow-[0_24px_60px_-18px_rgba(231,140,178,0.7)]"
        >
          {config.branding.emojiPrimary}
        </motion.span>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border border-dashed border-[#F7A8C8]/70"
        />
        <motion.span
          animate={{ scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-3 -right-2 text-3xl"
        >
          🎀
        </motion.span>
        <motion.span
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          className="absolute -bottom-2 -left-4 text-2xl"
        >
          ✨
        </motion.span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.7, ease: 'easeOut' }}
        className="relative z-10 flex max-w-2xl flex-col items-center gap-6"
      >
        <motion.span
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          className="rounded-full border border-[#F4BCD1] bg-white/80 px-4 py-1.5 text-xs font-black tracking-[0.22em] text-[#D9548A] uppercase shadow-sm backdrop-blur-md"
        >
          A Cupi Premium Birthday Story
        </motion.span>

        <h1 className="font-display text-balance text-4xl leading-tight font-bold text-[#9A3168] italic sm:text-6xl">
          {config.content.teaserHeading}
        </h1>

        <p className="max-w-md text-pretty text-sm leading-relaxed text-[#7C4A63] sm:text-base">
          {config.content.teaserSubtext}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 mt-11"
      >
        <motion.button
          type="button"
          onClick={onBegin}
          animate={{
            boxShadow: [
              '0 0 24px -4px rgba(247,168,200,0.55)',
              '0 0 52px -6px rgba(201,189,248,0.85)',
              '0 0 24px -4px rgba(247,168,200,0.55)',
            ],
          }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="group flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-[#F472B6] via-[#EC6E9F] to-[#A78BFA] px-9 text-base font-bold text-white shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <Sparkles className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
          Begin {config.recipient.name}&apos;s Surprise ✨
        </motion.button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.35, 0.8, 0.35] }}
        transition={{ delay: 1.3, duration: 2.4, repeat: Infinity }}
        className="relative z-10 mt-9 text-[11px] font-bold tracking-[0.25em] text-[#C46D97]/70 uppercase"
      >
        Best experienced with sound on
      </motion.p>
    </section>
  )
}