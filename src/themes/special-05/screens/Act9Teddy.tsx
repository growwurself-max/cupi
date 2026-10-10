import { motion, useAnimationControls } from 'framer-motion'
import { useRef, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { PALETTE } from '../palette'
import { Eyebrow, PrimaryButton, SceneTitle, StageScene } from '../components/Stage'
import { Heart, TeddyOnSwing } from '../components/Decor'

interface Act9TeddyProps {
  config: ExperienceConfig
  reduce: boolean
  onPush: () => void
  onContinue: () => void
}

interface Floater {
  id: number
  left: number
  size: number
}

export function Act9Teddy({ config, reduce, onPush, onContinue }: Act9TeddyProps) {
  const leftCtl = useAnimationControls()
  const rightCtl = useAnimationControls()
  const [pushed, setPushed] = useState(0)
  const [floaters, setFloaters] = useState<Floater[]>([])
  const seqRef = useRef(0)

  const pushBear = (side: 'left' | 'right') => {
    onPush()
    if (!reduce) {
      const ctl = side === 'left' ? leftCtl : rightCtl
      void ctl.start({
        rotate: [0, side === 'left' ? 24 : -24, side === 'left' ? -18 : 18, side === 'left' ? 9 : -9, 0],
        transition: { duration: 1.5, ease: 'easeInOut' },
      })
    }
    setPushed((p) => p + 1)

    seqRef.current += 1
    const id = seqRef.current
    const left = (side === 'left' ? 24 : 66) + ((pushed % 3) - 1) * 4
    setFloaters((prev) => [...prev.slice(-6), { id, left, size: 14 + (pushed % 3) * 4 }])
    window.setTimeout(() => {
      setFloaters((prev) => prev.filter((f) => f.id !== id))
    }, 1700)
  }

  return (
    <StageScene
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -22 }}
      transition={{ duration: reduce ? 0.35 : 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <Eyebrow>the teddy bears&apos; turn</Eyebrow>
      <SceneTitle className="mt-4">Push the bears, make them swing</SceneTitle>
      <p className="mt-3 max-w-md text-sm text-[#8c4360] sm:text-base">
        Give the swings a gentle nudge for {config.recipient.name || 'you'}.
      </p>

      <div className="relative mt-8 flex h-[42vh] max-h-[340px] min-h-[260px] w-full max-w-md items-start justify-center gap-6">
        {/* swing frame bar */}
        <div className="absolute inset-x-2 top-0 h-2.5 rounded-full" style={{ background: PALETTE.gold }} aria-hidden />

        {(['left', 'right'] as const).map((side) => (
          <motion.div key={side} className="flex-1" animate={side === 'left' ? leftCtl : rightCtl} style={{ transformOrigin: 'top center' }}>
            <button
              type="button"
              onClick={() => pushBear(side)}
              aria-label={`Push the ${side} teddy bear on the swing`}
              className="w-full cursor-pointer rounded-b-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#c2688c]"
            >
              <TeddyOnSwing variant={side === 'left' ? 'a' : 'b'} size={150} className="mx-auto" />
            </button>
          </motion.div>
        ))}

        {floaters.map((f) => (
          <motion.span
            key={f.id}
            className="pointer-events-none absolute bottom-10"
            style={{ left: `${f.left}%` }}
            initial={{ opacity: 0, y: 0, scale: 0.7 }}
            animate={{ opacity: [0, 1, 1, 0], y: -96 }}
            transition={{ duration: 1.6, ease: 'easeOut' }}
          >
            <Heart size={f.size} color={PALETTE.roseDeep} />
          </motion.span>
        ))}
      </div>

      <p className="mt-6 text-xs font-medium uppercase tracking-[0.24em] text-[#b98a9f]">
        {pushed === 0 ? 'tap a bear to start the swing' : `${pushed} swing${pushed > 1 ? 's' : ''} and counting`}
      </p>

      {pushed > 0 && (
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
          <PrimaryButton onClick={onContinue}>To the finale</PrimaryButton>
        </motion.div>
      )}
    </StageScene>
  )
}
