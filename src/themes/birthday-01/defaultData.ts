import type { ExperienceConfig } from '../../types/experience'

export const defaultBirthdayConfig: ExperienceConfig = {
  recipient: {
    name: 'Sophia',
  },
  sender: {
    name: 'Alex',
  },
  audio: {
    enabled: true,
    volume: 0.55,
    revealChimeNotes: [523.25, 659.25, 783.99, 1046.5],
    candleBlowPitch: 140,
  },
  content: {
    teaserHeading: 'Hey Sophia… someone has something special for you ✨',
    teaserSubtext:
      'No spam. No alerts. Just a little something crafted for you. Press play when you are ready.',
    suspenseHeading: 'You ready for this?',
    suspenseSubtext:
      'Put your headphones on or turn your sound up — this one deserves to be felt, not just read.',
    countdownTagline: 'Closing in on something good…',
    revealHeading: 'Happy Birthday',
    revealSubtext:
      'Another trip around the sun, and somehow you keep making the world a little brighter.',
    letterIntro: 'So I wrote you something…',
    letterLines: [
      'Happy birthday, {{name}}. I keep trying to find the right words, but they never feel big enough for what you mean to me.',
      'You are the kind of person who makes ordinary moments feel like small adventures — laughing at nothing, staying up late for no reason, turning bad days into inside jokes.',
      'I hope this next year gives you everything you give to everyone else: patience, kindness, and a love that never runs dry.',
      'Wherever you are in the world, know that I am out here thinking of you. Today — and every day after.',
    ],
    letterSignoff: 'Forever in your corner,',
    wishPrompt: 'Make a Birthday Wish',
    finalMessage: 'Today is all about YOU',
    finalCelebration:
      'Close your eyes, make a wish, and blow. I promise it is a good one. 💫',
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800&auto=format&fit=crop',
        alt: 'Friends celebrating under warm string lights',
        caption: 'Us, being us.',
        rotate: -4,
      },
      {
        src: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=800&auto=format&fit=crop',
        alt: 'Birthday cake glowing in golden light',
        caption: 'This one is on you. 🎂',
        rotate: 4,
      },
    ],
  },
  branding: {
    accentColor: '#f6c6b6',
    accentSecondary: '#c9b8ff',
    emojiPrimary: '🎂',
    themeLabel: 'Birthday · The Odyssey',
  },
  bouquet: {
    title: 'Your Birthday Bouquet 🌹',
    subtitle:
      'Six little notes, one for every bloom. Tap each tag to make it glow.',
    notes: [
      { id: 'note-1', text: 'You make every day brighter ☀️', emoji: '🌹' },
      { id: 'note-2', text: 'My favorite person 💖', emoji: '🌸' },
      { id: 'note-3', text: 'Forever lucky to have you 🥺', emoji: '🌷' },
      { id: 'note-4', text: 'The best part of my story 💫', emoji: '🍀' },
      { id: 'note-5', text: 'Your laugh fixes my Mondays 😄', emoji: '🌺' },
      { id: 'note-6', text: 'Happy birthday to my favorite human 🎂', emoji: '🏵️' },
    ],
  },
}