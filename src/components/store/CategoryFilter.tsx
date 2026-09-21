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
      label: 'All experiences',
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
      aria-label="Filter experiences by category"
      className="no-scrollbar -mx-5 flex w-full items-center gap-2 overflow-x-auto px-5 pb-1 sm:-mx-8 sm:px-8"
    >
      {options.map((option) => {
        const isActive = active === option.id
        const isFeatured = option.id === 'special'
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.id)}
            className={`relative flex min-h-12 shrink-0 items-center gap-2 rounded-full border bg-white px-5 text-sm font-semibold transition-all duration-200 ${
              isActive
                ? `border-transparent text-white shadow-md ${
                    isFeatured
                      ? 'shadow-amber-300/80'
                      : 'shadow-rose-200'
                  }`
                : isFeatured
                  ? 'border-amber-300/80 bg-gradient-to-r from-[#FFF8EA] to-[#FDEFF2] text-amber-800 shadow-[0_0_16px_-6px_rgba(251,191,36,0.75)] hover:border-amber-400 hover:text-amber-900 hover:shadow-[0_0_24px_-6px_rgba(251,191,36,0.95)]'
                  : 'border-stone-200/80 text-stone-600 hover:border-rose-300 hover:text-rose-600'
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="category-pill"
                className={`absolute inset-0 rounded-full bg-gradient-to-r ${
                  isFeatured
                    ? 'from-amber-500 via-rose-500 to-pink-500'
                    : 'from-rose-500 to-pink-500'
                }`}
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
                isActive ? 'text-white/70' : 'text-stone-400'
              }`}
            >
              {option.count}
            </span>
            {isFeatured && (
              <span
                aria-hidden
                className="absolute -top-1.5 -right-1.5 flex h-4 w-4"
              >
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex h-4 w-4 rounded-full bg-gradient-to-br from-amber-400 to-rose-500 ring-2 ring-white" />
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}