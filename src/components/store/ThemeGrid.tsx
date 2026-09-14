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
      experiences.filter(
        (experience) =>
          experience.isAvailable &&
          isThemeAvailable(experience.id) &&
          (activeCategory === 'all' ||
            experience.categoryId === activeCategory),
      ),
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
            experiences across six moments. Each one a live, animated
            surprise you can demo before you create yours.
          </p>
        </motion.div>

        <div className="mb-12 flex justify-center">
          <CategoryFilter
            categories={categories}
            active={activeCategory}
            onChange={onCategoryChange}
          />
        </div>

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