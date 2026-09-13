import type { Category, ThemeMetadata } from '../types/catalog'

export const categories: Category[] = [
  {
    id: 'birthday',
    name: 'Birthday',
    emoji: '🎂',
    description: 'Candle-lit confetti and wishes come true.',
    count: 1,
  },
  {
    id: 'love',
    name: 'Love',
    emoji: '❤️',
    description: 'Say it loud, straight from the heart.',
    count: 1,
  },
  {
    id: 'anniversary',
    name: 'Anniversary',
    emoji: '💕',
    description: 'Another beautiful year, another story.',
    count: 1,
  },
  {
    id: 'proposal',
    name: 'Proposal',
    emoji: '💍',
    description: 'The one question that changes everything.',
    count: 1,
  },
  {
    id: 'friendship',
    name: 'Friendship',
    emoji: '👋',
    description: 'For the ones who feel like home.',
    count: 1,
  },
  {
    id: 'graduation',
    name: 'Graduation',
    emoji: '🎓',
    description: 'Mark the climb, celebrate the milestone.',
    count: 1,
  },
]

const FEATURE_SOUND = { id: 'sound', label: '🎵 Sound Enabled' }
const FEATURE_CONFETTI = { id: 'confetti', label: '✨ Confetti Reveal' }
const FEATURE_PHOTOS = { id: 'photos', label: '📸 Photos & Letter' }
const FEATURE_CANDLE = { id: 'candle', label: '🎂 Interactive Candle' }
const FEATURE_UNLOCK = { id: 'unlock', label: '🗝️ Unlock Ritual' }
const FEATURE_RINGBOX = { id: 'ringbox', label: '💍 Interactive Ring Box' }
const FEATURE_SQUAD = { id: 'squad', label: '💥 Squad Micro-Interactions' }
const FEATURE_RECORD =
  { id: 'vhs', label: '📼 Highlight Reel & Cap Toss' }
const FEATURE_LETTER = { id: 'letter', label: '💌 Digital Love Letter' }

export const themes: ThemeMetadata[] = [
  {
    id: 'birthday-01',
    categoryId: 'birthday',
    name: 'Birthday Surprise #01',
    tagline: 'Confetti, candle, wish.',
    description:
      'A six-act cinematic surprise: a teaser, a little suspense, a countdown, a confetti reveal, memories in polaroids, and an interactive candle only you can blow out.',
    emoji: '🎂',
    gradient: 'linear-gradient(135deg, #f6c6b6 0%, #e0b3f2 45%, #c9b8ff 100%)',
    price: '₹9',
    amountInPaise: 900,
    features: [FEATURE_SOUND, FEATURE_CONFETTI, FEATURE_PHOTOS, FEATURE_CANDLE],
    tags: ['Cinematic', '6 Acts', 'Sendable Link'],
    status: 'available',
    isAvailable: true,
    badge: 'BESTSELLER',
  },
  {
    id: 'love-01',
    categoryId: 'love',
    name: 'Midnight Love Letter',
    tagline: 'Say it loudly, softly.',
    description:
      'A six-act love letter sealed like a wax stamp — a glowing teaser, a wax seal to crack, a candlelit countdown, a confetti reveal, and a note written just for them.',
    emoji: '💌',
    gradient: 'linear-gradient(135deg, #e0b3f2 0%, #c9b8ff 50%, #8ea6ff 100%)',
    price: '₹9',
    amountInPaise: 900,
    features: [FEATURE_SOUND, FEATURE_LETTER, FEATURE_CONFETTI],
    tags: ['Romantic', 'Letter', 'Song'],
    status: 'available',
    isAvailable: true,
    badge: 'TRENDING',
  },
  {
    id: 'anniversary-01',
    categoryId: 'anniversary',
    name: 'Golden Anniversary Memory Box',
    tagline: 'A love letter through time.',
    description:
      'Turn a golden key, lift the lid of a keepsake box, walk your years together on a milestone timeline, and light a golden candle for every year you’ve made yours.',
    emoji: '💞',
    gradient: 'linear-gradient(135deg, #f7b267 0%, #fde8cf 50%, #f6c6b6 100%)',
    price: '₹9',
    amountInPaise: 900,
    features: [FEATURE_UNLOCK, FEATURE_PHOTOS, FEATURE_CANDLE, FEATURE_SOUND],
    tags: ['Keepsake', 'Polaroids', 'Milestones'],
    status: 'available',
    isAvailable: true,
    badge: 'POPULAR',
  },
  {
    id: 'proposal-01',
    categoryId: 'proposal',
    name: 'The Big Question Proposal',
    tagline: 'One question. One yes.',
    description:
      'Feel your heartbeat, ride a build-the-courage countdown, open a tiny ring box, and face the question — with a shower of hearts the second they say yes.',
    emoji: '💍',
    gradient: 'linear-gradient(135deg, #ffb5c2 0%, #f6c6b6 50%, #ffd98a 100%)',
    price: '₹9',
    amountInPaise: 900,
    features: [FEATURE_RINGBOX, FEATURE_CONFETTI, FEATURE_SOUND, FEATURE_LETTER],
    tags: ['Dramatic', 'Confetti', 'The Moment'],
    status: 'available',
    isAvailable: true,
    badge: 'NEW',
  },
  {
    id: 'friendship-01',
    categoryId: 'friendship',
    name: 'Squad Forever Card',
    tagline: 'For the ones who feel like home.',
    description:
      'Mash a squad emoji burst, flip inside-joke cards, scroll unposed polaroids, and sign the official squad pledge — proof of the greatest friendship ever.',
    emoji: '🧡',
    gradient: 'linear-gradient(135deg, #ffb56b 0%, #f6c6b6 45%, #e0b3f2 100%)',
    price: '₹9',
    amountInPaise: 900,
    features: [FEATURE_SQUAD, FEATURE_PHOTOS, FEATURE_SOUND],
    tags: ['Group', 'Inside Jokes', 'Photos'],
    status: 'available',
    isAvailable: true,
    badge: 'NEW',
  },
  {
    id: 'graduation-01',
    categoryId: 'graduation',
    name: 'Graduation Victory Reel',
    tagline: 'Celebrate the climb.',
    description:
      'A highlight reel from first day to graduation day — a filmstrip of milestones, a countdown, a cap toss, and an official diploma unroll from the proudest team.',
    emoji: '🎓',
    gradient: 'linear-gradient(135deg, #7fd8be 0%, #9ec5ff 50%, #c9b8ff 100%)',
    price: '₹9',
    amountInPaise: 900,
    features: [FEATURE_RECORD, FEATURE_CONFETTI, FEATURE_PHOTOS, FEATURE_SOUND],
    tags: ['Milestone', 'Highlight Reel', 'Confetti'],
    status: 'available',
    isAvailable: true,
    badge: 'NEW',
  },
]

export function getCategoryById(id: string) {
  return categories.find((category) => category.id === id)
}