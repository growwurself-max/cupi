import { AnimatePresence } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSoundEffects } from '../../hooks/useSoundEffects'
import type { ExperienceConfig } from '../../types/experience'
import { ThemeToolbar } from '../shared/ThemeToolbar'
import { defaultAnniversaryConfig } from './defaultData'
import { TeaserScreen } from './screens/Screen1Teaser'
import { UnlockScreen } from './screens/Screen2Unlock'
import { TimelineScreen } from './screens/Screen3Timeline'
import { MemoriesScreen } from './screens/Screen4Memories'
import { CandleScreen } from './screens/Screen5Candle'

const TOTAL_STEPS = 5

interface AnniversaryThemeProps {
  config?: ExperienceConfig
  onExit: () => void
}

export function AnniversaryTheme({ config, onExit }: AnniversaryThemeProps) {
  const [step, setStep] = useState(1)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const resolvedConfig = useMemo(
    () => config ?? defaultAnniversaryConfig,
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
    if (step === 4) {
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
          <TeaserScreen key="anni-teaser" config={resolvedConfig} onBegin={goNext} />
        )}
        {step === 2 && (
          <UnlockScreen
            key="anni-unlock"
            config={resolvedConfig}
            onTurnKey={sound.playRevealChime}
            onContinue={goNext}
          />
        )}
        {step === 3 && (
          <TimelineScreen key="anni-timeline" config={resolvedConfig} onContinue={goNext} />
        )}
        {step === 4 && (
          <MemoriesScreen key="anni-memories" config={resolvedConfig} onContinue={goNext} />
        )}
        {step === 5 && (
          <CandleScreen
            key="anni-candle"
            config={resolvedConfig}
            onReplay={replay}
            onExit={handleExit}
            onBlow={sound.playBlowSound}
          />
        )}
      </AnimatePresence>
    </div>
  )
}