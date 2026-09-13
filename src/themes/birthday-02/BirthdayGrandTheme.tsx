import { AnimatePresence } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSoundEffects } from '../../hooks/useSoundEffects'
import type { ExperienceConfig } from '../../types/experience'
import { ThemeToolbar } from '../shared/ThemeToolbar'
import { defaultBirthdayGrandConfig } from './defaultData'
import { Screen1Cinematic } from './screens/Screen1Cinematic'
import { Screen2Stages } from './screens/Screen2Stages'
import { Screen3ExtendedLetter } from './screens/Screen3ExtendedLetter'
import { Screen4GrandFinale } from './screens/Screen4GrandFinale'

const TOTAL_STEPS = 4

interface BirthdayGrandThemeProps {
  config?: ExperienceConfig
  onExit: () => void
}

export function BirthdayGrandTheme({
  config,
  onExit,
}: BirthdayGrandThemeProps) {
  const [step, setStep] = useState(1)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const resolvedConfig = useMemo(
    () => config ?? defaultBirthdayGrandConfig,
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

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [step])

  return (
    <div
      ref={scrollRef}
      className="relative h-dvh overflow-x-hidden overflow-y-auto bg-[#0a0c10]"
    >
      <ThemeToolbar
        themeLabel={resolvedConfig.branding.themeLabel}
        step={step}
        totalSteps={TOTAL_STEPS}
        isMuted={sound.isMuted}
        soundEnabled={sound.isEnabled}
        onToggleMute={sound.toggleMute}
        onExit={handleExit}
      />

      <AnimatePresence mode="wait">
        {step === 1 && (
          <Screen1Cinematic key="bg-cinematic" config={resolvedConfig} onBegin={startExperience} />
        )}
        {step === 2 && (
          <Screen2Stages
            key="bg-stages"
            config={resolvedConfig}
            onStage={sound.playRevealChime}
            onContinue={goNext}
          />
        )}
        {step === 3 && (
          <Screen3ExtendedLetter
            key="bg-letter"
            config={resolvedConfig}
            onSeal={sound.playRevealChime}
            onContinue={goNext}
          />
        )}
        {step === 4 && (
          <Screen4GrandFinale
            key="bg-finale"
            config={resolvedConfig}
            onReplay={replay}
            onExit={handleExit}
            onBoom={sound.playRevealChime}
          />
        )}
      </AnimatePresence>
    </div>
  )
}