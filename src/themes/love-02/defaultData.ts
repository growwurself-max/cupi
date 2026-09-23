import type { ExperienceConfig } from '../../types/experience'

export const defaultLoveEternalConfig: ExperienceConfig = {
  recipient: {
    name: 'Mira',
  },
  sender: {
    name: 'Arjun',
  },
  audio: {
    enabled: true,
    volume: 0.58,
    revealChimeNotes: [392, 523.25, 659.25, 783.99, 987.77, 1174.66],
    candleBlowPitch: 160,
  },
  content: {
    teaserHeading: 'The stars arranged themselves for you 💫',
    teaserSubtext:
      'A romantic score. A constellation only you can draw. A wax seal holding something I have carried for too long.',
    suspenseHeading: 'Trace the constellation to unlock the letter',
    suspenseSubtext:
      'Tap every star in order. When the last one glows, the sky breaks open.',
    countdownTagline: 'Almost there…',
    revealHeading: 'My heart, eternal',
    revealSubtext:
      'Every star you lit is a promise I intend to keep.',
    letterIntro: 'I have been carrying these words…',
    letterLines: [
      '{{name}}, there is a version of me that exists only when you are near — softer, braver, more alive. I want you to meet him properly.',
      'I have loved you quietly and then loudly, in the small hours and in the messiest moments. It never once went the other way.',
      'You are not the peace I was looking for. You are the calm that makes the noise worth living through.',
      'If love were a constellation, ours would be the brightest one — drawn fast, by two clumsy hands, and beautiful anyway.',
      'So here, finally, is the confession: I am yours. In every future I can imagine, in every sky I might look up at, I am yours.',
      'No more sealed words. From now on, I am going to say it where you can hear it — loud enough for the stars to know.',
    ],
    letterSignoff: 'Forever drawn to you,',
    wishPrompt: 'Give your heart',
    finalMessage: 'YOURS, IN EVERY SKY',
    finalCelebration:
      'The constellation is complete — and so is this. Every star now points home: to you.',
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=800&auto=format&fit=crop',
        alt: 'Two people watching a starry night sky',
        caption: 'Every night, same stars.',
        rotate: -3,
      },
    ],
  },
  branding: {
    accentColor: '#a78bfa',
    accentSecondary: '#c9b8ff',
    emojiPrimary: '❤️',
    themeLabel: 'Love · Eternal',
  },
  bouquet: {
    title: 'Your Star Notes ✨',
    subtitle: 'Little constellations of words, one for every star you lit.',
    notes: [
      { id: 'note-1', text: 'You are my favourite solstice ☀️', emoji: '✨' },
      { id: 'note-2', text: 'Two hearts, one orbit 💞', emoji: '💖' },
      { id: 'note-3', text: 'I’d cross every sky for you 🌌', emoji: '🌙' },
      { id: 'note-4', text: 'The calm in my chaos 🥰', emoji: '🌸' },
      { id: 'note-5', text: 'Home is wherever you breathe 🏠', emoji: '🌹' },
      { id: 'note-6', text: 'Forever starts tonight 💫', emoji: '💍' },
    ],
  },
}