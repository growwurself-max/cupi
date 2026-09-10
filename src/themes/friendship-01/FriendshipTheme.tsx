import { AnimatePresence } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSoundEffects } from '../../hooks/useSoundEffects'
import type { ExperienceConfig } from '../../types/experience'
import { ThemeToolbar } from '../shared/ThemeToolbar'
import { defaultFriendshipConfig } from './defaultData'
import { TeaserScreen } from './screens/Screen1Teaser'
import { BurstScreen } from './screens/Screen2Burst'
import { PhotoWall } from './screens/Screen3PhotoWall'
import { JokesScreen } from './screens/Screen4Jokes'
import { ForeverScreen } from './screens/Screen5Forever'

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
    if (step === 3 || step === 4) {
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
          <TeaserScreen key="friend-teaser" config={resolvedConfig} onBegin={goNext} />
        )}
        {step === 2 && (
          <BurstScreen
            key="friend-burst"
            config={resolvedConfig}
            onBurst={sound.playRevealChime}
            onContinue={goNext}
          />
        )}
        {step === 3 && (
          <PhotoWall key="friend-photos" config={resolvedConfig} onContinue={goNext} />
        )}
        {step === 4 && (
          <JokesScreen
            key="friend-jokes"
            config={resolvedConfig}
            onFlip={sound.playRevealChime}
            onContinue={goNext}
          />
        )}
        {step === 5 && (
          <ForeverScreen
            key="friend-forever"
            config={resolvedConfig}
            onReplay={replay}
            onExit={handleExit}
          />
        )}
      </AnimatePresence>
    </div>
  )
}