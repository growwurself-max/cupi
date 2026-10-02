import type { ExperienceConfig } from '../../types/experience'

export const defaultParentDadConfig: ExperienceConfig = {
  recipient: {
    name: 'Dad',
  },
  sender: {
    name: 'Your Son',
  },
  audio: {
    enabled: true,
    volume: 0.35,
    revealChimeNotes: [392, 523.25, 659.25, 783.99],
    candleBlowPitch: 140,
  },
  content: {
    // Screen 1: Cinematic Opening
    teaserHeading: 'FOR THE MAN WHO TAUGHT ME MORE THAN HE KNOWS',
    teaserSubtext: 'A little something from your son',
    
    // Screen 2: The Portrait
    suspenseHeading: 'Dad.',
    suspenseSubtext: 'I may not say it often, but so much of who I am today comes from you.',
    
    // Screen 3: His Story
    revealHeading: 'The things you taught me',
    revealSubtext: '',
    
    // Screen 4: I Understand It Now
    countdownTagline: 'When I was younger, I didn\'t always understand it.',
    
    // Screen 5: Memory
    letterIntro: 'Some of my favorite memories have you in them.',
    
    // Screen 6: Personal Letter
    letterLines: [
      'Dear Dad,',
      '',
      'I don\'t always find the right words to say how much you mean to me.',
      '',
      'As I\'ve grown older, I\'ve started to understand more of the things you did for our family and the sacrifices you made without expecting anything in return.',
      '',
      'A lot of what I am today comes from the values you gave me, sometimes through your words and sometimes simply through the way you lived.',
      '',
      'Thank you for always being there, for believing in me, and for showing me what responsibility, strength and family really mean.',
      '',
      'I hope I can make you proud.',
      '',
      'Happy Birthday, Dad.',
      '',
      'With love,',
      '{{name}}',
    ],
    letterSignoff: 'With love,',
    
    // Screen 7: Things I Don't Say Enough
    wishPrompt: 'Things I don\'t say enough',
    
    // Screen 8: Birthday Moment
    finalMessage: 'Here\'s to another year of good health, happiness and moments worth remembering.',
    finalCelebration: 'You deserve a beautiful year ahead.',
    
    // Screen 9: Final
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1200&auto=format&fit=crop',
        alt: 'Father and child moment',
        caption: 'One of my favorite memories',
        rotate: 0,
      },
      {
        src: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1200&auto=format&fit=crop',
        alt: 'Precious family moment',
        caption: 'A moment I\'ll always treasure',
        rotate: 0,
      },
      {
        src: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=1200&auto=format&fit=crop',
        alt: 'Family together',
        caption: 'These moments stay with me',
        rotate: 0,
      },
    ],
  },
  branding: {
    accentColor: '#c9a959',
    accentSecondary: '#1a1f2e',
    emojiPrimary: '',
    themeLabel: 'For Dad · A Birthday Surprise',
  },
  bouquet: {
    title: 'The things you taught me',
    subtitle: '',
    notes: [
      { id: 'note-1', text: 'To keep going when things don\'t go as planned.', emoji: '' },
      { id: 'note-2', text: 'To take responsibility for the people I care about.', emoji: '' },
      { id: 'note-3', text: 'To stay grounded, no matter where life takes me.', emoji: '' },
    ],
  },
}
