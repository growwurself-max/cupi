import type { ExperienceConfig } from '../../types/experience'

export const defaultSpecialStorybookConfig: ExperienceConfig = {
  recipient: {
    name: 'Diya',
  },
  sender: {
    name: 'Arjun',
  },
  audio: {
    enabled: true,
    volume: 0.5,
    revealChimeNotes: [659.25, 830.61, 987.77, 1318.51],
    candleBlowPitch: 140,
  },
  content: {
    teaserHeading: 'Every love story deserves a book…',
    teaserSubtext:
      'Turn the pages, pop a sentence, and meet our story written sky-wide.',
    suspenseHeading: '',
    suspenseSubtext: '',
    countdownTagline: '',
    revealHeading: 'Our story, sealed forever.',
    revealSubtext: '',
    letterIntro: 'Chapter One',
    letterLines: [
      'Dear {{name}}, once upon a time a boy met a girl and forgot his own name.',
      'Page after page, I keep writing you — in polaroids, in roses, in quiet good mornings.',
      'This wax seal is not the end. It is just where our forever begins.',
    ],
    letterSignoff: 'Yours in every chapter,',
    wishPrompt: 'Open the box',
    finalMessage: 'You are my favorite reply.',
    finalCelebration: 'You are my forever surprise',
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop',
        alt: 'Warm fairy lights glowing in the dark',
        caption: 'Page one: the beginning of us.',
        rotate: -4,
      },
      {
        src: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=800&auto=format&fit=crop',
        alt: 'Silhouette of a couple under stars',
        caption: 'The chapter we keep writing.',
        rotate: 4,
      },
      {
        src: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?q=80&w=800&auto=format&fit=crop',
        alt: 'Couple laughing together',
        caption: 'My favorite plot twist.',
        rotate: -2,
      },
    ],
  },
  branding: {
    accentColor: '#a78bfa',
    accentSecondary: '#ffb5c2',
    emojiPrimary: '📖',
    themeLabel: 'Special · Storybook',
  },
}