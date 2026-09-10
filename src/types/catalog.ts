export type CategoryId =
  | 'birthday'
  | 'love'
  | 'anniversary'
  | 'proposal'
  | 'friendship'
  | 'graduation'

export interface Category {
  id: CategoryId
  name: string
  emoji: string
  description: string
  count: number
}

export type ThemeStatus = 'available' | 'coming-soon'

export interface FeaturePill {
  id: string
  label: string
}

export interface ThemeMetadata {
  id: string
  categoryId: CategoryId
  name: string
  tagline: string
  description: string
  emoji: string
  gradient: string
  features: FeaturePill[]
  tags: string[]
  status: ThemeStatus
  badge?: string
}