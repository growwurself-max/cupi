import type { BouquetNote, ExperienceConfig, PhotoItem } from '../types/experience'

export interface PhotoDraft {
  src: string
  caption: string
}

export interface CustomizerDraft {
  recipientName: string
  nickname: string
  senderName: string
  letterLines: string[]
  bouquetNotes: string[]
  photos: PhotoDraft[]
  /** Big headline / proposal question rendered by question-based themes. */
  finalMessage: string
  /** 4-digit secret passcode (a date such as DDMM/MMDD) for passcode themes. */
  passcode: string
}

const NOTE_EMOJIS = ['🌹', '🌸', '🌷', '🍀', '🌺', '🏵️']

export function emptyDraft(): CustomizerDraft {
  return {
    recipientName: '',
    nickname: '',
    senderName: '',
    letterLines: ['', ''],
    bouquetNotes: [
      'You make every day brighter ☀️',
      'My favorite person 💖',
      'Forever lucky to have you 🥺',
      'The best part of my story 💫',
    ],
    photos: [
      { src: '', caption: '' },
      { src: '', caption: '' },
    ],
    finalMessage: '',
    passcode: '',
  }
}

const isImageSrc = (value: string): boolean => {
  const candidate = value.trim()
  return (
    /^https?:\/\/\S+$/i.test(candidate) ||
    /^data:image\/(?:jpeg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(candidate)
  )
}

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

function isValidDayMonth(day: number, month: number): boolean {
  if (month < 1 || month > 12) return false
  if (day < 1) return false
  return day <= DAYS_IN_MONTH[month - 1]
}

/**
 * A passcode is a 4-digit code that reads as a real date in either DDMM or
 * MMDD form (e.g. 0512 = 5 December). At least one interpretation must be a
 * valid calendar date so the code always stays meaningful to the creator and
 * the recipient.
 */
export function isValidPasscode(code: string): boolean {
  if (!/^\d{4}$/.test(code)) return false
  const dd = Number(code.slice(0, 2))
  const mm = Number(code.slice(2, 4))
  if (isValidDayMonth(dd, mm)) return true
  const d2 = Number(code.slice(2, 4))
  const m2 = Number(code.slice(0, 2))
  return isValidDayMonth(d2, m2)
}

export function normalizePasscode(value: string): string {
  return value.replace(/\D/g, '').slice(0, 4)
}

/**
 * Builds a complete, safe ExperienceConfig from the user's draft by merging
 * every filled field onto the selected experience's curated defaults. Used
 * both for the live preview and as the payload sent to the server before
 * checkout.
 */
export function buildExperienceConfig(
  draft: Partial<CustomizerDraft>,
  baseConfig: ExperienceConfig,
  maxPhotos = 3,
): ExperienceConfig {
  const config = structuredClone(baseConfig)

  const recipient = draft.recipientName?.trim() || config.recipient.name
  const nickname = draft.nickname?.trim()
  const sender = draft.senderName?.trim() || config.sender.name

  config.recipient.name = nickname || recipient
  config.sender.name = sender

  const lines = (draft.letterLines ?? [])
    .map((line) => line.trim())
    .filter(Boolean)
  if (lines.length > 0) {
    config.content.letterLines = lines.slice(0, 6)
  }

  const notes = (draft.bouquetNotes ?? [])
    .map((note) => note.trim())
    .filter(Boolean)
  if (notes.length > 0 && config.bouquet) {
    config.bouquet.notes = notes.slice(0, 6).map(
      (text, index) =>
        ({
          id: `note-${index + 1}`,
          text,
          emoji: NOTE_EMOJIS[index % NOTE_EMOJIS.length],
        }) as BouquetNote,
    )
  }

  const finalMessage = draft.finalMessage?.trim()
  if (finalMessage) {
    config.content.finalMessage = finalMessage
  }

  const passcode = normalizePasscode(draft.passcode ?? '')
  if (passcode.length === 4) {
    config.content.passcode = passcode
  }

  const photos = (draft.photos ?? []).filter(
    (photo) => photo.src && isImageSrc(photo.src),
  )
  if (photos.length > 0) {
    config.content.photos = photos
      .slice(0, maxPhotos)
      .map((photo, index): PhotoItem => {
      const caption = photo.caption.trim() || 'A little memory'
      return {
        src: photo.src.trim(),
        alt: caption,
        caption,
        rotate: index % 2 === 0 ? -4 : 4,
      }
    })
  }

  return config
}