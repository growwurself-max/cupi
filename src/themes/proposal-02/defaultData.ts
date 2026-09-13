import type { ExperienceConfig } from '../../types/experience'

export const defaultProposalGreatestConfig: ExperienceConfig = {
  recipient: {
    name: 'Ishaan',
  },
  sender: {
    name: 'Kiara',
  },
  audio: {
    enabled: true,
    volume: 0.62,
    revealChimeNotes: [329.63, 392, 523.25, 659.25, 783.99, 1046.5],
    candleBlowPitch: 150,
  },
  content: {
    teaserHeading: 'Step into the spotlight… 💍',
    teaserSubtext:
      'A quiet door. A drumming heart. Three promises to make, one question to answer, and fireworks waiting on your yes.',
    suspenseHeading: 'The greatest buildup is almost over',
    suspenseSubtext:
      'Every promise you light brings the moment one breath closer. The spotlight is already finding you.',
    countdownTagline: '…still listening?',
    revealHeading: 'One question. Forever ahead.',
    revealSubtext:
      'Golden fireworks for one golden answer.',
    letterIntro: 'Before I ask…',
    letterLines: [
      'Ishaan, I have imagined this moment in a hundred different rooms, and in every one of them, you said yes.',
      'I did not fall for the version of you that tries. I fell for the you that forgets to try — the real one, unguarded and good.',
      'I want the boring Tuesdays. The tantrums over groceries. The 3am conversations that start nowhere and end everywhere.',
      'I am not asking for a ring on a finger. I am asking for a ring in a story we keep writing together.',
      'So here it is, under the spotlight, with my whole nervous heart in my throat.',
      'Will you make me the luckiest person in the world — every day, for the rest of our lives?',
    ],
    letterSignoff: 'Down on one knee,',
    wishPrompt: 'Say Yes',
    finalMessage: 'WILL YOU?',
    finalCelebration:
      'Golden fireworks are already in the air. But they are nothing next to what your yes just did to my heart.',
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop',
        alt: 'A ring box glowing in warm golden light',
        caption: 'It only ever held this.',
        rotate: -3,
      },
    ],
  },
  branding: {
    accentColor: '#f5b861',
    accentSecondary: '#e8b4a0',
    emojiPrimary: '💍',
    themeLabel: 'Proposal · The Greatest Yes',
  },
  bouquet: {
    title: 'Your Promise Notes 💍',
    subtitle: 'A note pinned to every promise you make.',
    notes: [
      { id: 'note-1', text: 'I choose you. Every quiet Tuesday 💍', emoji: '✨' },
      { id: 'note-2', text: 'You are my favorite yes 🥹', emoji: '💖' },
      { id: 'note-3', text: 'Forever starts when you do 💫', emoji: '🌟' },
      { id: 'note-4', text: 'Home is your heartbeat 🏠', emoji: '🌹' },
      { id: 'note-5', text: 'I keep every promise I make you 🤞', emoji: '💍' },
      { id: 'note-6', text: 'Under this sky: you, me, forever 🎇', emoji: '🏵️' },
    ],
  },
}