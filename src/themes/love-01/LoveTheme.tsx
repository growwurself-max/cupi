import { AnimatePresence } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSoundEffects } from '../../hooks/useSoundEffects'
import type { ExperienceConfig } from '../../types/experience'
import { Countdown } from '../shared/Countdown'
import { ThemeToolbar } from '../shared/ThemeToolbar'
import { defaultLoveConfig } from './defaultData'
import { TeaserScreen } from './screens/Screen1Teaser'
import { SealScreen } from './screens/Screen2Seal'
import { RevealScreen } from './screens/Screen4Reveal'
import { LetterScreen } from './screens/Screen5Letter'
import { FinaleScreen } from './screens/Screen6Finale'

const TOTAL_STEPS = 6

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
          <TeaserScreen key="love-teaser" config={resolvedConfig} onBegin={goNext} />
        )}
        {step === 2 && (
          <SealScreen
            key="love-seal"
            config={resolvedConfig}
            onBreak={sound.playRevealChime}
            onContinue={goNext}
          />
        )}
        {step === 3 && (
          <Countdown
            key="love-countdown"
            tagline={resolvedConfig.content.countdownTagline}
            color={resolvedConfig.branding.accentColor}
            colorSecondary={resolvedConfig.branding.accentSecondary}
            onTick={sound.playRevealChime}
            onComplete={goNext}
          />
        )}
        {step === 4 && (
          <RevealScreen key="love-reveal" config={resolvedConfig} onContinue={goNext} />
        )}
        {step === 5 && (
          <LetterScreen key="love-letter" config={resolvedConfig} onContinue={goNext} />
        )}
        {step === 6 && (
          <FinaleScreen
            key="love-finale"
            config={resolvedConfig}
            onReplay={replay}
            onExit={handleExit}
            onTap={sound.playBlowSound}
          />
        )}
      </AnimatePresence>
    </div>
  )
}