import type { ExperienceConfig } from '../../types/experience'

export const defaultBirthdayGrandConfig: ExperienceConfig = {
  recipient: {
    name: 'Sophia',
  },
  sender: {
    name: 'Alex',
  },
  audio: {
    enabled: true,
    volume: 0.6,
    revealChimeNotes: [523.25, 659.25, 783.99, 1046.5, 1318.51],
    candleBlowPitch: 140,
  },
  content: {
    teaserHeading: 'Tonight, everything glows for you ✨',
    teaserSubtext:
      'This is not just a birthday wish — it is a full-scale celebration built in three acts, ending in fireworks. Sound on. Lights up.',
    suspenseHeading: 'The stage is being set…',
    suspenseSubtext:
      'Three stages. Three surprises. Light every one of them to unlock the finale.',
    countdownTagline: 'Now… make it glow.',
    revealHeading: 'The Grand Reveal',
    revealSubtext:
      'Every stage you lit is a year of moments worth making golden.',
    letterIntro: 'One extended letter for you…',
    letterLines: [
      'My dearest Sophia, if I could bottle how the world looks when you smile, I would hand you the whole sun on your birthday.',
      'Some people cheer people up. You — you rearrange the weather. Bad days have a shorter lifespan around you.',
      'I hope this next orbit gives you more of the moments you collect: laughing until it hurts, terrible dancing that we swear is choreography, and people who love you loudly.',
      'Remember every year that outgrows you? This one is yours. Own it like you own every room you greet.',
      'And when the fireworks fade, know the loudest sound of the night was simply this — how lucky I feel to know you.',
      'Today the candles are all yours. So is everything after them.',
    ],
    letterSignoff: 'Forever, loudly,',
    wishPrompt: 'Make the Final Wish',
    finalMessage: 'LET THE NIGHT BEGIN',
    finalCelebration:
      'Three stages lit. One wish sealed. Fireworks in the sky — and in my heart. Happy Birthday, Sophia.',
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=800&auto=format&fit=crop',
        alt: 'Golden birthday celebration under string lights',
        caption: 'The night is ours.',
        rotate: -4,
      },
    ],
  },
  branding: {
    accentColor: '#f5b861',
    accentSecondary: '#e8b4a0',
    emojiPrimary: '🎂',
    themeLabel: 'Birthday · Grand Celebration',
  },
  bouquet: {
    title: 'Your Celebration Bouquet 🌹',
    subtitle: 'Golden notes for every bloom you light.',
    notes: [
      { id: 'note-1', text: 'The whole sky winks at me when you walk in ✨', emoji: '🌟' },
      { id: 'note-2', text: 'Year after year, still my favourite view 💖', emoji: '🌹' },
      { id: 'note-3', text: 'You make forever feel short 🥂', emoji: '🍾' },
      { id: 'note-4', text: 'Glow level: permanently maximum 🎇', emoji: '💫' },
      { id: 'note-5', text: 'Today, the universe is on your side 🌍', emoji: '🏵️' },
      { id: 'note-6', text: 'Happy birthday to my favorite human 🎂', emoji: '🏆' },
    ],
  },
}