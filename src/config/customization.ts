import type { ExperienceMetadata } from '../types/catalog'

/**
 * Steps available inside the customizer. Each maps to real, rendered fields
 * inside the target experience — never to fake inputs the experience ignores.
 */
export type CustomizerStepId =
  | 'basics'
  | 'passcode'
  | 'question'
  | 'message'
  | 'bouquet'
  | 'memories'

/** Themes that render the letter (content.letterLines) inside the experience. */
const LETTER_THEMES = new Set([
  'birthday-01',
  'birthday-02',
  'birthday-03',
  'love-01',
  'love-02',
  'anniversary-01',
  'anniversary-02',
  'proposal-01',
  'proposal-02',
  'friendship-01',
  'friendship-02',
  'graduation-01',
  'graduation-02',
  'special-01',
  'special-02',
  'special-03',
])

/**
 * Themes with an interactive bouquet/notes section. Only the birthday
 * experiences actually render this — preserved untouched for them.
 */
const BOUQUET_THEMES = new Set(['birthday-01', 'birthday-02', 'birthday-03'])

/**
 * Themes that render content.finalMessage as their big headline / the
 * proposal question itself (they do NOT render a letter).
 */
const QUESTION_THEMES = new Set(['proposal-01', 'proposal-02', 'special-01'])

/**
 * Themes gated behind a 4-digit secret passcode (a meaningful date) that the
 * creator sets at customization time. Asked right after the basics step.
 */
const PASSCODE_THEMES = new Set(['special-02'])

/**
 * Returns the customizer steps that match what a given experience actually
 * renders. The birthday experience keeps its existing flow (basics, message,
 * bouquet). Memories/photos are driven by metadata.supportsPhotos.
 */
export function getCustomizerStepIds(
  theme: ExperienceMetadata,
): CustomizerStepId[] {
  const steps: CustomizerStepId[] = ['basics']
  if (PASSCODE_THEMES.has(theme.id)) steps.push('passcode')
  if (QUESTION_THEMES.has(theme.id)) steps.push('question')
  if (LETTER_THEMES.has(theme.id)) steps.push('message')
  if (BOUQUET_THEMES.has(theme.id)) steps.push('bouquet')
  if (theme.supportsPhotos) steps.push('memories')
  return steps
}