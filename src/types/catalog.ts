export type CategoryId =
  | 'birthday'
  | 'love'
  | 'anniversary'
  | 'proposal'
  | 'friendship'
  | 'graduation'

export type ExperienceBadge =
  | 'BESTSELLER'
  | 'POPULAR'
  | 'TRENDING'
  | 'PREMIUM'

export interface Category {
  id: CategoryId
  name: string
  emoji: string
  description: string
  count: number
}

/**
 * Data-driven catalog row for a single experience. The `id` follows the
 * scalable convention `{category}-{NN}` (e.g. `birthday-01`, `birthday-02`,
 * `birthday-03`…) so new tiers can be added without touching the storefront.
 */
export interface ExperienceMetadata {
  id: string
  experienceNumber: number
  name: string
  categoryId: CategoryId
  tagline: string
  description: string
  price: string
  amountInPaise: number
  badge?: ExperienceBadge
  isAvailable: boolean
  features: string[]
  supportsPhotos: boolean
  previewVisual: {
    emoji: string
    gradient: string
    accentColor: string
  }
}