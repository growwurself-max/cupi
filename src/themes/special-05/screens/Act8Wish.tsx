import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { PALETTE } from '../palette'
import { Eyebrow, PrimaryButton, StageScene } from '../components/Stage'

interface Act8WishProps {
  config: ExperienceConfig
  reduce: boolean
  onBlow: () => void
  onContinue: () => void
}

const HOLD_MS = 1300

export function Act8Wish({ config, reduce, onBlow, onContinue }: Act8WishProps) {
  const [progress, setProgress] = useState(0)
  const [blown, setBlown] = useState(false)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)

  const stop = () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    startRef.current = null
  }

  const tick = (now: number) => {
    if (startRef.current === null) startRef.current = now
    const p = Math.min((now - startRef.current) / HOLD_MS, 1)
    setProgress(p)
    if (p >= 1) {
      stop()
      setBlown(true)
      setProgress(1)
      onBlow()
    } else {
      rafRef.current = requestAnimationFrame(tick)
    }
  }

  const startHold = () => {
    if (blown) return
    startRef.current = null
    rafRef.current = requestAnimationFrame(tick)
  }

  const releaseHold = () => {
    if (blown) return
    stop()
    setProgress(0)
  }

  useEffect(() => stop, [])

  useEffect(() => {
    if (blown) stop()
  }, [blown])

  return (
    <StageScene
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: reduce ? 0.35 : 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <Eyebrow>one more thing</Eyebrow>

      <div className="relative mt-8">
        <Cake blown={blown} reduce={reduce} />
      </div>

      <p className="mt-8 max-w-sm font-display text-lg font-semibold" style={{ color: PALETTE.berry }}>
        {config.content.wishPrompt}
      </p>

      {!blown && !reduce && (
        <button
          type="button"
          onPointerDown={startHold}
          onPointerUp={releaseHold}
          onPointerLeave={releaseHold}
          className="relative mt-6 flex h-16 w-16 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#c2688c]"
          aria-label="Press and hold to blow out the candles"
        >
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90">
            <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(194,104,140,0.25)" strokeWidth="6" />
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke={PALETTE.gold}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 44}
              strokeDashoffset={2 * Math.PI * 44 * (1 - progress)}
            />
          </svg>
          <span className="text-2xl" aria-hidden>
            🌬️
          </span>
        </button>
      )}

      {!blown && !reduce && (
        <p className="mt-3 text-xs font-medium uppercase tracking-[0.24em] text-[#b98a9f]">press &amp; hold</p>
      )}

      {!blown && reduce && (
        <div className="mt-6">
          <PrimaryButton
            onClick={() => {
              setBlown(true)
              onBlow()
            }}
          >
            Blow out the candles
          </PrimaryButton>
        </div>
      )}

      {blown && (
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mt-7">
          <PrimaryButton onClick={onContinue}>Onto the finale</PrimaryButton>
        </motion.div>
      )}
    </StageScene>
  )
}

function Cake({ blown, reduce }: { blown: boolean; reduce: boolean }) {
  return (
    <svg width="240" height="190" viewBox="0 0 240 190" className="mx-auto" aria-hidden>
      <defs>
        <linearGradient id="frosting" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF6FA" />
          <stop offset="100%" stopColor="#F6C9DB" />
        </linearGradient>
        <linearGradient id="sponge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F3C39A" />
          <stop offset="100%" stopColor="#D79A64" />
        </linearGradient>
      </defs>

      {/* candles */}
      {[70, 95, 120, 145, 170].map((x, i) => (
        <g key={i}>
          <rect x={x - 3} y={70} width="6" height="34" rx="3" fill={i % 2 === 0 ? PALETTE.roseMid : PALETTE.gold} />
          <line x1={x} y1="70" x2={x} y2="64" stroke={PALETTE.berry} strokeWidth="1.4" />
          {!blown ? (
            <motion.ellipse
              cx={x}
              cy="58"
              rx="4"
              ry="7"
              fill="#FFC24B"
              animate={reduce ? undefined : { ry: [6, 8, 6], opacity: [0.85, 1, 0.85] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: (x % 5) * 0.1 }}
            />
          ) : (
            <motion.path
              d={`M${x} 60 C ${x - 4} 50, ${x + 4} 46, ${x} 38`}
              stroke="rgba(150,150,160,0.6)"
              strokeWidth="2"
              fill="none"
              initial={{ opacity: 0.8, y: 0 }}
              animate={{ opacity: 0, y: -12 }}
              transition={{ duration: 1.6 }}
            />
          )}
        </g>
      ))}

      {/* cake body */}
      <rect x="52" y="96" width="136" height="52" rx="12" fill="#F6C9DB" />
      <rect x="52" y="96" width="136" height="16" rx="8" fill="#FBE4EC" />
      <rect x="58" y="132" width="124" height="26" rx="10" fill="#C98A5E" />
      <path d="M52 104 Q68 122 84 104 Q100 122 116 104 Q132 122 148 104 Q164 122 188 104 V96 H52 Z" fill="#FFF6FA" opacity="0.9" />
      {/* plate */}
      <ellipse cx="120" cy="166" rx="96" ry="12" fill="rgba(194,104,140,0.18)" />
    </svg>
  )
}
