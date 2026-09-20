import { getExperienceById } from '../../data/catalog'
import type { ExperienceConfig } from '../../types/experience'
import { SpecialPreview } from '../shared/SpecialPreview'
import { defaultSpecialHeartBloomConfig } from './defaultData'

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
  const metadata = getExperienceById('special-01') ?? null
  if (!metadata) return null
  return (
    <SpecialPreview
      metadata={metadata}
      config={config ?? defaultSpecialHeartBloomConfig}
      particle="heart-petals"
      onExit={onExit}
      isSharedLink={isSharedLink}
    />
  )
}