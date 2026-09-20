import { AnimatePresence } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSoundEffects } from '../../hooks/useSoundEffects'
import type { ExperienceConfig } from '../../types/experience'
import { ThemeToolbar } from '../shared/ThemeToolbar'
import { defaultSpecialHeartBloomConfig } from './defaultData'
import { Act1Aim } from './screens/Act1Aim'
import { Act2Wish } from './screens/Act2Wish'
import { Act3Tree } from './screens/Act3Tree'

const TOTAL_STEPS = 3

interface SpecialThemeProps {
  config?: ExperienceConfig
  onExit: () => void
  isSharedLink?: boolean
}

export function SpecialHeartBloomTheme({
  config,
  onExit,
  isSharedLink,
}: SpecialThemeProps) {
  const [step, setStep] = useState(1)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const resolvedConfig = useMemo(
    () => config ?? defaultSpecialHeartBloomConfig,
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
      className="demo-scope relative h-dvh overflow-x-hidden overflow-y-auto bg-[#16100c]"
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
          <Act1Aim
            key="act1-aim"
            config={resolvedConfig}
            onFire={goNext}
            onTwang={sound.playBowTwang}
          />
        )}
        {step === 2 && (
          <Act2Wish
            key="act2-wish"
            config={resolvedConfig}
            onShimmer={sound.playBurstShimmer}
            onContinue={goNext}
          />
        )}
        {step === 3 && (
          <Act3Tree
            key="act3-tree"
            config={resolvedConfig}
            onReplay={replay}
            onExit={handleExit}
            onAmbient={sound.playAmbientPad}
            onGrow={sound.playRevealChime}
            onBloom={sound.playBurstShimmer}
          />
        )}
      </AnimatePresence>
    </div>
  )
}