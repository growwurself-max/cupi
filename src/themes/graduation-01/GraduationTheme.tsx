import { AnimatePresence } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSoundEffects } from '../../hooks/useSoundEffects'
import type { ExperienceConfig } from '../../types/experience'
import { ThemeToolbar } from '../shared/ThemeToolbar'
import { defaultGraduationConfig } from './defaultData'
import { CapTossScreen } from './screens/Screen5CapToss'
import { GloryScreen } from './screens/Screen3Glory'
import { GrindMeterScreen } from './screens/Screen2GrindMeter'
import { JourneyScreen } from './screens/Screen4Journey'
import { MilestoneScreen } from './screens/Screen1Milestone'

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
    scrollRef.current?.scrollTo({ top: 0 })
  }, [step])

  return (
    <div
      ref={scrollRef}
      className="relative h-dvh overflow-x-hidden overflow-y-auto bg-gradient-to-b from-[#F8FAFC] via-[#EFF6FF] to-[#FEF9C3]"
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
          <MilestoneScreen key="grad-milestone" config={resolvedConfig} onBegin={goNext} />
        )}
        {step === 2 && (
          <GrindMeterScreen key="grad-grind" config={resolvedConfig} onContinue={goNext} />
        )}
        {step === 3 && (
          <GloryScreen key="grad-glory" config={resolvedConfig} onContinue={goNext} />
        )}
        {step === 4 && (
          <JourneyScreen key="grad-journey" config={resolvedConfig} onContinue={goNext} />
        )}
        {step === 5 && (
          <CapTossScreen
            key="grad-captoss"
            config={resolvedConfig}
            onReplay={replay}
            onExit={handleExit}
            onToss={sound.playRevealChime}
          />
        )}
      </AnimatePresence>
    </div>
  )
}