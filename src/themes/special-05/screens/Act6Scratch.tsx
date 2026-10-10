import { motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { PALETTE } from '../palette'
import { Eyebrow, PrimaryButton, StageScene } from '../components/Stage'
import { Sparkle } from '../components/Decor'

interface Act6ScratchProps {
  config: ExperienceConfig
  reduce: boolean
  onScratch: () => void
  onContinue: () => void
}

const REVEAL_FRACTION = 3.2

export function Act6Scratch({ config, reduce, onScratch, onContinue }: Act6ScratchProps) {
  const cardRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [scratching, setScratching] = useState(false)
  const lastPoint = useRef<{ x: number; y: number } | null>(null)
  const scratched = useRef(0)

  const paintCover = useCallback(() => {
    const canvas = canvasRef.current
    const card = cardRef.current
    if (!canvas || !card) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = card.clientWidth
    const h = card.clientHeight
    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const grad = ctx.createLinearGradient(0, 0, w, h)
    grad.addColorStop(0, PALETTE.roseMid)
    grad.addColorStop(0.5, PALETTE.roseDeep)
    grad.addColorStop(1, '#9E4468')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = 'rgba(255,255,255,0.28)'
    ctx.font = '600 15px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('scratch here', w / 2, h / 2)
    scratched.current = 0
  }, [])

  useEffect(() => {
    if (reduce) return
    paintCover()
    const onResize = () => {
      if (!revealed) paintCover()
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [paintCover, reduce, revealed])

  const scratchAt = (x: number, y: number) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(x, y, 26, 0, Math.PI * 2)
    ctx.fill()
    if (lastPoint.current) {
      ctx.lineWidth = 52
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(lastPoint.current.x, lastPoint.current.y)
      ctx.lineTo(x, y)
      ctx.stroke()
    }
    ctx.globalCompositeOperation = 'source-over'
    lastPoint.current = { x, y }
    scratched.current += 26 * dpr
    if (scratched.current > canvas.width * REVEAL_FRACTION) {
      setRevealed(true)
      onScratch()
    }
  }

  const pointFromEvent = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const revealAll = () => {
    setRevealed(true)
    onScratch()
  }

  return (
    <StageScene
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.06 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.06 }}
      transition={{ duration: reduce ? 0.35 : 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <Eyebrow>a hidden note</Eyebrow>

      <div ref={cardRef} className="relative mt-8 w-full max-w-md overflow-hidden rounded-[24px]">
        {/* the secret underneath */}
        <div
          className="flex min-h-[280px] flex-col items-center justify-center gap-4 px-8 py-14"
          style={{ background: `linear-gradient(180deg, ${PALETTE.cream} 0%, ${PALETTE.blush} 100%)` }}
        >
          <motion.span
            animate={revealed && !reduce ? { scale: [1, 1.12, 1] } : undefined}
            transition={{ duration: 2.4, repeat: Infinity }}
          >
            <Sparkle size={34} color={PALETTE.gold} />
          </motion.span>
          <p className="font-display text-2xl font-bold leading-snug" style={{ color: PALETTE.berry }}>
            {config.content.letterIntro}
          </p>
          <p className="text-sm text-[#8c4360]">For {config.recipient.name || 'you'}</p>
        </div>

        {/* scratch-off cover */}
        {!reduce && (
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 h-full w-full touch-none transition-opacity duration-500 ${revealed ? 'pointer-events-none opacity-0' : 'cursor-crosshair'}`}
            onPointerDown={(e) => {
              setScratching(true)
              lastPoint.current = null
              const { x, y } = pointFromEvent(e)
              scratchAt(x, y)
            }}
            onPointerMove={(e) => {
              if (!scratching || revealed) return
              const { x, y } = pointFromEvent(e)
              scratchAt(x, y)
            }}
            onPointerUp={() => {
              setScratching(false)
              lastPoint.current = null
            }}
            onPointerLeave={() => {
              setScratching(false)
              lastPoint.current = null
            }}
          />
        )}
      </div>

      {reduce && !revealed && (
        <div className="mt-6">
          <PrimaryButton onClick={revealAll}>Reveal the note</PrimaryButton>
        </div>
      )}

      {!reduce && !revealed && (
        <button type="button" onClick={revealAll} className="sr-only">
          Reveal the note
        </button>
      )}

      {!reduce && !revealed && (
        <p className="mt-5 text-xs font-medium uppercase tracking-[0.24em] text-[#b98a9f]">
          drag across the card to scratch
        </p>
      )}

      {revealed && (
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mt-7">
          <PrimaryButton onClick={onContinue}>Read the letter</PrimaryButton>
        </motion.div>
      )}
    </StageScene>
  )
}
