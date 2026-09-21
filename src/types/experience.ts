export interface RecipientData {
  name: string
}

export interface SenderData {
  name: string
}

export interface PhotoItem {
  src: string
  alt: string
  caption: string
  rotate: number
}

export interface BouquetNote {
  id: string
  text: string
  emoji?: string
}

export interface BouquetConfig {
  title: string
  subtitle: string
  notes: BouquetNote[]
}

export interface ExperienceContent {
  teaserHeading: string
  teaserSubtext: string
  suspenseHeading: string
  suspenseSubtext: string
  countdownTagline: string
  revealHeading: string
  revealSubtext: string
  letterIntro: string
  letterLines: string[]
  letterSignoff: string
  wishPrompt: string
  finalMessage: string
  finalCelebration: string
  photos: PhotoItem[]
  /**
   * Optional 4-digit secret passcode (e.g. a birth date in DDMM/MMDD form)
   * that unlocks passcode-gated experiences such as Special #02.
   */
  passcode?: string
}

export interface ExperienceAudio {
  enabled: boolean
  volume: number
  revealChimeNotes: number[]
  candleBlowPitch: number
}

export interface ExperienceBranding {
  accentColor: string
  accentSecondary: string
  emojiPrimary: string
  themeLabel: string
}

export interface ExperienceConfig {
  recipient: RecipientData
  sender: SenderData
  audio: ExperienceAudio
  content: ExperienceContent
  branding: ExperienceBranding
  bouquet?: BouquetConfig
}