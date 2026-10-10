import { motion } from 'framer-motion'
import { GOLD_TRIM, PALETTE } from '../palette'

interface CurtainStageProps {
  /** When true the curtains are drawn back into their tied-back pose. */
  open: boolean
  reduce: boolean
  /** Show the "tap to open" cue and allow the tap target. */
  interactive?: boolean
  onOpen?: () => void
  cueLabel?: string
}

const LEFT_SATIN = `linear-gradient(90deg, ${PALETTE.satin4} 0%, ${PALETTE.satin3} 18%, ${PALETTE.satin2} 55%, ${PALETTE.satin1} 100%)`
const RIGHT_SATIN = `linear-gradient(270deg, ${PALETTE.satin4} 0%, ${PALETTE.satin3} 18%, ${PALETTE.satin2} 55%, ${PALETTE.satin1} 100%)`

/** Vertical satin folds, mirrored for the right-hand curtain. */
function folds(mirror: boolean): string {
  const dir = mirror ? '270deg' : '90deg'
  return [
    `repeating-linear-gradient(${dir}, rgba(255,255,255,0.18) 0px, rgba(255,255,255,0.05) 7px, rgba(120,44,74,0.30) 16px, rgba(255,255,255,0.07) 24px, rgba(120,44,74,0.34) 34px, rgba(255,255,255,0.13) 46px)`,
    `repeating-linear-gradient(${dir}, rgba(110,36,64,0.10) 0 2px, transparent 2px 46px)`,
  ].join(', ')
}

/**
 * The theatre itself: a warm stage wash, a scalloped gold-trimmed valance, two
 * layered satin curtains that part with physical easing, and champagne tie-backs
 * with tassels. All fabric is CSS gradients + inline SVG, so it stays crisp at
 * any DPI and never loads a raster asset.
 */
export function CurtainStage({
  open,
  reduce,
  interactive = false,
  onOpen,
  cueLabel = 'tap to open',
}: CurtainStageProps) {
  return (
    <div
      aria-hidden={!interactive}
      className={`fixed inset-0 z-40 overflow-hidden ${interactive ? '' : 'pointer-events-none'}`}
    >
      <CurtainPanel side="left" open={open} reduce={reduce} />
      <CurtainPanel side="right" open={open} reduce={reduce} />

      <TieBack side="left" open={open} reduce={reduce} />
      <TieBack side="right" open={open} reduce={reduce} />

      <Valance />

      {/* "Tap to open" cue */}
      {interactive && !open && (
        <motion.button
          type="button"
          onClick={onOpen}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="pointer-events-auto absolute bottom-[7vh] left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-3 rounded-full px-6 py-3 outline-none focus-visible:ring-2 focus-visible:ring-[#c2688c]"
          aria-label="Open the curtains"
        >
          <span className="relative flex h-14 w-14 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-white/60 [animation-duration:2.4s]" />
            <span
              className="relative flex h-14 w-14 items-center justify-center rounded-full"
              style={{ background: GOLD_TRIM, boxShadow: '0 10px 26px -8px rgba(120,60,80,0.55)' }}
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
                <path
                  d="M7 10 L12 5 L17 10 M12 5 V19"
                  stroke={PALETTE.berry}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </span>
          <span
            className="rounded-full px-4 py-1.5 text-[11px] font-semibold tracking-[0.32em] text-[#6E2440] uppercase backdrop-blur-sm"
            style={{ background: 'rgba(255,255,255,0.62)' }}
          >
            {cueLabel}
          </span>
        </motion.button>
      )}
    </div>
  )
}

interface CurtainPanelProps {
  side: 'left' | 'right'
  open: boolean
  reduce: boolean
}

