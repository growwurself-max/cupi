import { Heart, Sparkles } from 'lucide-react'
import { categories } from '../../data/catalog'
import type { CategorySelection } from './CategoryFilter'

interface FooterProps {
  onSelectCategory: (category: CategorySelection) => void
}

export function Footer({ onSelectCategory }: FooterProps) {
  return (
    <footer className="relative mt-10 border-t border-rose-100/70 bg-[#F7F2EE] px-5 py-14 sm:px-8">
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
      </div>

      <div className="mt-12 text-center text-xs text-stone-400">
        © {new Date().getFullYear()} Cupi. Interactive digital surprises, made
        with <span className="text-rose-500">♥</span> for the people who
        matter.
      </div>
    </footer>
  )
}