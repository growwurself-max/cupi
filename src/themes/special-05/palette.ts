/**
 * Cohesive colour system for Special #05 — the premium "Birthday Theatre".
 * Everything is drawn from a soft blush / rose / berry / champagne-gold family;
 * no neon, no flat saturated pink.
 */
export const PALETTE = {
  /** warm cream highlight */
  cream: '#FFF9F3',
  creamDeep: '#FBEEDF',
  creamShadow: '#F3DFC9',
  /** blush */
  blush: '#FCE6EE',
  blushDeep: '#F6C9DB',
  /** rose */
  rose: '#EEA6C0',
  roseMid: '#DB89AC',
  roseDeep: '#C2688C',
  /** deep berry — used for all body text */
  berry: '#6E2440',
  berrySoft: '#8C4360',
  berryFaint: '#A9748C',
  /** champagne gold accents */
  gold: '#D8B26A',
  goldLight: '#F0D9A6',
  goldDeep: '#AE8438',
  /** satin curtain tones */
  satin1: '#F7C6D8',
  satin2: '#E594B4',
  satin3: '#C56C90',
  satin4: '#9E4468',
} as const

export const GOLD_TRIM =
  'linear-gradient(180deg, #F5E1B0 0%, #D8B26A 45%, #B0893F 100%)'
