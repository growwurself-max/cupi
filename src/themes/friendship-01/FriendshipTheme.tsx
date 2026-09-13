import { AnimatePresence } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSoundEffects } from '../../hooks/useSoundEffects'
import type { ExperienceConfig } from '../../types/experience'
import { ThemeToolbar } from '../shared/ThemeToolbar'
import { defaultFriendshipConfig } from './defaultData'
import { BestieAlertScreen } from './screens/Screen1BestieAlert'
import { QuizScreen } from './screens/Screen2Quiz'
import { JokesScreen } from './screens/Screen3Jokes'
import { ChaosReelScreen } from './screens/Screen4ChaosReel'
import { HighFiveScreen } from './screens/Screen5HighFive'

const TOTAL_STEPS = 5

interface FriendshipThemeProps {
  config?: ExperienceConfig
  onExit: () => void
}

export function FriendshipTheme({ config, onExit }: FriendshipThemeProps) {
  const [step, setStep] = useState(1)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const resolvedConfig = useMemo(
    () => config ?? defaultFriendshipConfig,
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
      className="relative h-dvh overflow-x-hidden overflow-y-auto bg-gradient-to-b from-[#FFFBEB] via-[#FFF1F2] to-[#F5F3FF]"
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
          <BestieAlertScreen
            key="friend-alert"
            config={resolvedConfig}
            onBegin={goNext}
          />
        )}
        {step === 2 && (
          <QuizScreen
            key="friend-quiz"
            config={resolvedConfig}
            onPick={sound.playRevealChime}
            onContinue={goNext}
          />
        )}
        {step === 3 && (
          <JokesScreen
            key="friend-jokes"
            config={resolvedConfig}
            onFlip={sound.playRevealChime}
            onContinue={goNext}
          />
        )}
        {step === 4 && (
          <ChaosReelScreen
            key="friend-reel"
            config={resolvedConfig}
            onContinue={goNext}
          />
        )}
        {step === 5 && (
          <HighFiveScreen
            key="friend-five"
            config={resolvedConfig}
            onReplay={replay}
            onExit={handleExit}
            onFive={sound.playRevealChime}
          />
        )}
      </AnimatePresence>
    </div>
  )
}