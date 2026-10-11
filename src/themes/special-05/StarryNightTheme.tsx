import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m as motion, useReducedMotion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSoundEffects } from '../../hooks/useSoundEffects'
import { resolveConfigPlaceholders } from '../../utils/placeholders'
import { fireContinuousSparkle, fireGrandBurst, fireHeartRain } from '../../utils/confetti'
import type { ExperienceConfig } from '../../types/experience'
import { ThemeToolbar } from '../shared/ThemeToolbar'
import { defaultStarryNightConfig } from './defaultData'
import { CloudLayer } from './components/CloudLayer'
import { CurtainStage } from './components/CurtainStage'
import { SparkleTrail } from './components/SparkleTrail'
import { Act1CurtainOpen } from './screens/Act1CurtainOpen'
import { Act2Balloons } from './screens/Act2Balloons'
import { Act3Lights } from './screens/Act3Lights'
import { Act4Bunting } from './screens/Act4Bunting'
import { Act5Memories } from './screens/Act5Memories'
import { Act6Scratch } from './screens/Act6Scratch'
import { Act7Letter } from './screens/Act7Letter'
import { Act8Wish } from './screens/Act8Wish'
import { Act9Teddy } from './screens/Act9Teddy'
import { Act10Finale } from './screens/Act10Finale'

const TOTAL_STEPS = 10

interface StarryNightThemeProps {
  config?: ExperienceConfig
  onExit: () => void
  isSharedLink?: boolean
}

/**
 * Special #05 — the premium hand-crafted "Birthday Theatre".
 * Ten scenes play out on a warm stage: the satin curtains sweep open, balloons
 * pop, lanterns are lit, bunting is strung, memories and a scratch-off note are
 * uncovered, a letter is read, a wish is blown out and teddy bears swing before
 * the confetti finale.
 */
