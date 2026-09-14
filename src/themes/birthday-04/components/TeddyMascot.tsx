import { motion, type Transition, type Variants } from 'framer-motion'

export type TeddyState = 'shy' | 'excited' | 'countdown' | 'party' | 'letter' | 'cake'

interface TeddyMascotProps {
  state?: TeddyState
  className?: string
}

const bodyVariants: Record<TeddyState, Variants> = {
  shy: {
    animate: {
      y: [0, -5, 0],
      rotate: [-2, 2, -2],
    },
  },
  excited: {
    animate: {
      y: [0, -12, 0],
      scaleX: [1, 0.96, 1.04, 1],
      scaleY: [1, 1.05, 0.97, 1],
    },
  },
  countdown: {
    animate: {
      rotate: [-3, 3, -3],
      y: [0, -4, 0],
    },
  },
  party: {
    animate: {
      y: [0, -10, 0],
      scaleX: [1, 1.03, 0.98, 1],
      scaleY: [1, 0.97, 1.04, 1],
    },
  },
  letter: {
    animate: {
      y: [0, -4, 0],
      rotate: [-1, 1, -1],
    },
  },
  cake: {
    animate: {
      y: [0, -6, 0],
      rotate: [-1.5, 1.5, -1.5],
    },
  },
}

const bodyTransition: Record<TeddyState, Transition> = {
  shy: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' },
  excited: { duration: 1.2, repeat: Infinity, ease: 'easeInOut', times: [0, 0.35, 0.65, 1] },
  countdown: { duration: 0.25, repeat: Infinity, ease: 'easeInOut' },
  party: { duration: 1.4, repeat: Infinity, ease: 'easeInOut', times: [0, 0.3, 0.6, 1] },
  letter: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  cake: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
}

const earWiggle: { animate: { rotate: number[] }; transition: Transition } = {
  animate: { rotate: [-4, 4, -4] },
  transition: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' },
}

