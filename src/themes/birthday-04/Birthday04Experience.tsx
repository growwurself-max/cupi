import { AnimatePresence } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSoundEffects } from '../../hooks/useSoundEffects'
import { resolveConfigPlaceholders } from '../../utils/placeholders'
import type { ExperienceConfig } from '../../types/experience'
import { ThemeToolbar } from '../shared/ThemeToolbar'
import { defaultBirthdayTeddyConfig } from './defaultData'
import { Screen1ShyTeddy } from './screens/Screen1ShyTeddy'
import { Screen2TeddyExcitement } from './screens/Screen2TeddyExcitement'
import { Screen3TeddyCountdown } from './screens/Screen3TeddyCountdown'
import { Screen4TeddyReveal } from './screens/Screen4TeddyReveal'
import { Screen5TeddyLetter } from './screens/Screen5TeddyLetter'
import { Screen6TeddyCake } from './screens/Screen6TeddyCake'

const TOTAL_STEPS = 6

interface Birthday04ExperienceProps {
  config?: ExperienceConfig
  onExit: () => void
  isSharedLink?: boolean
}

export function Birthday04Experience({
  config,
  onExit,
  isSharedLink,
}: Birthday04ExperienceProps) {
  const [step, setStep] = useState(1)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const resolvedConfig = useMemo(
    () => config ?? resolveConfigPlaceholders(defaultBirthdayTeddyConfig),
    [config],
  )

  const sound = useSoundEffects({
    audio: resolvedConfig.audio,
    enabled: resolvedConfig.audio.enabled,
  })

  const startExperience = useCallback(() => {
    sound.resume()
    sound.playAmbientPad()
    setStep(2)
  }, [sound])

  const goNext = useCallback(() => {
    setStep((prev) => Math.min(prev + 1, TOTAL_STEPS))
  }, [])

  const replay = useCallback(() => {
    sound.resume()
    sound.playAmbientPad()
    setStep(1)
  }, [sound])

  const handleExit = useCallback(() => {
    sound.resume()
    onExit()
  }, [onExit, sound])

  const handleBlow = useCallback(() => {
    sound.playBlowSound()
  }, [sound])

  useEffect(() => {
    if (step === 4) {
      sound.playRevealChime()
    }
  }, [step, sound])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [step])

  return (
    <div
      ref={scrollRef}
      className="relative h-dvh overflow-x-hidden overflow-y-auto bg-[#FFF0F3]"
    >
      <ThemeToolbar
        themeLabel={resolvedConfig.branding.themeLabel}
        step={step}
        totalSteps={TOTAL_STEPS}
        isMuted={sound.isMuted}
        soundEnabled={sound.isEnabled}
        onToggleMute={sound.toggleMute}
        onExit={handleExit}
        variant={isSharedLink ? 'shared' : 'demo'}
      />

      <AnimatePresence mode="wait">
        {step === 1 && (
          <Screen1ShyTeddy
            key="teddy-shy"
            config={resolvedConfig}
            onBegin={startExperience}
          />
        )}
        {step === 2 && (
          <Screen2TeddyExcitement
            key="teddy-excitement"
            config={resolvedConfig}
            onYes={goNext}
          />
        )}
        {step === 3 && (
          <Screen3TeddyCountdown
            key="teddy-countdown"
            config={resolvedConfig}
            onTick={sound.playRevealChime}
            onComplete={goNext}
          />
        )}
        {step === 4 && (
          <Screen4TeddyReveal
            key="teddy-reveal"
            config={resolvedConfig}
            onContinue={goNext}
          />
        )}
        {step === 5 && (
          <Screen5TeddyLetter
            key="teddy-letter"
            config={resolvedConfig}
            onContinue={goNext}
          />
        )}
        {step === 6 && (
          <Screen6TeddyCake
            key="teddy-cake"
            config={resolvedConfig}
            onReplay={replay}
            onExit={handleExit}
            onBlow={handleBlow}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
