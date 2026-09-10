import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import {
  CustomizeModal,
} from './components/store/CustomizeModal'
import { Footer } from './components/store/Footer'
import { HeroSection } from './components/store/HeroSection'
import { HowItWorks } from './components/store/HowItWorks'
import { Navbar } from './components/store/Navbar'
import { ThemeGrid } from './components/store/ThemeGrid'
import type { CategorySelection } from './components/store/CategoryFilter'
import { themeRegistry } from './themes/registry'
import type { ThemeMetadata } from './types/catalog'

type View = 'store' | 'demo'

export default function App() {
  const [view, setView] = useState<View>('store')
  const [activeThemeId, setActiveThemeId] = useState('birthday-01')
  const [activeCategory, setActiveCategory] =
    useState<CategorySelection>('all')
  const [customizeTheme, setCustomizeTheme] =
    useState<ThemeMetadata | null>(null)

  const enterDemo = useCallback((themeId: string) => {
    setActiveThemeId(themeId)
    setView('demo')
  }, [])
  const exitDemo = useCallback(() => setView('store'), [])

  useEffect(() => {
    const lock = view === 'demo'
    document.body.style.overflow = lock ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [view])

  const handleCustomize = useCallback(
    (theme: ThemeMetadata) => setCustomizeTheme(theme),
    [],
  )

  const handleSelectCategory = useCallback((id: CategorySelection) => {
    setActiveCategory(id)
    document.getElementById('themes')?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const activeRegistration = themeRegistry[activeThemeId]
  const DemoExperience = activeRegistration?.component

  return (
    <div className="surface-obsidian relative min-h-[100dvh] overflow-x-hidden">
      <Navbar onLaunchDemo={() => enterDemo('birthday-01')} />

      <main>
        <HeroSection onLaunchDemo={() => enterDemo('birthday-01')} />
        <ThemeGrid
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          onLaunchDemo={(theme) => enterDemo(theme.id)}
          onCustomize={handleCustomize}
        />
        <HowItWorks />
      </main>

      <Footer onSelectCategory={handleSelectCategory} />

      <CustomizeModal
        theme={customizeTheme}
        onClose={() => setCustomizeTheme(null)}
        onLaunchDemo={() => {
          enterDemo(customizeTheme?.id ?? 'birthday-01')
          setCustomizeTheme(null)
        }}
      />

      <AnimatePresence>
        {view === 'demo' && DemoExperience && (
          <motion.div
            key="demo-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="fixed inset-0 z-[100] bg-obsidian-900"
            role="dialog"
            aria-label={`${activeRegistration?.metadata.name ?? 'Surprise'} live demo preview`}
          >
            <DemoExperience onExit={exitDemo} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}