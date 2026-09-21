import { AnimatePresence } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSoundEffects } from '../../hooks/useSoundEffects'
import type { ExperienceConfig } from '../../types/experience'
import { ThemeToolbar } from '../shared/ThemeToolbar'
import { defaultSpecialBunnyConfig } from './defaultData'
import { Act1Passcode } from './screens/Act1Passcode'
import { Act2Cake } from './screens/Act2Cake'
import { Act3Balloons } from './screens/Act3Balloons'
import { Act4Mystery } from './screens/Act4Mystery'
import { Act5Letter } from './screens/Act5Letter'

const TOTAL_STEPS = 5

interface SpecialThemeProps {
  config?: ExperienceConfig
  onExit: () => void
  isSharedLink?: boolean
}

export function SpecialBunnyTheme({
  config,
  onExit,
  isSharedLink,
}: SpecialThemeProps) {
  const [step, setStep] = useState(1)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const resolvedConfig = useMemo(
    () => config ?? defaultSpecialBunnyConfig,
    [config],
  )

  const sound = useSoundEffects({
    audio: resolvedConfig.audio,
    enabled: resolvedConfig.audio.enabled,
  })

  const isDemoPreview = !isSharedLink

  const goNext = useCallback(() => {
    setStep((prev) => Math.min(prev + 1, TOTAL_STEPS))
  }, [])

  const jumpToStep = useCallback((target: number) => {
    setStep(Math.max(1, Math.min(target, TOTAL_STEPS)))
  }, [])

  const replay = useCallback(() => {
    sound.resume()
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
      style={{ color: '#3f3a37' }}
      className="demo-scope relative h-dvh overflow-x-hidden overflow-y-auto bg-[#FCEBEE]"
    >
      <ThemeToolbar
        themeLabel={resolvedConfig.branding.themeLabel || 'Bunny'}
        step={step}
        totalSteps={TOTAL_STEPS}
        isMuted={sound.isMuted}
        soundEnabled={sound.isEnabled}
        onToggleMute={sound.toggleMute}
        onExit={handleExit}
        variant={isSharedLink ? 'shared' : 'demo'}
        onJumpToStep={isDemoPreview ? jumpToStep : undefined}
      />

      <AnimatePresence mode="wait">
        {step === 1 && (
          <Act1Passcode
            key="act1"
            config={resolvedConfig}
            demoPreview={isDemoPreview}
            onKeyTap={sound.playSoftClick}
            onSkip={() => {
              sound.playRevealChime()
              goNext()
            }}
            onSuccess={() => {
              sound.playRevealChime()
              goNext()
            }}
          />
        )}
        {step === 2 && (
          <Act2Cake
            key="act2"
            config={resolvedConfig}
            onBlowOut={() => {
              sound.playBlowSound()
              sound.playRevealChime()
              sound.playBurstShimmer()
              goNext()
            }}
          />
        )}
        {step === 3 && (
          <Act3Balloons
            key="act3"
            onPop={sound.playPop}
            onComplete={() => {
              setTimeout(() => {
                sound.playRevealChime()
                goNext()
              }, 2000)
            }}
          />
        )}
        {step === 4 && (
          <Act4Mystery
            key="act4"
            onSelect={() => {
              sound.playBurstShimmer()
              setTimeout(goNext, 1500)
            }}
          />
        )}
        {step === 5 && (
          <Act5Letter
            key="act5"
            config={resolvedConfig}
            onReplay={replay}
            onExit={handleExit}
            isMuted={sound.isMuted}
            onToggleMute={sound.toggleMute}
          />
        )}
      </AnimatePresence>
    </div>
  )
}