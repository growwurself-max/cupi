import { motion } from 'framer-motion'
import { useState } from 'react'

const STYLE = `
  @keyframes earWiggleL {
    0%, 100% { transform: rotate(0deg) scaleY(1); }
    50% { transform: rotate(8deg) scaleY(1.06); }
  }
  @keyframes earWiggleR {
    0%, 100% { transform: rotate(0deg) scaleY(1); }
    50% { transform: rotate(-8deg) scaleY(1.06); }
  }
  @keyframes bearBlink {
    0%, 92%, 100% { transform: scaleY(1); }
    95% { transform: scaleY(0.12); }
  }
`

const MILK_FUR = '#FFFDF9'
const MILK_STROKE = '#EFD5C2'
const MOCHA_FUR = '#C0875B'
const MOCHA_STROKE = '#8F6542'
const NOSE = '#432C1F'
const HIGHLIGHT = '#FFFFFF'

interface BearProps {
  x: number
  fur: string
  stroke: string
  earFill: string
  muzzleFill: string
}

function Bear({ x, fur, stroke, earFill, muzzleFill }: BearProps) {
  const headY = 84
  const earStyle = {
    transformBox: 'fill-box',
    transformOrigin: '50% 100%',
  } as const
  return (
    <g filter="url(#bearSoftShadow)">
      {/* ears — each wiggles independently, mirrored per side */}
      <g
        className="bear-ear"
        style={{
          ...earStyle,
          animation: 'earWiggleL 2.3s ease-in-out infinite',
        }}
      >
        <circle cx={x - 26} cy={headY - 26} r="13" fill={fur} stroke={stroke} strokeWidth="2" />
        <circle cx={x - 26} cy={headY - 26} r="6.5" fill={earFill} />
        <circle cx={x - 27} cy={headY - 29} r="2" fill={HIGHLIGHT} opacity="0.5" />
      </g>
      <g
        className="bear-ear"
        style={{
          ...earStyle,
          animation: 'earWiggleR 2.3s ease-in-out infinite',
          animationDelay: '0.35s',
        }}
      >
        <circle cx={x + 26} cy={headY - 26} r="13" fill={fur} stroke={stroke} strokeWidth="2" />
        <circle cx={x + 26} cy={headY - 26} r="6.5" fill={earFill} />
        <circle cx={x + 25} cy={headY - 29} r="2" fill={HIGHLIGHT} opacity="0.5" />
      </g>
      {/* head */}
      <circle cx={x} cy={headY} r="34" fill={fur} stroke={stroke} strokeWidth="2.5" />
      {/* eyes — blink together, kept buttery */}
      <g
        style={{
          animation: 'bearBlink 4.2s ease-in-out infinite',
          transformBox: 'fill-box',
          transformOrigin: 'center',
        }}
      >
        <circle cx={x - 12} cy={headY - 2} r="4" fill={NOSE} />
        <circle cx={x + 12} cy={headY - 2} r="4" fill={NOSE} />
        <circle cx={x - 12.8} cy={headY - 3.4} r="1.1" fill={HIGHLIGHT} opacity="0.85" />
        <circle cx={x + 11.2} cy={headY - 3.4} r="1.1" fill={HIGHLIGHT} opacity="0.85" />
      </g>
      {/* blush — soft radial bloom */}
      <circle cx={x - 21} cy={headY + 10} r="7" fill="url(#blushGrad)" />
      <circle cx={x + 21} cy={headY + 10} r="7" fill="url(#blushGrad)" />
      {/* muzzle */}
      <ellipse cx={x} cy={headY + 13} rx="12" ry="9" fill={muzzleFill} />
      <ellipse cx={x} cy={headY + 10} rx="3.6" ry="2.8" fill={NOSE} />
      <path
        d={`M${x} ${headY + 13} L${x} ${headY + 19}`}
        stroke={NOSE}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </g>
  )
}

const GOLD_SPARKS = [
  { x: 30, y: 70, r: 3.4, dur: 4.4, delay: 0, drift: -11 },
  { x: 64, y: 26, r: 2.2, dur: 3.6, delay: 0.5, drift: -7 },
  { x: 212, y: 24, r: 2.8, dur: 3.9, delay: 1.1, drift: -8 },
  { x: 250, y: 62, r: 3.4, dur: 4.8, delay: 0.3, drift: -12 },
  { x: 24, y: 114, r: 2.1, dur: 3.3, delay: 1.6, drift: -6 },
  { x: 256, y: 112, r: 2.4, dur: 3.7, delay: 0.9, drift: -7 },
  { x: 140, y: 44, r: 2.2, dur: 4.2, delay: 2.2, drift: -8 },
  { x: 36, y: 152, r: 2.0, dur: 4.0, delay: 2.0, drift: -5 },
  { x: 244, y: 150, r: 2.0, dur: 4.0, delay: 1.4, drift: -5 },
]

