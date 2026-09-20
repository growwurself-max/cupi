import { AnimatePresence } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSoundEffects } from '../../hooks/useSoundEffects'
import type { ExperienceConfig } from '../../types/experience'
import { ThemeToolbar } from '../shared/ThemeToolbar'
import { defaultSpecialStorybookConfig } from './defaultData'
import { Act1Intro } from './screens/Act1Intro'
import { Act2Balloons } from './screens/Act2Balloons'
import { Act3CandleRose } from './screens/Act3CandleRose'
import { Act4Polaroids } from './screens/Act4Polaroids'
import { Act5Letter } from './screens/Act5Letter'
import { Act6Gift } from './screens/Act6Gift'

const TOTAL_STEPS = 6

interface SpecialThemeProps {
  config?: ExperienceConfig
  onExit: () => void
  isSharedLink?: boolean
}

export function SpecialStorybookTheme({
  config,
  onExit,
  isSharedLink,
}: SpecialThemeProps) {
  const [step, setStep] = useState(1)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const resolvedConfig = useMemo(
    () => config ?? defaultSpecialStorybookConfig,
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
      style={{ color: '#3f3a37' }}
      className="demo-scope relative h-dvh overflow-x-hidden overflow-y-auto bg-[#FDFBF7]"
    >
      <ThemeToolbar
        themeLabel={resolvedConfig.branding.themeLabel || 'Storybook'}
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
          <Act1Intro
            key="sb1"
            config={resolvedConfig}
            onYes={() => {
              sound.playRevealChime()
              goNext()
            }}
          />
        )}
        {step === 2 && (
          <Act2Balloons
            key="sb2"
            config={resolvedConfig}
            onPop={sound.playPop}
            onComplete={() => {
              sound.playRevealChime()
              goNext()
            }}
          />
        )}
        {step === 3 && (
          <Act3CandleRose
            key="sb3"
            config={resolvedConfig}
            onBlow={sound.playBlowSound}
            onComplete={goNext}
          />
        )}
        {step === 4 && (
          <Act4Polaroids key="sb4" config={resolvedConfig} onContinue={goNext} />
        )}
        {step === 5 && (
          <Act5Letter
            key="sb5"
            config={resolvedConfig}
            onOpen={sound.playBurstShimmer}
            onContinue={goNext}
          />
        )}
        {step === 6 && (
          <Act6Gift
            key="sb6"
            config={resolvedConfig}
            onReplay={replay}
            onExit={handleExit}
            isMuted={sound.isMuted}
            onToggleMute={sound.toggleMute}
            onCelebrate={sound.playBurstShimmer}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
