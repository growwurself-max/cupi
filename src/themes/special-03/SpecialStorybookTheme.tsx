import { getExperienceById } from '../../data/catalog'
import type { ExperienceConfig } from '../../types/experience'
import { SpecialPreview } from '../shared/SpecialPreview'
import { defaultSpecialStorybookConfig } from './defaultData'

interface SpecialThemeProps {
  config?: ExperienceConfig
  onExit: () => void
  isSharedLink?: boolean
}

export function SpecialStorybookTheme({
  config,
  onExit,
  isSharedLink,
}: SpecialThemeProps) {
  const metadata = getExperienceById('special-03') ?? null
  if (!metadata) return null
  return (
    <SpecialPreview
      metadata={metadata}
      config={config ?? defaultSpecialStorybookConfig}
      particle="star-dust"
      onExit={onExit}
      isSharedLink={isSharedLink}
    />
  )
}