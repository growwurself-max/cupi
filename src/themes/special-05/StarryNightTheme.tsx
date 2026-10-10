import { AnimatePresence } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSoundEffects } from '../../hooks/useSoundEffects'
import { resolveConfigPlaceholders } from '../../utils/placeholders'
import type { ExperienceConfig } from '../../types/experience'
import { ThemeToolbar } from '../shared/ThemeToolbar'
import { PremiumFrame } from '../premium/PremiumFrame'
import { defaultStarryNightConfig } from './defaultData'
import { Act1Stars } from './screens/Act1Stars'
import { Act2Constellation } from './screens/Act2Constellation'
import { Act3Universe } from './screens/Act3Universe'

const TOTAL_STEPS = 3

interface StarryNightThemeProps {
  config?: ExperienceConfig
  onExit: () => void
  isSharedLink?: boolean
}

export function StarryNightTheme({
  config,
  onExit,
  isSharedLink,
}: StarryNightThemeProps) {
  const [step, setStep] = useState(1)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const resolvedConfig = useMemo(
    () => config ?? resolveConfigPlaceholders(defaultStarryNightConfig),
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
      style={{ color: '#e2e8f0' }}
      className="demo-scope relative isolate h-dvh overflow-x-hidden overflow-y-auto bg-[#0f172a]"
    >
      <PremiumFrame variant="special" />
      {/* Deep space gradient */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(99, 102, 241, 0.15), transparent 50%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(168, 85, 247, 0.1), transparent 50%), linear-gradient(180deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
        }}
      />

      <ThemeToolbar
        themeLabel={resolvedConfig.branding.themeLabel}
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
          <Act1Stars
            key="act1-stars"
            config={resolvedConfig}
            onConnect={goNext}
            onTwinkle={sound.playBurstShimmer}
          />
        )}
        {step === 2 && (
          <Act2Constellation
            key="act2-constellation"
            config={resolvedConfig}
            onReveal={goNext}
            onSparkle={sound.playRevealChime}
          />
        )}
        {step === 3 && (
          <Act3Universe
            key="act3-universe"
            config={resolvedConfig}
            onReplay={replay}
            onExit={handleExit}
            onAmbient={sound.playAmbientPad}
            onGlow={sound.playBurstShimmer}
            isMuted={sound.isMuted}
            onToggleMute={sound.toggleMute}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