export function CoupleIllustration() {
  return (
    <>
      <style>{STYLE}</style>
      <motion.svg
        viewBox="0 0 280 200"
        className="mx-auto mb-2 h-auto w-72 sm:mb-4 sm:w-80"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden
      >
        <defs>
          <radialGradient id="warmAmbient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFE0B0" stopOpacity="0.55" />
            <stop offset="55%" stopColor="#FFD5A4" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#FFD5A4" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="goldGlitter" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF3D6" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#FFD98F" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#F0A93E" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="blushGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFB9C8" stopOpacity="0.95" />
            <stop offset="65%" stopColor="#FFB9C8" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#FFB9C8" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="earPinkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFE9EF" />
            <stop offset="100%" stopColor="#FFC6D6" />
          </linearGradient>
          <linearGradient id="earMochaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E3B787" />
            <stop offset="100%" stopColor="#C78C5C" />
          </linearGradient>
          <linearGradient id="muzzleLightGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFF1E3" />
            <stop offset="100%" stopColor="#FFE5CF" />
          </linearGradient>
          <linearGradient id="muzzleMochaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F3D2A6" />
            <stop offset="100%" stopColor="#E1B17E" />
          </linearGradient>
          <linearGradient id="milkBodyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFDF9" />
            <stop offset="100%" stopColor="#FBE6D6" />
          </linearGradient>
          <linearGradient id="mochaBodyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#CA9063" />
            <stop offset="100%" stopColor="#A06C43" />
          </linearGradient>
          <linearGradient id="heartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF8FAF" />
            <stop offset="55%" stopColor="#F26391" />
            <stop offset="100%" stopColor="#C42E5D" />
          </linearGradient>
          <filter id="bearSoftShadow" x="-35%" y="-35%" width="170%" height="175%">
            <feDropShadow dx="0" dy="3.5" stdDeviation="4" floodColor="#5C2B33" floodOpacity="0.16" />
          </filter>
          <filter id="heartGlow" x="-70%" y="-70%" width="240%" height="240%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* lifted inside the viewBox so the canvas keeps clear bottom breathing room */}
        <g transform="translate(0, -18)">
          {/* warm ambient candle-light behind the bears */}
          <circle cx="102" cy="66" r="88" fill="url(#warmAmbient)" opacity="0.95" />
          <circle cx="178" cy="66" r="88" fill="url(#warmAmbient)" opacity="0.95" />

          {/* soft ground shadow */}
          <ellipse cx="140" cy="172" rx="96" ry="12" fill="rgba(150,90,60,0.14)" />

          <Bear
            x={102}
            fur={MILK_FUR}
            stroke={MILK_STROKE}
            earFill="url(#earPinkGrad)"
            muzzleFill="url(#muzzleLightGrad)"
          />
          <Bear
            x={178}
            fur={MOCHA_FUR}
            stroke={MOCHA_STROKE}
            earFill="url(#earMochaGrad)"
            muzzleFill="url(#muzzleMochaGrad)"
          />

          {/* bodies */}
          <path
            d="M78 116 Q76 158 90 168 L114 168 Q126 168 126 156 L126 116 Z"
            fill="url(#milkBodyGrad)"
            stroke={MILK_STROKE}
            strokeWidth="2.5"
          />
          <path
            d="M154 116 Q154 156 166 168 L190 168 Q204 168 202 158 L202 116 Z"
            fill="url(#mochaBodyGrad)"
            stroke={MOCHA_STROKE}
            strokeWidth="2.5"
          />

          {/* arms reaching toward the shared heart */}
          <motion.g
            animate={{ rotate: [0, -5, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '108px 150px' }}
          >
            <ellipse cx="116" cy="138" rx="16" ry="9" fill={MILK_FUR} stroke={MILK_STROKE} strokeWidth="2" transform="rotate(-24 116 138)" />
          </motion.g>
          <motion.g
            animate={{ rotate: [0, 5, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '172px 150px' }}
          >
            <ellipse cx="164" cy="138" rx="16" ry="9" fill={MOCHA_FUR} stroke={MOCHA_STROKE} strokeWidth="2" transform="rotate(24 164 138)" />
          </motion.g>

          {/* shared heart — fluid, organic heartbeat */}
          <motion.path
            d="M140 128 C138 120 128 118 126.5 126 C125.5 132 132 138 140 144 C148 138 154.5 132 153.5 126 C152 118 142 120 140 128 Z"
            fill="url(#heartGrad)"
            filter="url(#heartGlow)"
            animate={{ scale: [1, 1.16, 1], y: [0, -3, 0], opacity: [0.9, 1, 0.9] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          />
          <motion.circle
            cx="134"
            cy="122"
            r="3.2"
            fill="#FFF"
            opacity="0.75"
            animate={{ opacity: [0.35, 0.85, 0.35] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* golden drifting glitters */}
          {GOLD_SPARKS.map((s, i) => (
            <motion.circle
              key={i}
              cx={s.x}
              cy={s.y}
              r={s.r}
              fill="url(#goldGlitter)"
              animate={{ y: [0, s.drift, 0], opacity: [0, 0.95, 0], scale: [0.55, 1.05, 0.55] }}
              transition={{ duration: s.dur, repeat: Infinity, delay: s.delay, ease: 'easeInOut' }}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            />
          ))}
        </g>
      </motion.svg>
    </>
  )
}

/**
 * Animated couple sticker placeholder.
 *
 * A looping MP4 (autoplay/loop) renders here from `public/assets/couple-animation.gif.mp4`.
 * While the file is missing (or fails to load) the classic vector
 * illustration is shown as a fallback, so nothing ever looks broken.
 */
export function CoupleAnimation() {
  const [failed, setFailed] = useState(false)
  return (
    <div className="mx-auto mb-4 w-60 sm:mb-6 sm:w-72">
      {failed ? (
        <CoupleIllustration />
      ) : (
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-transparent ring-1 ring-[#E9C5B6]/25">
          <motion.video
            src="/assets/couple-animation.gif.mp4"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            aria-label="Animated couple celebrating"
            className="h-full w-full object-contain mix-blend-multiply"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            onError={() => setFailed(true)}
          />
        </div>
      )}
    </div>
  )
}