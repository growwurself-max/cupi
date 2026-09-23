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
      'A letter that has been waiting for the perfect moment to reach you.',
    suspenseHeading: 'Come inside.',
    suspenseSubtext:
      'This letter was sealed with a little bit of courage and a lot of heart.',
    countdownTagline: 'Opening your letter…',
    revealHeading: 'There’s a reason you’re here tonight.',
    revealSubtext: 'Some things are too big for a text message.',
    letterIntro: 'for your eyes only',
    letterLines: [
      'Dear {{name}}, I have rewritten this letter seven times because words never quite do you justice.',
      'You are my favorite hello, my hardest goodbye, and every soft moment in between. Loving you is the easiest thing I have ever done.',
      'I do not need a special day to tell you this — but tonight felt like the right one. With you, every midnight feels like the start of something wonderful.',
      'Whatever tomorrow brings, I will be there — holding your hand through all of it.',
    ],
    letterSignoff: 'Forever and always,',
    wishPrompt: 'Seal with a kiss',
    finalMessage: 'All my love, forever.',
    finalCelebration:
      'I cannot wait to be the reason behind your smile — tonight and every night after.',
    memoryDate: '12.05',
    memoryTag: 'midnight talks under fairy lights',
    photos: [],
  },
  branding: {
    accentColor: '#e8b4a0',
    accentSecondary: '#f4b0c6',
    emojiPrimary: '💌',
    themeLabel: 'Love · The Letter',
  },
}