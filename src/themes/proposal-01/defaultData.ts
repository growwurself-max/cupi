import type { ExperienceConfig } from '../../types/experience'

export const defaultProposalConfig: ExperienceConfig = {
  recipient: {
    name: 'Aaliyah',
  },
  sender: {
    name: 'Arham',
  },
  audio: {
    enabled: true,
    volume: 0.5,
    revealChimeNotes: [523.25, 659.25, 783.99, 1046.5],
    candleBlowPitch: 480,
  },
  content: {
    teaserHeading: 'Some moments are worth the whole universe.',
    teaserSubtext:
      'Every star, every late-night talk, every silly argument we won together — they all led to one question I have only ever wanted to ask you.',
    suspenseHeading: 'Close your eyes… feel our heartbeat.',
    suspenseSubtext:
      'One heartbeat for every time I almost said it out loud. Tap the heart, let it beat for us.',
    countdownTagline: 'The question of all questions…',
    revealHeading: 'It was always going to be you.',
    revealSubtext:
      'A tiny box. One question. Zero doubts.',
    letterIntro: 'If I could write it forever,',
    letterLines: [
      'Dear {{name}}, I have imagined this moment in a hundred different tomorrows, and it always looks the same — you, smiling, saying yes.',
      'You make ordinary days feel like beginnings. You are my favorite thought, my safest place, and my wildest dream all at once.',
      'I am not asking because the timing is perfect. I am asking because everything about my life points to you, and it always has.',
    ],
    letterSignoff: 'Down on one knee,',
    wishPrompt: 'Make it official',
    finalMessage: 'You said YES!',
    finalCelebration:
      'This box was the beginning — the rest of our story starts right here, right now.',
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=800&auto=format&fit=crop',
        alt: 'Couple holding hands against a sunset',
        caption: 'Every step led here.',
        rotate: -3,
      },
    ],
  },
  branding: {
    accentColor: '#ffb3ba',
    accentSecondary: '#f6c6b6',
    emojiPrimary: '💍',
    themeLabel: 'Proposal · The Big Question',
  },
}