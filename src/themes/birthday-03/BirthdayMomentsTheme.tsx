import { AnimatePresence } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSoundEffects } from '../../hooks/useSoundEffects'
import type { ExperienceConfig } from '../../types/experience'
import { ThemeToolbar } from '../shared/ThemeToolbar'
import { defaultBirthdayMomentsConfig } from './defaultData'
import { Screen1Teaser } from './screens/Screen1Teaser'
import { Screen2MemoryReel } from './screens/Screen2MemoryReel'
import { Screen3Countdown } from './screens/Screen3Countdown'
import { Screen4Reveal } from './screens/Screen4Reveal'
import { Screen5Letter } from './screens/Screen5Letter'
import { Screen6Finale } from './screens/Screen6Finale'

const TOTAL_STEPS = 6

interface BirthdayMomentsThemeProps {
  config?: ExperienceConfig
  onExit: () => void
  isSharedLink?: boolean
}

export function BirthdayMomentsTheme({
  config,
  onExit,
  isSharedLink,
}: BirthdayMomentsThemeProps) {
  const [step, setStep] = useState(1)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const resolvedConfig = useMemo(
    () => config ?? defaultBirthdayMomentsConfig,
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
      className="relative h-dvh overflow-x-hidden overflow-y-auto bg-[#FFF8F6]"
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
          <Screen1Teaser key="moments-teaser" config={resolvedConfig} onBegin={startExperience} />
        )}
        {step === 2 && (
          <Screen2MemoryReel
            key="moments-reel"
            config={resolvedConfig}
            onTilt={sound.playRevealChime}
            onContinue={goNext}
          />
        )}
        {step === 3 && (
          <Screen3Countdown
            key="moments-countdown"
            config={resolvedConfig}
            onTick={sound.playRevealChime}
            onComplete={goNext}
          />
        )}
        {step === 4 && (
          <Screen4Reveal key="moments-reveal" config={resolvedConfig} onContinue={goNext} />
        )}
        {step === 5 && (
          <Screen5Letter key="moments-letter" config={resolvedConfig} onContinue={goNext} />
        )}
        {step === 6 && (
          <Screen6Finale
            key="moments-finale"
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