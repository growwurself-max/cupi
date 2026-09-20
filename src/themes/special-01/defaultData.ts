import type { ExperienceConfig } from '../../types/experience'

export const defaultSpecialHeartBloomConfig: ExperienceConfig = {
  recipient: {
    name: 'Ava',
  },
  sender: {
    name: 'Noah',
  },
  audio: {
    enabled: true,
    volume: 0.5,
    revealChimeNotes: [659.25, 830.61, 987.77, 1318.51],
    candleBlowPitch: 180,
  },
  content: {
    teaserHeading: 'a little something for you',
    teaserSubtext:
      'I strung this bow for you. Pull it back, hold your breath, and let the arrow find its heart.',
    suspenseHeading: '',
    suspenseSubtext: '',
    countdownTagline: '',
    revealHeading: 'make a wish...',
    revealSubtext: 'to someone worth celebrating',
    letterIntro: 'For your eyes only',
    letterLines: [
      'Dear Ava, today the whole sky bows to you — every star, every heartbeat, every quiet beginning.',
      'You have a way of turning ordinary days into something worth celebrating.',
      'Close your eyes, make a wish, and watch it bloom.',
    ],
    letterSignoff: 'Always yours,',
    wishPrompt: 'make it count',
    finalMessage: 'Happy Birthday',
    finalCelebration: 'to a year that blooms',
    photos: [],
  },
  branding: {
    accentColor: '#ff8296',
    accentSecondary: '#f9b16e',
    emojiPrimary: '🏹',
    themeLabel: 'Special · Heart Bloom',
  },
}