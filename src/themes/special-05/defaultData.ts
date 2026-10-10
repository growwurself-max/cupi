import type { ExperienceConfig } from '../../types/experience'

/**
 * Default content for Special #05 — the premium "Birthday Theatre" experience.
 *
 * Every customization field key is preserved (teaser*, suspense*, countdown*,
 * reveal*, letter*, wishPrompt, final*, photos, memoryDate, memoryTag) so the
 * customizer and share-link hydration keep working unchanged. Only the copy and
 * branding were re-tuned for the hand-crafted theatre theme.
 */
export const defaultStarryNightConfig: ExperienceConfig = {
  recipient: {
    name: 'Someone Special',
  },
  sender: {
    name: 'Someone Who Loves You',
  },
  audio: {
    enabled: true,
    volume: 0.5,
    revealChimeNotes: [523.25, 659.25, 783.99, 1046.5],
    candleBlowPitch: 180,
  },
  content: {
    teaserHeading: 'preparing something personal',
    teaserSubtext:
      'Someone has created something beautiful especially for you.',
    suspenseHeading: 'The stage is waiting for you',
    suspenseSubtext: 'Tap each little light and watch the theatre wake up.',
    countdownTagline: 'Happy Birthday',
    revealHeading: 'Look what floated in for you',
    revealSubtext: 'A few of these balloons are hiding a secret.',
    letterIntro: 'A note tucked inside the programme',
    letterLines: [
      'Every year with you feels like a celebration worth dressing up for.',
      'You turn ordinary days into a stage lit just for the two of us.',
      'So tonight the whole theatre is yours. Curtain up — because of you.',
    ],
    letterSignoff: 'With all my love,',
    wishPrompt: 'Press and hold to make your wish',
    finalMessage: 'You are the whole show',
    finalCelebration: 'Happy Birthday — here is to your encore',
    photos: [],
    memoryDate: '',
    memoryTag: '',
  },
  branding: {
    accentColor: '#c2688c',
    accentSecondary: '#d8b26a',
    emojiPrimary: '🎀',
    themeLabel: 'Special · Birthday Theatre',
  },
}
