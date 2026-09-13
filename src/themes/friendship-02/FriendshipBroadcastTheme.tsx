import { AnimatePresence } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSoundEffects } from '../../hooks/useSoundEffects'
import type { ExperienceConfig } from '../../types/experience'
import { ThemeToolbar } from '../shared/ThemeToolbar'
import { defaultFriendshipBroadcastConfig } from './defaultData'
import { Screen1Broadcast } from './screens/Screen1Broadcast'
import { Screen2Stickers } from './screens/Screen2Stickers'
import { Screen3HighFive } from './screens/Screen3HighFive'
import { Screen4ChaosReel } from './screens/Screen4ChaosReel'
import { Screen5BestieLetter } from './screens/Screen5BestieLetter'

const TOTAL_STEPS = 5

interface FriendshipBroadcastThemeProps {
  config?: ExperienceConfig
  onExit: () => void
}

export function FriendshipBroadcastTheme({
  config,
  onExit,
}: FriendshipBroadcastThemeProps) {
  const [step, setStep] = useState(1)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const resolvedConfig = useMemo(
    () => config ?? defaultFriendshipBroadcastConfig,
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
      className="relative h-dvh overflow-x-hidden overflow-y-auto bg-[#120d0b]"
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
          <Screen1Broadcast key="bff-broadcast" config={resolvedConfig} onBegin={startExperience} />
        )}
        {step === 2 && (
          <Screen2Stickers
            key="bff-stickers"
            config={resolvedConfig}
            onSplat={sound.playRevealChime}
            onContinue={goNext}
          />
        )}
        {step === 3 && (
          <Screen3HighFive
            key="bff-highfive"
            onFive={sound.playRevealChime}
            onContinue={goNext}
          />
        )}
        {step === 4 && (
          <Screen4ChaosReel
            key="bff-chaos"
            config={resolvedConfig}
            onMash={sound.playRevealChime}
            onContinue={goNext}
          />
        )}
        {step === 5 && (
          <Screen5BestieLetter
            key="bff-letter"
            config={resolvedConfig}
            onReplay={replay}
            onExit={handleExit}
          />
        )}
      </AnimatePresence>
    </div>
  )
}