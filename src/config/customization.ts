import type { ExperienceMetadata } from '../types/catalog'

export type CustomizerStepId =
  | 'basics'
  | 'passcode'
  | 'question'
  | 'message'
  | 'bouquet'
  | 'memories'
  | 'moment'

/**
 * Per-theme customization schema.
 *
 * Each theme only asks for the inputs its screens actually render:
 *  - basics       every theme renders the recipient's name and the sender
 *  - passcode     special-02 gates itself behind a 4-digit date passcode
 *  - question     proposal-01/02 headline the YES moment; special-01 shows a
 *                 birthday headline wish (rendered via finalMessage)
 *  - message      the rendered letter — every theme except the two proposals,
 *                 whose screens never draw letterLines
 *  - bouquet      config.bouquet.notes pop in only in birthday-01 (bouquet
 *                 screen) and birthday-04 (teddy letter); birthday-02/03 carry
 *                 bouquet defaults but never render them
 *  - memories     photos slide in only where screens map config.content.photos
 *  - moment       the handwritten letter theme asks for one optional memory
 *                 date + memory tag instead of a photo wall
 */
const SCHEMA: Record<string, CustomizerStepId[]> = {
  'birthday-01': ['basics', 'message', 'bouquet', 'memories'],
  'birthday-02': ['basics', 'message'],
  'birthday-03': ['basics', 'message', 'memories'],
  'birthday-04': ['basics', 'message', 'bouquet'],
  'love-01': ['basics', 'message', 'moment'],
  'love-02': ['basics', 'message'],
  'anniversary-01': ['basics', 'message', 'memories'],
  'anniversary-02': ['basics', 'message', 'memories'],
  'proposal-01': ['basics', 'question'],
  'proposal-02': ['basics', 'question'],
  'friendship-01': ['basics', 'message', 'memories'],
  'friendship-02': ['basics', 'message'],
  'graduation-01': ['basics', 'message', 'memories'],
  'graduation-02': ['basics', 'message'],
  'special-01': ['basics', 'question', 'message'],
  'special-02': ['basics', 'passcode', 'message', 'memories'],
  'special-03': ['basics', 'message', 'memories'],
}

/** Safe default for unknown or newly registered themes. */
const FALLBACK_STEPS: CustomizerStepId[] = ['basics', 'message']

export function getCustomizerStepIds(
  theme: ExperienceMetadata,
): CustomizerStepId[] {
  return (
    SCHEMA[theme.id] ??
    (theme.supportsPhotos ? [...FALLBACK_STEPS, 'memories'] : FALLBACK_STEPS)
  )
}