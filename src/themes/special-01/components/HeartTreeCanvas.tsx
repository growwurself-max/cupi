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

interface Vec2 {
  x: number
  y: number
}

const GROW_MS = 4000
const BLOOM_MS = 5000
const BLOOM_OVERLAP = 320
const POP_MS = 520
const BLOOM_LEVELS = 6
const WAVE_LEVEL_MS = 4200
const WAVE_OUTWARD_MS = 300
const WAVE_JITTER_MS = 240
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

const HEART_POLY: Vec2[] = (() => {
  const pts: Vec2[] = []
  for (let i = 0; i < 960; i++) {
    pts.push(heartPoint((i / 960) * Math.PI * 2))
  }
  return pts
})()

const HEART_BBOX = (() => {
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const p of HEART_POLY) {
    if (p.x < minX) minX = p.x
    if (p.x > maxX) maxX = p.x
    if (p.y < minY) minY = p.y
    if (p.y > maxY) maxY = p.y
  }
  return { minX, maxX, minY, maxY }
})()

function polygonArea(poly: Vec2[]) {
  let area = 0
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    area += poly[j].x * poly[i].y - poly[i].x * poly[j].y
  }
  return Math.abs(area) / 2
}

const HEART_AREA_UNITS = polygonArea(HEART_POLY)

function pointInPoly(pt: Vec2, poly: Vec2[]) {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i]
    const b = poly[j]
    if (a.y > pt.y !== b.y > pt.y && pt.x < ((b.x - a.x) * (pt.y - a.y)) / (b.y - a.y) + a.x) {
      inside = !inside
    }
  }
  return inside
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

