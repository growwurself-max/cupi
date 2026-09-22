import { AnimatePresence } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSoundEffects } from '../../hooks/useSoundEffects'
import type { ExperienceConfig } from '../../types/experience'
import { ThemeToolbar } from '../shared/ThemeToolbar'
import { defaultLoveConfig } from './defaultData'
import { Act1Envelope } from './acts/Act1Envelope'
import { Act2Letter } from './acts/Act2Letter'
import { Act3Seal } from './acts/Act3Seal'
import { Act4Closing } from './acts/Act4Closing'

const TOTAL_STEPS = 4

interface LoveThemeProps {
  config?: ExperienceConfig
  onExit: () => void
  isSharedLink?: boolean
}

export function LoveTheme({ config, onExit, isSharedLink }: LoveThemeProps) {
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
      className="relative h-dvh overflow-x-hidden overflow-y-auto bg-cream-50"
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
          <Act1Envelope
            key="lv-envelope"
            config={resolvedConfig}
            onReveal={sound.playRevealChime}
            onContinue={goNext}
          />
        )}
        {step === 2 && (
          <Act2Letter
            key="lv-letter"
            config={resolvedConfig}
            onContinue={goNext}
          />
        )}
        {step === 3 && (
          <Act3Seal
            key="lv-seal"
            config={resolvedConfig}
            onKiss={sound.playRevealChime}
            onContinue={goNext}
          />
        )}
        {step === 4 && (
          <Act4Closing
            key="lv-closing"
            config={resolvedConfig}
            onReplay={replay}
            onExit={handleExit}
          />
        )}
      </AnimatePresence>
    </div>
  )
}