import { AnimatePresence } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSoundEffects } from '../../hooks/useSoundEffects'
import type { ExperienceConfig } from '../../types/experience'
import { Countdown } from '../shared/Countdown'
import { ThemeToolbar } from '../shared/ThemeToolbar'
import { defaultProposalConfig } from './defaultData'
import { TeaserScreen } from './screens/Screen1Teaser'
import { HeartbeatScreen } from './screens/Screen2Heartbeat'
import { RingBoxScreen } from './screens/Screen4RingBox'
import { QuestionScreen } from './screens/Screen5Question'
import { YesScreen } from './screens/Screen6Yes'

const TOTAL_STEPS = 6

interface ProposalThemeProps {
  config?: ExperienceConfig
  onExit: () => void
}

export function ProposalTheme({ config, onExit }: ProposalThemeProps) {
  const [step, setStep] = useState(1)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const resolvedConfig = useMemo(() => config ?? defaultProposalConfig, [config])

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

  const handleYes = useCallback(() => {
    sound.playRevealChime()
    goNext()
  }, [goNext, sound])

  useEffect(() => {
    if (step === 4 || step === 5) {
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
          <TeaserScreen key="prop-teaser" config={resolvedConfig} onBegin={goNext} />
        )}
        {step === 2 && (
          <HeartbeatScreen
            key="prop-heartbeat"
            config={resolvedConfig}
            onBeat={sound.playRevealChime}
            onContinue={goNext}
          />
        )}
        {step === 3 && (
          <Countdown
            key="prop-countdown"
            tagline={resolvedConfig.content.countdownTagline}
            color={resolvedConfig.branding.accentColor}
            colorSecondary={resolvedConfig.branding.accentSecondary}
            onTick={sound.playRevealChime}
            onComplete={goNext}
          />
        )}
        {step === 4 && (
          <RingBoxScreen
            key="prop-ring-box"
            config={resolvedConfig}
            onOpen={sound.playRevealChime}
            onContinue={goNext}
          />
        )}
        {step === 5 && (
          <QuestionScreen key="prop-question" config={resolvedConfig} onYes={handleYes} />
        )}
        {step === 6 && (
          <YesScreen
            key="prop-yes"
            config={resolvedConfig}
            onReplay={replay}
            onExit={handleExit}
          />
        )}
      </AnimatePresence>
    </div>
  )
}