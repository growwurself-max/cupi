import { motion } from 'framer-motion'
import type { Category, CategoryId } from '../../types/catalog'

export type CategorySelection = CategoryId | 'all'

interface CategoryFilterProps {
  categories: Category[]
  active: CategorySelection
  onChange: (category: CategorySelection) => void
}

interface FilterOption {
  id: CategorySelection
  label: string
  emoji: string
  count: number
}

export function CategoryFilter({
  categories,
  active,
  onChange,
}: CategoryFilterProps) {
  const options: FilterOption[] = [
    {
      id: 'all',
      label: 'All themes',
      emoji: '✨',
      count: categories.reduce((sum, category) => sum + category.count, 0),
    },
    ...categories.map((category) => ({
      id: category.id,
      label: category.name,
      emoji: category.emoji,
      count: category.count,
    })),
  ]

  return (
    <div
      role="tablist"
      aria-label="Filter themes by category"
      className="no-scrollbar -mx-5 flex w-full items-center gap-2 overflow-x-auto px-5 pb-1 sm:-mx-8 sm:px-8"
    >
      {options.map((option) => {
        const isActive = active === option.id
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.id)}
            className={`relative flex min-h-12 shrink-0 items-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors duration-200 ${
              isActive ? 'text-obsidian-900' : 'text-white/60 hover:text-white'
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="category-pill"
                className="absolute inset-0 rounded-full bg-gradient-to-r from-rose-gold to-soft-violet shadow-lg shadow-rose-gold/20"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <span aria-hidden className="relative z-10 text-base">
              {option.emoji}
            </span>
            <span className="relative z-10">{option.label}</span>
            <span
              aria-hidden
              className={`relative z-10 text-[10px] font-bold ${
                isActive ? 'text-obsidian-900/60' : 'text-white/30'
              }`}
            >
              {option.count}
            </span>
          </button>
        )
      })}
    </div>
  )
}