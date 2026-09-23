import type { ExperienceConfig } from '../../types/experience'

export const defaultGraduationConfig: ExperienceConfig = {
  recipient: {
    name: 'Zara',
  },
  sender: {
    name: 'Mom & Dad',
  },
  audio: {
    enabled: true,
    volume: 0.5,
    revealChimeNotes: [523.25, 659.25, 783.99, 1046.5, 1318.51],
    candleBlowPitch: 220,
  },
  content: {
    teaserHeading: 'Four years. One reel. Zero regrets.',
    teaserSubtext:
      'The late nights, the lucky pens, the seat you claimed in the back row — every frame of this reel got you here. Take the victory lap.',
    suspenseHeading: 'Rewind the highlights.',
    suspenseSubtext:
      'From moving-in day to cap-and-gown, zoom through the clips that built the ending.',
    countdownTagline: 'The main event is one breath away…',
    revealHeading: 'You did it, Grad!',
    revealSubtext:
      'Tap the cap. Throw it high. This is your victory lap.',
    letterIntro: 'A word from the proud team',
    letterLines: [
      'Dear {{name}}, we watched you carry a whole library home in one backpack and argued about it for four years. Worth it.',
      'We are not surprised you made it. We are just proud you did it your way — messy notes, stubborn dreams, and all.',
      'Wherever the tassel falls and the door opens, walk like you own the place. You did the work. Now go be brilliant.',
    ],
    letterSignoff: 'Standing and cheering,',
    wishPrompt: 'Turn the tassel',
    finalMessage: 'Class of 2026!',
    finalCelebration:
      'The tassel was worth the hassle. Now go make the world your scene.',
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop',
        alt: 'Graduation caps thrown into the air',
        caption: 'Toss one for every all-nighter.',
        rotate: -3,
      },
      {
        src: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop',
        alt: 'Row of empty desks in a lecture hall',
        caption: 'The seat that knew you best.',
        rotate: 3,
      },
      {
        src: 'https://images.unsplash.com/photo-1541123356219-284ebe98ae3b?q=80&w=800&auto=format&fit=crop',
        alt: 'Group of students celebrating with caps',
        caption: 'Same crew. Bigger chapter.',
        rotate: -2,
      },
    ],
  },
  branding: {
    accentColor: '#f5c266',
    accentSecondary: '#61e0c5',
    emojiPrimary: '🎓',
    themeLabel: 'Graduation · Victory Reel',
  },
}