import { AnimatePresence, useReducedMotion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSoundEffects } from '../../hooks/useSoundEffects'
import { resolveConfigPlaceholders } from '../../utils/placeholders'
import { fireContinuousSparkle, fireGrandBurst, fireHeartRain } from '../../utils/confetti'
import type { ExperienceConfig } from '../../types/experience'
import { ThemeToolbar } from '../shared/ThemeToolbar'
import { defaultStarryNightConfig } from './defaultData'
import { CloudLayer } from './components/CloudLayer'
import { CurtainStage } from './components/CurtainStage'
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
  const [pageHidden, setPageHidden] = useState(false)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const advanceTimer = useRef<number | null>(null)
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

  const goNext = useCallback(() => setStep((prev) => Math.min(prev + 1, TOTAL_STEPS)), [])
  const goBack = useCallback(() => setStep((prev) => Math.max(prev - 1, 1)), [])
  const jumpToStep = useCallback((target: number) => {
    clearAdvance()
    setStep(Math.max(1, Math.min(target, TOTAL_STEPS)))
  }, [clearAdvance])

  const replay = useCallback(() => {
    clearAdvance()
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
    const delay = reduce ? 400 : 1500
    advanceTimer.current = window.setTimeout(() => goNext(), delay)
  }, [curtainsOpen, goNext, playIfOn, reduce, sound.playRevealChime])

  // Curtain choreography: closed on scene 1, open on scenes 2–9, and a
  // close-then-open curtain call that frames the finale.
  useEffect(() => {
    clearAdvance()
    if (step === 1) {
      setCurtainsOpen(false)
      return
    }
    if (step === TOTAL_STEPS) {
      setCurtainsOpen(false)
      const t = window.setTimeout(() => setCurtainsOpen(true), reduce ? 250 : 750)
      return () => window.clearTimeout(t)
    }
    setCurtainsOpen(true)
  }, [step, reduce, clearAdvance])

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

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext()
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goBack()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [goNext, goBack])

  const sceneTransitionSound = useCallback(() => {
    playIfOn(sound.playRevealChime)
  }, [playIfOn, sound.playRevealChime])

  return (
    <div
      ref={scrollRef}
      className="relative isolate h-dvh overflow-x-hidden overflow-y-auto"
      style={{ background: '#fbe6ee', color: '#6E2440' }}
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

      <CurtainStage
        open={curtainsOpen}
        reduce={reduce}
        interactive={step === 1}
        onOpen={handleOpenCurtains}
      />

      <AnimatePresence mode="wait">
        {step === 1 && (
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
              if (!pageHidden) fireContinuousSparkle(1000)
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
  )
}
