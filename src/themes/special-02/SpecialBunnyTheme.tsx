import { getExperienceById } from '../../data/catalog'
import type { ExperienceConfig } from '../../types/experience'
import { SpecialPreview } from '../shared/SpecialPreview'
import { defaultSpecialBunnyConfig } from './defaultData'

interface SpecialThemeProps {
  config?: ExperienceConfig
  onExit: () => void
  isSharedLink?: boolean
}

export function SpecialBunnyTheme({ config, onExit, isSharedLink }: SpecialThemeProps) {
  const metadata = getExperienceById('special-02') ?? null
  if (!metadata) return null
  return (
    <SpecialPreview
      metadata={metadata}
      config={config ?? defaultSpecialBunnyConfig}
      particle="emoji-stickers"
      onExit={onExit}
      isSharedLink={isSharedLink}
    />
  )
}