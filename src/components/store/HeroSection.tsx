import { motion } from 'framer-motion'
import { ArrowDown, Gift, Sparkles } from 'lucide-react'
import { useState } from 'react'

const REACTIONS = ['✨', '🎉', '❤️', '🥳', '😍']

function ReactionBurst({ burst }: { burst: number }) {
  if (burst === 0) return null
  return (
    <div key={burst} className="pointer-events-none absolute inset-0">
      {REACTIONS.map((reaction, i) => {
        const angle = (i / REACTIONS.length) * Math.PI * 2
        const x = Math.cos(angle) * 54
        const y = Math.sin(angle) * 54
        return (
          <motion.span
            key={`${burst}-${i}`}
            initial={{ opacity: 0, scale: 0.4, x: 0, y: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0.4, 1.3, 0.5], x, y }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="absolute top-1/2 left-1/2 text-xl"
            aria-hidden
          >
            {reaction}
          </motion.span>
        )
      })}
    </div>
  )
}

export function HeroSection({
  onLaunchDemo,
}: {
  onLaunchDemo: () => void
}) {
  const [burst, setBurst] = useState(0)

  return (
    <section
      id="top"
      className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-5 pb-28 pt-28 text-center sm:px-8"
    >
      <div
        aria-hidden
        className="animate-float-slow pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(246,198,182,0.35) 0%, rgba(224,179,242,0.22) 45%, transparent 70%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 bottom-10 h-72 w-72 rounded-full opacity-30 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(252,217,166,0.4), transparent 70%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="glass-panel relative z-10 mb-7 flex items-center gap-2 rounded-full px-4 py-2"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-soft-amber opacity-70" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-soft-amber" />
        </span>
        <span className="text-xs font-semibold tracking-wide text-white/80 uppercase">
          Handcrafted surprise experiences
        </span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.12, ease: 'easeOut' }}
        className="font-display relative z-10 max-w-4xl text-balance text-5xl leading-[1.05] font-semibold sm:text-6xl md:text-7xl"
      >
        Make a moment{' '}
        <span className="text-shimmer animate-shimmer">unforgettable.</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.24, ease: 'easeOut' }}
        className="relative z-10 mt-6 max-w-xl text-pretty text-base text-white/60 sm:text-lg"
      >
        Personalized, animated interactive mini-websites you can create in
        minutes and send through a simple link.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.36, ease: 'easeOut' }}
        className="relative z-10 mt-10 flex flex-col items-center gap-4 sm:flex-row"
      >
        <button
          type="button"
          onClick={onLaunchDemo}
          className="glow-primary group flex min-h-14 items-center gap-3 rounded-full bg-gradient-to-r from-rose-gold via-soft-violet to-soft-amber px-8 text-base font-bold text-obsidian-900 transition-transform duration-200 hover:scale-[1.04] active:scale-95"
        >
          <Gift className="h-5 w-5" />
          🎂 Try Birthday Demo
        </button>
        <a
          href="#themes"
          className="glass-panel flex min-h-14 items-center gap-2 rounded-full px-7 text-base font-semibold text-white/80 transition-all duration-200 hover:scale-[1.03] hover:text-white active:scale-95"
        >
          Explore Themes
          <ArrowDown className="h-5 w-5 text-soft-violet" />
        </a>
      </motion.div>

      {/* Floating interactive preview badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7, type: 'spring', stiffness: 120, damping: 16 }}
        className="absolute right-6 bottom-24 z-20 hidden lg:block"
      >
        <motion.div
          animate={{ y: [0, -12, 0], rotate: [-2, 2, -2] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="relative"
        >
          <button
            type="button"
            onClick={() => setBurst((b) => b + 1)}
            className="glass-panel relative flex items-center gap-3 rounded-full px-5 py-3.5 shadow-2xl transition-transform duration-200 hover:scale-105 active:scale-95"
            aria-label="Trigger a live reaction preview"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-gold opacity-70" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-gold" />
            </span>
            <span className="flex flex-col items-start">
              <span className="text-sm font-bold text-white">Reactions, live</span>
              <span className="text-[11px] font-medium text-white/50">
                tap me for a spark ✨
              </span>
            </span>
            <Sparkles className="h-4 w-4 text-soft-amber" />
            <ReactionBurst burst={burst} />
          </button>
        </motion.div>
      </motion.div>
    </section>
  )
}