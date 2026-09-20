import { motion } from 'framer-motion'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { FloatingHeart } from '../components/FloatingHeart'

const MAX_PULL_PX = 110
const FIRE_THRESHOLD = 0.34
const VIEW_BOX = { w: 152, h: 270 }
const NOCK_X = 84
const NOCK_Y = 138
const PULL_BEND_X = 52
const ARROW_TIP_OFFSET = 78
const ARROW_TAIL = 26

interface FlightState {
  x: number
  y: number
  dx: number
  dy: number
}

interface Sparks {
  dx: number
  dy: number
}

interface Act1AimProps {
  config: ExperienceConfig
  onFire: () => void
  onTwang: () => void
}

function buildStringPath(pull: number) {
  const nockX = NOCK_X - pull * PULL_BEND_X
  const nockY = NOCK_Y + pull * MAX_PULL_PX
  return `M ${NOCK_X} 16 Q ${nockX} ${nockY} ${NOCK_X} ${VIEW_BOX.h - 28}`
}

export function Act1Aim({ config, onFire, onTwang }: Act1AimProps) {
  const [pull, setPull] = useState(0)
  const pullRef = useRef(0)
  const [fired, setFired] = useState(false)
  const [pulling, setPulling] = useState(false)
  const [weak, setWeak] = useState(false)
  const [flight, setFlight] = useState<FlightState | null>(null)
  const [sparks, setSparks] = useState<Sparks[]>([])

  const startYRef = useRef(0)
  const weakTimerRef = useRef<number | null>(null)
  const fireTimerRef = useRef<number | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const heartRef = useRef<HTMLDivElement | null>(null)
  const pullAdded = useRef(0)

  const ready = pull >= FIRE_THRESHOLD

  const updatePull = useCallback((dy: number) => {
    const incremental = dy - pullAdded.current
    if (Math.abs(pullRef.current) < 0.001 && incremental < 0) return
    const next = Math.min(1, Math.max(0, pullRef.current + incremental / MAX_PULL_PX))
    pullAdded.current = dy
    pullRef.current = next
    setPull(next)
  }, [])

  useEffect(() => () => {
    if (weakTimerRef.current) window.clearTimeout(weakTimerRef.current)
    if (fireTimerRef.current) window.clearTimeout(fireTimerRef.current)
  }, [])

  const launch = useCallback(() => {
    if (fired) return
    setFired(true)
    onTwang()

    const svgRect = svgRef.current?.getBoundingClientRect()
    const heartRect = heartRef.current?.getBoundingClientRect()
    const scale = svgRect ? svgRect.height / VIEW_BOX.h : 1
    const originX = svgRect
      ? svgRect.left + (NOCK_X - pullRef.current * PULL_BEND_X) * scale
      : window.innerWidth / 2
    const originY = svgRect
      ? svgRect.top + (NOCK_Y + pullRef.current * MAX_PULL_PX) * scale
      : window.innerHeight * 0.72

    const tipYOffset = ARROW_TIP_OFFSET * scale
    let targetX = window.innerWidth / 2
    let targetY = window.innerHeight * 0.3
    if (heartRect) {
      targetX = heartRect.left + heartRect.width / 2
      targetY = heartRect.top + heartRect.height / 2
    }

    setFlight({
      x: originX,
      y: originY - tipYOffset,
      dx: targetX - originX,
      dy: targetY - (originY - tipYOffset),
    })

    const scatter: Sparks[] = Array.from({ length: 9 }).map((_, i) => ({
      dx: Math.cos((i / 9) * Math.PI * 2) * 30,
      dy: Math.sin((i / 9) * Math.PI * 2) * 30,
    }))
    setSparks(scatter)

    fireTimerRef.current = window.setTimeout(() => {
      onFire()
    }, 860)
  }, [fired, onFire, onTwang])

  const endDrag = useCallback(() => {
    setPulling(false)
    if (fired) return
    if (pullRef.current >= FIRE_THRESHOLD) {
      launch()
      return
    }
    setWeak(true)
    onTwang()
    pullRef.current = 0
    pullAdded.current = 0
    setPull(0)
    if (weakTimerRef.current) window.clearTimeout(weakTimerRef.current)
    weakTimerRef.current = window.setTimeout(() => setWeak(false), 620)
  }, [fired, launch, onTwang])

  const handleDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (fired) return
      event.preventDefault()
      ;(event.currentTarget as HTMLDivElement).setPointerCapture(event.pointerId)
      startYRef.current = event.clientY
      pullAdded.current = 0
      setPulling(true)
    },
    [fired],
  )

  const handleMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!pulling || fired) return
      const dy = Math.max(0, event.clientY - startYRef.current)
      updatePull(dy)
    },
    [fired, pulling, updatePull],
  )

  const handleKey = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (fired) return
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        pullAdded.current += 12
        updatePull(pullAdded.current)
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        pullAdded.current = Math.max(0, pullAdded.current - 12)
        updatePull(pullAdded.current)
      } else if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault()
        endDrag()
      }
    },
    [endDrag, fired, updatePull],
  )

  const nockX = NOCK_X - pull * PULL_BEND_X
  const nockY = NOCK_Y + pull * MAX_PULL_PX
  const arrowScale = 1

  const hint = fired
    ? 'it found its mark…'
    : weak
      ? 'give it a stronger pull'
      : pulling
        ? ready
          ? 'release!'
          : 'keep pulling…'
        : 'touch the arrow & drag down'

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-5 py-6 text-center sm:px-8"
    >
      {/* ambient warmth */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 42% at 50% 22%, rgba(255,217,166,0.13), transparent 62%), radial-gradient(ellipse 60% 46% at 50% 118%, rgba(255,92,138,0.1), transparent 60%)',
        }}
      />

      <div className="relative z-10 flex w-full max-w-xl flex-col items-center gap-5">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-[11px] font-bold tracking-[0.32em] text-[#f3e7da]/45 uppercase"
        >
          Act One · The Bow
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.18 }}
          className="font-display text-balance text-4xl font-semibold text-[#f3e7da] italic sm:text-5xl"
        >
          {config.content.teaserHeading}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="max-w-sm text-sm leading-relaxed font-medium text-[#e7cfb8]/70"
        >
          {config.content.teaserSubtext}
        </motion.p>

        <div ref={heartRef} className="mt-1">
          <FloatingHeart size={118} excited={fired} />
        </div>

        {/* Bow & pull area */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: fired ? 0.55 : 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-2 flex w-full flex-col items-center gap-2"
        >
          <div className="flex items-end gap-3 sm:gap-5">
            {/* Power meter */}
            <div className="flex h-52 w-9 flex-col items-center gap-2">
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#f3e7da]/40 uppercase [writing-mode:vertical-lr]">
                pull
              </span>
              <div className="relative h-full w-2.5 overflow-hidden rounded-full bg-[#f3e7da]/10 ring-1 ring-[#f3e7da]/15">
                <motion.div
                  className="w-full rounded-full"
                  style={{
                    background: 'linear-gradient(180deg, #ffd9a6 0%, #ff8fb0 55%, #ff5c8a 100%)',
                    boxShadow: '0 0 12px rgba(255,140,176,0.7)',
                  }}
                  animate={{ height: `${ready ? Math.max(pull, 0.42) * 100 : pull * 100}%` }}
                  transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                />
              </div>
            </div>

            {/* Bow */}
            <div
              role="slider"
              aria-label="Bow pull"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(pull * 100)}
              tabIndex={0}
              onPointerDown={handleDown}
              onPointerMove={handleMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onKeyDown={handleKey}
              className={`relative h-60 w-40 cursor-grab outline-none select-none sm:h-64 sm:w-44 ${
                fired ? 'cursor-default' : ''
              }`}
              style={{ touchAction: 'none', WebkitUserSelect: 'none' }}
            >
              <svg
                ref={svgRef}
                viewBox={`0 0 ${VIEW_BOX.w} ${VIEW_BOX.h}`}
                className="h-full w-full overflow-visible"
                aria-hidden
              >
                <defs>
                  <linearGradient id="hb-bow-arm" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#e8c39a" />
                    <stop offset="55%" stopColor="#b97f55" />
                    <stop offset="100%" stopColor="#7a4a33" />
                  </linearGradient>
                  <linearGradient id="hb-arrow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f6d9bd" />
                    <stop offset="100%" stopColor="#e7c4a2" />
                  </linearGradient>
                </defs>

                {/* bow arm */}
                <path
                  d={`M ${NOCK_X} 16 C 40 36, 40 234, ${NOCK_X} ${VIEW_BOX.h - 28}`}
                  fill="none"
                  stroke="url(#hb-bow-arm)"
                  strokeWidth={8}
                  strokeLinecap="round"
                />
                <path
                  d={`M ${NOCK_X} 16 C 40 36, 40 234, ${NOCK_X} ${VIEW_BOX.h - 28}`}
                  fill="none"
                  stroke="rgba(255,255,255,0.16)"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
                {/* grip */}
                <rect
                  x={NOCK_X - PULL_BEND_X - 14}
                  y={NOCK_Y - 24}
                  width={30}
                  height={48}
                  rx={15}
                  fill="#4a2d1f"
                  stroke="#e8c39a"
                  strokeOpacity={0.35}
                />
                {/* string */}
                <path
                  d={buildStringPath(pull)}
                  fill="none"
                  stroke="#f3e7da"
                  strokeOpacity={fired ? 0.35 : 0.9}
                  strokeWidth={2}
                  strokeLinecap="round"
                />

                {/* arrow */}
                <g transform={`translate(${nockX} ${nockY}) scale(${arrowScale})`}>
                  <line x1={0} y1={-ARROW_TIP_OFFSET} x2={0} y2={ARROW_TAIL + 4} stroke="url(#hb-arrow)" strokeWidth={3.4} strokeLinecap="round" />
                  <path
                    d={`M 0 ${-ARROW_TIP_OFFSET - 7} L -4.5 ${-ARROW_TIP_OFFSET + 3} L 4.5 ${-ARROW_TIP_OFFSET + 3} Z`}
                    fill="#f6d9bd"
                    stroke="#fff7ed"
                    strokeWidth={0.8}
                  />
                  <circle cx={0} cy={-ARROW_TIP_OFFSET + 1} r={4.4} fill="#ff8fb0" opacity={0.9} />
                  <path
                    d={`M 0 ${ARROW_TAIL - 12} L 0 ${ARROW_TAIL + 2} M 0 ${ARROW_TAIL - 12} L 5 ${ARROW_TAIL - 6} L 4.6 ${ARROW_TAIL - 1} M 0 ${ARROW_TAIL - 12} L -5 ${ARROW_TAIL - 6} L -4.6 ${ARROW_TAIL - 1}`}
                    stroke="#ffd9a6"
                    strokeWidth={1.6}
                    strokeLinecap="round"
                    fill="none"
                  />
                  <circle cx={0} cy={ARROW_TAIL + 4} r={5} fill="#ffd9a6" opacity={0.8} />
                </g>

                {/* target ring reachable zone */}
                <motion.circle
                  cx={NOCK_X}
                  cy={NOCK_Y}
                  r={34}
                  fill="transparent"
                  animate={pulling ? { opacity: [0.25, 0.5, 0.25] } : { opacity: 0 }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              </svg>
            </div>
          </div>

          {/* pull & release indicator */}
          <div className="mt-1 flex flex-col items-center gap-1.5">
            <motion.div
              animate={
                weak
                  ? { x: [0, -7, 7, -5, 5, 0] }
                  : ready && pulling
                    ? { scale: [1, 1.12, 1] }
                    : {}
              }
              transition={weak ? { duration: 0.4 } : { duration: 0.8, repeat: Infinity }}
              className={`rounded-full border px-5 py-2 text-[11px] font-black tracking-[0.28em] uppercase backdrop-blur-sm ${
                ready
                  ? 'border-[#ff8fb0]/60 bg-[#ff5c8a]/20 text-[#ffb9cd] shadow-[0_0_22px_-4px_rgba(255,92,138,0.8)]'
                  : pulling
                    ? 'border-[#ffd9a6]/50 bg-[#ffd9a6]/10 text-[#ffd9a6]'
                    : 'border-[#f3e7da]/15 bg-white/[0.03] text-[#f3e7da]/60'
              }`}
            >
              {weak || !pulling ? 'PULL & release' : 'RELEASE'}
            </motion.div>
            <motion.p
              key={hint}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs font-medium text-[#e7cfb8]/45 italic"
            >
              {hint}
            </motion.p>
          </div>
        </motion.div>
      </div>

      {/* in-flight arrow + sparks */}
      {flight && (
        <div
          className="pointer-events-none fixed z-30"
          style={{
            left: flight.x,
            top: flight.y,
            transform: 'translate(-50%, -50%)',
          }}
          aria-hidden
        >
          <motion.div
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: flight.dx,
              y: flight.dy,
              opacity: [1, 1, 0],
              scale: [1, 1.35, 1.9],
            }}
            transition={{ duration: 0.78, ease: [0.22, 1, 0.36, 1] }}
          >
            <svg width={30} height={120} viewBox="0 0 30 120" className="overflow-visible">
              <line x1={15} y1={8} x2={15} y2={112} stroke="#f6d9bd" strokeWidth={3.4} strokeLinecap="round" />
              <path d="M 15 2 L 10 12 L 20 12 Z" fill="#f6d9bd" />
              <circle cx={15} cy={11} r={5} fill="#ff8fb0" />
              <path d="M 15 96 L 15 112 M 15 96 L 20 104 L 19 110 M 15 96 L 10 104 L 11 110" stroke="#ffd9a6" strokeWidth={1.8} fill="none" strokeLinecap="round" />
            </svg>
          </motion.div>

          {sparks.map((spark, i) => (
            <motion.div
              key={i}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{ x: spark.dx, y: spark.dy, opacity: 0, scale: 0.4 }}
              transition={{ duration: 0.55, delay: 0.05 * i, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: i % 2 ? '#ffd9a6' : '#ffb9cd',
                boxShadow: '0 0 10px rgba(255,185,205,0.9)',
              }}
            />
          ))}
        </div>
      )}
    </motion.section>
  )
}