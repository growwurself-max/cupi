import { AnimatePresence } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSoundEffects } from '../../hooks/useSoundEffects'
import { resolveConfigPlaceholders } from '../../utils/placeholders'
import type { ExperienceConfig } from '../../types/experience'
import { ThemeToolbar } from '../shared/ThemeToolbar'
import { defaultGraduationChapterConfig } from './defaultData'
import { Screen1HonorRoll } from './screens/Screen1HonorRoll'
import { Screen2CapToss } from './screens/Screen2CapToss'
import { Screen3GoldenConfetti } from './screens/Screen3GoldenConfetti'
import { Screen4MentorNote } from './screens/Screen4MentorNote'
import { Screen5Finale } from './screens/Screen5Finale'

const TOTAL_STEPS = 5

interface GraduationChapterThemeProps {
  config?: ExperienceConfig
  onExit: () => void
  isSharedLink?: boolean
}

export function GraduationChapterTheme({
  config,
  onExit,
  isSharedLink,
}: GraduationChapterThemeProps) {
  const [step, setStep] = useState(1)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const resolvedConfig = useMemo(
    () => config ?? resolveConfigPlaceholders(defaultGraduationChapterConfig),
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
      className="relative h-dvh overflow-x-hidden overflow-y-auto bg-[#0b0e11]"
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
          <Screen1HonorRoll key="grad-honor" config={resolvedConfig} onBegin={startExperience} />
        )}
        {step === 2 && (
          <Screen2CapToss
            key="grad-captoss"
            config={resolvedConfig}
            onToss={sound.playRevealChime}
            onContinue={goNext}
          />
        )}
        {step === 3 && (
          <Screen3GoldenConfetti
            key="grad-confetti"
            config={resolvedConfig}
            onRain={sound.playRevealChime}
            onContinue={goNext}
          />
        )}
        {step === 4 && (
          <Screen4MentorNote
            key="grad-mentor"
            onRead={sound.playRevealChime}
            onContinue={goNext}
          />
        )}
        {step === 5 && (
          <Screen5Finale
            key="grad-finale"
            config={resolvedConfig}
            onReplay={replay}
            onExit={handleExit}
          />
        )}
      </AnimatePresence>
    </div>
  )
}