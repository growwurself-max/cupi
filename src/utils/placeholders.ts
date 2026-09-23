import type {
  ExperienceConfig,
  ExperienceContent,
} from '../types/experience'

/**
 * Consistent placeholder tokens used throughout the curated default copy.
 * When a customer enters the recipient/sender name, these tokens are swapped
 * for the real names instead of hardcoding replacement logic in each theme.
 */
export const RECIPIENT_PLACEHOLDER = '{{name}}'
export const SENDER_PLACEHOLDER = '{{sender}}'

export interface PlaceholderContext {
  recipient?: string
  sender?: string
}

/**
 * Replaces every occurrence of the recipient/sender placeholder inside a
 * single string. Unknown placeholders are left untouched so a later pass can
 * still resolve them. Idempotent: running it on already-filled text is a no-op.
 */
export function fillPlaceholders(
  text: string,
  context: PlaceholderContext = {},
): string {
  const recipient = context.recipient?.trim()
  const sender = context.sender?.trim()
  return text
    .split(RECIPIENT_PLACEHOLDER)
    .join(recipient || RECIPIENT_PLACEHOLDER)
    .split(SENDER_PLACEHOLDER)
    .join(sender || SENDER_PLACEHOLDER)
}

/**
 * Resolves placeholders across every letter field of a content object while
 * keeping line breaks, emojis and the rest of the copy intact.
 */
export function resolveContentPlaceholders(
  content: ExperienceContent,
  context: PlaceholderContext,
): ExperienceContent {
  return {
    ...content,
    letterIntro: fillPlaceholders(content.letterIntro, context),
    letterLines: content.letterLines.map((line) =>
      fillPlaceholders(line, context),
    ),
    letterSignoff: fillPlaceholders(content.letterSignoff, context),
  }
}

/**
 * Resolves placeholders in a full config using the config's own recipient and
 * sender names. Safe to run at any boundary (customization, share-link
 * hydration, demo fallback) because it is idempotent.
 */
export function resolveConfigPlaceholders(
  config: ExperienceConfig,
): ExperienceConfig {
  return {
    ...config,
    content: resolveContentPlaceholders(config.content, {
      recipient: config.recipient.name,
      sender: config.sender.name,
    }),
  }
}