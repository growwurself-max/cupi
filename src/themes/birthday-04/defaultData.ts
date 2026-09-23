import type { ExperienceConfig } from '../../types/experience'

export const defaultBirthdayTeddyConfig: ExperienceConfig = {
  recipient: {
    name: 'Sophia',
  },
  sender: {
    name: 'Alex',
  },
  audio: {
    enabled: true,
    volume: 0.55,
    revealChimeNotes: [523.25, 659.25, 783.99, 1046.5, 1318.51],
    candleBlowPitch: 140,
  },
  content: {
    teaserHeading: 'Psst... someone sent a tiny messenger on a secret mission for you',
    teaserSubtext:
      'A cuddly teddy bear has been sent to make your birthday extra special. He has been waiting just for you. Are you ready to meet him?',
    suspenseHeading: 'Teddy has a huge surprise for you…',
    suspenseSubtext: 'Are you ready to see it?',
    countdownTagline: 'Teddy is shaking the gift faster and faster…',
    revealHeading: 'HAPPY BIRTHDAY',
    revealSubtext:
      'Another year of you — softer, braver, and still the best part of every story.',
    letterIntro: 'A letter, from me to you',
    letterLines: [
      'Happy birthday, {{name}}. I tried to put words around what you mean to me, and then I remembered — some things are too bright to fit inside sentences.',
      'You make ordinary days feel like a film I never want to pause: your laugh, your terrible dance moves, the way you cheer loudest for everyone else.',
      'I hope this year hands you back a little of everything you keep giving away — patience, courage, and people who love you in the same loud, full-hearted way you love them.',
      'Wherever this year takes you, remember the version of you I get to witness: the one who turns strangers into friends and bad days into stories.',
      'So here it is, stood proudly in a pink sky — a tiny piece of my heart, built just for you. Today the candles are yours.',
      'And after them, so is everything good that is still coming your way.',
    ],
    letterSignoff: 'Forever in your corner,',
    wishPrompt: 'Make your wish',
    finalMessage: 'The best is yet to come',
    finalCelebration:
      'You just blew out the candle with every memory you have ever collected. The universe heard it. Happy birthday — here is to the year you were always meant to have.',
    photos: [],
  },
  branding: {
    accentColor: '#F43F5E',
    accentSecondary: '#FB7185',
    emojiPrimary: '🧸',
    themeLabel: 'Birthday · Teddy Celebration Édition',
  },
  bouquet: {
    title: 'Teddy\'s Little Notes',
    subtitle: 'Tap each note to make it glow.',
    notes: [
      { id: 'note-1', text: 'You are so special ✨', emoji: '✨' },
      { id: 'note-2', text: 'Always smiling ☀️', emoji: '☀️' },
      { id: 'note-3', text: 'Pure sunshine 🌸', emoji: '🌸' },
      { id: 'note-4', text: 'Best soul 💖', emoji: '💖' },
    ],
  },
}
