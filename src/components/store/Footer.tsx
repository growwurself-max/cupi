import { Heart, Sparkles, Zap } from 'lucide-react'
import { categories } from '../../data/catalog'
import { SUPPORT_EMAIL } from '../../pages/legal/LegalLayout'
import type { CategorySelection } from './CategoryFilter'

interface FooterProps {
  onSelectCategory: (category: CategorySelection) => void
  onNavigate: (path: string) => void
}

const LEGAL_LINKS = [
  { label: 'Privacy Policy', path: '/privacy' },
  { label: 'Terms of Service', path: '/terms' },
  { label: 'Refund Policy', path: '/refund' },
  { label: 'Contact Us', path: '/contact' },
]

export function Footer({ onSelectCategory, onNavigate }: FooterProps) {
  return (
    <footer className="relative mt-10 border-t border-rose-100/70 bg-[#FAF4F1] px-5 py-14 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 md:flex-row md:justify-between">
        <div className="flex flex-col items-center gap-3 text-center md:items-start md:text-left">
          <div className="flex items-center gap-2">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-500 shadow-lg shadow-rose-200">
              <Heart className="h-4 w-4 text-white" strokeWidth={2.2} />
              <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-rose-300" />
            </span>
            <span className="font-display text-lg font-bold text-stone-900">
              Cupi
            </span>
          </div>
          <p className="max-w-xs text-sm text-stone-500">
            Our mission: make every milestone a moment they actually feel —
            personal, animated, and delivered with a simple link.
          </p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <span className="text-sm font-semibold tracking-wide text-stone-500 uppercase">
            Shop by feeling
          </span>
          <div className="grid grid-cols-3 gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => onSelectCategory(category.id)}
                className="flex min-h-12 items-center justify-center gap-1.5 rounded-full border border-stone-200/80 bg-white px-3 text-xs font-semibold text-stone-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-300 hover:text-rose-600 active:scale-95"
              >
                <span aria-hidden>{category.emoji}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 text-center md:items-start md:text-left">
          <span className="text-sm font-semibold tracking-wide text-stone-500 uppercase">
            Support & Legal
          </span>
          <div className="flex flex-col items-center gap-2 md:items-start">
            {LEGAL_LINKS.map((link) => (
              <button
                key={link.path}
                type="button"
                onClick={() => onNavigate(link.path)}
                className="text-sm font-medium text-stone-500 transition-colors hover:text-rose-600"
              >
                {link.label}
              </button>
            ))}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-sm font-semibold text-rose-500 transition-colors hover:text-rose-600"
            >
              {SUPPORT_EMAIL}
            </a>
          </div>
        </div>
      </div>

      <div className="mt-12 border-t border-rose-100/70 pt-6 text-center text-xs text-stone-400">
        <p className="inline-flex items-center gap-1.5 font-semibold text-stone-500">
          <Zap className="h-3.5 w-3.5 text-rose-400" fill="currentColor" />
          Instant Digital Delivery via Link • No Physical Shipping
        </p>
        <p className="mt-2">
          © {new Date().getFullYear()} Cupi. Interactive digital surprises, made
          with <span className="text-rose-500">♥</span> for the people who
          matter.
        </p>
        <p className="mt-2">Legal Business Name: Mohammed Shafey</p>
      </div>
    </footer>
  )
}