function traceHeartPath(ctx: CanvasRenderingContext2D, cx: number, canopyY: number, s: number) {
  ctx.beginPath()
  for (let i = 0; i < HEART_POLY.length; i++) {
    const p = HEART_POLY[i]
    const x = cx + p.x * s
    const y = canopyY - p.y * s
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
}

// Dense fill of the silhouette with vibrant pinks, reds, magentas and warm gold/peach accents.
const HOT_TINTS = ['#FF1E56', '#FF2E63', '#FF4D8D', '#FB2576', '#FF5C8A', '#FF6F91']
const SWEET_TINTS = ['#FF8EAD', '#FFA3C0', '#FFB3C6', '#E91E63', '#EC407A', '#D81B60', '#F06292']
const WARM_TINTS = ['#FF9A76', '#FFB26B', '#FFC93C', '#FFD166', '#F59E0B']

function pickCanopyColor(r: () => number) {
  const roll = r()
  const bucket = roll < 0.55 ? HOT_TINTS : roll < 0.85 ? SWEET_TINTS : WARM_TINTS
  return bucket[Math.floor(r() * bucket.length)]
}

function buildHearts(cx: number, canopyY: number, s: number, r: () => number): Heart[] {
  const hearts: Heart[] = []
  const bboxW = HEART_BBOX.maxX - HEART_BBOX.minX
  const bboxH = HEART_BBOX.maxY - HEART_BBOX.minY
  // sequential level-by-level bloom: hearts at the trunk/base bloom first and
  // the pop ripples band by band upward, spreading slightly outward to the rim.
  const halfW = (HEART_BBOX.maxX - HEART_BBOX.minX) / 2
  const height = HEART_BBOX.maxY - HEART_BBOX.minY
  const levelDelay = (ux: number, uy: number) => {
    const nv = (uy - HEART_BBOX.minY) / height
    const band = Math.min(BLOOM_LEVELS - 1, Math.floor(nv * BLOOM_LEVELS))
    const bandBase = (band / BLOOM_LEVELS) * WAVE_LEVEL_MS
    const outward = (Math.abs(ux) / halfW) * WAVE_OUTWARD_MS
    return bandBase + outward + r() * WAVE_JITTER_MS
  }

  const density = 0.4
  const interiorTarget = Math.max(700, Math.min(4300, Math.round(HEART_AREA_UNITS / (density * density))))

  let attempts = 0
  while (hearts.length < interiorTarget && attempts < interiorTarget * 6) {
    attempts++
    const ux = HEART_BBOX.minX + r() * bboxW
    const uy = HEART_BBOX.minY + r() * bboxH
    if (!pointInPoly({ x: ux, y: uy }, HEART_POLY)) continue
    const jx = (r() - 0.5) * s * 0.14
    const jy = (r() - 0.5) * s * 0.14
    hearts.push({
      x: cx + ux * s + jx,
      y: canopyY - uy * s + jy,
      size: s * (0.26 + r() * 0.36),
      color: pickCanopyColor(r),
      delay: levelDelay(ux, uy),
      phase: r() * Math.PI * 2,
    })
  }

  // crisp contour: trace the silhouette edge so the canopy reads as a clean heart outline.
  const boundaryCount = 280
  for (let i = 0; i < boundaryCount; i++) {
    const t = (i / boundaryCount) * Math.PI * 2 + r() * 0.025
    const pt = heartPoint(t)
    const k = 0.968 + r() * 0.024
    const ux = pt.x * k
    const uy = pt.y * k
    hearts.push({
      x: cx + ux * s,
      y: canopyY - uy * s,
      size: s * (0.22 + r() * 0.3),
      color: pickCanopyColor(r),
      delay: levelDelay(ux, uy),
      phase: r() * Math.PI * 2,
    })
  }

  return hearts
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

    // Cache the fully-bloomed canopy on an offscreen canvas so dense rendering stays cheap.
    let settled: HTMLCanvasElement | null = null

    function buildTree(seedNum: number, width: number, height: number): TreeState {
      const r = mulberry32(seedNum)
      const limbs: Limb[] = []
      let totalLen = 0

      const branchTips: { x: number; y: number }[] = []

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
        if (depth <= 0) {
          branchTips.push({ x: ex, y: ey })
          return
        }
        const childCount = width > 6 && r() < 0.55 ? 3 : 2
        for (let i = 0; i < childCount; i++) {
          const dir = i - (childCount - 1) / 2
          const spread = depth >= 3 ? 0.46 : 0.62
          const na = angle + dir * spread * (0.62 + r() * 0.5) + (r() - 0.5) * 0.16
          growBranch(ex, ey, na, len * (0.66 + r() * 0.1), Math.max(0.9, width * 0.58), depth - 1)
        }
      }

      const baseY = height * 0.98
      const cx = width > 768 ? width * 0.72 : width * 0.58
      const trunkLen = height * 0.19
      growBranch(cx, baseY, -Math.PI / 2, trunkLen, Math.max(9, Math.min(16, width * 0.028)), DEPTH)

      const s = Math.max(7, Math.min(17, Math.min(width, height) * 0.024)) * 1.15
      const canopyY = height * 0.4

      const hearts = buildHearts(cx, canopyY, s, r)

      // blossoms that sprout straight from the branch tips reaching into the heart
      for (const tip of branchTips) {
        for (let k = 0; k < 5; k++) {
          hearts.push({
            x: tip.x + (r() - 0.5) * s * 0.24,
            y: tip.y + (r() - 0.5) * s * 0.24,
            size: s * (0.24 + r() * 0.3),
            color: pickCanopyColor(r),
            delay: 0.35 + r() * 0.9,
            phase: r() * Math.PI * 2,
          })
        }
      }

      const petalTints = ['#FF2E63', '#FF8EAD', '#FFB3C6', '#FFD166']
      const petals: Petal[] = Array.from({ length: 54 }).map(() => ({
        x: r() * width,
        y: r() * height * 0.85,
        size: 2.4 + r() * 3.8,
        vy: 0.45 + r() * 0.65,
        sway: 0.6 + r() * 1.4,
        phase: r() * Math.PI * 2,
        rot: r() * Math.PI * 2,
        vr: (r() - 0.5) * 0.02,
        alpha: 0.32 + r() * 0.45,
        color: petalTints[Math.floor(r() * petalTints.length)],
      }))

      const twinkles: Twinkle[] = Array.from({ length: 34 }).map(() => ({
        x: r() * width,
        y: r() * height,
        size: 0.8 + r() * 1.6,
        phase: r() * Math.PI * 2,
      }))

      return { limbs, totalLen, hearts, petals, twinkles, cx, canopyY }
    }

    const renderSettled = () => {
      if (settled) return
      settled = document.createElement('canvas')
      settled.width = Math.floor(w * dpr)
      settled.height = Math.floor(h * dpr)
      const sctx = settled.getContext('2d')
      if (!sctx) return
      sctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      for (const heart of state.hearts) {
        drawMiniHeart(sctx, heart.x, heart.y, heart.size, heart.color, 0.95)
      }
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
      settled = null
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

    const paint = (now: number) => {
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

      if (bloomProg > 0.02) {
        // soft blush wash behind the mini-hearts so the silhouette reads instantly
        const wash = Math.min(0.14, bloomProg * 0.1)
        ctx.globalAlpha = wash
        ctx.fillStyle = '#FF8098'
        traceHeartPath(ctx, state.cx, state.canopyY, Math.max(7, Math.min(17, Math.min(w, h) * 0.024)) * 1.15)
        ctx.fill()
        ctx.globalAlpha = 1
      }

      if (t >= bloomStart) {
        // last heart finishes its pop only after the full staggered wave has run
        const bloomEnd = bloomStart + WAVE_LEVEL_MS + WAVE_OUTWARD_MS + WAVE_JITTER_MS + POP_MS
        if (t >= bloomEnd) {
          if (!settled) renderSettled()
          if (settled) {
            ctx.drawImage(settled, 0, 0, w, h)
            // live shimmer highlights keep the canopy feeling alive without re-drawing 4k hearts
            if (!reduced) {
              for (let i = 0; i < state.hearts.length; i += 11) {
                const heart = state.hearts[i]
                const pulse = 1 + 0.08 * Math.sin(t * 0.0035 + heart.phase)
                const shimmer = 0.72 + 0.28 * Math.sin(t * 0.002 + heart.phase)
                drawMiniHeart(ctx, heart.x, heart.y, heart.size * pulse, heart.color, shimmer)
              }
            }
            ctx.globalAlpha = 1
          }
        } else {
          for (let i = 0; i < state.hearts.length; i++) {
            const heart = state.hearts[i]
            const localAge = t - bloomStart - heart.delay
            if (localAge < 0) continue
            const progress = clamp01(localAge / POP_MS)
            const scale = reduced ? 1 : easeOutBack(progress)
            const pulse = reduced ? 1 : 1 + 0.07 * Math.sin(t * 0.004 + heart.phase)
            const alpha = clamp01(progress) * 0.95

            // soft "blossom pop" ring on a light sample of hearts as they unfold
            if (!reduced && i % 3 === 0 && progress < 0.5) {
              const ringR = (1 - progress / 0.5) * 6.5
              ctx.globalAlpha = progress * 0.4
              ctx.strokeStyle = 'rgba(255,255,255,0.85)'
              ctx.lineWidth = 1
              ctx.beginPath()
              ctx.arc(heart.x, heart.y, heart.size * 0.55 + ringR, 0, Math.PI * 2)
              ctx.stroke()
            }

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
      }

      if (bloomProg >= 0.96 && !bloomFiredRef.current && !reduced) {
        bloomFiredRef.current = true
        onBloomRef.current?.()
      }

      // continuous drifting petals
      const petalsActive = t > 400 || reduced
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
    }

    if (reduced) {
      paint(performance.now())
    } else {
      const loop = (now: number) => {
        paint(now)
        raf = requestAnimationFrame(loop)
      }
      raf = requestAnimationFrame(loop)
    }

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