import { AnimatePresence, m as motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { fillPlaceholders } from '../../../utils/placeholders'
import { PALETTE } from '../palette'
import { Eyebrow, PrimaryButton, StageScene } from '../components/Stage'
import { Heart, PaperCard } from '../components/Decor'
import { AnimatedText, RecipientName } from '../components/AnimatedText'

interface Act7LetterProps {
  config: ExperienceConfig
  reduce: boolean
  onContinue: () => void
}

export function Act7Letter({ config, reduce, onContinue }: Act7LetterProps) {
  const ctx = { recipient: config.recipient.name, sender: config.sender.name }
  const lines = config.content.letterLines.map((line) => fillPlaceholders(line, ctx))
  const signoff = fillPlaceholders(config.content.letterSignoff, ctx)
  const baseDelay = 0.35
  const [opened, setOpened] = useState(false)
  const [sealCracked, setSealCracked] = useState(false)
  const crackTimer = useRef<number | null>(null)
  const letterVisible = opened || reduce

  useEffect(
    () => () => {
      if (crackTimer.current !== null) window.clearTimeout(crackTimer.current)
    },
    [],
  )

  const openLetter = () => {
    if (sealCracked) return
    setSealCracked(true)
    crackTimer.current = window.setTimeout(() => {
      setOpened(true)
      crackTimer.current = null
    }, 720)
  }

  return (
    <StageScene
      motionPreset="page-fold"
      reduceMotion={reduce}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: reduce ? 0.4 : 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <Eyebrow>with all my heart</Eyebrow>

      <div className="relative mt-7 w-full max-w-lg">
        <AnimatePresence mode="wait">
          {!opened && !reduce ? (
            <motion.button
              key="sealed-envelope"
              type="button"
              onClick={openLetter}
              className="relative mx-auto block h-60 w-full max-w-md overflow-visible rounded-[22px] outline-none focus-visible:ring-2 focus-visible:ring-[#c2688c]"
              initial={{ opacity: 0, y: 35, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 36, scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 150, damping: 18 }}
              whileTap={{ scale: 0.98 }}
              aria-label="Open the sealed letter"
            >
              <span
                className="absolute inset-0 rounded-[22px]"
                style={{
                  background: `linear-gradient(150deg, ${PALETTE.cream} 0%, ${PALETTE.blushDeep} 100%)`,
                  boxShadow: '0 26px 50px -28px rgba(110,36,64,0.6)',
                }}
              />
              <span className="absolute inset-x-0 bottom-0 top-[36%] rounded-b-[22px] bg-gradient-to-br from-[#f6c9db] to-[#d887a8]" />
              <motion.span
                className="absolute inset-x-0 top-0 z-10 h-[62%] origin-top"
                style={{
                  clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                  background: `linear-gradient(180deg, ${PALETTE.satin2}, ${PALETTE.roseDeep})`,
                }}
                animate={{ rotateX: sealCracked ? -168 : 0 }}
                transition={{ duration: 0.72, ease: [0.35, 0, 0.2, 1] }}
              />
              <span className="absolute left-1/2 top-[44%] z-20 -translate-x-1/2 -translate-y-1/2">
                <motion.span
                  className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#f4d8a0] text-2xl text-[#fff6e4]"
                  style={{ background: `radial-gradient(circle at 35% 28%, ${PALETTE.roseMid}, ${PALETTE.satin4})`, boxShadow: '0 5px 15px rgba(110,36,64,0.32)' }}
                  animate={sealCracked ? { scale: [1, 1.22, 0.76], opacity: [1, 0.7, 0] } : { scale: [1, 1.05, 1] }}
                  transition={sealCracked
                    ? { duration: 0.24, ease: 'easeOut' }
                    : { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                >
                  ♥
                </motion.span>
              </span>
              <span className="absolute -bottom-10 left-0 right-0 text-center text-xs font-semibold uppercase tracking-[0.24em] text-[#b98a9f]">
                tap to open
              </span>
              {sealCracked && (
                <motion.span
                  className="absolute left-1/2 top-[44%] z-30 h-px w-9 -rotate-45 bg-white"
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: [0, 1, 0], scaleX: [0, 1.4, 0] }}
                  transition={{ duration: 0.35 }}
                />
              )}
            </motion.button>
          ) : (
            <motion.div
              key="opened-letter"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 88, rotateX: -14, scaleY: 0.86 }}
              animate={{ opacity: 1, y: 0, rotateX: 0, scaleY: 1 }}
              transition={reduce ? { duration: 0.3 } : { type: 'spring', stiffness: 105, damping: 16, mass: 0.9 }}
              style={{ transformPerspective: 1000, transformOrigin: 'top center' }}
            >
              <PaperCard className="w-full px-6 py-8 text-left sm:px-10 sm:py-10">
                <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[26px]">
                  {[0, 1, 2].map((item) => (
                    <motion.span
                      key={item}
                      className="absolute"
                      style={{ left: `${18 + item * 30}%`, top: '74%' }}
                      initial={{ opacity: 0, y: 8, scale: 0.5 }}
                      animate={{ opacity: [0, 0.55, 0], y: -42 - item * 8, scale: [0.5, 1, 0.7] }}
                      transition={{ delay: item * 0.16, duration: 1.6, ease: 'easeOut' }}
                    >
                      <Heart size={14 + item * 2} color={PALETTE.roseMid} />
                    </motion.span>
                  ))}
                </div>
                <div className="relative z-10">
                <p className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-[#b98a9f]">
                  <AnimatedText text={config.content.letterIntro} effect="blur" reduce={reduce} highlightText={config.recipient.name} />
                </p>
                <div className="mt-6 space-y-4">
                  {lines.map((line, i) => (
                    <motion.p
                      key={i}
                      initial={reduce ? { opacity: 1 } : { opacity: 0, y: 9, rotateX: -35 }}
                      animate={{ opacity: 1, y: 0, rotateX: 0 }}
                      transition={{ delay: reduce ? 0 : baseDelay + i * 0.4, duration: 0.55, ease: 'easeOut' }}
                      className="font-display text-[15px] leading-relaxed sm:text-base"
                      style={{ color: PALETTE.berry, transformPerspective: 900, transformOrigin: 'top center' }}
                    >
                      <AnimatedText text={line} effect="typewriter" reduce={reduce} highlightText={config.recipient.name} />
                    </motion.p>
                  ))}
                </div>
                <motion.div
                  initial={reduce ? { opacity: 1 } : { opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: reduce ? 0 : baseDelay + lines.length * 0.4 + 0.25, duration: 0.55 }}
                  className="mt-7 text-right"
                >
                  <p className="font-script text-2xl" style={{ color: PALETTE.roseDeep }}>{signoff}</p>
                  <svg viewBox="0 0 220 34" className="ml-auto mt-1 h-7 w-40" aria-hidden>
                    <motion.path
                      d="M3 24 C38 2 34 30 59 18 S86 6 91 24 C97 32 113 25 124 14 C141 -1 139 31 163 18 S196 8 216 17"
                      fill="none"
                      stroke={PALETTE.roseDeep}
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: reduce ? 0 : baseDelay + lines.length * 0.4 + 0.4, duration: 1.15, ease: 'easeInOut' }}
                    />
                  </svg>
                  <p className="mt-1 text-sm font-semibold" style={{ color: PALETTE.berrySoft }}>
                    <RecipientName text={config.sender.name} reduce={reduce} />
                  </p>
                  <motion.span
                    aria-hidden
                    className="ml-auto mt-2 flex h-8 w-8 items-center justify-center rounded-full border text-sm"
                    style={{ borderColor: PALETTE.gold, background: `radial-gradient(circle at 35% 28%, ${PALETTE.roseMid}, ${PALETTE.satin4})`, color: '#fff6e4' }}
                    initial={{ opacity: 0, scale: 0.4, rotate: -24 }}
                    animate={{ opacity: 1, scale: [0.4, 1.2, 1], rotate: 0 }}
                    transition={{ delay: reduce ? 0 : baseDelay + lines.length * 0.4 + 0.45, duration: 0.65, ease: [0.2, 1.5, 0.3, 1] }}
                  >
                    ♥
                  </motion.span>
                </motion.div>
                </div>
              </PaperCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {letterVisible && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduce ? 0 : 1.4 }}
          className="mt-8"
        >
          <PrimaryButton onClick={onContinue}>Make a wish</PrimaryButton>
        </motion.div>
      )}
    </StageScene>
  )
}
