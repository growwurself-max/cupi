import { motion } from 'framer-motion'
import { useMemo } from 'react'

/**
 * Dreamy, premium backdrop for the ₹297 "My Queen" experience — the most
 * expensive template in the store. Soft pastel pink/lavender atmosphere with a
 * playful HAPPY pennant garland, cuddly top accents, drifting clouds, a few
 * butterflies and gentle floating hearts/balloons.
 *
 * Rendered once behind every screen of the theme (never interactive, never
 * covering content) so the whole experience feels like one special place.
 */
export function DreamyDecor() {
  const garland = useMemo(
    () => [
      { letter: 'H', droop: 0, bg: 'linear-gradient(180deg, #ffdcea 0%, #ffb9d4 100%)' },
      { letter: 'A', droop: 6, bg: 'linear-gradient(180deg, #fff0f5 0%, #ffd3e3 100%)' },
      { letter: 'P', droop: 11, bg: 'linear-gradient(180deg, #ede4ff 0%, #cfbcfb 100%)' },
      { letter: 'P', droop: 6, bg: 'linear-gradient(180deg, #fff0f5 0%, #ffd3e3 100%)' },
      { letter: 'Y', droop: 0, bg: 'linear-gradient(180deg, #ffdcea 0%, #ffb9d4 100%)' },
    ],
    [],
  )

  const clouds = useMemo(
    () => [
      { id: 'cloud-1', className: '-bottom-6 -left-12 w-56 sm:w-80', opacity: 0.8, blur: 'blur-[2px]', drift: 24, duration: 26 },
      { id: 'cloud-2', className: '-bottom-10 -right-16 w-64 sm:w-96', opacity: 0.66, blur: 'blur-[3px]', drift: -20, duration: 30 },
      { id: 'cloud-3', className: 'bottom-[24%] -left-20 w-44 sm:w-64', opacity: 0.42, blur: 'blur-[4px]', drift: 16, duration: 34 },
      { id: 'cloud-4', className: 'top-[44%] -right-24 w-40 sm:w-60', opacity: 0.34, blur: 'blur-[5px]', drift: -14, duration: 38 },
      { id: 'cloud-5', className: 'bottom-[4%] left-[30%] w-44 sm:w-60', opacity: 0.46, blur: 'blur-[4px]', drift: 12, duration: 32 },
    ],
    [],
  )

  const butterflies = useMemo(
    () => [
      { id: 'butterfly-1', className: 'left-[6%] top-[23%] w-7 opacity-80 sm:w-9', upper: '#f7a8c8', lower: '#ffd7e5', float: 10, flap: 1.3, delay: 0 },
      { id: 'butterfly-2', className: 'right-[7%] top-[31%] w-6 opacity-70 sm:w-8', upper: '#c9b8f8', lower: '#e7ddff', float: 12, flap: 1.6, delay: 1.1 },
      { id: 'butterfly-3', className: 'bottom-[27%] left-[12%] w-5 opacity-60 sm:w-7', upper: '#f9b7d0', lower: '#ffe3ee', float: 13, flap: 1.45, delay: 0.6 },
      { id: 'butterfly-4', className: 'bottom-[17%] right-[13%] w-7 opacity-75 sm:w-8', upper: '#d5c6fb', lower: '#efe8ff', float: 11, flap: 1.5, delay: 1.7 },
      { id: 'butterfly-5', className: 'top-[57%] right-[5%] w-5 opacity-55 sm:w-6', upper: '#f7a8c8', lower: '#ffd7e5', float: 14, flap: 1.75, delay: 2.3 },
    ],
    [],
  )

  const hearts = useMemo(
    () =>
      Array.from({ length: 6 }).map((_, i) => ({
        id: i,
        left: (i * 37 + 9) % 94,
        top: 46 + ((i * 13) % 34),
        size: 5 + (i % 3) * 3,
        color: i % 2 === 0 ? '#f7a8c8' : '#c9b8f8',
        delay: ((i * 17) % 70) / 10,
        duration: 15 + (i % 4) * 4,
        drift: (i % 2 === 0 ? 1 : -1) * (10 + (i % 3) * 8),
        opacity: 0.2 + (i % 3) * 0.08,
      })),
    [],
  )

  const balloons = useMemo(
    () => [
      { id: 'balloon-1', emoji: '🎈', left: 9, duration: 30, sway: -16, opacity: 0.38, delay: 0 },
      { id: 'balloon-2', emoji: '🎈', left: 68, duration: 34, sway: 14, opacity: 0.3, delay: 4 },
      { id: 'balloon-3', emoji: '🎀', left: 87, duration: 27, sway: -12, opacity: 0.4, delay: 8 },
    ],
    [],
  )

  const sparkles = useMemo(
    () =>
      Array.from({ length: 5 }).map((_, i) => ({
        id: i,
        left: (i * 41 + 14) % 92,
        top: 30 + ((i * 21) % 48),
        size: 11 + (i % 3) * 4,
        color: i % 2 === 0 ? '#f472b6' : '#a78bfa',
        delay: ((i * 23) % 80) / 10,
        duration: 9 + (i % 4) * 3,
      })),
    [],
  )

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* Soft depth: glow orbs + a gentle spotlight behind the content */}
      <div className="absolute -top-28 -left-24 h-80 w-80 rounded-full bg-[#FFD1E4]/50 blur-3xl" />
      <div className="absolute top-[28%] -right-28 h-96 w-96 rounded-full bg-[#E4D7FF]/55 blur-3xl" />
      <div className="absolute -bottom-24 left-[18%] h-80 w-80 rounded-full bg-[#FFD9E8]/50 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 h-[62vh] w-[86vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40 blur-3xl" />

      {/* Airy light at the top, dreamy mist at the bottom */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/70 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-white/60 via-white/25 to-transparent" />

      {/* Hanging HAPPY garland */}
      <motion.div
        initial={{ opacity: 0, y: -22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.15, ease: 'easeOut' }}
        className="absolute inset-x-0 top-20 flex justify-center px-4 sm:top-28"
      >
        <div className="relative">
          <svg
            viewBox="0 0 240 40"
            preserveAspectRatio="none"
            className="absolute -top-3 left-0 h-10 w-full"
            aria-hidden
          >
            <path
              d="M4 10 Q120 34 236 10"
              fill="none"
              stroke="#f6aecb"
              strokeWidth="2"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div className="flex items-start gap-1.5 sm:gap-2.5">
            {garland.map((flag, index) => (
              <motion.div
                key={flag.letter + index}
                initial={{ opacity: 0, y: -14, rotate: index % 2 === 0 ? -2.5 : 2.5 }}
                animate={{ opacity: 1, y: 0, rotate: index % 2 === 0 ? [-2.5, 2.5, -2.5] : [2.5, -2.5, 2.5] }}
                transition={{
                  y: { duration: 0.5, delay: 0.3 + index * 0.12, ease: 'easeOut' },
                  opacity: { duration: 0.5, delay: 0.3 + index * 0.12 },
                  rotate: { duration: 3.4 + index * 0.5, repeat: Infinity, ease: 'easeInOut', delay: index * 0.3 },
                }}
                style={{ marginTop: 6 + flag.droop, transformOrigin: 'top center' }}
                className="drop-shadow-[0_6px_10px_rgba(200,110,150,0.35)]"
              >
                <div
                  className="flex h-11 w-8 items-start justify-center pt-1.5 [clip-path:polygon(0_0,100%_0,100%_70%,50%_100%,0_70%)] sm:h-14 sm:w-11 sm:pt-2.5"
                  style={{ background: flag.bg }}
                >
                  <span className="font-display text-lg font-bold text-rose-700 sm:text-2xl">
                    {flag.letter}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Cute companions near the top */}
      <motion.div
        animate={{ y: [0, -9, 0], rotate: [-3, 3, -3] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[26vh] left-[7%] flex items-end gap-1 text-4xl drop-shadow-[0_6px_12px_rgba(180,110,150,0.35)] sm:top-[24vh] sm:left-[11%] sm:text-5xl"
      >
        <span>🧸</span>
        <span className="-mb-1 text-2xl drop-shadow-[0_4px_10px_rgba(225,29,72,0.3)] sm:text-3xl">
          💗
        </span>
      </motion.div>
      <motion.div
        animate={{ y: [0, -11, 0], rotate: [4, -4, 4] }}
        transition={{ duration: 8.5, repeat: Infinity, ease: 'easeInOut', delay: 1.4 }}
        className="absolute top-[25vh] right-[8%] text-4xl drop-shadow-[0_6px_12px_rgba(190,120,160,0.32)] sm:top-[23vh] sm:right-[12%] sm:text-5xl"
      >
        🎀
      </motion.div>

      {/* Soft drifting clouds */}
      {clouds.map((cloud) => (
        <motion.div
          key={cloud.id}
          className={`absolute ${cloud.className} ${cloud.blur}`}
          style={{ opacity: cloud.opacity }}
          animate={{ x: [0, cloud.drift, 0] }}
          transition={{ duration: cloud.duration, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg viewBox="0 0 240 110" className="h-auto w-full" aria-hidden>
            <g fill="#ffffff">
              <rect x="30" y="58" width="180" height="44" rx="22" />
              <ellipse cx="78" cy="58" rx="46" ry="34" />
              <ellipse cx="138" cy="48" rx="40" ry="36" />
              <ellipse cx="182" cy="64" rx="34" ry="26" />
              <ellipse cx="48" cy="70" rx="34" ry="24" />
            </g>
          </svg>
        </motion.div>
      ))}

      {/* A few elegant butterflies */}
      {butterflies.map((butterfly) => (
        <motion.div
          key={butterfly.id}
          className={`absolute ${butterfly.className}`}
          animate={{ y: [0, -14, 0], x: [0, 9, 0], rotate: [-6, 7, -6] }}
          transition={{
            duration: butterfly.float,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: butterfly.delay,
          }}
        >
          <Butterfly upper={butterfly.upper} lower={butterfly.lower} flap={butterfly.flap} delay={butterfly.delay} />
        </motion.div>
      ))}

      {/* Gentle floating hearts */}
      {hearts.map((heart) => (
        <motion.span
          key={`heart-${heart.id}`}
          className="absolute rounded-full"
          style={{
            left: `${heart.left}%`,
            top: `${heart.top}%`,
            width: heart.size,
            height: heart.size,
            background: heart.color,
            boxShadow: `0 0 10px ${heart.color}`,
            opacity: heart.opacity,
          }}
          animate={{
            y: [0, -26, 0],
            x: Math.sin(heart.delay + heart.id) * heart.drift,
            opacity: [heart.opacity, heart.opacity + 0.22, heart.opacity],
            borderRadius: ['50%', '50% 0 50% 50%', '50%'],
          }}
          transition={{
            duration: heart.duration,
            repeat: Infinity,
            delay: heart.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Slow rising balloons */}
      {balloons.map((balloon) => (
        <motion.span
          key={balloon.id}
          className="absolute text-2xl select-none sm:text-3xl"
          style={{ left: `${balloon.left}%`, bottom: '-8%' }}
          initial={{ y: 0, opacity: 0 }}
          animate={{
            y: ['0vh', '-115vh'],
            x: [0, balloon.sway, 0],
            opacity: [0, balloon.opacity, balloon.opacity, 0],
          }}
          transition={{
            duration: balloon.duration,
            repeat: Infinity,
            delay: balloon.delay,
            ease: 'linear',
          }}
        >
          {balloon.emoji}
        </motion.span>
      ))}

      {/* Tiny twinkles */}
      {sparkles.map((sparkle) => (
        <motion.span
          key={`sparkle-${sparkle.id}`}
          className="absolute"
          style={{
            left: `${sparkle.left}%`,
            top: `${sparkle.top}%`,
            fontSize: sparkle.size,
            color: sparkle.color,
          }}
          animate={{
            y: [-6, -22, -6],
            opacity: [0.15, 0.6, 0.15],
            scale: [0.7, 1.15, 0.7],
          }}
          transition={{
            duration: sparkle.duration,
            repeat: Infinity,
            delay: sparkle.delay,
            ease: 'easeInOut',
          }}
        >
          ✦
        </motion.span>
      ))}
    </div>
  )
}

interface ButterflyProps {
  upper: string
  lower: string
  flap: number
  delay: number
}

function Butterfly({ upper, lower, flap, delay }: ButterflyProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      className="h-auto w-full drop-shadow-[0_3px_8px_rgba(190,120,160,0.4)]"
      aria-hidden
    >
      <motion.g
        initial={{ scaleX: 1, originX: 1, originY: 0.5 }}
        animate={{ scaleX: [1, 0.45, 1], originX: 1, originY: 0.5 }}
        transition={{ duration: flap, repeat: Infinity, ease: 'easeInOut', delay }}
      >
        <path d="M32 32 C31 14 18 5 9 10 C1 15 6 28 31 34 Z" fill={upper} />
        <path d="M31 35 C14 33 4 40 8 49 C12 57 24 51 32 38 Z" fill={lower} />
        <circle cx="18" cy="20" r="3" fill="#ffffff" opacity="0.55" />
      </motion.g>
      <motion.g
        initial={{ scaleX: 1, originX: 0, originY: 0.5 }}
        animate={{ scaleX: [1, 0.45, 1], originX: 0, originY: 0.5 }}
        transition={{ duration: flap, repeat: Infinity, ease: 'easeInOut', delay }}
      >
        <path d="M32 32 C33 14 46 5 55 10 C63 15 58 28 33 34 Z" fill={upper} />
        <path d="M33 35 C50 33 60 40 56 49 C52 57 40 51 32 38 Z" fill={lower} />
        <circle cx="46" cy="20" r="3" fill="#ffffff" opacity="0.55" />
      </motion.g>
      <path
        d="M32 24 C34.5 30 34.5 45 32 53 C29.5 45 29.5 30 32 24 Z"
        fill="#8c5b73"
      />
      <path
        d="M31.5 26 C29 20 26 18 23.5 17 M32.5 26 C35 20 38 18 40.5 17"
        fill="none"
        stroke="#8c5b73"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
