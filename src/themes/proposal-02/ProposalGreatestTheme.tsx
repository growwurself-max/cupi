import { AnimatePresence } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSoundEffects } from '../../hooks/useSoundEffects'
import { resolveConfigPlaceholders } from '../../utils/placeholders'
import type { ExperienceConfig } from '../../types/experience'
import { ThemeToolbar } from '../shared/ThemeToolbar'
import { defaultProposalGreatestConfig } from './defaultData'
import { Screen1Cinematic } from './screens/Screen1Cinematic'
import { Screen2Spotlight } from './screens/Screen2Spotlight'
import { Screen3Promise } from './screens/Screen3Promise'
import { Screen4GoldenFireworks } from './screens/Screen4GoldenFireworks'

const TOTAL_STEPS = 4

interface ProposalGreatestThemeProps {
  config?: ExperienceConfig
  onExit: () => void
  isSharedLink?: boolean
}

export function ProposalGreatestTheme({
  config,
  onExit,
  isSharedLink,
}: ProposalGreatestThemeProps) {
  const [step, setStep] = useState(1)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const resolvedConfig = useMemo(
    () => config ?? resolveConfigPlaceholders(defaultProposalGreatestConfig),
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
          <Screen1Cinematic key="prop-cinematic" config={resolvedConfig} onBegin={startExperience} />
        )}
        {step === 2 && (
          <Screen2Spotlight
            key="prop-spotlight"
            config={resolvedConfig}
            onOpen={sound.playRevealChime}
            onContinue={goNext}
          />
        )}
        {step === 3 && (
          <Screen3Promise
            key="prop-promise"
            config={resolvedConfig}
            onVow={sound.playRevealChime}
            onContinue={goNext}
          />
        )}
        {step === 4 && (
          <Screen4GoldenFireworks
            key="prop-fireworks"
            config={resolvedConfig}
            onYes={sound.playRevealChime}
            onReplay={replay}
            onExit={handleExit}
          />
        )}
      </AnimatePresence>
    </div>
  )
}