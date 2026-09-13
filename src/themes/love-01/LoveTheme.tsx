import { AnimatePresence } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSoundEffects } from '../../hooks/useSoundEffects'
import type { ExperienceConfig } from '../../types/experience'
import { ThemeToolbar } from '../shared/ThemeToolbar'
import { defaultLoveConfig } from './defaultData'
import { WhisperScreen } from './screens/Screen1Whisper'
import { CheckScreen } from './screens/Screen2Check'
import { HeartbeatScreen } from './screens/Screen3Heartbeat'
import { MemoriesScreen } from './screens/Screen4Memories'
import { ConstellationScreen } from './screens/Screen5Constellation'

const TOTAL_STEPS = 5

interface LoveThemeProps {
  config?: ExperienceConfig
  onExit: () => void
}

export function LoveTheme({ config, onExit }: LoveThemeProps) {
  const [step, setStep] = useState(1)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const resolvedConfig = useMemo(() => config ?? defaultLoveConfig, [config])

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
      className="relative h-dvh overflow-x-hidden overflow-y-auto bg-gradient-to-b from-[#FFF0F3] via-[#FFE3E8] to-[#FFF5F7]"
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
          <WhisperScreen key="love-whisper" config={resolvedConfig} onBegin={goNext} />
        )}
        {step === 2 && (
          <CheckScreen key="love-check" config={resolvedConfig} onYes={goNext} />
        )}
        {step === 3 && (
          <HeartbeatScreen
            key="love-heartbeat"
            config={resolvedConfig}
            onBeat={sound.playRevealChime}
            onContinue={goNext}
          />
        )}
        {step === 4 && (
          <MemoriesScreen key="love-memories" config={resolvedConfig} onContinue={goNext} />
        )}
        {step === 5 && (
          <ConstellationScreen
            key="love-constellation"
            config={resolvedConfig}
            onReplay={replay}
            onExit={handleExit}
            onTap={sound.playRevealChime}
          />
        )}
      </AnimatePresence>
    </div>
  )
}