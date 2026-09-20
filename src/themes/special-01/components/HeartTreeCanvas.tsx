import { useEffect, useRef } from 'react'

export interface HeartTreePalette {
  pink: string
  peach: string
  magenta?: string
  gold: string
  bark: string
}

interface HeartTreeCanvasProps {
  colors: HeartTreePalette
  className?: string
  onGrowComplete?: () => void
  onBloomComplete?: () => void
}

interface Limb {
  x0: number
  y0: number
  x1: number
  y1: number
  len: number
  w: number
}

interface Heart {
  x: number
  y: number
  size: number
  color: string
  delay: number
  phase: number
}

interface Petal {
  x: number
  y: number
  size: number
  vy: number
  sway: number
  phase: number
  rot: number
  vr: number
  alpha: number
  color: string
}

interface Twinkle {
  x: number
  y: number
  size: number
  phase: number
}

interface TreeState {
  limbs: Limb[]
  totalLen: number
  hearts: Heart[]
  petals: Petal[]
  twinkles: Twinkle[]
  cx: number
  canopyY: number
}

const GROW_MS = 4000
const BLOOM_MS = 2600
const BLOOM_OVERLAP = 320
const DEPTH = 5

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function heartPoint(t: number) {
  return {
    x: 16 * Math.pow(Math.sin(t), 3),
    y: 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t),
  }
}

