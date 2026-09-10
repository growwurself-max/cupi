import { Heart, Sparkles } from 'lucide-react'
import { categories } from '../../data/catalog'
import type { CategorySelection } from './CategoryFilter'

interface FooterProps {
  onSelectCategory: (category: CategorySelection) => void
}

export function Footer({ onSelectCategory }: FooterProps) {
  return (
    <footer className="relative mt-10 border-t border-white/10 px-5 py-14 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 md:flex-row md:justify-between">
        <div className="flex flex-col items-center gap-3 text-center md:items-start md:text-left">
          <div className="flex items-center gap-2 text-lg font-bold text-white">
            <span className="glass-panel relative flex h-9 w-9 items-center justify-center rounded-xl">
              <Heart className="h-4 w-4 text-rose-gold" strokeWidth={2.2} />
              <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-soft-amber" />
            </span>
            Cupi
          </div>
          <p className="max-w-xs text-sm text-white/45">
            Our mission: make every milestone a moment they actually feel —
            personal, animated, and delivered with a simple link.
          </p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <span className="text-sm font-semibold tracking-wide text-white/60 uppercase">
            Shop by feeling
          </span>
          <div className="grid grid-cols-3 gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => onSelectCategory(category.id)}
                className="glass-panel flex min-h-12 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-semibold text-white/60 transition-all duration-200 hover:scale-[1.04] hover:text-white active:scale-95"
              >
                <span aria-hidden>{category.emoji}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12 text-center text-xs text-white/30">
        © {new Date().getFullYear()} Cupi. Interactive digital surprises, made
        with <span className="text-rose-gold">♥</span> for the people who
        matter.
      </div>
    </footer>
  )
}