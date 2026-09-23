import type { ExperienceConfig } from '../../types/experience'

export const defaultBirthdayMomentsConfig: ExperienceConfig = {
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
    teaserHeading: 'Someone wrapped the whole sky in pink for you ✨',
    teaserSubtext:
      'A premium birthday story built around your favourite moments — photos, confetti, and every word meant just for you. Sound on. Lights up. Ready?',
    suspenseHeading: 'The moment is almost yours',
    suspenseSubtext:
      'A few heartbeats… then the whole sky lights up — with the memories we collected together.',
    countdownTagline: 'Close your eyes and feel it build…',
    revealHeading: 'Happy Birthday',
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
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800&auto=format&fit=crop',
        alt: 'Friends laughing under warm string lights',
        caption: 'Us, being us.',
        rotate: -4,
      },
      {
        src: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=800&auto=format&fit=crop',
        alt: "A birthday cake glowing in golden light — this one's yours",
        caption: 'This one is on you. 🎂',
        rotate: 4,
      },
      {
        src: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=800&auto=format&fit=crop',
        alt: 'Golden birthday celebration with balloons',
        caption: 'Our golden hour. ✨',
        rotate: -2,
      },
      {
        src: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?q=80&w=800&auto=format&fit=crop',
        alt: 'Confetti floating over a sunset celebration',
        caption: 'Confetti, always. 🎊',
        rotate: 3,
      },
    ],
  },
  branding: {
    accentColor: '#f9a8c9',
    accentSecondary: '#c4b5fd',
    emojiPrimary: '🎂',
    themeLabel: 'Birthday · Moments Édition',
  },
  bouquet: {
    title: 'Your Birthday Bouquet 🌷',
    subtitle:
      'Six little notes, one for every bloom. Tap each tag to make it glow.',
    notes: [
      { id: 'note-1', text: 'Your laugh is my favourite sound 💖', emoji: '🌷' },
      { id: 'note-2', text: 'The best part of every photo 📸', emoji: '🌸' },
      { id: 'note-3', text: 'You make soft days feel bright ☀️', emoji: '🌼' },
      { id: 'note-4', text: 'Still my favourite view, year after year 💫', emoji: '🌹' },
      { id: 'note-5', text: 'People glow around you — it is science 🥺', emoji: '🍀' },
      { id: 'note-6', text: 'Happy birthday to my favourite human 🎂', emoji: '🏵️' },
    ],
  },
}