export function StarryNightTheme({
  config,
  onExit,
  isSharedLink,
}: StarryNightThemeProps) {
  const [step, setStep] = useState(1)
  const [curtainsOpen, setCurtainsOpen] = useState(false)
  const [introRevealed, setIntroRevealed] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [pageHidden, setPageHidden] = useState(false)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const advanceTimer = useRef<number | null>(null)
  const curtainAutoTimer = useRef<number | null>(null)
  const pendingStepRef = useRef<number | null>(null)
  const transitionLockRef = useRef(false)
  const swipeStart = useRef<{ x: number; time: number } | null>(null)
  const startedRef = useRef(false)
  const prefersReducedMotion = useReducedMotion()
  const reduce = !!prefersReducedMotion

  const resolvedConfig = useMemo(
    () => config ?? resolveConfigPlaceholders(defaultStarryNightConfig),
    [config],
  )

  const sound = useSoundEffects({
    audio: resolvedConfig.audio,
    enabled: resolvedConfig.audio.enabled,
  })

  const soundOn = !sound.isMuted
  const playIfOn = useCallback((fn: () => void) => {
    if (soundOn) fn()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soundOn])

  const isDemoPreview = !isSharedLink

  const clearAdvance = useCallback(() => {
    if (advanceTimer.current !== null) {
      window.clearTimeout(advanceTimer.current)
      advanceTimer.current = null
    }
  }, [])

  const requestStep = useCallback((requestedStep: number) => {
    const target = Math.max(1, Math.min(requestedStep, TOTAL_STEPS))
    clearAdvance()
    if (target === step || transitionLockRef.current) return
    if (!reduce && [4, 7, TOTAL_STEPS].includes(target)) {
      transitionLockRef.current = true
      setIsTransitioning(true)
      pendingStepRef.current = target
      setCurtainsOpen(false)
      return
    }
    setStep(target)
  }, [clearAdvance, reduce, step])
  const handleCurtainComplete = useCallback((open: boolean) => {
    if (open && step === 1) setIntroRevealed(true)
    if (!open && pendingStepRef.current !== null) {
      const nextStep = pendingStepRef.current
      pendingStepRef.current = null
      setStep(nextStep)
      setCurtainsOpen(true)
      return
    }
    if (open && transitionLockRef.current) {
      transitionLockRef.current = false
      setIsTransitioning(false)
    }
  }, [step])

  const replay = useCallback(() => {
    clearAdvance()
    transitionLockRef.current = false
    setIsTransitioning(false)
    pendingStepRef.current = null
    setIntroRevealed(false)
    setCurtainsOpen(false)
    sound.resume()
    setStep(1)
  }, [clearAdvance, sound])

  const handleExit = useCallback(() => {
    clearAdvance()
    sound.resume()
    onExit()
  }, [clearAdvance, onExit, sound])

  const handleOpenCurtains = useCallback(() => {
    if (curtainsOpen) return
    setCurtainsOpen(true)
    playIfOn(sound.playRevealChime)
  }, [curtainsOpen, playIfOn, sound.playRevealChime])

  const goNext = useCallback(() => {
    if (step === 1 && !introRevealed) {
      if (!curtainsOpen) handleOpenCurtains()
      return
    }
    requestStep(step + 1)
  }, [curtainsOpen, handleOpenCurtains, introRevealed, requestStep, step])
  const goBack = useCallback(() => requestStep(step - 1), [requestStep, step])
  const jumpToStep = useCallback((target: number) => requestStep(target), [requestStep])

  useEffect(() => {
    if (step !== 1 || reduce) return
    if (!curtainsOpen) {
      curtainAutoTimer.current = window.setTimeout(() => handleOpenCurtains(), 4200)
    }
    return () => {
      if (curtainAutoTimer.current !== null) {
        window.clearTimeout(curtainAutoTimer.current)
        curtainAutoTimer.current = null
      }
    }
  }, [curtainsOpen, handleOpenCurtains, reduce, step])

  // Keep the very first render silent: sound is off until the guest unmutes.
  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    if (resolvedConfig.audio.enabled) sound.toggleMute()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Pause the decorative layers while the tab is hidden.
  useEffect(() => {
    const onVisibility = () => setPageHidden(document.hidden)
    onVisibility()
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [step])

  useEffect(() => () => clearAdvance(), [clearAdvance])

  const sceneTransitionSound = useCallback(() => {
    playIfOn(sound.playRevealChime)
  }, [playIfOn, sound.playRevealChime])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') goNext()
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') goBack()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [goNext, goBack])

  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation}>
        <div
          ref={scrollRef}
          className="relative isolate h-dvh overflow-x-hidden overflow-y-auto"
          style={{ background: '#fbe6ee', color: '#6E2440' }}
          onPointerDown={(event) => {
            if (event.pointerType !== 'touch') return
            if (event.target instanceof Element && event.target.closest('button, canvas, a, [role="button"]')) return
            swipeStart.current = { x: event.clientX, time: event.timeStamp }
          }}
          onPointerUp={(event) => {
            const start = swipeStart.current
            swipeStart.current = null
            if (!start) return
            const delta = event.clientX - start.x
            const elapsed = Math.max(1, event.timeStamp - start.time)
            if (Math.abs(delta) > 76 || (Math.abs(delta) > 34 && Math.abs(delta / elapsed) > 0.55)) {
              if (delta < 0) goNext()
              else goBack()
            }
          }}
          onPointerCancel={() => {
            swipeStart.current = null
          }}
        >
      {/* Warm stage wash */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `
            radial-gradient(120% 80% at 50% 30%, rgba(255,247,236,0.98) 0%, rgba(253,236,240,0.9) 40%, rgba(247,214,227,0.85) 68%, rgba(233,182,203,0.9) 100%),
            linear-gradient(180deg, #fbe6ee 0%, #f7d6e3 100%)
          `,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed left-1/2 top-[42%] z-0 h-[52vh] w-[52vh] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(255,252,244,0.85) 0%, rgba(255,240,224,0.35) 55%, transparent 76%)',
        }}
      />

      {!pageHidden && <CloudLayer reduce={reduce} />}

      <ThemeToolbar
        themeLabel={resolvedConfig.branding.themeLabel}
        step={step}
        totalSteps={TOTAL_STEPS}
        isMuted={sound.isMuted}
        soundEnabled={sound.isEnabled}
        onToggleMute={sound.toggleMute}
        onExit={handleExit}
        variant={isSharedLink ? 'shared' : 'demo'}
        onJumpToStep={isDemoPreview ? jumpToStep : undefined}
      />

      <div
        className="fixed left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/70 bg-white/75 px-3 py-2 shadow-lg backdrop-blur-md"
        style={{ bottom: 'calc(0.8rem + env(safe-area-inset-bottom))' }}
        aria-label="Slide navigation"
      >
        <motion.button
          type="button"
          onClick={goBack}
          disabled={step === 1 || isTransitioning}
          aria-label="Previous slide"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-rose-200 bg-white/80 text-lg text-[#6E2440] transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.06 }}
        >
          ‹
        </motion.button>
        <div className="flex min-w-[4.5rem] flex-col items-center gap-1" role="status" aria-label={`Slide ${step} of ${TOTAL_STEPS}`}>
          <span className="text-[10px] font-semibold tracking-[0.16em] text-[#8c4360]">{step} / {TOTAL_STEPS}</span>
          <span className="h-1 w-14 overflow-hidden rounded-full bg-rose-100">
            <span className="block h-full rounded-full bg-[#c2688c] transition-[width] duration-500" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
          </span>
        </div>
        <motion.button
          type="button"
          onClick={goNext}
          disabled={step === TOTAL_STEPS || isTransitioning}
          aria-label="Next slide"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-rose-200 bg-white/80 text-lg text-[#6E2440] transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.06 }}
        >
          ›
        </motion.button>
      </div>

      <CurtainStage
        open={curtainsOpen || reduce}
        reduce={reduce}
        interactive={step === 1 && !reduce}
        onOpen={handleOpenCurtains}
        onTransitionComplete={handleCurtainComplete}
      />
      <SparkleTrail reduce={reduce || pageHidden} />

      <AnimatePresence mode="sync">
        {step === 1 && (introRevealed || reduce) && (
          <Act1CurtainOpen key="scene-1" config={resolvedConfig} reduce={reduce} />
        )}

        {step === 2 && (
          <Act2Balloons
            key="act-2-balloons"
            config={resolvedConfig}
            reduce={reduce}
            onPop={() => playIfOn(sound.playPop)}
            onContinue={() => {
              sceneTransitionSound()
              goNext()
            }}
          />
        )}

        {step === 3 && (
          <Act3Lights
            key="act3-lights"
            config={resolvedConfig}
            reduce={reduce}
            onLight={() => playIfOn(sound.playSoftClick)}
            onContinue={() => {
              sceneTransitionSound()
              goNext()
            }}
          />
        )}

        {step === 4 && (
          <Act4Bunting
            key="act4-bunting"
            config={resolvedConfig}
            reduce={reduce}
            onCheer={() => {
              if (!pageHidden && !reduce) fireContinuousSparkle(1000)
              playIfOn(sound.playBurstShimmer)
            }}
            onContinue={() => {
              sceneTransitionSound()
              goNext()
            }}
          />
        )}

        {step === 5 && (
          <Act5Memories
            key="act5-memories"
            config={resolvedConfig}
            reduce={reduce}
            onContinue={() => {
              sceneTransitionSound()
              goNext()
            }}
          />
        )}

        {step === 6 && (
          <Act6Scratch
            key="act6-scratch"
            config={resolvedConfig}
            reduce={reduce}
            onScratch={() => playIfOn(sound.playBurstShimmer)}
            onContinue={() => {
              sceneTransitionSound()
              goNext()
            }}
          />
        )}

        {step === 7 && (
          <Act7Letter
            key="act7-letter"
            config={resolvedConfig}
            reduce={reduce}
            onContinue={() => {
              sceneTransitionSound()
              goNext()
            }}
          />
        )}

        {step === 8 && (
          <Act8Wish
            key="act8-wish"
            config={resolvedConfig}
            reduce={reduce}
            onBlow={() => playIfOn(sound.playBlowSound)}
            onContinue={() => {
              sceneTransitionSound()
              goNext()
            }}
          />
        )}

        {step === 9 && (
          <Act9Teddy
            key="act9-teddy"
            config={resolvedConfig}
            reduce={reduce}
            onPush={() => playIfOn(sound.playBowTwang)}
            onContinue={() => {
              sceneTransitionSound()
              goNext()
            }}
          />
        )}

        {step === TOTAL_STEPS && (
          <Act10Finale
            key="act10-finale"
            config={resolvedConfig}
            reduce={reduce}
            onCelebrate={() => {
              if (pageHidden || reduce) return
              fireGrandBurst()
              fireHeartRain(1800)
              playIfOn(sound.playAmbientPad)
            }}
            onReplay={replay}
            onExit={handleExit}
          />
        )}
      </AnimatePresence>
        </div>
      </LazyMotion>
    </MotionConfig>
  )
}
