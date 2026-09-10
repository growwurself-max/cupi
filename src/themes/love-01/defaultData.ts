import type { ExperienceConfig } from '../../types/experience'

export const defaultLoveConfig: ExperienceConfig = {
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
    teaserHeading: 'Someone at midnight is thinking about you…',
    teaserSubtext:
      'Not a text. Not a call. A letter that has been waiting for the perfect moment to reach you.',
    suspenseHeading: 'One envelope. Zero excuses.',
    suspenseSubtext:
      'This letter was sealed with a little bit of courage and a lot of heart. Break the seal when you are ready.',
    countdownTagline: 'Opening your letter…',
    revealHeading: 'There’s a reason you’re here tonight.',
    revealSubtext:
      'Some things are too big for a text message. This is one of them.',
    letterIntro: 'For your eyes only',
    letterLines: [
      'Dear Ava, I have rewritten this letter seven times because words never quite do you justice.',
      'You are my favorite hello, my hardest goodbye, and every soft moment in between. Loving you is the easiest thing I have ever done.',
      'I do not need a special day to tell you this — but tonight felt like the right one. With you, every midnight feels like the start of something wonderful.',
      'Whatever tomorrow brings, I will be there — holding your hand through all of it.',
    ],
    letterSignoff: 'Forever and always,',
    wishPrompt: 'Open your heart',
    finalMessage: 'All my love, forever.',
    finalCelebration:
      'I cannot wait to be the reason behind your smile — tonight and every night after.',
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop',
        alt: 'Warm fairy lights glowing in the dark',
        caption: 'Every night with you.',
        rotate: -3,
      },
      {
        src: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=800&auto=format&fit=crop',
        alt: 'Silhouette of a couple under the stars',
        caption: 'My favorite view.',
        rotate: 3,
      },
    ],
  },
  branding: {
    accentColor: '#ff9bb3',
    accentSecondary: '#8f7bff',
    emojiPrimary: '💌',
    themeLabel: 'Love · Midnight Letter',
  },
}