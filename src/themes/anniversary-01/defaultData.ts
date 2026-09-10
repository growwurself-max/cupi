import type { ExperienceConfig } from '../../types/experience'

export const defaultAnniversaryConfig: ExperienceConfig = {
  recipient: {
    name: 'Serena',
  },
  sender: {
    name: 'Rehan',
  },
  audio: {
    enabled: true,
    volume: 0.5,
    revealChimeNotes: [659.25, 783.99, 987.77, 1318.51],
    candleBlowPitch: 160,
  },
  content: {
    teaserHeading: 'A keepsake, saved just for us.',
    teaserSubtext:
      'Every year with you deserves a box of its own. This one has been filled with the small things that became our everything.',
    suspenseHeading: 'The key is in your hands.',
    suspenseSubtext:
      'Turn the golden key, lift the lid, and let the years pour out — one memory at a time.',
    countdownTagline: 'Unlocking something beautiful…',
    revealHeading: 'Happy Anniversary',
    revealSubtext:
      'Years together, and you still manage to feel brand new.',
    letterIntro: 'From the box, for you',
    letterLines: [
      'Dear Serena, we started as strangers, stumbled into friends, and ended up here — building a home out of ordinary Tuesdays.',
      'Every year I love you a little more, and I did not think that was possible. Thank you for the laughter, the slow mornings, and the way you hold my hand through everything.',
      'The years ahead are just more chances to be us. I cannot wait for not one more.',
    ],
    letterSignoff: 'Through every year,',
    wishPrompt: 'Make a wish together',
    finalMessage: 'Here’s to forever.',
    finalCelebration:
      'Light the candle with me — one flame for every year we’ve made ours.',
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1516718615083-59c3be1c4afc?q=80&w=800&auto=format&fit=crop',
        alt: 'Stack of vintage photographs and letters',
        caption: 'Where it all began.',
        rotate: -4,
      },
      {
        src: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=800&auto=format&fit=crop',
        alt: 'Couple holding hands at golden hour',
        caption: 'Golden hour, golden us.',
        rotate: 4,
      },
    ],
  },
  branding: {
    accentColor: '#f5b861',
    accentSecondary: '#e8924a',
    emojiPrimary: '🎁',
    themeLabel: 'Anniversary · Memory Box',
  },
}