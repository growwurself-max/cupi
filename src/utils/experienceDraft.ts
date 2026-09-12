import type { BouquetNote, ExperienceConfig, PhotoItem } from '../types/experience'
import { defaultBirthdayConfig } from '../themes/birthday-01/defaultData'

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
  }
}

const isHttpUrl = (value: string): boolean =>
  /^https?:\/\/\S+$/i.test(value.trim())

/**
 * Builds a complete, safe ExperienceConfig from the user's draft by merging
 * every filled field onto the curated defaults. Used both for the live preview
 * and as the payload sent to the server before checkout.
 */
export function buildBirthdayConfig(draft: Partial<CustomizerDraft>): ExperienceConfig {
  const config = structuredClone(defaultBirthdayConfig)

  const recipient = draft.recipientName?.trim() || config.recipient.name
  const nickname = draft.nickname?.trim() || recipient
  const sender = draft.senderName?.trim() || config.sender.name

  config.recipient.name = recipient
  config.sender.name = sender
  config.content.teaserHeading = `Hey ${nickname}… someone has something special for you ✨`
  config.content.finalMessage = `Today is all about ${nickname}`

  const lines = (draft.letterLines ?? [])
    .map((line) => line.trim())
    .filter(Boolean)
  if (lines.length > 0) {
    config.content.letterLines = lines.slice(0, 6)
  }

  const notes = (draft.bouquetNotes ?? [])
    .map((note) => note.trim())
    .filter(Boolean)
  if (notes.length > 0) {
    config.bouquet!.notes = notes.slice(0, 6).map(
      (text, index) =>
        ({
          id: `note-${index + 1}`,
          text,
          emoji: NOTE_EMOJIS[index % NOTE_EMOJIS.length],
        }) as BouquetNote,
    )
  }

  const photos = (draft.photos ?? []).filter(
    (photo) => photo.src && isHttpUrl(photo.src),
  )
  if (photos.length > 0) {
    config.content.photos = photos.slice(0, 3).map((photo, index): PhotoItem => {
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