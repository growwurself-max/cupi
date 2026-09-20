import { useEffect, useRef } from 'react'

interface HeartBurstOverlayProps {
  /** Origin of the burst as fractions of the viewport (0..1). */
  origin?: { x: number; y: number }
  colors?: string[]
  duration?: number
  className?: string
}

interface BurstParticle {
  type: 'heart' | 'dot'
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  life: number
  maxLife: number
  alpha: number
  rot: number
  vr: number
}

function drawHeart(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  alpha: number,
  rot: number,
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rot)
  ctx.globalAlpha = alpha
  ctx.fillStyle = color
  ctx.beginPath()
  const r = size
  ctx.moveTo(0, r * 0.32)
  ctx.bezierCurveTo(-r * 0.5, -r * 0.2, -r * 0.22, -r * 0.62, 0, -r * 0.18)
  ctx.bezierCurveTo(r * 0.22, -r * 0.62, r * 0.5, -r * 0.2, 0, r * 0.32)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

export function HeartBurstOverlay({
  origin = { x: 0.5, y: 0.26 },
  colors = ['#ff8296', '#ffb3c1', '#ffd6c9', '#f9b16e', '#e3b35b', '#ffe9d1'],
  duration = 1700,
  className = '',
}: HeartBurstOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const resize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const w = window.innerWidth
    const h = window.innerHeight
    const cx = origin.x * w
    const cy = origin.y * h
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const particles: BurstParticle[] = Array.from({ length: reduced ? 40 : 170 }).map(
      () => {
        const angle = Math.random() * Math.PI * 2
        const speed = reduced ? 4 : 3 + Math.random() * 9
        const maxLife = reduced ? 300 : 700 + Math.random() * 900
        return {
          type: (Math.random() < 0.42 ? 'heart' : 'dot') as BurstParticle['type'],
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          size: 2.5 + Math.random() * 5.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 0,
          maxLife,
          alpha: 0.65 + Math.random() * 0.35,
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.18,
        }
      },
    )

    let raf = 0
    const start = performance.now()
    let last = start

    const frame = (now: number) => {
      const dt = Math.min(2, (now - last) / 16.7)
      last = now
      const elapsed = now - start
      ctx.clearRect(0, 0, w, h)

      const ring = elapsed / duration
      if (ring < 1) {
        const rad = 46 + ring * Math.min(w, h) * 0.65
        ctx.beginPath()
        ctx.arc(cx, cy, rad, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(227,179,91,${0.6 * (1 - ring)})`
        ctx.lineWidth = 1.6
        ctx.stroke()
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad)
        glow.addColorStop(0, `rgba(227,179,91,${0.22 * (1 - ring)})`)
        glow.addColorStop(1, 'rgba(227,179,91,0)')
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(cx, cy, rad, 0, Math.PI * 2)
        ctx.fill()
      }

      for (const p of particles) {
        p.life += dt * 16.7
        if (p.life >= p.maxLife) continue
        p.vy += 0.14 * dt
        p.vx *= 0.992
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.rot += p.vr * dt
        const fade = 1 - Math.pow(p.life / p.maxLife, 1.6)
        const alpha = p.alpha * fade
        if (p.type === 'dot') {
          ctx.globalAlpha = alpha
          ctx.fillStyle = p.color
          ctx.shadowColor = p.color
          ctx.shadowBlur = 8
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * 0.55, 0, Math.PI * 2)
          ctx.fill()
          ctx.shadowBlur = 0
        } else {
          drawHeart(ctx, p.x, p.y, p.size, p.color, alpha, p.rot)
        }
      }

      const totalFrames = duration / 16.7
      if (elapsed < totalFrames * 16.7 + 200) {
        raf = requestAnimationFrame(frame)
      }
    }

    if (reduced) {
      raf = requestAnimationFrame((now) => frame(now))
    } else {
      raf = requestAnimationFrame(frame)
    }

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(raf)
    }
  }, [colors, duration, origin.x, origin.y])

  return <canvas ref={canvasRef} className={`pointer-events-none absolute inset-0 z-20 ${className}`} aria-hidden />
}