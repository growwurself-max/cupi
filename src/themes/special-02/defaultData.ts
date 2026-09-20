import type { ExperienceConfig } from '../../types/experience'

export const defaultSpecialBunnyConfig: ExperienceConfig = {
  recipient: {
    name: 'Mia',
  },
  sender: {
    name: 'Rohan',
  },
  audio: {
    enabled: true,
    volume: 0.5,
    revealChimeNotes: [523.25, 659.25, 783.99, 1046.5],
    candleBlowPitch: 160,
  },
  content: {
    teaserHeading: 'A little bunny has a secret code just for you…',
    teaserSubtext:
      'Tap the hearts, pop the balloons, and find the gift that hides inside.',
    suspenseHeading: '',
    suspenseSubtext: '1234',
    countdownTagline: '',
    revealHeading: 'You cracked the code! 🎉',
    revealSubtext: '',
    letterIntro: 'The mystery gift is…',
    letterLines: [
      'Dear Mia, the passcode was easy — it has always been your smile.',
      'Every balloon I pop, every candle I light, reminds me that you are my favorite surprise.',
      'Peek inside the gift box whenever life feels heavy — it is filled with us.',
    ],
    letterSignoff: 'Your bunny,',
    wishPrompt: 'Pop a balloon',
    finalMessage: 'You make every day feel like a mystery worth solving.',
    finalCelebration: 'Here is to a hundred more balloon pops with you.',
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=800&auto=format&fit=crop',
        alt: 'A pair of hands holding sparklers',
        caption: 'Our favorite little moments.',
        rotate: -3,
      },
      {
        src: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop',
        alt: 'Warm fairy lights glowing in the dark',
        caption: 'Always glowing for you.',
        rotate: 3,
      },
    ],
  },
  branding: {
    accentColor: '#f5a623',
    accentSecondary: '#ffb5c2',
    emojiPrimary: '🐰',
    themeLabel: 'Special · Bunny Games',
  },
}