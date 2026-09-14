import type { ComponentType } from 'react'
import { experiences } from '../data/catalog'
import type { ExperienceMetadata } from '../types/catalog'
import type { ExperienceConfig } from '../types/experience'
import { AnniversaryForeverTheme } from './anniversary-02/AnniversaryForeverTheme'
import { defaultAnniversaryForeverConfig } from './anniversary-02/defaultData'
import { AnniversaryTheme } from './anniversary-01/AnniversaryTheme'
import { defaultAnniversaryConfig } from './anniversary-01/defaultData'
import { BirthdayGrandTheme } from './birthday-02/BirthdayGrandTheme'
import { defaultBirthdayGrandConfig } from './birthday-02/defaultData'
import { BirthdayTheme } from './birthday-01/BirthdayTheme'
import { defaultBirthdayConfig } from './birthday-01/defaultData'
import { BirthdayMomentsTheme } from './birthday-03/BirthdayMomentsTheme'
import { defaultBirthdayMomentsConfig } from './birthday-03/defaultData'
import { FriendshipBroadcastTheme } from './friendship-02/FriendshipBroadcastTheme'
import { defaultFriendshipBroadcastConfig } from './friendship-02/defaultData'
import { FriendshipTheme } from './friendship-01/FriendshipTheme'
import { defaultFriendshipConfig } from './friendship-01/defaultData'
import { GraduationChapterTheme } from './graduation-02/GraduationChapterTheme'
import { defaultGraduationChapterConfig } from './graduation-02/defaultData'
import { GraduationTheme } from './graduation-01/GraduationTheme'
import { defaultGraduationConfig } from './graduation-01/defaultData'
import { LoveEternalTheme } from './love-02/LoveEternalTheme'
import { defaultLoveEternalConfig } from './love-02/defaultData'
import { LoveTheme } from './love-01/LoveTheme'
import { defaultLoveConfig } from './love-01/defaultData'
import { ProposalGreatestTheme } from './proposal-02/ProposalGreatestTheme'
import { defaultProposalGreatestConfig } from './proposal-02/defaultData'
import { ProposalTheme } from './proposal-01/ProposalTheme'
import { defaultProposalConfig } from './proposal-01/defaultData'

export interface ThemeComponentProps {
  config?: ExperienceConfig
  onExit: () => void
  /** True when rendered from a live shareable link (/x/:id). */
  isSharedLink?: boolean
}

export interface ThemeRegistration {
  metadata: ExperienceMetadata
  component: ComponentType<ThemeComponentProps> | null
  defaultConfig: ExperienceConfig | null
}

const REGISTERED_THEMES: Array<{
  id: string
  component: ComponentType<ThemeComponentProps>
  defaultConfig: ExperienceConfig
}> = [
  { id: 'birthday-01', component: BirthdayTheme, defaultConfig: defaultBirthdayConfig },
  { id: 'birthday-02', component: BirthdayGrandTheme, defaultConfig: defaultBirthdayGrandConfig },
  { id: 'birthday-03', component: BirthdayMomentsTheme, defaultConfig: defaultBirthdayMomentsConfig },
  { id: 'love-01', component: LoveTheme, defaultConfig: defaultLoveConfig },
  { id: 'love-02', component: LoveEternalTheme, defaultConfig: defaultLoveEternalConfig },
  { id: 'anniversary-01', component: AnniversaryTheme, defaultConfig: defaultAnniversaryConfig },
  { id: 'anniversary-02', component: AnniversaryForeverTheme, defaultConfig: defaultAnniversaryForeverConfig },
  { id: 'proposal-01', component: ProposalTheme, defaultConfig: defaultProposalConfig },
  { id: 'proposal-02', component: ProposalGreatestTheme, defaultConfig: defaultProposalGreatestConfig },
  { id: 'friendship-01', component: FriendshipTheme, defaultConfig: defaultFriendshipConfig },
  { id: 'friendship-02', component: FriendshipBroadcastTheme, defaultConfig: defaultFriendshipBroadcastConfig },
  { id: 'graduation-01', component: GraduationTheme, defaultConfig: defaultGraduationConfig },
  { id: 'graduation-02', component: GraduationChapterTheme, defaultConfig: defaultGraduationChapterConfig },
]

const registrations: ThemeRegistration[] = REGISTERED_THEMES.flatMap(
  (entry) => {
    const metadata = experiences.find((experience) => experience.id === entry.id)
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