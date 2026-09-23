import { AnimatePresence } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSoundEffects } from '../../hooks/useSoundEffects'
import { resolveConfigPlaceholders } from '../../utils/placeholders'
import type { ExperienceConfig } from '../../types/experience'
import { ThemeToolbar } from '../shared/ThemeToolbar'
import { defaultSpecialHeartBloomConfig } from './defaultData'
import { Act1Aim } from './screens/Act1Aim'
import { Act2Wish } from './screens/Act2Wish'
import { Act3Tree } from './screens/Act3Tree'

const TOTAL_STEPS = 3

const PAPER_GRAIN =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.42'/%3E%3C/svg%3E"

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
    () => config ?? resolveConfigPlaceholders(defaultSpecialHeartBloomConfig),
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
      style={{ color: '#3f3a37' }}
      className="demo-scope relative h-dvh overflow-x-hidden overflow-y-auto bg-[#FBF1E7]"
    >
      {/* soft paper grain + ambient warmth */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: `url("${PAPER_GRAIN}")`,
          backgroundSize: '160px 160px',
          opacity: 0.05,
          mixBlendMode: 'multiply',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 62% 46% at 50% -6%, rgba(249,177,110,0.16), transparent 62%), radial-gradient(ellipse 55% 42% at 50% 108%, rgba(255,130,150,0.1), transparent 60%)',
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
            isMuted={sound.isMuted}
            onToggleMute={sound.toggleMute}
          />
        )}
      </AnimatePresence>
    </div>
  )
}