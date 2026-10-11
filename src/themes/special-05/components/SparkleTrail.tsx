import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Heart, Sparkle } from './Decor'

interface TrailMark {
  id: number
  x: number
  y: number
  heart: boolean
}

export function SparkleTrail({ reduce }: { reduce: boolean }) {
  const [marks, setMarks] = useState<TrailMark[]>([])
  const nextId = useRef(0)
  const lastMove = useRef(0)

  useEffect(() => {
    if (reduce) return
    const addMark = (event: PointerEvent, heart: boolean) => {
      if (event.pointerType === 'mouse' && !heart && performance.now() - lastMove.current < 95) return
      lastMove.current = performance.now()
      const mark = {
        id: ++nextId.current,
        x: event.clientX,
        y: event.clientY,
        heart,
      }
      setMarks((current) => [...current.slice(-4), mark])
    }
    const onMove = (event: PointerEvent) => addMark(event, false)
    const onDown = (event: PointerEvent) => addMark(event, true)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
    }
  }, [reduce])

  if (reduce) return null

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {marks.map((mark) => (
        <motion.span
          key={mark.id}
          className="absolute"
          style={{ left: mark.x, top: mark.y, willChange: 'transform, opacity' }}
          initial={{ opacity: 0, scale: 0.5, x: -8, y: -4 }}
          animate={{ opacity: [0, 0.85, 0], scale: [0.6, 1, 0.75], x: mark.id % 2 ? 7 : -7, y: -34 }}
          transition={{ duration: 0.85, ease: 'easeOut' }}
          onAnimationComplete={() => setMarks((current) => current.filter((item) => item.id !== mark.id))}
        >
          {mark.heart ? <Heart size={14} /> : <Sparkle size={12} />}
        </motion.span>
      ))}
    </div>
  )
}
