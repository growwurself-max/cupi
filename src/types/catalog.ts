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

/**
 * Experience pricing tier. `basic` experiences (Experience #01) are the
 * quick & joyful ₹9 animated surprises; `premium` experiences (Experience
 * #02) are the cinematic, interactive ₹29 deluxe editions.
 */
export type ExperienceTier = 'basic' | 'premium'

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
  tier: ExperienceTier
  badge?: ExperienceBadge
  isAvailable: boolean
  features: string[]
  supportsPhotos: boolean
  /**
   * Optional promotional mini-badge shown on the product card for flagship
   * tiers (e.g. "PHOTOS + ADVANCED ANIMATION" on the ₹49 experience).
   */
  promoLabel?: string
  /** Maximum number of user photos the experience accepts (default 3). */
  maxPhotos?: number
  previewVisual: {
    emoji: string
    gradient: string
    accentColor: string
  }
}