export function TeddyMascot({ state = 'excited', className = 'w-48 h-48 sm:w-56 sm:h-56' }: TeddyMascotProps) {
  const isGiggling = state === 'shy' || state === 'excited'
  const hasHat = state === 'party' || state === 'cake'
  const showEnvelope = state === 'letter'
  const showArmsUp = state === 'party'
  const showArmHold = state === 'letter' || state === 'cake'
  const showPawsWaving = state === 'shy'
  const showStrainedEyes = false

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Soft ambient glow behind mascot */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-t from-rose-300/30 via-pink-200/20 to-transparent blur-2xl pointer-events-none" />

      {/* Floating hearts */}
      <motion.div
        animate={{ y: [-4, -20, -4], opacity: [0.6, 1, 0.6], scale: [0.9, 1.15, 0.9] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-3 -right-3 text-rose-400 text-xl pointer-events-none z-20"
      >
        💖
      </motion.div>
      <motion.div
        animate={{ y: [-2, -16, -2], opacity: [0.5, 0.9, 0.5], scale: [0.85, 1.05, 0.85] }}
        transition={{ duration: 2.2, delay: 0.6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-1 -left-3 text-pink-400 text-lg pointer-events-none z-20"
      >
        💕
      </motion.div>

      {state === 'excited' && (
        <motion.div
          animate={{ y: [-6, -22, -6], opacity: [0.4, 0.85, 0.4], scale: [0.8, 1.1, 0.8] }}
          transition={{ duration: 2, delay: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1 -right-6 text-rose-300 text-sm pointer-events-none z-20"
        >
          ✨
        </motion.div>
      )}

      {state === 'party' && (
        <>
          <motion.div
            animate={{ y: [-8, -28, -8], opacity: [0.5, 1, 0.5], rotate: [0, 15, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-6 -left-5 text-2xl pointer-events-none z-20"
          >
            🎉
          </motion.div>
          <motion.div
            animate={{ y: [-5, -24, -5], opacity: [0.4, 0.9, 0.4], rotate: [0, -10, 0] }}
            transition={{ duration: 2.6, delay: 0.4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-4 -right-6 text-xl pointer-events-none z-20"
          >
            🎊
          </motion.div>
        </>
      )}

      {state === 'cake' && (
        <>
          <motion.div
            animate={{ y: [-3, -14, -3], opacity: [0.4, 0.8, 0.4], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-5 left-1/2 -translate-x-3 text-rose-400 text-lg pointer-events-none z-20"
          >
            🕯️
          </motion.div>
          <motion.div
            animate={{ y: [-2, -10, -2], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2.4, delay: 0.8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-0 -right-4 text-amber-300 text-sm pointer-events-none z-20"
          >
            ✨
          </motion.div>
        </>
      )}

      {/* Main teddy SVG */}
      <motion.svg
        viewBox="0 0 200 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-lg overflow-visible"
        variants={bodyVariants[state]}
        animate="animate"
        transition={bodyTransition[state]}
      >
        <defs>
          <radialGradient id="blush-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FDA4AF" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#FDA4AF" stopOpacity="0" />
          </radialGradient>
          <filter id="soft-shadow" x="-20%" y="-10%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#FDE2E8" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* === EARS === */}
        <motion.g {...earWiggle} style={{ transformOrigin: '55px 55px' }}>
          <circle cx="55" cy="55" r="24" fill="#FFFBFC" stroke="#FDE2E8" strokeWidth="3.5" />
          <circle cx="55" cy="55" r="13" fill="#FECDD3" />
        </motion.g>
        <motion.g {...earWiggle} style={{ transformOrigin: '145px 55px' }}>
          <circle cx="145" cy="55" r="24" fill="#FFFBFC" stroke="#FDE2E8" strokeWidth="3.5" />
          <circle cx="145" cy="55" r="13" fill="#FECDD3" />
        </motion.g>

        {/* === HEAD === */}
        <ellipse cx="100" cy="95" rx="68" ry="62" fill="#FFFBFC" stroke="#FDE2E8" strokeWidth="3.5" filter="url(#soft-shadow)" />

        {/* === BLUSH CHEEKS === */}
        <motion.ellipse
          cx="55" cy="108" rx="15" ry="10"
          fill="url(#blush-grad)"
          animate={{ opacity: [0.5, 0.85, 0.5] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.ellipse
          cx="145" cy="108" rx="15" ry="10"
          fill="url(#blush-grad)"
          animate={{ opacity: [0.5, 0.85, 0.5] }}
          transition={{ duration: 2.2, delay: 0.3, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* === EYES === */}
        {isGiggling || showStrainedEyes ? (
          /* Happy squinting ^ ^ eyes */
          <>
            <motion.path
              d="M 68 90 Q 78 78 88 90"
              stroke="#372528"
              strokeWidth="4.5"
              strokeLinecap="round"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            />
            <motion.path
              d="M 112 90 Q 122 78 132 90"
              stroke="#372528"
              strokeWidth="4.5"
              strokeLinecap="round"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            />
          </>
        ) : (
          /* Big round twinkling eyes */
          <>
            <motion.g
              animate={{ scaleY: [1, 1, 0.08, 1, 1] }}
              transition={{ duration: 4, repeat: Infinity, times: [0, 0.45, 0.5, 0.55, 1] }}
              style={{ transformOrigin: '78px 88px' }}
            >
              <circle cx="78" cy="88" r="7.5" fill="#2E1C20" />
              <circle cx="75.5" cy="85.5" r="2.8" fill="#FFFFFF" />
              <circle cx="81" cy="90" r="1.2" fill="#FFFFFF" opacity="0.6" />
            </motion.g>
            <motion.g
              animate={{ scaleY: [1, 1, 0.08, 1, 1] }}
              transition={{ duration: 4, repeat: Infinity, times: [0, 0.45, 0.5, 0.55, 1] }}
              style={{ transformOrigin: '122px 88px' }}
            >
              <circle cx="122" cy="88" r="7.5" fill="#2E1C20" />
              <circle cx="119.5" cy="85.5" r="2.8" fill="#FFFFFF" />
              <circle cx="125" cy="90" r="1.2" fill="#FFFFFF" opacity="0.6" />
            </motion.g>
          </>
        )}

        {/* === NOSE === */}
        <ellipse cx="100" cy="100" rx="5.5" ry="4" fill="#3E2429" />

        {/* === MOUTH === */}
        {isGiggling ? (
          /* Hands covering giggling mouth */
          <>
            <motion.ellipse
              cx="85" cy="110" rx="14" ry="11"
              fill="#FFFBFC" stroke="#FDE2E8" strokeWidth="2.5"
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.ellipse
              cx="115" cy="110" rx="14" ry="11"
              fill="#FFFBFC" stroke="#FDE2E8" strokeWidth="2.5"
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 0.7, delay: 0.1, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Paw pads */}
            <ellipse cx="85" cy="112" rx="6" ry="4.5" fill="#FECDD3" opacity="0.5" />
            <ellipse cx="115" cy="112" rx="6" ry="4.5" fill="#FECDD3" opacity="0.5" />
          </>
        ) : (
          /* Open happy smile */
          <path
            d="M 86 108 Q 100 122 114 108"
            stroke="#372528"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* === BODY === */}
        <ellipse cx="100" cy="165" rx="54" ry="44" fill="#FFFBFC" stroke="#FDE2E8" strokeWidth="3.5" filter="url(#soft-shadow)" />

        {/* Tummy patch */}
        <ellipse cx="100" cy="168" rx="34" ry="28" fill="#FFF5F7" />

        {/* === ARMS === */}
        {showArmsUp && (
          /* Arms raised high for party */
          <>
            <motion.ellipse
              cx="38" cy="130" rx="14" ry="10"
              fill="#FFFBFC" stroke="#FDE2E8" strokeWidth="3"
              transform="rotate(-55 38 130)"
              animate={{ rotate: [-55, -45, -55] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: '38px 130px' }}
            />
            <motion.ellipse
              cx="162" cy="130" rx="14" ry="10"
              fill="#FFFBFC" stroke="#FDE2E8" strokeWidth="3"
              transform="rotate(55 162 130)"
              animate={{ rotate: [55, 45, 55] }}
              transition={{ duration: 0.8, delay: 0.1, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: '162px 130px' }}
            />
          </>
        )}

        {showArmHold && (
          /* Arms forward to hold object */
          <>
            <ellipse
              cx="50" cy="152" rx="14" ry="10"
              fill="#FFFBFC" stroke="#FDE2E8" strokeWidth="3"
              transform="rotate(-30 50 152)"
            />
            <ellipse
              cx="150" cy="152" rx="14" ry="10"
              fill="#FFFBFC" stroke="#FDE2E8" strokeWidth="3"
              transform="rotate(30 150 152)"
            />
          </>
        )}

        {showPawsWaving && (
          /* Subtle paw wave */
          <>
            <motion.ellipse
              cx="44" cy="165" rx="14" ry="10"
              fill="#FFFBFC" stroke="#FDE2E8" strokeWidth="3"
              animate={{ rotate: [-10, 10, -10] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: '44px 165px' }}
            />
            <motion.ellipse
              cx="156" cy="165" rx="14" ry="10"
              fill="#FFFBFC" stroke="#FDE2E8" strokeWidth="3"
              animate={{ rotate: [10, -10, 10] }}
              transition={{ duration: 1.8, delay: 0.15, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: '156px 165px' }}
            />
          </>
        )}

        {!showArmsUp && !showArmHold && !showPawsWaving && (
          /* Default resting arms */
          <>
            <ellipse cx="46" cy="160" rx="13" ry="9" fill="#FFFBFC" stroke="#FDE2E8" strokeWidth="3" transform="rotate(-15 46 160)" />
            <ellipse cx="154" cy="160" rx="13" ry="9" fill="#FFFBFC" stroke="#FDE2E8" strokeWidth="3" transform="rotate(15 154 160)" />
          </>
        )}

        {/* === FEET === */}
        <motion.ellipse
          cx="72" cy="202" rx="18" ry="12"
          fill="#FFFBFC" stroke="#FDE2E8" strokeWidth="3"
          animate={state === 'shy' ? { rotate: [-5, 5, -5] } : {}}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '72px 202px' }}
        />
        <ellipse cx="72" cy="203" rx="9" ry="6" fill="#FECDD3" opacity="0.55" />

        <motion.ellipse
          cx="128" cy="202" rx="18" ry="12"
          fill="#FFFBFC" stroke="#FDE2E8" strokeWidth="3"
          animate={state === 'shy' ? { rotate: [5, -5, 5] } : {}}
          transition={{ duration: 1.2, delay: 0.15, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '128px 202px' }}
        />
        <ellipse cx="128" cy="203" rx="9" ry="6" fill="#FECDD3" opacity="0.55" />

        {/* === PARTY HAT === */}
        {hasHat && (
          <g transform="translate(82, 22)">
            <polygon points="18,0 0,40 36,40" fill="#FF4D79" stroke="#FFE4E6" strokeWidth="2" strokeLinejoin="round" />
            <circle cx="18" cy="0" r="6" fill="#FFD166" />
            <circle cx="18" cy="20" r="3.5" fill="#FFFFFF" opacity="0.75" />
            <circle cx="10" cy="30" r="2.5" fill="#FFD166" opacity="0.6" />
            <circle cx="26" cy="28" r="2" fill="#FFFFFF" opacity="0.5" />
          </g>
        )}

        {/* === ENVELOPE (letter state) === */}
        {showEnvelope && (
          <g transform="translate(60, 138)">
            <rect x="0" y="0" width="80" height="52" rx="5" fill="#FFF8E7" stroke="#E8C47C" strokeWidth="1.5" />
            <path d="M 0 0 L 40 28 L 80 0" stroke="#E8C47C" strokeWidth="1.5" fill="none" />
            <circle cx="40" cy="14" r="6" fill="#FF4D79" opacity="0.15" />
            <text x="40" y="18" textAnchor="middle" fontSize="10" fill="#FF4D79">♥</text>
          </g>
        )}
      </motion.svg>

      {/* Tapping feet indicator for shy state */}
      {state === 'shy' && (
        <motion.div
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1.5 }}
          className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 gap-2 z-10"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-rose-300/60" />
          <span className="h-1.5 w-1.5 rounded-full bg-rose-300/40" />
          <span className="h-1.5 w-1.5 rounded-full bg-rose-300/60" />
        </motion.div>
      )}
    </div>
  )
}
