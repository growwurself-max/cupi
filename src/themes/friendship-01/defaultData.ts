import type { ExperienceConfig } from '../../types/experience'

export const defaultFriendshipConfig: ExperienceConfig = {
  recipient: {
    name: 'The Squad',
  },
  sender: {
    name: 'Your best friend',
  },
  audio: {
    enabled: true,
    volume: 0.5,
    revealChimeNotes: [659.25, 740, 880, 987.77],
    candleBlowPitch: 260,
  },
  content: {
    teaserHeading: 'A whole era of us.',
    teaserSubtext:
      'From zero-context memes to 2am drives, every photo in here is a tiny proof that we happened. Tap around — this one’s loud on purpose.',
    suspenseHeading: 'Squad duty: make some noise.',
    suspenseSubtext:
      'Every burst below is one inside joke we still laugh about. Mash it — that’s what it’s for.',
    countdownTagline: 'Warning: group feelings incoming…',
    revealHeading: 'You already know why.',
    revealSubtext: 'No caption needed. The vibe says it all.',
    letterIntro: 'An official squad memo',
    letterLines: [
      'To the people who have seen me at my worst and still call me first — thank you for being my whole safety net.',
      'We have cried in parking lots, lost friends we outgrew, and kept each other through every plot twist. That’s rare. That’s us.',
      'Wherever life scatters us, the group chat stays open. Squad forever is not just a phrase — it’s a contract.',
    ],
    letterSignoff: 'Always ride or die,',
    wishPrompt: 'Cheers to us',
    finalMessage: 'Squad forever.',
    finalCelebration:
      'One toast for every memory, and a thousand more we haven’t made yet.',
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=800&auto=format&fit=crop',
        alt: 'Group of friends laughing together',
        caption: 'Original trio. Legendary since day one.',
        rotate: -4,
      },
      {
        src: 'https://images.unsplash.com/photo-1543269664-56d93c1b41a6?q=80&w=800&auto=format&fit=crop',
        alt: 'Friends gathering around a table',
        caption: 'The table where all plans were made.',
        rotate: 3,
      },
      {
        src: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=800&auto=format&fit=crop',
        alt: 'Friends jumping with joy outdoors',
        caption: 'Every group photo looks like this. By law.',
        rotate: -2,
      },
    ],
  },
  branding: {
    accentColor: '#ff8a5c',
    accentSecondary: '#5cd6c8',
    emojiPrimary: '🫶',
    themeLabel: 'Friendship · Squad Forever',
  },
}