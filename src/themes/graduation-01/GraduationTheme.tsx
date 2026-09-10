import { AnimatePresence } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSoundEffects } from '../../hooks/useSoundEffects'
import type { ExperienceConfig } from '../../types/experience'
import { Countdown } from '../shared/Countdown'
import { ThemeToolbar } from '../shared/ThemeToolbar'
import { defaultGraduationConfig } from './defaultData'
import { TeaserScreen } from './screens/Screen1Teaser'
import { ReelScreen } from './screens/Screen2Reel'
import { CapTossScreen } from './screens/Screen4CapToss'
import { DiplomaScreen } from './screens/Screen5Diploma'

const TOTAL_STEPS = 5

interface GraduationThemeProps {
  config?: ExperienceConfig
  onExit: () => void
}

export function GraduationTheme({ config, onExit }: GraduationThemeProps) {
  const [step, setStep] = useState(1)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const resolvedConfig = useMemo(
    () => config ?? defaultGraduationConfig,
    [config],
  )

  const sound = useSoundEffects({
    audio: resolvedConfig.audio,
    enabled: resolvedConfig.audio.enabled,
  })

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
    if (step === 3 || step === 4) {
      sound.playRevealChime()
    }
  }, [step, sound])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [step])

  return (
    <div
      ref={scrollRef}
      className="surface-obsidian relative h-dvh overflow-x-hidden overflow-y-auto"
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
          <TeaserScreen key="grad-teaser" config={resolvedConfig} onBegin={goNext} />
        )}
        {step === 2 && (
          <ReelScreen key="grad-reel" config={resolvedConfig} onContinue={goNext} />
        )}
        {step === 3 && (
          <Countdown
            key="grad-countdown"
            tagline={resolvedConfig.content.countdownTagline}
            color={resolvedConfig.branding.accentColor}
            colorSecondary={resolvedConfig.branding.accentSecondary}
            onTick={sound.playRevealChime}
            onComplete={goNext}
          />
        )}
        {step === 4 && (
          <CapTossScreen
            key="grad-captoss"
            config={resolvedConfig}
            onToss={sound.playRevealChime}
            onContinue={goNext}
          />
        )}
        {step === 5 && (
          <DiplomaScreen
            key="grad-diploma"
            config={resolvedConfig}
            onReplay={replay}
            onExit={handleExit}
          />
        )}
      </AnimatePresence>
    </div>
  )
}