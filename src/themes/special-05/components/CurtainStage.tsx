import { animate, m as motion, useMotionValue, useTransform, type MotionValue } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { GOLD_TRIM, PALETTE } from '../palette'

interface CurtainStageProps {
  open: boolean
  reduce: boolean
  interactive?: boolean
  onOpen?: () => void
  onTransitionComplete?: (open: boolean) => void
  cueLabel?: string
}

function curtainPath(topProgress: number, hemProgress: number, phase: number) {
  const topX = 500 - 500 * topProgress
  const hemX = 500 - 500 * hemProgress
  const billow = Math.sin(topProgress * Math.PI) * 24
  let path = `M0 0 L${topX} 0 C${topX + billow} 250 ${hemX + billow * 0.42} 740 ${hemX} 1000`
  const segments = 8
  for (let index = 0; index < segments; index += 1) {
    const from = hemX - ((hemX) * index) / segments
    const to = hemX - ((hemX) * (index + 1)) / segments
    const middle = (from + to) / 2
    const wave = Math.sin(phase + index * 1.15) * 3.5 + (index % 2 === 0 ? 5 : -3)
    path += ` Q${middle} ${1000 + wave} ${to} 1000`
  }
  return `${path} L0 1040 L0 0 Z`
}

function hemPath(hemProgress: number, phase: number) {
  const hemX = 500 - 500 * hemProgress
  let path = `M${hemX} 1000`
  for (let index = 0; index < 8; index += 1) {
    const from = hemX - ((hemX) * index) / 8
    const to = hemX - ((hemX) * (index + 1)) / 8
    const middle = (from + to) / 2
    const wave = Math.sin(phase + index * 1.15) * 3.5 + (index % 2 === 0 ? 5 : -3)
    path += ` Q${middle} ${1000 + wave} ${to} 1000`
  }
  return path
}

