import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'

interface InteractiveCandleProps {
  /** Fired once the flame is extinguished (tap or mic blow). */
  onBlow: () => void
  /** Candles are never dark — warm candle hues for dark/light themes alike. */
  tone?: 'rose' | 'blush'
  className?: string
}

const PALETTES = {
  rose: {
    bodyTop: '#f6c6b6',
    bodyMid: '#fff0e8',
    bodyEnd: '#c99a8a',
    hint: 'text-rose-950/80',
  },
  blush: {
    bodyTop: '#F9A8C9',
    bodyMid: '#F9E6EF',
    bodyEnd: '#D8A0D9',
    hint: 'text-[#7C4A63]',
  },
} as const

/** RMS volume above this is treated as a blow; sustained for BLOW_SUSTAIN_MS. */
const BLOW_RMS_THRESHOLD = 0.12
const BLOW_SUSTAIN_MS = 200

export function CandleFlame({ lit }: { lit: boolean }) {
  const gradId = useId()
  return (
    <AnimatePresence>
      {lit && (
        <motion.div
          key="flame"
          initial={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.15, y: -8 }}
          transition={{ duration: 0.22, ease: 'easeIn' }}
          className="pointer-events-none absolute -top-14 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{
              scaleY: [1, 1.14, 0.9, 1.05, 1],
              scaleX: [1, 0.92, 1.08, 0.96, 1],
            }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: 'bottom center' }}
          >
            <svg
              width="48"
              height="62"
              viewBox="0 0 48 62"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M24 2 C31 15 43 21 42 35 C41 47 34 58 24 58 C14 58 7 47 6 35 C5 21 17 15 24 2 Z"
                fill={`url(#${gradId})`}
              />
              <ellipse cx="24" cy="42" rx="7.5" ry="11" fill="#fff3c4" opacity="0.85" />
              <defs>
                <linearGradient id={gradId} x1="24" y1="2" x2="24" y2="58">
                  <stop stopColor="#fff6d8" />
                  <stop offset="0.35" stopColor="#ffd98a" />
                  <stop offset="0.75" stopColor="#f7a94d" />
                  <stop offset="1" stopColor="#e8733f" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
          <motion.div
            aria-hidden
            animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0.2, 0.5] }}
            transition={{ duration: 1.7, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -inset-5 rounded-full bg-amber-300/30 blur-xl"
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function InteractiveCandle({ onBlow, tone = 'rose', className }: InteractiveCandleProps) {
  const palette = PALETTES[tone]
  const gradId = useId()

  const [lit, setLit] = useState(true)
  const [micActive, setMicActive] = useState(false)
  const [level, setLevel] = useState(0)
  const blownRef = useRef(false)
  const levelRef = useRef(0)
  const smokeRef = useRef<HTMLDivElement | null>(null)

  const isTouch = useMemo(
    () =>
      typeof window !== 'undefined' &&
      ('ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        (window.matchMedia?.('(pointer: coarse)')?.matches ?? false)),
    [],
  )

  const fireCandle = useCallback(() => {
    if (blownRef.current) return
    blownRef.current = true
    setLit(false)
    onBlow()
  }, [onBlow])

  useEffect(() => {
    if (!lit) return
    let cancelled = false
    let stream: MediaStream | null = null
    let ctx: AudioContext | null = null
    let analyser: AnalyserNode | null = null
    let rafId = 0
    let blowSince: number | null = null
    let lastLevelPush = 0

    const stopAudio = () => {
      cancelled = true
      cancelAnimationFrame(rafId)
      stream?.getTracks().forEach((track) => {
        if (track.readyState === 'live') track.stop()
      })
      stream = null
      if (ctx) {
        void ctx.close().catch(() => {})
        ctx = null
      }
    }

    const readLevel = () => {
      if (!analyser) return
      const data = new Float32Array(analyser.fftSize)
      analyser.getFloatTimeDomainData(data)
      let sum = 0
      for (let i = 0; i < data.length; i += 1) sum += data[i] * data[i]
      const rms = Math.sqrt(sum / data.length)
      levelRef.current = rms
      const now = performance.now()
      if (now - lastLevelPush > 100) {
        lastLevelPush = now
        setLevel(rms)
      }
      if (rms > BLOW_RMS_THRESHOLD) {
        blowSince ??= now
        if (now - blowSince >= BLOW_SUSTAIN_MS) {
          fireCandle()
          return
        }
      } else {
        blowSince = null
      }
      rafId = requestAnimationFrame(readLevel)
    }

    const startMic = async () => {
      if (cancelled || !navigator.mediaDevices?.getUserMedia) {
        setMicActive(false)
        return
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        if (cancelled) {
          stopAudio()
          return
        }
        const AudioCtor =
          window.AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext
        if (!AudioCtor) {
          setMicActive(false)
          stopAudio()
          return
        }
        ctx = new AudioCtor()
        const source = ctx.createMediaStreamSource(stream)
        analyser = ctx.createAnalyser()
        analyser.fftSize = 1024
        analyser.smoothingTimeConstant = 0.35
        source.connect(analyser)
        setMicActive(true)
        rafId = requestAnimationFrame(readLevel)
      } catch {
        // Mic denied or unavailable — tap/click fallback remains.
        setMicActive(false)
        stopAudio()
      }
    }

    if (isTouch) void startMic()

    return () => {
      stopAudio()
    }
  }, [lit, isTouch, fireCandle])

  const bodyRef = useRef<HTMLDivElement | null>(null)

  return (
    <motion.div className={className}>
      <div className="relative flex h-20 items-start">
        <CandleFlame lit={lit} />

        {/* Smoke on blow */}
        <AnimatePresence>
          {!lit && (
            <motion.div
              key="smoke"
              initial={{ opacity: 0.9 }}
              animate={{ opacity: 0, y: -70 }}
              transition={{ duration: 1.6, ease: 'easeOut' }}
            >
              <div
                ref={smokeRef}
                className="absolute -top-12 left-1/2 flex -translate-x-1/2 gap-1.5"
              >
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    animate={{ x: [0, (i - 1) * 14], y: [0, -36] }}
                    transition={{ duration: 1.2, delay: i * 0.09 }}
                    className="h-2.5 w-2.5 rounded-full bg-[#E890B4]/90 blur-[4px]"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.button
        type="button"
        onClick={fireCandle}
        aria-label={lit ? 'Blow out the candle' : 'Candle is out'}
        animate={lit ? { rotate: [0, 1.5, -1.5, 0] } : { rotate: 0 }}
        transition={
          lit ? { duration: 3.2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.4 }
        }
        whileTap={{ scale: 0.96 }}
        className="relative mt-6 flex flex-col items-center outline-none"
      >
        <motion.div
          ref={bodyRef}
          animate={lit ? { scaleY: 1 } : { scaleY: 0.92, opacity: 0.85 }}
          transition={{ duration: 0.25 }}
          style={{ transformOrigin: 'bottom center' }}
          className="relative"
        >
          <svg
            width="88"
            height="150"
            viewBox="0 0 88 150"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id={`${gradId}-body`} x1="0" y1="0" x2="88" y2="0">
                <stop stopColor={palette.bodyTop} />
                <stop offset="0.5" stopColor={palette.bodyMid} />
                <stop offset="1" stopColor={palette.bodyEnd} />
              </linearGradient>
            </defs>
            <rect x="9" y="34" width="70" height="112" rx="10" fill={`url(#${gradId}-body)`} />
            <rect x="9" y="34" width="34" height="112" rx="10" fill="white" opacity="0.14" />
            <path d="M18 34 C18 40 16 46 18 52 C20 46 22 40 20 34 Z" fill="#fff0e8" opacity="0.7" />
            <path
              d="M62 34 C61 42 57 50 60 58 C64 50 66 41 64 34 Z"
              fill="#fff0e8"
              opacity="0.55"
            />
          </svg>
        </motion.div>
      </motion.button>

      {/* Wick */}
      <motion.div
        animate={lit ? { scaleY: 1 } : { scaleY: 0.6 }}
        transition={{ duration: 0.3 }}
        style={{ transformOrigin: 'bottom center' }}
        className="pointer-events-none relative -mt-1 flex justify-center"
      >
        <svg width="6" height="26" viewBox="0 0 6 26">
          <path d="M3 0 C4.5 8 5 15 3 26 C1 15 1.5 8 3 0 Z" fill="#3a2417" />
        </svg>
      </motion.div>

      {/* Mic listening + breath meter */}
      <AnimatePresence>
        {micActive && lit && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-6 flex flex-col items-center gap-2"
          >
            <div className="flex items-center gap-2 rounded-full border border-rose-200 bg-white/85 px-3.5 py-1.5 shadow-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-rose-400" />
              <span className="text-[11px] font-bold tracking-wider text-rose-700 uppercase">
                🎙 Listening… blow when ready
              </span>
            </div>
            <div className="h-1.5 w-28 overflow-hidden rounded-full bg-rose-100">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-rose-400 to-violet-400"
                animate={{ width: `${Math.min(100, level * 220)}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.p
        animate={lit ? { opacity: [0.55, 1, 0.55] } : { opacity: 0.5 }}
        transition={lit ? { duration: 2.2, repeat: Infinity } : {}}
        className={`mt-7 max-w-sm text-center text-sm font-semibold ${palette.hint}`}
      >
        {!lit
          ? 'Nice blow. Now hold that thought. ✨'
          : micActive || isTouch
            ? '💨 Blow into your mic or tap the candle to make a wish!'
            : '✨ Click the candle to make a wish!'}
      </motion.p>
    </motion.div>
  )
}