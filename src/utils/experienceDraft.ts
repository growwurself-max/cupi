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
  }
}

const isImageSrc = (value: string): boolean => {
  const candidate = value.trim()
  return (
    /^https?:\/\/\S+$/i.test(candidate) ||
    /^data:image\/(?:jpeg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(candidate)
  )
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