function easeOutBack(t: number) {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

function drawMiniHeart(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  alpha: number,
) {
  const r = size
  ctx.globalAlpha = alpha
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(x, y + r * 0.4)
  ctx.bezierCurveTo(x - r * 0.6, y - r * 0.1, x - r * 0.28, y - r * 0.72, x, y - r * 0.16)
  ctx.bezierCurveTo(x + r * 0.28, y - r * 0.72, x + r * 0.6, y - r * 0.1, x, y + r * 0.4)
  ctx.closePath()
  ctx.fill()
}

export function HeartTreeCanvas({
  colors,
  className = '',
  onGrowComplete,
  onBloomComplete,
}: HeartTreeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const growFiredRef = useRef(false)
  const bloomFiredRef = useRef(false)
  const onGrowRef = useRef(onGrowComplete)
  const onBloomRef = useRef(onBloomComplete)

  useEffect(() => {
    onGrowRef.current = onGrowComplete
    onBloomRef.current = onBloomComplete
  }, [onBloomComplete, onGrowComplete])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let w = window.innerWidth
    let h = window.innerHeight
    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    const seed = 20240920
    let state: TreeState = buildTree(seed, w, h)

    function buildTree(seedNum: number, width: number, height: number): TreeState {
      const r = mulberry32(seedNum)
      const limbs: Limb[] = []
      let totalLen = 0

      const growBranch = (
        x: number,
        y: number,
        angle: number,
        len: number,
        width: number,
        depth: number,
      ) => {
        const ex = x + Math.cos(angle) * len
        const ey = y + Math.sin(angle) * len
        limbs.push({ x0: x, y0: y, x1: ex, y1: ey, len, w: width })
        totalLen += len
        if (depth <= 0) return
        const childCount = width > 6 && r() < 0.55 ? 3 : 2
        for (let i = 0; i < childCount; i++) {
          const dir = i - (childCount - 1) / 2
          const spread = depth >= 3 ? 0.46 : 0.62
          const na = angle + dir * spread * (0.62 + r() * 0.5) + (r() - 0.5) * 0.16
          growBranch(ex, ey, na, len * (0.66 + r() * 0.1), Math.max(0.9, width * 0.58), depth - 1)
        }
      }

      const baseY = height * 1.02
      const cx = width / 2
      const trunkLen = height * 0.17
      growBranch(cx, baseY, -Math.PI / 2, trunkLen, Math.max(9, Math.min(16, width * 0.028)), DEPTH)

      const s = Math.max(6, Math.min(15, Math.min(width, height) * 0.0215))
      const canopyY = height * 0.46

      const hearts: Heart[] = []
      const layers = [
        { loop: 96, off: 0 },
        { loop: 64, off: 0.14 },
        { loop: 44, off: 0.24 },
        { loop: 30, off: 0.32 },
      ]
      const palette = [colors.pink, colors.magenta ?? colors.pink, colors.peach, colors.gold]
      for (let li = 0; li < layers.length; li++) {
        const { loop, off } = layers[li]
        for (let i = 0; i < loop; i++) {
          const t = (i / loop) * Math.PI * 2 + r() * 0.4
          const pt = heartPoint(t)
          const jx = (r() - 0.5) * 3.4 * s * 0.2
          const jy = (r() - 0.5) * 3.4 * s * 0.2
          const f = 1 - off
          hearts.push({
            x: cx + pt.x * s * f + jx,
            y: canopyY - pt.y * s * f + jy,
            size: 2.4 + r() * 3.6,
            color: palette[Math.floor(r() * palette.length)],
            delay: off * 3.2 + r() * 1.35,
            phase: r() * Math.PI * 2,
          })
        }
      }

      const petals: Petal[] = Array.from({ length: 26 }).map(() => ({
        x: r() * width,
        y: r() * height,
        size: 2.6 + r() * 3.4,
        vy: 0.5 + r() * 0.55,
        sway: 0.5 + r() * 1.2,
        phase: r() * Math.PI * 2,
        rot: r() * Math.PI * 2,
        vr: (r() - 0.5) * 0.02,
        alpha: 0.35 + r() * 0.4,
        color: r() < 0.5 ? colors.pink : colors.peach,
      }))

      const twinkles: Twinkle[] = Array.from({ length: 34 }).map(() => ({
        x: r() * width,
        y: r() * height,
        size: 0.8 + r() * 1.6,
        phase: r() * Math.PI * 2,
      }))

      return { limbs, totalLen, hearts, petals, twinkles, cx, canopyY }
    }

    const resize = () => {
      const newW = window.innerWidth
      const newH = window.innerHeight
      if (newW === w && newH === h) return
      w = newW
      h = newH
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      state = buildTree(seed, w, h)
    }

    canvas.width = Math.floor(w * dpr)
    canvas.height = Math.floor(h * dpr)
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    window.addEventListener('resize', resize)

    const clamp01 = (v: number) => Math.max(0, Math.min(1, v))
    let raf = 0
    const start = performance.now()

    const frame = (now: number) => {
      const elapsed = now - start
      const t = reduced ? Infinity : elapsed
      ctx.clearRect(0, 0, w, h)

      // ambient twinkles
      for (const tw of state.twinkles) {
        const a = (reduced ? 0.5 : 0.5 + 0.5 * Math.sin(t * 0.0012 + tw.phase)) * 0.5
        ctx.globalAlpha = a
        ctx.fillStyle = colors.gold
        ctx.beginPath()
        ctx.arc(tw.x, tw.y, tw.size, 0, Math.PI * 2)
        ctx.fill()
      }

      // canopy aura
      const aura = ctx.createRadialGradient(
        state.cx,
        state.canopyY,
        0,
        state.cx,
        state.canopyY,
        Math.min(w, h) * 0.42,
      )
      aura.addColorStop(0, 'rgba(255,138,172,0.1)')
      aura.addColorStop(0.55, 'rgba(255,217,166,0.05)')
      aura.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = aura
      ctx.fillRect(0, 0, w, h)

      const growT = clamp01(t / GROW_MS)
      const growEased = growT * growT * (3 - 2 * growT)
      const glowA = 0.1 + 0.14 * (1 - growEased)

      let drawnLen = 0
      let tipX = state.cx
      let tipY = state.canopyY
      for (const limb of state.limbs) {
        const limbEnd = drawnLen + limb.len
        if (limbEnd <= state.totalLen * growEased) {
          drawLimb(ctx, limb.x0, limb.y0, limb.x1, limb.y1, limb.w)
          tipX = limb.x1
          tipY = limb.y1
        } else if (drawnLen < state.totalLen * growEased) {
          const frac = (state.totalLen * growEased - drawnLen) / limb.len
          const mx = limb.x0 + (limb.x1 - limb.x0) * frac
          const my = limb.y0 + (limb.y1 - limb.y0) * frac
          drawLimb(ctx, limb.x0, limb.y0, mx, my, limb.w)
          tipX = mx
          tipY = my
          break
        }
        drawnLen = limbEnd
      }

      // grow tip glow
      if (growEased < 1) {
        ctx.globalAlpha = glowA
        const tipGlow = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, 26)
        tipGlow.addColorStop(0, 'rgba(227,179,91,0.75)')
        tipGlow.addColorStop(1, 'rgba(227,179,91,0)')
        ctx.fillStyle = tipGlow
        ctx.beginPath()
        ctx.arc(tipX, tipY, 26, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
      }

      if (growT >= 1 && !growFiredRef.current) {
        growFiredRef.current = true
        onGrowRef.current?.()
      }

      const bloomStart = GROW_MS - BLOOM_OVERLAP
      const bloomProg = clamp01((t - bloomStart) / BLOOM_MS)

      if (bloomProg > 0) {
        for (const heart of state.hearts) {
          const localAge = t - bloomStart - heart.delay
          if (localAge < 0) continue
          const progress = clamp01(localAge / 460)
          const scale = reduced ? 1 : easeOutBack(progress)
          const pulse = reduced ? 1 : 1 + 0.07 * Math.sin(t * 0.004 + heart.phase)
          const alpha = clamp01(progress) * 0.95
          drawMiniHeart(
            ctx,
            heart.x,
            heart.y,
            heart.size * scale * pulse,
            heart.color,
            alpha,
          )
        }
      }

      if (bloomProg >= 0.96 && !bloomFiredRef.current && !reduced) {
        bloomFiredRef.current = true
        onBloomRef.current?.()
      }

      // falling petals
      const petalsActive = t > bloomStart + 500 || reduced
      if (petalsActive) {
        ctx.globalAlpha = 1
        for (const petal of state.petals) {
          if (!reduced) {
            petal.y += petal.vy * 1.4
            petal.rot += petal.vr
            petal.x += Math.sin(t * 0.001 + petal.phase) * petal.sway * 0.18
            if (petal.y > h + 18) {
              petal.y = -18
              petal.x = Math.random() * w
            }
          }
          const wob = reduced ? 1 : 0.7 + 0.3 * Math.sin(t * 0.003 + petal.phase)
          ctx.save()
          ctx.translate(petal.x, petal.y)
          ctx.rotate(petal.rot)
          ctx.globalAlpha = petal.alpha * wob
          ctx.fillStyle = petal.color
          ctx.beginPath()
          ctx.ellipse(0, 0, petal.size * 0.72, petal.size, 0, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        }
      }

      raf = requestAnimationFrame(frame)
    }

    raf = requestAnimationFrame(frame)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(raf)
    }
  }, [colors])

  return <canvas ref={canvasRef} className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden />
}

function drawLimb(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  width: number,
) {
  ctx.strokeStyle = '#8a5a44'
  ctx.lineWidth = width
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(x0, y0)
  ctx.lineTo(x1, y1)
  ctx.stroke()

  ctx.strokeStyle = 'rgba(232,195,154,0.5)'
  ctx.lineWidth = Math.max(0.6, width * 0.35)
  ctx.beginPath()
  ctx.moveTo(x0, y0)
  ctx.lineTo(x1, y1)
  ctx.stroke()
}