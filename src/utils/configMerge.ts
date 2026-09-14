import type {
  BouquetConfig,
  ExperienceBranding,
  ExperienceConfig,
  ExperienceContent,
  PhotoItem,
} from '../types/experience'

function pickFirstString(
  value: string | undefined | null,
  fallback: string,
): string {
  if (typeof value !== 'string' || !value.trim()) return fallback
  return value.trim()
}

function pickArray<T>(value: T[] | undefined, fallback: T[]): T[] {
  return Array.isArray(value) && value.length > 0 ? value : fallback
}

function pickNumber(value: number | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? value
    : fallback
}

function pickBoolean(value: boolean | undefined, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function mergeContent(
  base: ExperienceContent,
  fetched: Partial<ExperienceContent> | undefined,
  maxPhotos: number,
): ExperienceContent {
  if (!fetched) return base
  return {
    teaserHeading: pickFirstString(fetched.teaserHeading, base.teaserHeading),
    teaserSubtext: pickFirstString(fetched.teaserSubtext, base.teaserSubtext),
    suspenseHeading: pickFirstString(
      fetched.suspenseHeading,
      base.suspenseHeading,
    ),
    suspenseSubtext: pickFirstString(
      fetched.suspenseSubtext,
      base.suspenseSubtext,
    ),
    countdownTagline: pickFirstString(
      fetched.countdownTagline,
      base.countdownTagline,
    ),
    revealHeading: pickFirstString(fetched.revealHeading, base.revealHeading),
    revealSubtext: pickFirstString(fetched.revealSubtext, base.revealSubtext),
    letterIntro: pickFirstString(fetched.letterIntro, base.letterIntro),
    letterLines: pickArray(fetched.letterLines, base.letterLines).slice(0, 8),
    letterSignoff: pickFirstString(
      fetched.letterSignoff,
      base.letterSignoff,
    ),
    wishPrompt: pickFirstString(fetched.wishPrompt, base.wishPrompt),
    finalMessage: pickFirstString(fetched.finalMessage, base.finalMessage),
    finalCelebration: pickFirstString(
      fetched.finalCelebration,
      base.finalCelebration,
    ),
    photos: pickArray<PhotoItem>(fetched.photos, base.photos).slice(0, maxPhotos),
  }
}

function mergeBranding(
  base: ExperienceBranding,
  fetched: Partial<ExperienceBranding> | undefined,
): ExperienceBranding {
  if (!fetched) return base
  return {
    accentColor: pickFirstString(fetched.accentColor, base.accentColor),
    accentSecondary: pickFirstString(
      fetched.accentSecondary,
      base.accentSecondary,
    ),
    emojiPrimary: pickFirstString(fetched.emojiPrimary, base.emojiPrimary),
    themeLabel: pickFirstString(fetched.themeLabel, base.themeLabel),
  }
}

const FALLBACK_BOUQUET: BouquetConfig = {
  title: 'Something to treasure',
  subtitle: 'A few little notes, one for every bloom.',
  notes: [],
}

function mergeBouquet(
  base: BouquetConfig,
  fetched: Partial<BouquetConfig> | undefined,
): BouquetConfig {
  if (!fetched) return base
  return {
    title: pickFirstString(fetched.title, base.title),
    subtitle: pickFirstString(fetched.subtitle, base.subtitle),
    notes: pickArray(fetched.notes, base.notes).slice(0, 6),
  }
}

/**
 * Merges a persisted (sanitized) experience payload onto the theme's curated
 * default config. The database stores a reduced/sanitized shape, so every
 * nested section is re-hydrated from the theme defaults to guarantee the
 * full-screen experience — including the finale — never renders `undefined`
 * fields in shared-link (/x/:id) mode.
 */
export function deepMergeExperienceConfig(
  base: ExperienceConfig,
  fetched: Partial<ExperienceConfig> | null | undefined,
  maxPhotos = 3,
): ExperienceConfig {
  if (!fetched) return base
  return {
    recipient: {
      name: pickFirstString(fetched.recipient?.name, base.recipient.name),
    },
    sender: {
      name: pickFirstString(fetched.sender?.name, base.sender.name),
    },
    audio: {
      enabled: pickBoolean(fetched.audio?.enabled, base.audio.enabled),
      volume: pickNumber(fetched.audio?.volume, base.audio.volume),
      revealChimeNotes: pickArray(
        fetched.audio?.revealChimeNotes,
        base.audio.revealChimeNotes,
      ),
      candleBlowPitch: pickNumber(
        fetched.audio?.candleBlowPitch,
        base.audio.candleBlowPitch,
      ),
    },
    content: mergeContent(base.content, fetched.content, maxPhotos),
    branding: mergeBranding(base.branding, fetched.branding),
    bouquet: fetched.bouquet
      ? mergeBouquet(base.bouquet ?? FALLBACK_BOUQUET, fetched.bouquet)
      : base.bouquet,
  }
}