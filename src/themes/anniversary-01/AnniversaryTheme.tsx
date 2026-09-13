import { AnimatePresence } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSoundEffects } from '../../hooks/useSoundEffects'
import type { ExperienceConfig } from '../../types/experience'
import { ThemeToolbar } from '../shared/ThemeToolbar'
import { defaultAnniversaryConfig } from './defaultData'
import { ChapterScreen } from './screens/Screen1Chapter'
import { TickerScreen } from './screens/Screen2Ticker'
import { TicketsScreen } from './screens/Screen3Tickets'
import { VaultScreen } from './screens/Screen4Vault'
import { ToastScreen } from './screens/Screen5Toast'

const TOTAL_STEPS = 5

interface AnniversaryThemeProps {
  config?: ExperienceConfig
  onExit: () => void
  isSharedLink?: boolean
}

export function AnniversaryTheme({ config, onExit, isSharedLink }: AnniversaryThemeProps) {
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
    scrollRef.current?.scrollTo({ top: 0 })
  }, [step])

  return (
    <div
      ref={scrollRef}
      className="relative h-dvh overflow-x-hidden overflow-y-auto bg-gradient-to-b from-[#FFFDF7] via-[#FEF7E6] to-[#FFF9EE]"
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
          <ChapterScreen key="anni-chapter" config={resolvedConfig} onBegin={goNext} />
        )}
        {step === 2 && (
          <TickerScreen key="anni-ticker" config={resolvedConfig} onContinue={goNext} />
        )}
        {step === 3 && (
          <TicketsScreen key="anni-tickets" config={resolvedConfig} onContinue={goNext} />
        )}
        {step === 4 && (
          <VaultScreen key="anni-vault" config={resolvedConfig} onContinue={goNext} />
        )}
        {step === 5 && (
          <ToastScreen
            key="anni-toast"
            config={resolvedConfig}
            onReplay={replay}
            onExit={handleExit}
            onClink={sound.playRevealChime}
          />
        )}
      </AnimatePresence>
    </div>
  )
}