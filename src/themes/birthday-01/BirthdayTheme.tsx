import { AnimatePresence } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSoundEffects } from '../../hooks/useSoundEffects'
import type { ExperienceConfig } from '../../types/experience'
import { defaultBirthdayConfig } from './defaultData'
import { ThemeToolbar } from '../shared/ThemeToolbar'
import { Screen1Teaser } from './screens/Screen1Teaser'
import { Screen2Suspense } from './screens/Screen2Suspense'
import { Screen3Countdown } from './screens/Screen3Countdown'
import { Screen4Reveal } from './screens/Screen4Reveal'
import { Screen4_5Bouquet } from './screens/Screen4_5Bouquet'
import { Screen5LetterMemories } from './screens/Screen5LetterMemories'
import { Screen6WishFinale } from './screens/Screen6WishFinale'

const TOTAL_STEPS = 7

interface BirthdayThemeProps {
  config?: ExperienceConfig
  onExit: () => void
}

export function BirthdayTheme({
  config,
  onExit,
}: BirthdayThemeProps) {
  const [step, setStep] = useState(1)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const resolvedConfig = useMemo(
    () => config ?? defaultBirthdayConfig,
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
          <Screen1Teaser key="screen1" config={resolvedConfig} onBegin={startExperience} />
        )}
        {step === 2 && (
          <Screen2Suspense
            key="screen2"
            config={resolvedConfig}
            soundEnabled={sound.isEnabled}
            onContinue={goNext}
          />
        )}
        {step === 3 && (
          <Screen3Countdown
            key="screen3"
            config={resolvedConfig}
            onTick={sound.playRevealChime}
            onComplete={goNext}
          />
        )}
        {step === 4 && (
          <Screen4Reveal key="screen4" config={resolvedConfig} onContinue={goNext} />
        )}
        {step === 5 && (
          <Screen4_5Bouquet
            key="screen4_5"
            config={resolvedConfig}
            onTagTap={sound.playRevealChime}
            onContinue={goNext}
          />
        )}
        {step === 6 && (
          <Screen5LetterMemories key="screen5" config={resolvedConfig} onContinue={goNext} />
        )}
        {step === 7 && (
          <Screen6WishFinale
            key="screen6"
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