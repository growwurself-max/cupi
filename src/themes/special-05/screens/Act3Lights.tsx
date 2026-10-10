import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { PALETTE } from '../palette'
import { Eyebrow, PrimaryButton, SceneTitle, StageScene } from '../components/Stage'

interface Act3LightsProps {
  config: ExperienceConfig
  reduce: boolean
  onLight: () => void
  onContinue: () => void
}

interface LampSpec {
  id: number
  left: number
  drop: number
}

const LAMPS: LampSpec[] = [
  { id: 0, left: 10, drop: 40 },
  { id: 1, left: 26, drop: 78 },
  { id: 2, left: 42, drop: 46 },
  { id: 3, left: 58, drop: 86 },
  { id: 4, left: 74, drop: 52 },
  { id: 5, left: 90, drop: 74 },
]

export function Act3Lights({ config, reduce, onLight, onContinue }: Act3LightsProps) {
  const [lit, setLit] = useState<number[]>([])
  const lamps = useMemo(() => LAMPS, [])
  const allLit = lit.length === lamps.length

  const toggle = (id: number) => {
    if (lit.includes(id)) return
    onLight()
    setLit((prev) => [...prev, id])
  }

  return (
    <StageScene
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: reduce ? 0.35 : 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <Eyebrow>the stage wakes up</Eyebrow>
      <SceneTitle className="mt-4">{config.content.suspenseHeading}</SceneTitle>
      <p className="mt-3 max-w-md text-sm text-[#8c4360] sm:text-base">{config.content.suspenseSubtext}</p>

      <div className="relative mt-6 h-[42vh] max-h-[340px] min-h-[260px] w-full max-w-xl">
        {/* the wire */}
        <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="absolute inset-x-0 top-1 h-6 w-full" aria-hidden>
          <path d="M0 3 Q50 12 100 3" fill="none" stroke={PALETTE.gold} strokeWidth="0.8" />
        </svg>

        {lamps.map((lamp) => {
          const isLit = lit.includes(lamp.id)
          return (
            <div key={lamp.id} className="absolute top-0 flex flex-col items-center" style={{ left: `${lamp.left}%` }}>
              {/* cord */}
              <div style={{ height: lamp.drop, width: 1, background: PALETTE.goldDeep, opacity: 0.7 }} />
              <motion.button
                type="button"
                onClick={() => toggle(lamp.id)}
                aria-label={isLit ? 'This lantern is glowing' : 'Light this lantern'}
                aria-pressed={isLit}
                className="relative -mt-1 flex h-12 w-12 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#c2688c]"
                whileTap={{ scale: 0.9 }}
              >
                {isLit && !reduce && (
                  <motion.span
                    className="absolute inset-[-14px] rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(255,214,150,0.55), transparent 68%)' }}
                    animate={{ opacity: [0.55, 0.95, 0.55], scale: [0.9, 1.08, 0.9] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
                <span
                  className="relative h-9 w-7 rounded-full transition-colors duration-500"
                  style={{
                    background: isLit
                      ? 'radial-gradient(circle at 35% 30%, #FFF3D6, #F3B860 60%, #DE8B3B)'
                      : 'rgba(150,110,130,0.18)',
                    boxShadow: isLit ? '0 0 18px 4px rgba(243,184,96,0.55)' : 'inset 0 0 0 1px rgba(150,110,130,0.32)',
                  }}
                />
              </motion.button>
            </div>
          )
        })}
      </div>

      <motion.p
        className="mt-2 text-xs font-medium uppercase tracking-[0.24em] text-[#b98a9f]"
        animate={allLit && !reduce ? { opacity: [0.6, 1, 0.6] } : undefined}
        transition={{ duration: 2.4, repeat: Infinity }}
      >
        {allLit ? 'the theatre is glowing' : `${lamps.length - lit.length} little light${lamps.length - lit.length === 1 ? '' : 's'} to go`}
      </motion.p>

      {allLit && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
          <PrimaryButton onClick={onContinue}>Draw the bunting</PrimaryButton>
        </motion.div>
      )}
    </StageScene>
  )
}
