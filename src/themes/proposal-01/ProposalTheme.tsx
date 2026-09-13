import { AnimatePresence } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSoundEffects } from '../../hooks/useSoundEffects'
import type { ExperienceConfig } from '../../types/experience'
import { ThemeToolbar } from '../shared/ThemeToolbar'
import { defaultProposalConfig } from './defaultData'
import { Screen1Mystery } from './screens/Screen1Mystery'
import { Screen2Memories } from './screens/Screen2Memories'
import { Screen3Hush } from './screens/Screen3Hush'
import { Screen4Question } from './screens/Screen4Question'
import { Screen5Yes } from './screens/Screen5Yes'

const TOTAL_STEPS = 5

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

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [step])

  return (
    <div
      ref={scrollRef}
      className="relative h-dvh overflow-x-hidden overflow-y-auto bg-gradient-to-b from-[#FAF5FF] via-[#F3E8FF] to-[#FDF4FF]"
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
          <Screen1Mystery
            key="prop-mystery"
            config={resolvedConfig}
            onBegin={goNext}
          />
        )}
        {step === 2 && (
          <Screen2Memories
            key="prop-memories"
            config={resolvedConfig}
            onContinue={goNext}
          />
        )}
        {step === 3 && (
          <Screen3Hush
            key="prop-hush"
            config={resolvedConfig}
            onOpen={sound.playRevealChime}
            onContinue={goNext}
          />
        )}
        {step === 4 && (
          <Screen4Question
            key="prop-question"
            config={resolvedConfig}
            onContinue={goNext}
          />
        )}
        {step === 5 && (
          <Screen5Yes
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