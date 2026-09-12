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
            'radial-gradient(circle, rgba(255,183,197,0.4) 0%, rgba(232,122,144,0.16) 45%, transparent 70%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 bottom-10 h-72 w-72 rounded-full opacity-40 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(253,224,231,0.6), transparent 70%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative z-10 mb-7 flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-70" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-400" />
        </span>
        <span className="text-xs font-semibold tracking-wide text-rose-600">
          A new way to surprise your favorite people
        </span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.12, ease: 'easeOut' }}
        className="font-display relative z-10 max-w-4xl text-balance text-5xl leading-[1.05] font-bold text-stone-900 sm:text-6xl md:text-7xl"
      >
        Make a moment{' '}
        <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 bg-clip-text text-transparent">
          unforgettable.
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.24, ease: 'easeOut' }}
        className="relative z-10 mt-6 max-w-xl text-pretty text-base text-stone-600 sm:text-lg"
      >
        Send interactive, animated surprises with personal notes, photos, and
        music — delivered through one simple link.
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
          className="group flex min-h-14 items-center gap-3 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 px-8 text-base font-bold text-white shadow-lg shadow-rose-200 transition-all duration-200 hover:scale-[1.04] hover:shadow-xl hover:shadow-rose-200 active:scale-95"
        >
          <Gift className="h-5 w-5" />
          Try Birthday Demo
        </button>
        <a
          href="#themes"
          className="flex min-h-14 items-center gap-2 rounded-full border border-stone-200 bg-white px-7 text-base font-semibold text-stone-700 transition-all duration-200 hover:scale-[1.03] hover:border-rose-200 hover:bg-stone-50 active:scale-95"
        >
          Explore Themes
          <ArrowDown className="h-5 w-5 text-rose-400" />
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
            className="relative flex items-center gap-3 rounded-full border border-rose-100/70 bg-white/85 px-5 py-3.5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md transition-all duration-200 hover:scale-105 hover:shadow-[0_12px_35px_rgba(244,63,94,0.14)] active:scale-95"
            aria-label="Trigger a live reaction preview"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-70" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-400" />
            </span>
            <span className="flex flex-col items-start">
              <span className="text-sm font-bold text-stone-800">
                Reactions, live
              </span>
              <span className="text-[11px] font-medium text-stone-500">
                tap me for a spark ✨
              </span>
            </span>
            <Sparkles className="h-4 w-4 text-rose-400" />
            <ReactionBurst burst={burst} />
          </button>
        </motion.div>
      </motion.div>
    </section>
  )
}