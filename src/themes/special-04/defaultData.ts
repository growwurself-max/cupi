import type { ExperienceConfig } from '../../types/experience'

export const defaultGoodMorningConfig: ExperienceConfig = {
  recipient: {
    name: 'Ava',
  },
  sender: {
    name: 'Noah',
  },
  audio: {
    enabled: true,
    volume: 0.5,
    revealChimeNotes: [523.25, 659.25, 783.99, 1046.5],
    candleBlowPitch: 180,
  },
  content: {
    teaserHeading: 'a beautiful beginning',
    teaserSubtext:
      'The sun came up this morning with you in mind. Take a quiet moment — this one is yours.',
    suspenseHeading: '',
    suspenseSubtext: '',
    countdownTagline: '',
    revealHeading: 'good morning',
    revealSubtext: 'a gentle, golden beginning',
    letterIntro: 'For a beautiful day ahead',
    letterLines: [
      'Dear {{name}}, the sun came up this morning with you in mind.',
      'Wake gently. Breathe slowly. Let the light find you.',
      'A good day is already yours — go ahead and claim it.',
    ],
    letterSignoff: 'Wishing you the brightest day,',
    wishPrompt: '',
    finalMessage: 'Good Morning',
    finalCelebration: 'a gentle, golden beginning',
    photos: [],
  },
  branding: {
    accentColor: '#f6a33c',
    accentSecondary: '#f8c47a',
    emojiPrimary: '☀️',
    themeLabel: 'Special · Good Morning',
  },
}