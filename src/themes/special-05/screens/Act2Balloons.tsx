import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { PALETTE } from '../palette'
import { Eyebrow, PrimaryButton, SceneTitle, StageScene } from '../components/Stage'
import { Balloon, Heart } from '../components/Decor'

interface Act2BalloonsProps {
  config: ExperienceConfig
  reduce: boolean
  onPop: () => void
  onContinue: () => void
}

interface BalloonSpec {
  id: number
  left: number
  top: number
  size: number
  tone: number
  secret?: string
}

const BALLOONS: BalloonSpec[] = [
  { id: 0, left: 12, top: 4, size: 78, tone: 0 },
  { id: 1, left: 40, top: -4, size: 96, tone: 1, secret: 'you are so loved' },
  { id: 2, left: 70, top: 6, size: 74, tone: 2 },
  { id: 3, left: 4, top: 42, size: 70, tone: 3, secret: 'make a wish' },
  { id: 4, left: 33, top: 38, size: 88, tone: 4 },
  { id: 5, left: 63, top: 44, size: 80, tone: 1, secret: 'the world is brighter with you' },
  { id: 6, left: 20, top: 66, size: 72, tone: 2 },
  { id: 7, left: 56, top: 70, size: 76, tone: 0 },
]

const REVEAL_TARGET = 3

export function Act2Balloons({ config, reduce, onPop, onContinue }: Act2BalloonsProps) {
  const [popped, setPopped] = useState<number[]>([])
  const specs = useMemo(() => BALLOONS, [])
  const revealed = popped.length >= REVEAL_TARGET
  const secretsFound = popped.filter((id) => specs.find((s) => s.id === id)?.secret).length

  const pop = (id: number) => {
    if (popped.includes(id)) return
    onPop()
    setPopped((prev) => [...prev, id])
  }

  return (
    <StageScene
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.12 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: reduce ? 0.35 : 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <Eyebrow>a little surprise</Eyebrow>
      <SceneTitle className="mt-4">{config.content.revealHeading}</SceneTitle>
      <p className="mt-3 max-w-md text-sm text-[#8c4360] sm:text-base">{config.content.revealSubtext}</p>

      {/* balloon field */}
      <div className="relative mt-4 h-[46vh] max-h-[360px] min-h-[280px] w-full max-w-lg">
        {specs.map((b) => (
          <div
            key={b.id}
            className="absolute"
            style={{ left: `${b.left}%`, top: `${b.top}%` }}
          >
            <AnimatePresence>
              {!popped.includes(b.id) ? (
                <motion.button
                  type="button"
                  onClick={() => pop(b.id)}
                  aria-label={b.secret ? 'Pop this balloon to reveal a secret' : 'Pop the balloon'}
                  className="cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#c2688c] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                  initial={{ opacity: 0, y: 20 }}
                  animate={
                    reduce
                      ? { opacity: 1, y: 0 }
                      : { opacity: 1, y: [0, -10, 0], rotate: [-3, 3, -3] }
                  }
                  exit={{ opacity: 0, scale: 1.5 }}
                  transition={
                    reduce
                      ? { duration: 0.3 }
                      : {
                          opacity: { duration: 0.4 },
                          y: { duration: 4 + b.id * 0.4, repeat: Infinity, ease: 'easeInOut' },
                          rotate: { duration: 5 + b.id * 0.3, repeat: Infinity, ease: 'easeInOut' },
                        }
                  }
                  style={{ transformOrigin: 'top center' }}
                  whileTap={{ scale: 0.86 }}
                >
                  <Balloon tone={b.tone} size={b.size} />
                </motion.button>
              ) : (
                <motion.div
                  key={`burst-${b.id}`}
                  initial={{ opacity: 1, scale: 0.6 }}
                  animate={{ opacity: 0, scale: 1.4, y: -26 }}
                  transition={{ duration: 0.9, ease: 'easeOut' }}
                  className="pointer-events-none flex flex-col items-center"
                >
                  <Heart size={22} color={PALETTE.roseDeep} />
                  {b.secret && (
                    <span
                      className="mt-1 w-28 text-center text-[11px] font-semibold leading-tight"
                      style={{ color: PALETTE.berrySoft }}
                    >
                      {b.secret}
                    </span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <p className="mt-2 text-xs font-medium uppercase tracking-[0.24em] text-[#b98a9f]">
        {revealed
          ? secretsFound > 0
            ? `${secretsFound} secret${secretsFound > 1 ? 's' : ''} found`
            : 'nicely done'
          : `tap ${REVEAL_TARGET - popped.length} more balloon${REVEAL_TARGET - popped.length === 1 ? '' : 's'}`}
      </p>

      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <PrimaryButton onClick={onContinue}>Turn up the lights</PrimaryButton>
          </motion.div>
        )}
      </AnimatePresence>
    </StageScene>
  )
}
