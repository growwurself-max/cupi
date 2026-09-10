import type { ComponentType } from 'react'
import { themes } from '../data/catalog'
import type { ThemeMetadata } from '../types/catalog'
import type { ExperienceConfig } from '../types/experience'
import { AnniversaryTheme } from './anniversary-01/AnniversaryTheme'
import { defaultAnniversaryConfig } from './anniversary-01/defaultData'
import { BirthdayTheme } from './birthday-01/BirthdayTheme'
import { defaultBirthdayConfig } from './birthday-01/defaultData'
import { FriendshipTheme } from './friendship-01/FriendshipTheme'
import { defaultFriendshipConfig } from './friendship-01/defaultData'
import { GraduationTheme } from './graduation-01/GraduationTheme'
import { defaultGraduationConfig } from './graduation-01/defaultData'
import { LoveTheme } from './love-01/LoveTheme'
import { defaultLoveConfig } from './love-01/defaultData'
import { ProposalTheme } from './proposal-01/ProposalTheme'
import { defaultProposalConfig } from './proposal-01/defaultData'

export interface ThemeComponentProps {
  config?: ExperienceConfig
  onExit: () => void
}

export interface ThemeRegistration {
  metadata: ThemeMetadata
  component: ComponentType<ThemeComponentProps> | null
  defaultConfig: ExperienceConfig | null
}

const REGISTERED_THEMES: Array<{
  id: string
  component: ComponentType<ThemeComponentProps>
  defaultConfig: ExperienceConfig
}> = [
  { id: 'birthday-01', component: BirthdayTheme, defaultConfig: defaultBirthdayConfig },
  { id: 'love-01', component: LoveTheme, defaultConfig: defaultLoveConfig },
  { id: 'anniversary-01', component: AnniversaryTheme, defaultConfig: defaultAnniversaryConfig },
  { id: 'proposal-01', component: ProposalTheme, defaultConfig: defaultProposalConfig },
  { id: 'friendship-01', component: FriendshipTheme, defaultConfig: defaultFriendshipConfig },
  { id: 'graduation-01', component: GraduationTheme, defaultConfig: defaultGraduationConfig },
]

const registrations: ThemeRegistration[] = REGISTERED_THEMES.flatMap(
  (entry) => {
    const metadata = themes.find((theme) => theme.id === entry.id)
    if (!metadata) return []
    return [
      {
        metadata,
        component: entry.component,
        defaultConfig: entry.defaultConfig,
      },
    ]
  },
)

export const themeRegistry: Record<string, ThemeRegistration> =
  registrations.reduce(
    (registry, registration) => {
      registry[registration.metadata.id] = registration
      return registry
    },
    {} as Record<string, ThemeRegistration>,
  )

export function isThemeAvailable(themeId: string) {
  const registration = themeRegistry[themeId]
  return Boolean(registration?.component && registration?.defaultConfig)
}