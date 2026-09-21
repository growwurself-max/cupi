import { AnimatePresence, motion } from 'framer-motion'
import { useMemo } from 'react'
import { categories, experiences } from '../../data/catalog'
import { isThemeAvailable } from '../../themes/registry'
import type { ExperienceMetadata } from '../../types/catalog'
import { CategoryFilter, type CategorySelection } from './CategoryFilter'
import { ThemeCard } from './ThemeCard'

interface ThemeGridProps {
  activeCategory: CategorySelection
  onCategoryChange: (category: CategorySelection) => void
  onLaunchDemo: (theme: ExperienceMetadata) => void
  onCustomize: (theme: ExperienceMetadata) => void
}

export function ThemeGrid({
  activeCategory,
  onCategoryChange,
  onLaunchDemo,
  onCustomize,
}: ThemeGridProps) {
  const visibleExperiences = useMemo(
    () =>
      experiences
        .filter(
          (experience) =>
            experience.isAvailable &&
            isThemeAvailable(experience.id) &&
            (activeCategory === 'all' ||
              experience.categoryId === activeCategory),
        )
        .slice()
        .sort((a, b) => a.amountInPaise - b.amountInPaise),
    [activeCategory],
  )

  return (
    <section
      id="experiences"
      className="relative scroll-mt-24 px-5 py-24 sm:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-10 text-center"
        >
          <p className="mb-3 text-sm font-semibold tracking-[0.25em] text-rose-500 uppercase">
            Explore the collection
          </p>
          <h2 className="font-display text-4xl font-bold text-stone-900 sm:text-5xl">
            Find the moment.{' '}
            <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 bg-clip-text text-transparent">
              Leave it unforgettable.
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-stone-500 sm:text-base">
            {experiences.filter((e) => e.isAvailable && isThemeAvailable(e.id)).length}{' '}
            experiences across seven moments. Each one a live, animated
            surprise you can demo before you create yours.
          </p>
        </motion.div>

        <div className="mb-8 flex justify-center">
          <CategoryFilter
            categories={categories}
            active={activeCategory}
            onChange={onCategoryChange}
          />
        </div>

        <AnimatePresence mode="wait">
          {activeCategory === 'special' && (
            <motion.div
              key="special-banner"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="mb-10 flex flex-col items-center gap-4 rounded-2xl border border-amber-300/60 bg-gradient-to-r from-[#FFF4E0] via-[#FDE8EC] to-[#FDE8E6] px-6 py-5 text-center shadow-[0_18px_48px_-22px_rgba(251,146,60,0.6)] sm:flex-row sm:justify-between sm:text-left"
            >
              <div>
                <p className="text-xs font-bold tracking-[0.28em] text-amber-600 uppercase sm:text-sm">
                  ✦ Limited-time special drop ✦
                </p>
                <h3 className="mt-1.5 font-display text-xl font-bold text-stone-800 sm:text-2xl">
                  Handcrafted and fully animated — from ₹9.
                </h3>
                <p className="mt-1 max-w-md text-pretty text-sm leading-relaxed text-stone-500">
                  Storybook letters, bunny mini-games and heart-bloom
                  animations. Demo each one before you create yours.
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-2.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-5 py-2.5 text-xs font-bold tracking-wide text-white uppercase shadow-lg shadow-amber-200">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                </span>
                Now live
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visibleExperiences.map((experience) => (
              <motion.div
                key={experience.id}
                layout
                initial={{ opacity: 0, scale: 0.96, y: 18 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 12 }}
                transition={{ type: 'spring', stiffness: 260, damping: 26 }}
              >
                <ThemeCard
                  theme={experience}
                  onLaunchDemo={() => onLaunchDemo(experience)}
                  onCustomize={() => onCustomize(experience)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}