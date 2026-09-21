import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { useSoundEffects } from '../../hooks/useSoundEffects'
import type { ExperienceMetadata } from '../../types/catalog'
import type { ExperienceConfig } from '../../types/experience'
import { FloatingParticles, type ParticleType } from './FloatingParticles'
import { ThemeToolbar } from './ThemeToolbar'

interface SpecialPreviewProps {
  metadata: ExperienceMetadata
  config: ExperienceConfig
  particle?: ParticleType
  onExit: () => void
  isSharedLink?: boolean
}

/**
 * Showcase preview for the Special collection templates. Renders a polished,
 * branded teaser card (name, tagline, features, tags + a letter sneak peek)
 * so the templates are fully demoable in the store while their full
 * multi-act interactive experiences are still rolling out.
 */
export function SpecialPreview({
  metadata,
  config,
  particle = 'heart-petals',
  onExit,
  isSharedLink,
}: SpecialPreviewProps) {
  const sound = useSoundEffects({
    audio: config.audio,
    enabled: config.audio.enabled,
  })

  const letterLines = (config.content.letterLines ?? []).filter(Boolean)

  const handleExit = useCallback(() => {
    sound.resume()
    onExit()
  }, [onExit, sound])

  return (
    <div className="relative h-dvh overflow-x-hidden overflow-y-auto bg-[#FEFAF4]">
      <ThemeToolbar
        themeLabel={config.branding.themeLabel}
        step={1}
        totalSteps={1}
        isMuted={sound.isMuted}
        soundEnabled={sound.isEnabled}
        onToggleMute={sound.toggleMute}
        onExit={handleExit}
        variant={isSharedLink ? 'shared' : 'demo'}
      />

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-x-hidden px-5 py-24 text-center sm:px-8"
        style={{ background: metadata.previewVisual.gradient }}
      >
        <FloatingParticles type={particle} />

        <div className="relative z-10 flex w-full max-w-lg flex-col items-center gap-5">
          <motion.span
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            className="text-7xl drop-shadow-[0_16px_30px_rgba(0,0,0,0.18)]"
            aria-hidden
          >
            {metadata.previewVisual.emoji}
          </motion.span>

          <div className="flex flex-col items-center gap-2">
            <span className="rounded-full border border-white/70 bg-white/85 px-3 py-1 text-sm font-black text-rose-600 shadow-sm backdrop-blur-md">
              {metadata.price}
            </span>
            <h1 className="font-display text-3xl font-bold text-stone-900 sm:text-4xl">
              {metadata.name}
            </h1>
            <p className="max-w-sm text-pretty text-sm leading-relaxed font-medium text-stone-600">
              {metadata.tagline}
            </p>
            <p className="max-w-md text-pretty text-sm leading-relaxed text-stone-700/80">
              {metadata.description}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-1.5">
            {metadata.features.map((feature) => (
              <span
                key={feature}
                className="rounded-full border border-white/80 bg-white/85 px-3 py-1 text-xs font-semibold text-stone-700 shadow-sm backdrop-blur-md"
              >
                {feature}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-1.5">
            {metadata.tags?.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-rose-200/70 bg-white/80 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-rose-600 uppercase shadow-sm backdrop-blur-md"
              >
                {tag}
              </span>
            ))}
          </div>

          {letterLines.length > 0 && (
            <div
              className="relative w-full max-w-sm rounded-3xl bg-[#FFF9F3] p-6 shadow-[0_20px_50px_rgba(60,30,40,0.18)] ring-1 ring-stone-200/70"
              style={{ transform: 'rotate(-1.2deg)' }}
            >
              <span className="absolute -top-3 right-6 text-xl" aria-hidden>
                ❤️
              </span>
              <p className="font-serif text-lg font-bold text-stone-800 italic">
                {config.content.letterIntro || 'A little note…'}
              </p>
              <div className="mt-3 space-y-2.5 text-left">
                {letterLines.slice(0, 4).map((line) => (
                  <p
                    key={line}
                    className="text-sm leading-relaxed text-stone-600"
                  >
                    {line}
                  </p>
                ))}
              </div>
              <p className="mt-4 text-right text-sm font-semibold text-stone-500 italic">
                — {config.sender.name}
              </p>
            </div>
          )}

          <p className="max-w-xs text-[11px] font-medium leading-relaxed text-stone-600/80">
            This is the showcase preview. The full{' '}
            <span className="font-bold text-stone-800">{metadata.name}</span>{' '}
            interactive experience unlocks when you customize and create yours.
          </p>
        </div>
      </motion.section>
    </div>
  )
}