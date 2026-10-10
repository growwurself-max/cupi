import type { ExperienceConfig } from '../../types/experience'

export const defaultStarryNightConfig: ExperienceConfig = {
  recipient: {
    name: 'Luna',
  },
  sender: {
    name: 'Orion',
  },
  audio: {
    enabled: true,
    volume: 0.5,
    revealChimeNotes: [523.25, 659.25, 783.99, 1046.5],
    candleBlowPitch: 180,
  },
  content: {
    teaserHeading: 'under the stars',
    teaserSubtext:
      'Tonight the sky wrote your name in constellations. Tap the stars to reveal the message written just for you.',
    suspenseHeading: '',
    suspenseSubtext: '',
    countdownTagline: '',
    revealHeading: 'look up',
    revealSubtext: 'the universe has something to say',
    letterIntro: 'Written in the stars',
    letterLines: [
      'Every star in the sky seems to whisper your name tonight.',
      'In this vast universe, finding you was my greatest discovery.',
      'You are my moon, my sun, and every star in between.',
    ],
    letterSignoff: 'Forever yours,',
    wishPrompt: 'make a wish upon a star',
    finalMessage: 'You are my universe',
    finalCelebration: 'written in the stars forever',
    photos: [],
  },
  branding: {
    accentColor: '#6366f1',
    accentSecondary: '#a855f7',
    emojiPrimary: '✨',
    themeLabel: 'Special · Starry Night',
  },
}
