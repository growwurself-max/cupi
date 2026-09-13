import type { ExperienceConfig } from '../../types/experience'

export const defaultGraduationChapterConfig: ExperienceConfig = {
  recipient: {
    name: 'Ananya',
  },
  sender: {
    name: 'The Squad',
  },
  audio: {
    enabled: true,
    volume: 0.6,
    revealChimeNotes: [523.25, 659.25, 783.99, 1046.5, 1318.51],
    candleBlowPitch: 150,
  },
  content: {
    teaserHeading: 'HONOR ROLL ANNOUNCEMENT 🎓',
    teaserSubtext:
      'This doubt has been formally closed. Ananya, we are staging a tiny graduation — a cap toss, confetti, and an official recognition of your stubborn excellence.',
    suspenseHeading: 'Recognition pending…',
    suspenseSubtext:
      'The committee (us) has discussed, drawn diagrams, and argued with you. Decision confirmed: pure honor roll energy.',
    countdownTagline: '…ceremony begins now',
    revealHeading: 'GRADUATION CHAPTER',
    revealSubtext:
      'This is the "cap in the air" part. Somewhere between nonsense and all-nighters, you graduated.',
    letterIntro: 'Dear Ananya,',
    letterLines: [
      'You aced the exams, the panic, and the group-project damage control where you did everything. That deserves a ceremony.',
      'Nobody else could pull off juggling a thesis, a side hustle, and still making time to roast us. Legend behavior.',
      'We have watched you turn "maybe it won‘t work" into a milestone. That is the whole graduation in one sentence.',
      'Today we celebrate every all-nighter, every re-take, every "I will figure it out." You always did.',
      'The squad graduated the day you dragged us through. Now go collect the glory — you earned every bit of this confetti.',
      'Congratulations, Ananya. The future is terrified of you, in a good way.',
    ],
    letterSignoff: 'Your personal fan club,',
    wishPrompt: 'Tap to toss the cap',
    finalMessage: 'CONGRATULATIONS, GRADUATE 🎓',
    finalCelebration:
      'Application of confetti: complete. Cap toss: 10/10. Your next chapter is officially open — bookmark it.',
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop',
        alt: 'Graduates throwing caps in celebration',
        caption: 'Cap toss: 10/10, in practice.',
        rotate: 3,
      },
    ],
  },
  branding: {
    accentColor: '#e0b24b',
    accentSecondary: '#a8d8c0',
    emojiPrimary: '🎓',
    themeLabel: 'Graduation · Graduation Chapter',
  },
  bouquet: {
    title: 'Squad Notes & Confetti Bits 🐯',
    subtitle: 'Sticky notes crashed the ceremony.',
    notes: [
      { id: 'note-1', text: 'You survived stats AND me 🚀', emoji: '🎓' },
      { id: 'note-2', text: 'Somehow the smartest and the silliest 💛', emoji: '🏆' },
      { id: 'note-3', text: 'Road trips: graduation reserved 🚗', emoji: '🎉' },
      { id: 'note-4', text: 'Future CEO energy, present me friend 📈', emoji: '✨' },
      { id: 'note-5', text: 'Confetti proof: this note ✂️', emoji: '🎊' },
      { id: 'note-6', text: 'Official title: legend 🐯', emoji: '👑' },
    ],
  },
}