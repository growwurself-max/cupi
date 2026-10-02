import { AnimatePresence } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSoundEffects } from '../../hooks/useSoundEffects'
import { resolveConfigPlaceholders } from '../../utils/placeholders'
import type { ExperienceConfig } from '../../types/experience'
import { ThemeToolbar } from '../shared/ThemeToolbar'
import { defaultParentMomConfig } from './defaultData'
import { Screen1Intro } from './screens/Screen1Intro'
import { Screen2Hero } from './screens/Screen2Hero'
import { Screen3QueenPresentation } from './screens/Screen3QueenPresentation'
import { Screen4BecauseOfYou } from './screens/Screen4BecauseOfYou'
import { Screen5Letter } from './screens/Screen5Letter'
import { Screen6Memories } from './screens/Screen6Memories'
import { Screen7ThingsILove } from './screens/Screen7ThingsILove'
import { Screen8Celebration } from './screens/Screen8Celebration'
import { Screen9Final } from './screens/Screen9Final'

const TOTAL_STEPS = 9

interface ParentMomThemeProps {
  config?: ExperienceConfig
  onExit: () => void
  isSharedLink?: boolean
}

export function ParentMomTheme({
  config,
  onExit,
  isSharedLink,
}: ParentMomThemeProps) {
  const [step, setStep] = useState(1)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const resolvedConfig = useMemo(
    () => config ?? resolveConfigPlaceholders(defaultParentMomConfig),
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
      className="relative h-dvh overflow-x-hidden overflow-y-auto bg-gradient-to-b from-[#fff0f3] via-[#fbd5e3] to-[#e3d9ff]"
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
          <Screen1Intro key="screen1" config={resolvedConfig} onBegin={startExperience} />
        )}
        {step === 2 && (
          <Screen2Hero key="screen2" config={resolvedConfig} onContinue={goNext} />
        )}
        {step === 3 && (
          <Screen3QueenPresentation key="screen3" config={resolvedConfig} onContinue={goNext} />
        )}
        {step === 4 && (
          <Screen4BecauseOfYou key="screen4" config={resolvedConfig} onContinue={goNext} />
        )}
        {step === 5 && (
          <Screen5Letter key="screen5" config={resolvedConfig} onContinue={goNext} />
        )}
        {step === 6 && (
          <Screen6Memories key="screen6" config={resolvedConfig} onContinue={goNext} />
        )}
        {step === 7 && (
          <Screen7ThingsILove key="screen7" config={resolvedConfig} onContinue={goNext} />
        )}
        {step === 8 && (
          <Screen8Celebration key="screen8" config={resolvedConfig} onContinue={goNext} />
        )}
        {step === 9 && (
          <Screen9Final key="screen9" config={resolvedConfig} onExit={handleExit} />
        )}
      </AnimatePresence>
    </div>
  )
}
