import type { ExperienceConfig } from '../../types/experience'

export const defaultFriendshipBroadcastConfig: ExperienceConfig = {
  recipient: {
    name: 'Zara',
  },
  sender: {
    name: 'Nikhil',
  },
  audio: {
    enabled: true,
    volume: 0.6,
    revealChimeNotes: [440, 554.37, 659.25, 880, 1108.73],
    candleBlowPitch: 150,
  },
  content: {
    teaserHeading: 'INCOMING TRANSMISSION 📡',
    teaserSubtext:
      'This is a friendship ALERT. A chaos broadcast is on the way — stickers, a super high-five, and a bestie letter with zero chill.',
    suspenseHeading: 'Translation: I love you, bestie',
    suspenseSubtext:
      'In friendship terms: you are my favorite notification. Prepare yourself.',
    countdownTagline: '…drops in 3, 2, 1',
    revealHeading: 'BESTIE BROADCAST',
    revealSubtext:
      'Broadcast received. Friendship confirmed. Chaos level: maximum.',
    letterIntro: 'A note, real talk…',
    letterLines: [
      '{{name}}, you are the first person I text and the last person I judge (almost never). That is basically a lifelong contract.',
      'We have laughed at nothing so much that I have permanent abs theory. We have cried about things that genuinely matter, and you never made me feel small for it.',
      'You keep my secrets like they are your own library — untouchable and slightly chaotic.',
      'Some people are an acquired taste. You are my safe place that also somehow enables my worst decisions. Perfect match.',
      'So this is the bestie letter: stay this unhinged, stay this kind, stay mine. I have your back forever.',
      'Also, do not delete this. Screenshot it. Framing is suggested.',
    ],
    letterSignoff: 'Your ride-or-die,',
    wishPrompt: 'High-five to seal',
    finalMessage: 'BESTIES. OFFICIALLY. 👑',
    finalCelebration:
      'Broadcast delivered, sticker residue cleaned up, high-five recorded. Friendship contract signed in emoji.',
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=800&auto=format&fit=crop',
        alt: 'Group of friends laughing together outdoors',
        caption: 'Us, being the loudest.',
        rotate: -4,
      },
    ],
  },
  branding: {
    accentColor: '#ff8a5c',
    accentSecondary: '#e8b4a0',
    emojiPrimary: '👋',
    themeLabel: 'Friendship · Bestie Broadcast',
  },
  bouquet: {
    title: 'Your Bestie Notes 🍕',
    subtitle: 'Sticky notes pinned to the broadcast feed.',
    notes: [
      { id: 'note-1', text: 'You know too much. You stay anyway 💖', emoji: '🍕' },
      { id: 'note-2', text: 'My therapist is literally you 🛋️', emoji: '😄' },
      { id: 'note-3', text: 'No plans with us is still plans 🤪', emoji: '🎉' },
      { id: 'note-4', text: 'I would share my fries with you 🍟', emoji: '💛' },
      { id: 'note-5', text: 'Inside jokes: infinite 🃏', emoji: '✨' },
      { id: 'note-6', text: 'Bestie for life, legally binding 📜', emoji: '👑' },
    ],
  },
}