import { AnimatePresence } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSoundEffects } from '../../hooks/useSoundEffects'
import type { ExperienceConfig } from '../../types/experience'
import { ThemeToolbar } from '../shared/ThemeToolbar'
import { defaultAnniversaryForeverConfig } from './defaultData'
import { Screen1Chapter } from './screens/Screen1Chapter'
import { Screen2Odometer } from './screens/Screen2Odometer'
import { Screen3Nostalgia } from './screens/Screen3Nostalgia'
import { Screen4Champagne } from './screens/Screen4Champagne'
import { Screen5ForeverLetter } from './screens/Screen5ForeverLetter'

const TOTAL_STEPS = 5

interface AnniversaryForeverThemeProps {
  config?: ExperienceConfig
  onExit: () => void
  isSharedLink?: boolean
}

export function AnniversaryForeverTheme({
  config,
  onExit,
  isSharedLink,
}: AnniversaryForeverThemeProps) {
  const [step, setStep] = useState(1)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const resolvedConfig = useMemo(
    () => config ?? defaultAnniversaryForeverConfig,
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
        variant={isSharedLink ? 'shared' : 'demo'}
      />

      <AnimatePresence mode="wait">
        {step === 1 && (
          <Screen1Chapter key="anni-chapter" config={resolvedConfig} onBegin={startExperience} />
        )}
        {step === 2 && (
          <Screen2Odometer
            key="anni-odometer"
            config={resolvedConfig}
            onRoll={sound.playRevealChime}
            onContinue={goNext}
          />
        )}
        {step === 3 && (
          <Screen3Nostalgia
            key="anni-reel"
            config={resolvedConfig}
            onFlip={sound.playRevealChime}
            onContinue={goNext}
          />
        )}
        {step === 4 && (
          <Screen4Champagne
            key="anni-champagne"
            config={resolvedConfig}
            onClink={sound.playRevealChime}
            onContinue={goNext}
          />
        )}
        {step === 5 && (
          <Screen5ForeverLetter
            key="anni-forever"
            config={resolvedConfig}
            onReplay={replay}
            onExit={handleExit}
          />
        )}
      </AnimatePresence>
    </div>
  )
}