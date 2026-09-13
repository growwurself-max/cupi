import type { ExperienceConfig } from '../../types/experience'

export const defaultAnniversaryForeverConfig: ExperienceConfig = {
  recipient: {
    name: 'Aanya',
  },
  sender: {
    name: 'Rohan',
  },
  audio: {
    enabled: true,
    volume: 0.58,
    revealChimeNotes: [261.63, 329.63, 392, 523.25, 659.25],
    candleBlowPitch: 150,
  },
  content: {
    teaserHeading: "Every year tastes like 'forever' with you 🥂",
    teaserSubtext:
      'Spin the odometer of our years, flip through the nostalgia reel, and pop a champagne toast only you can open.',
    suspenseHeading: 'Spin the odometer',
    suspenseSubtext:
      'Every tap rolls another beautiful year into the counter. Take it all the way up.',
    countdownTagline: '…and the story keeps going.',
    revealHeading: 'Our Forever Story',
    revealSubtext:
      'Years on the odometer, gold in the glass, and still only the beginning.',
    letterIntro: 'A letter for the ages…',
    letterLines: [
      'My dearest Aanya, people keep milestones. We keep turning ours into chapters.',
      'I have counted the years the way others count blessings — slowly, carefully, and always with a little disbelief that they are mine.',
      'You loved me through the version of me that was still figuring things out, and you love me still.',
      'Every champagne pop, every golden candle, every silent moment at 2am — I replay them all like a reel I never skip.',
      'We are not the couple in the glowy photos. We are the people behind the camera laughing at the mess in the frame.',
      'So here is the forever letter: whatever the odometer says next year, this story is the one I will never stop re-reading.',
      'Happy anniversary, my dearest love. To every year — and everything still to come.',
    ],
    letterSignoff: 'Yours, chapter after chapter,',
    wishPrompt: 'Make it official',
    finalMessage: 'TO US. TO FOREVER.',
    finalCelebration:
      'The odometer rolled, the reel turned, the cork flew. And still — the story is just getting warm.',
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=800&auto=format&fit=crop',
        alt: 'Couple toasting with glasses under warm lights',
        caption: 'The first toast, again.',
        rotate: -4,
      },
      {
        src: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800&auto=format&fit=crop',
        alt: 'Polaroids lying on a wooden table',
        caption: 'The reel that never skips.',
        rotate: 4,
      },
    ],
  },
  branding: {
    accentColor: '#fcd9a6',
    accentSecondary: '#e8b4a0',
    emojiPrimary: '💕',
    themeLabel: 'Anniversary · Forever Story',
  },
  bouquet: {
    title: 'Your Toast Notes 🥂',
    subtitle: 'A note for every year you roll up on the odometer.',
    notes: [
      { id: 'note-1', text: 'Year one: I fell. Year all: still falling 🥂', emoji: '✨' },
      { id: 'note-2', text: 'Your laugh is my favourite hour 🕰️', emoji: '❤️' },
      { id: 'note-3', text: 'Home is you. Always was 🏡', emoji: '🌹' },
      { id: 'note-4', text: 'Every chapter better than the last 📖', emoji: '💞' },
      { id: 'note-5', text: 'The reel is rerunning on loop 🎞️', emoji: '💫' },
      { id: 'note-6', text: 'Forever’s not long enough with you ♾️', emoji: '🍾' },
    ],
  },
}