function CurtainPanel({ side, open, reduce }: CurtainPanelProps) {
  const isLeft = side === 'left'
  return (
    <motion.div
      className="absolute inset-y-0 w-[54%] sm:w-[47%]"
      style={{
        [isLeft ? 'left' : 'right']: 0,
        transformOrigin: isLeft ? 'left center' : 'right center',
        willChange: 'transform',
      }}
      initial={false}
      animate={open ? { x: isLeft ? '-15%' : '14%', scaleX: 0.52 } : { x: 0, scaleX: 1 }}
      transition={{ duration: reduce ? 0.3 : 1.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="absolute inset-0"
        animate={
          reduce
            ? undefined
            : {
                skewX: isLeft ? [0, 0.6, 0] : [0, -0.6, 0],
                rotate: isLeft ? [0, 0.25, 0] : [0, -0.25, 0],
              }
        }
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: isLeft ? 'right center' : 'left center' }}
      >
        <div className="absolute inset-0" style={{ background: isLeft ? LEFT_SATIN : RIGHT_SATIN }} />
        <div className="absolute inset-0" style={{ background: folds(!isLeft) }} />
        {/* Deep shadow along the inner edge (towards centre stage) */}
        <div
          className="absolute inset-y-0 w-1/3"
          style={{
            [isLeft ? 'right' : 'left']: 0,
            background: isLeft
              ? 'linear-gradient(90deg, transparent, rgba(120,44,74,0.42))'
              : 'linear-gradient(270deg, transparent, rgba(120,44,74,0.42))',
          }}
        />
        {/* Soft shadow under the valance */}
        <div
          className="absolute inset-x-0 top-0 h-24"
          style={{ background: 'linear-gradient(180deg, rgba(110,36,64,0.32), transparent)' }}
        />
        {/* Slow sweeping sheen */}
        {!reduce && (
          <motion.div
            className="absolute inset-y-[-20%] w-[45%] -skew-x-12"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
            }}
            animate={{ x: isLeft ? ['-130%', '330%'] : ['330%', '-130%'] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', repeatDelay: 3 }}
          />
        )}
      </motion.div>
    </motion.div>
  )
}

function TieBack({ side, open, reduce }: { side: 'left' | 'right'; open: boolean; reduce: boolean }) {
  const isLeft = side === 'left'
  return (
    <motion.div
      className="absolute top-[45%]"
      style={{ [isLeft ? 'left' : 'right']: '9%' }}
      initial={false}
      animate={{ opacity: open ? 1 : 0, scale: open ? 1 : 0.7 }}
      transition={{ duration: reduce ? 0.3 : 0.7, delay: open ? 0.35 : 0, ease: 'easeOut' }}
    >
      <div className="relative h-16 w-10">
        <div
          className="absolute inset-x-0 top-3 h-4 rounded-full"
          style={{ background: GOLD_TRIM, boxShadow: '0 2px 6px rgba(110,36,64,0.35)' }}
        />
        <div className="absolute left-1/2 top-6 h-5 w-px -translate-x-1/2" style={{ background: PALETTE.goldDeep }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
          <svg width="30" height="34" viewBox="0 0 30 34" aria-hidden>
            <path d="M15 0 L15 6" stroke={PALETTE.goldDeep} strokeWidth="1.4" />
            <ellipse cx="15" cy="9" rx="5" ry="4" fill={PALETTE.gold} />
            {Array.from({ length: 5 }).map((_, i) => (
              <path
                key={i}
                d={`M${7 + i * 4} 12 C ${6 + i * 4} 22, ${8 + i * 4} 28, ${7 + i * 4} 33`}
                stroke={PALETTE.gold}
                strokeWidth="1.6"
                strokeLinecap="round"
                fill="none"
              />
            ))}
          </svg>
        </div>
      </div>
    </motion.div>
  )
}

function Valance() {
  return (
    <div className="absolute inset-x-0 top-0">
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className="h-[72px] w-full sm:h-[92px]"
        aria-hidden
      >
        <defs>
          <linearGradient id="valanceFabric" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={PALETTE.satin3} />
            <stop offset="45%" stopColor={PALETTE.roseMid} />
            <stop offset="100%" stopColor={PALETTE.satin4} />
          </linearGradient>
          <linearGradient id="valanceGold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={PALETTE.goldLight} />
            <stop offset="50%" stopColor={PALETTE.gold} />
            <stop offset="100%" stopColor={PALETTE.goldDeep} />
          </linearGradient>
        </defs>
        <path
          d="M0 0 H1200 V64 Q1160 104 1120 64 Q1080 104 1040 64 Q1000 104 960 64 Q920 104 880 64 Q840 104 800 64 Q760 104 720 64 Q680 104 640 64 Q600 104 560 64 Q520 104 480 64 Q440 104 400 64 Q360 104 320 64 Q280 104 240 64 Q200 104 160 64 Q120 104 80 64 Q40 104 0 64 Z"
          fill="url(#valanceFabric)"
        />
        <path
          d="M0 64 Q40 104 80 64 Q120 104 160 64 Q200 104 240 64 Q280 104 320 64 Q360 104 400 64 Q440 104 480 64 Q520 104 560 64 Q600 104 640 64 Q680 104 720 64 Q760 104 800 64 Q840 104 880 64 Q920 104 960 64 Q1000 104 1040 64 Q1080 104 1120 64 Q1160 104 1200 64"
          fill="none"
          stroke="url(#valanceGold)"
          strokeWidth="5"
          vectorEffect="non-scaling-stroke"
        />
        <rect x="0" y="0" width="1200" height="10" fill="url(#valanceGold)" />
      </svg>
    </div>
  )
}
