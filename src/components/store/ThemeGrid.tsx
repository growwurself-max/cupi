import { AnimatePresence, motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { categories, themes } from '../../data/catalog'
import { isThemeAvailable } from '../../themes/registry'
import type { ThemeMetadata } from '../../types/catalog'
import { CategoryFilter, type CategorySelection } from './CategoryFilter'
import { ThemeCard } from './ThemeCard'

interface ThemeGridProps {
  activeCategory: CategorySelection
  onCategoryChange: (category: CategorySelection) => void
  onLaunchDemo: (theme: ThemeMetadata) => void
  onCustomize: (theme: ThemeMetadata) => void
}

export function ThemeGrid({
  activeCategory,
  onCategoryChange,
  onLaunchDemo,
  onCustomize,
}: ThemeGridProps) {
  const [notified, setNotified] = useState<string | null>(null)

  const visibleThemes = useMemo(
    () =>
      activeCategory === 'all'
        ? themes
        : themes.filter((theme) => theme.categoryId === activeCategory),
    [activeCategory],
  )

  useEffect(() => {
    if (!notified) return
    const timer = setTimeout(() => setNotified(null), 2800)
    return () => clearTimeout(timer)
  }, [notified])

  return (
    <section id="themes" className="relative scroll-mt-24 px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-10 text-center"
        >
          <p className="mb-3 text-sm font-semibold tracking-[0.25em] text-rose-gold uppercase">
            Explore the collection
          </p>
          <h2 className="font-display text-4xl font-semibold text-white sm:text-5xl">
            Find the moment.{' '}
            <span className="text-gradient-lux">
              Leave it unforgettable.
            </span>
          </h2>
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
            {visibleThemes.map((theme) => (
              <motion.div
                key={theme.id}
                layout
                initial={{ opacity: 0, scale: 0.96, y: 18 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 12 }}
                transition={{ type: 'spring', stiffness: 260, damping: 26 }}
              >
                <ThemeCard
                  theme={theme}
                  available={isThemeAvailable(theme.id)}
                  onLaunchDemo={() => onLaunchDemo(theme)}
                  onCustomize={() => onCustomize(theme)}
                  onNotify={() => setNotified(theme.name)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <AnimatePresence>
        {notified && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="glass-panel fixed bottom-6 left-1/2 z-[60] flex w-[calc(100vw-2.5rem)] max-w-sm -translate-x-1/2 items-center gap-3 rounded-2xl px-4 py-3.5 shadow-2xl"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-soft-violet/15 text-soft-violet ring-1 ring-soft-violet/30">
              <Check className="h-5 w-5" />
            </span>
            <p className="text-sm font-medium text-white/90">
              You&apos;re on the list for{' '}
              <span className="font-bold text-soft-violet">{notified}</span>.
              We&apos;ll let you know when it launches.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}