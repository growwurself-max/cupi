import { AnimatePresence } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSoundEffects } from '../../hooks/useSoundEffects'
import type { ExperienceConfig } from '../../types/experience'
import { ThemeToolbar } from '../shared/ThemeToolbar'
import { defaultLoveEternalConfig } from './defaultData'
import { Screen1RomanticScore } from './screens/Screen1RomanticScore'
import { Screen2Constellation } from './screens/Screen2Constellation'
import { Screen3WaxSeal } from './screens/Screen3WaxSeal'
import { Screen4Confession } from './screens/Screen4Confession'
import { Screen5Eternal } from './screens/Screen5Eternal'

const TOTAL_STEPS = 5

interface LoveEternalThemeProps {
  config?: ExperienceConfig
  onExit: () => void
}

export function LoveEternalTheme({ config, onExit }: LoveEternalThemeProps) {
  const [step, setStep] = useState(1)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const resolvedConfig = useMemo(() => config ?? defaultLoveEternalConfig, [config])

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
          <Screen1RomanticScore key="love-score" config={resolvedConfig} onBegin={startExperience} />
        )}
        {step === 2 && (
          <Screen2Constellation
            key="love-constellation"
            config={resolvedConfig}
            onStar={sound.playRevealChime}
            onContinue={goNext}
          />
        )}
        {step === 3 && (
          <Screen3WaxSeal
            key="love-seal"
            config={resolvedConfig}
            onOpen={sound.playRevealChime}
            onContinue={goNext}
          />
        )}
        {step === 4 && (
          <Screen4Confession key="love-confession" config={resolvedConfig} onContinue={goNext} />
        )}
        {step === 5 && (
          <Screen5Eternal
            key="love-eternal"
            config={resolvedConfig}
            onReplay={replay}
            onExit={handleExit}
            onBeat={sound.playRevealChime}
          />
        )}
      </AnimatePresence>
    </div>
  )
}