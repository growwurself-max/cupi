const LIMITS = {
  name: 40,
  line: 500,
  note: 160,
  caption: 120,
  heading: 120,
  paragraph: 400,
  url: 600,
} as const

// A compressed 800px upload is ~80–150KB binary → ~110–200KB base64. Allow
// generous headroom (≈1.5MB base64 per photo) while keeping the whole payload
// under the 10mb JSON limit.
const MAX_BASE64_PHOTO_LENGTH = 1_500_000

function cleanString(value: unknown, max: number): string {
  if (typeof value !== 'string') return ''
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
}

/**
 * Photo sources may be hosted images (https://) OR client-compressed base64
 * data URLs from the upload picker. Data URLs are never truncated (a sliced
 * base64 blob is corrupt) — they are validated whole and capped by length.
 */
function cleanPhotoSrc(value: unknown): string {
  if (typeof value !== 'string') return ''
  const candidate = value.trim()
  if (/^https?:\/\/[^\s]+$/i.test(candidate)) {
    return candidate.slice(0, LIMITS.url)
  }
  if (
    candidate.length <= MAX_BASE64_PHOTO_LENGTH &&
    /^data:image\/(?:jpeg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(candidate)
  ) {
    return candidate
  }
  return ''
}

function clampNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function cleanChimeNotes(value: unknown): number[] {
  if (!Array.isArray(value)) return []
  return value
    .filter(
      (note): note is number => typeof note === 'number' && Number.isFinite(note),
    )
    .slice(0, 8)
}

export interface SanitizedPhoto {
  src: string
  alt: string
  caption: string
  rotate: number
}

export interface SanitizedNote {
  id: string
  text: string
  emoji?: string
}

export interface SanitizedAudio {
  enabled: boolean
  volume: number
  revealChimeNotes: number[]
  candleBlowPitch: number
}

export interface SanitizedCustomization {
  recipient: { name: string }
  sender: { name: string }
  audio: SanitizedAudio
  content: {
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
    photos: SanitizedPhoto[]
  }
  branding: {
    accentColor: string
    accentSecondary: string
    emojiPrimary: string
    themeLabel: string
  }
  bouquet: {
    title: string
    subtitle: string
    notes: SanitizedNote[]
  }
}

interface RawPhoto {
  src?: unknown
  alt?: unknown
  caption?: unknown
  rotate?: unknown
}

interface RawNote {
  id?: unknown
  text?: unknown
  emoji?: unknown
}

/**
 * Validates + sanitizes an order's customization payload. Returns a clean,
 * fully-shaped object or `null` when the payload is not a valid surprise.
 * `maxPhotos` mirrors the template's allowed photo count (see PHOTO_LIMITS).
 */
export function sanitizeCustomization(
  payload: unknown,
  maxPhotos = 3,
): SanitizedCustomization | null {
  if (!payload || typeof payload !== 'object') return null

  const source = payload as Record<string, unknown>
  const recipient = source.recipient as Record<string, unknown> | undefined
  const sender = source.sender as Record<string, unknown> | undefined
  const content = source.content as Record<string, unknown> | undefined
  const branding = source.branding as Record<string, unknown> | undefined
  const bouquet = source.bouquet as Record<string, unknown> | undefined
  const audio = source.audio as Record<string, unknown> | undefined

  const recipientName = cleanString(recipient?.name, LIMITS.name) || 'Someone Special'
  const senderName = cleanString(sender?.name, LIMITS.name) || 'A Friend'
  if (!content) return null

  const letterLines = Array.isArray(content.letterLines)
    ? content.letterLines
        .map((line) => cleanString(line, LIMITS.line))
        .filter(Boolean)
    : []

  const photos = Array.isArray(content.photos)
    ? (content.photos as RawPhoto[])
        .slice(0, maxPhotos)
        .map((photo, index) => {
          const src = cleanPhotoSrc(photo.src)
          if (!src) return null
          const caption = cleanString(photo.caption, LIMITS.caption)
          return {
            src,
            alt: caption || 'A little memory',
            caption: caption || 'A little memory',
            rotate: clampNumber(photo.rotate, index % 2 === 0 ? -4 : 4),
          }
        })
        .filter((photo): photo is SanitizedPhoto => photo !== null)
    : []

  if (photos.length === 0) return null

  const notes = Array.isArray(bouquet?.notes)
    ? (bouquet.notes as RawNote[])
        .slice(0, 6)
        .map((note, index): SanitizedNote | null => {
          const text = cleanString(note.text, LIMITS.note)
          if (!text) return null
          const emoji = cleanString(note.emoji, 8)
          return {
            id: cleanString(note.id, 24) || `note-${index + 1}`,
            text,
            emoji: emoji || undefined,
          }
        })
        .filter((note): note is SanitizedNote => note !== null)
    : []

  // Notes are optional - don't fail if they're missing

  return {
    recipient: { name: recipientName },
    sender: { name: senderName },
    audio: {
      enabled:
        typeof audio?.enabled === 'boolean'
          ? audio.enabled
          : true,
      volume: clampNumber(audio?.volume, 0.55),
      revealChimeNotes: cleanChimeNotes(audio?.revealChimeNotes),
      candleBlowPitch:
        typeof audio?.candleBlowPitch === 'number' &&
        Number.isFinite(audio.candleBlowPitch)
          ? audio.candleBlowPitch
          : 140,
    },
    content: {
      teaserHeading:
        cleanString(content.teaserHeading, LIMITS.heading) ||
        `Hey ${recipientName}… someone has something special for you ✨`,
      teaserSubtext: cleanString(content.teaserSubtext, LIMITS.paragraph),
      suspenseHeading: cleanString(content.suspenseHeading, LIMITS.heading),
      suspenseSubtext: cleanString(content.suspenseSubtext, LIMITS.paragraph),
      countdownTagline: cleanString(content.countdownTagline, LIMITS.heading),
      revealHeading: cleanString(content.revealHeading, LIMITS.heading) || 'Happy Birthday',
      revealSubtext: cleanString(content.revealSubtext, LIMITS.paragraph),
      letterIntro:
        cleanString(content.letterIntro, LIMITS.heading) || 'So I wrote you something…',
      letterLines,
      letterSignoff:
        cleanString(content.letterSignoff, LIMITS.heading) || 'Forever in your corner,',
      wishPrompt: cleanString(content.wishPrompt, LIMITS.heading) || 'Make a Birthday Wish',
      finalMessage: cleanString(content.finalMessage, LIMITS.heading),
      finalCelebration: cleanString(content.finalCelebration, LIMITS.paragraph),
      photos,
    },
    branding: {
      accentColor: cleanString(branding?.accentColor, 32) || '#f6c6b6',
      accentSecondary: cleanString(branding?.accentSecondary, 32) || '#c9b8ff',
      emojiPrimary: cleanString(branding?.emojiPrimary, 16) || '🎂',
      themeLabel: cleanString(branding?.themeLabel, 60) || 'Birthday · The Odyssey',
    },
    bouquet: {
      title: cleanString(bouquet?.title, LIMITS.heading) || 'Your Birthday Bouquet 🌹',
      subtitle: cleanString(bouquet?.subtitle, LIMITS.paragraph),
      notes,
    },
  }
}