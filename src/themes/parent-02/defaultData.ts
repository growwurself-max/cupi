import type { ExperienceConfig } from '../../types/experience'

export const defaultParentMomConfig: ExperienceConfig = {
  recipient: {
    name: 'Mom',
  },
  sender: {
    name: 'Your Child',
  },
  audio: {
    enabled: true,
    volume: 0.5,
    revealChimeNotes: [523.25, 659.25, 783.99, 880],
    candleBlowPitch: 140,
  },
  content: {
    teaserHeading: 'For the woman who made my world beautiful...',
    teaserSubtext: 'A special birthday surprise awaits. Open your surprise.',
    suspenseHeading: 'My first home.',
    suspenseSubtext: 'My forever comfort.',
    countdownTagline: 'Closing in on something good…',
    revealHeading: 'Every home has a heart.',
    revealSubtext: 'Ours is you. 👑',
    letterIntro: 'A Letter For My Mom',
    letterLines: [
      'Dear Mom,',
      '',
      'Happy Birthday to the most wonderful woman in my life. Thank you for your endless love, care and support.',
      '',
      'You have always been there for me, and I can never fully express how grateful I am to have you as my mother.',
      '',
      'With lots of love,',
      '{{name}}',
    ],
    letterSignoff: 'With love,',
    wishPrompt: 'Make a Birthday Wish',
    finalMessage: 'I love you, Mom. ❤️',
    finalCelebration: 'Happy Birthday, Mom! 🌷',
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1542513212-6249a5ad6754?q=80&w=800&auto=format&fit=crop',
        alt: 'Mother and child moment',
        caption: 'A beautiful memory 🌸',
        rotate: -3,
      },
      {
        src: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=800&auto=format&fit=crop',
        alt: 'Precious family moment',
        caption: 'I\'ll cherish this forever',
        rotate: 3,
      },
    ],
  },
  branding: {
    accentColor: '#f9a8c9',
    accentSecondary: '#fff0f3',
    emojiPrimary: '🌷',
    themeLabel: 'My Queen · Mom\'s Birthday',
  },
  bouquet: {
    title: 'Because Of You',
    subtitle: 'Three things I love about you.',
    notes: [
      { id: 'note-1', text: 'Your Love', emoji: '❤️' },
      { id: 'note-2', text: 'Your Care', emoji: '🌸' },
      { id: 'note-3', text: 'Your Home', emoji: '🏡' },
    ],
  },
}
