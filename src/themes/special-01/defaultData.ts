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
    teaserHeading: 'Someone drew a target around your smile…',
    teaserSubtext:
      'One pull of the bow, one floating heart, one wish made just for you.',
    suspenseHeading: '',
    suspenseSubtext: '',
    countdownTagline: '',
    revealHeading: 'Wishes bloom where hearts touch.',
    revealSubtext: '',
    letterIntro: 'For your eyes only',
    letterLines: [
      'Dear Ava, I aimed an arrow at the sky, but it always lands back on you.',
      'You are the heartbeat this little tree was waiting for.',
      'Close your eyes, make a wish — and watch it bloom.',
    ],
    letterSignoff: 'Always yours,',
    wishPrompt: 'Make a wish',
    finalMessage: 'You + me, a forever in bloom.',
    finalCelebration: 'Here is to every wish that still has your name on it.',
    photos: [],
  },
  branding: {
    accentColor: '#ff5c8a',
    accentSecondary: '#ffd9a6',
    emojiPrimary: '🏹',
    themeLabel: 'Special · Heart Bloom',
  },
}