export function CurtainStage({
  open,
  reduce,
  interactive = false,
  onOpen,
  onTransitionComplete,
  cueLabel = 'tap to open',
}: CurtainStageProps) {
  const progress = useMotionValue(open || reduce ? 1 : 0)
  const onCompleteRef = useRef(onTransitionComplete)
  useEffect(() => {
    onCompleteRef.current = onTransitionComplete
  }, [onTransitionComplete])
  const leftPath = useTransform(progress, (top) =>
    curtainPath(top, reduce ? 1 : Math.max(0, Math.min(1, (top - 0.2) / 0.8)), reduce ? 0 : top * Math.PI * 2),
  )
  const leftHem = useTransform(progress, (top) =>
    hemPath(reduce ? 1 : Math.max(0, Math.min(1, (top - 0.2) / 0.8)), reduce ? 0 : top * Math.PI * 2),
  )
  const glowOpacity = useTransform(progress, (value) => 0.8 * Math.sin(Math.PI * Math.max(0, Math.min(1, value))))

  useEffect(() => {
    if (reduce) {
      progress.set(1)
      onCompleteRef.current?.(open)
      return
    }
    const controls = animate(progress, open ? [progress.get(), -0.025, 1] : 0, {
      duration: open ? 2.4 : 0.9,
      ease: open ? [0.72, 0, 0.24, 1] : [0.4, 0, 0.65, 1],
      times: open ? [0, 0.12, 1] : undefined,
      onComplete: () => onCompleteRef.current?.(open),
    })
    return () => controls.stop()
  }, [open, progress, reduce])

  return (
    <div
      aria-hidden={!interactive}
      className={`fixed inset-0 z-40 overflow-hidden ${interactive ? '' : 'pointer-events-none'}`}
    >
      <motion.div
        aria-hidden
        className="absolute inset-0"
        style={{
          opacity: reduce ? 0 : glowOpacity,
          background: 'radial-gradient(ellipse at center, rgba(255,244,220,0.58), rgba(255,222,184,0.2) 42%, transparent 76%)',
        }}
      />

      <CurtainPanel side="left" path={leftPath} hem={leftHem} progress={progress} />
      <CurtainPanel side="right" path={leftPath} hem={leftHem} progress={progress} />
      <TieBack side="left" progress={progress} reduce={reduce} />
      <TieBack side="right" progress={progress} reduce={reduce} />
      <Valance />

      {interactive && !open && (
        <motion.button
          type="button"
          onClick={onOpen}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="pointer-events-auto absolute left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-3 rounded-full px-6 py-3 outline-none focus-visible:ring-2 focus-visible:ring-[#c2688c]"
          style={{ bottom: 'calc(7dvh + env(safe-area-inset-bottom))' }}
          aria-label="Open the curtains"
        >
          <span className="relative flex h-14 w-14 items-center justify-center">
            <motion.span
              className="absolute inset-0 rounded-full bg-white/60"
              animate={reduce ? undefined : { opacity: [0.5, 0, 0.5], scale: [0.85, 1.35, 0.85] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            />
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

function CurtainPanel({
  side,
  path,
  hem,
  progress,
}: {
  side: 'left' | 'right'
  path: MotionValue<string>
  hem: MotionValue<string>
  progress: MotionValue<number>
}) {
  const isLeft = side === 'left'
  const gather = useTransform(progress, [0, 1], [1, 0.78])
  const gatherSide = useTransform(gather, (value) => (isLeft ? value : -value))
  return (
    <motion.svg
      viewBox="0 0 500 1040"
      preserveAspectRatio="none"
      className={`absolute inset-y-0 h-full w-1/2 ${isLeft ? 'left-0' : 'right-0'}`}
      style={{ scaleX: gatherSide, transformOrigin: 'center' }}
      aria-hidden
    >
      <defs>
        <linearGradient id="curtain-satin" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={PALETTE.satin4} />
          <stop offset="18%" stopColor={PALETTE.satin3} />
          <stop offset="55%" stopColor={PALETTE.satin2} />
          <stop offset="100%" stopColor={PALETTE.satin1} />
        </linearGradient>
        <pattern id="curtain-folds" width="46" height="1040" patternUnits="userSpaceOnUse">
          <rect width="46" height="1040" fill="transparent" />
          <path d="M2 0 V1040 M16 0 V1040 M34 0 V1040" stroke="rgba(255,255,255,0.16)" strokeWidth="7" />
          <path d="M25 0 V1040 M42 0 V1040" stroke="rgba(110,36,64,0.25)" strokeWidth="8" />
        </pattern>
        <linearGradient id="curtain-sheen" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="50%" stopColor="white" stopOpacity="0.36" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path d={path} fill="url(#curtain-satin)" />
      <motion.path d={path} fill="url(#curtain-folds)" />
      <motion.path d={path} fill="url(#curtain-sheen)" opacity={0.28} />
      <motion.path d={hem} fill="none" stroke={PALETTE.gold} strokeWidth="4" vectorEffect="non-scaling-stroke" />
    </motion.svg>
  )
}

function TieBack({ side, progress, reduce }: { side: 'left' | 'right'; progress: MotionValue<number>; reduce: boolean }) {
  const opacity = useTransform(progress, [0, 0.48, 0.8], [0, 0, 1])
  const scale = useTransform(progress, [0, 0.55, 0.82, 1], [0.7, 0.7, 1.08, 1])
  return (
    <motion.div
      className="absolute top-[45%]"
      style={{ [side]: '9%', opacity, scale }}
    >
      <div className="relative h-16 w-10">
        <div className="absolute inset-x-0 top-3 h-4 rounded-full" style={{ background: GOLD_TRIM, boxShadow: '0 2px 6px rgba(110,36,64,0.35)' }} />
        <div className="absolute left-1/2 top-6 h-5 w-px -translate-x-1/2" style={{ background: PALETTE.goldDeep }} />
        <motion.svg
          width="30"
          height="34"
          viewBox="0 0 30 34"
          className="absolute bottom-0 left-1/2 -translate-x-1/2"
          aria-hidden
          animate={reduce ? undefined : { rotate: [-4, 5, -2, 0] }}
          transition={{ duration: 1.7, ease: 'easeOut', delay: 0.4 }}
          style={{ transformOrigin: 'top center' }}
        >
          <path d="M15 0 L15 6" stroke={PALETTE.goldDeep} strokeWidth="1.4" />
          <ellipse cx="15" cy="9" rx="5" ry="4" fill={PALETTE.gold} />
          {Array.from({ length: 5 }).map((_, index) => (
            <path
              key={index}
              d={`M${7 + index * 4} 12 C ${6 + index * 4} 22, ${8 + index * 4} 28, ${7 + index * 4} 33`}
              stroke={PALETTE.gold}
              strokeWidth="1.6"
              strokeLinecap="round"
              fill="none"
            />
          ))}
        </motion.svg>
      </div>
    </motion.div>
  )
}

function Valance() {
  return (
    <div className="absolute inset-x-0 top-0">
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="h-[72px] w-full sm:h-[92px]" aria-hidden>
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
        <path d="M0 0 H1200 V64 Q1160 104 1120 64 Q1080 104 1040 64 Q1000 104 960 64 Q920 104 880 64 Q840 104 800 64 Q760 104 720 64 Q680 104 640 64 Q600 104 560 64 Q520 104 480 64 Q440 104 400 64 Q360 104 320 64 Q280 104 240 64 Q200 104 160 64 Q120 104 80 64 Q40 104 0 64 Z" fill="url(#valanceFabric)" />
        <path d="M0 64 Q40 104 80 64 Q120 104 160 64 Q200 104 240 64 Q280 104 320 64 Q360 104 400 64 Q440 104 480 64 Q520 104 560 64 Q600 104 640 64 Q680 104 720 64 Q760 104 800 64 Q840 104 880 64 Q920 104 960 64 Q1000 104 1040 64 Q1080 104 1120 64 Q1160 104 1200 64" fill="none" stroke="url(#valanceGold)" strokeWidth="5" vectorEffect="non-scaling-stroke" />
        <rect x="0" y="0" width="1200" height="10" fill="url(#valanceGold)" />
      </svg>
    </div>
  )
}
