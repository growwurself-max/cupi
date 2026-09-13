import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import type { CategorySelection } from './components/store/CategoryFilter'
import { CustomizerModal } from './components/store/CustomizerModal'
import { ExperienceView } from './components/store/ExperienceView'
import { Footer } from './components/store/Footer'
import { HeroSection } from './components/store/HeroSection'
import { HowItWorks } from './components/store/HowItWorks'
import { Navbar } from './components/store/Navbar'
import { ThemeGrid } from './components/store/ThemeGrid'
import { themeRegistry } from './themes/registry'
import type { ExperienceMetadata } from './types/catalog'

type View = 'store' | 'demo'

interface Route {
  view: View | 'share'
  shareId: string | null
}

function parsePath(pathname: string): Route {
  const match = pathname.match(/^\/x\/([A-Za-z0-9_-]{4,64})$/)
  if (match) {
    return { view: 'share', shareId: match[1] }
  }
  return { view: 'store', shareId: null }
}

export default function App() {
  const [view, setView] = useState<View>('store')
  const [activeThemeId, setActiveThemeId] = useState('birthday-01')
  const [activeCategory, setActiveCategory] =
    useState<CategorySelection>('all')
  const [customizeTheme, setCustomizeTheme] =
    useState<ExperienceMetadata | null>(null)
  const [route, setRoute] = useState<Route>(() =>
    parsePath(typeof window !== 'undefined' ? window.location.pathname : '/'),
  )

  useEffect(() => {
    const onPopState = () => setRoute(parsePath(window.location.pathname))
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const navigate = useCallback((path: string) => {
    window.history.pushState({}, '', path)
    setRoute(parsePath(path))
  }, [])

  const goToStore = useCallback(() => navigate('/'), [navigate])

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
    (theme: ExperienceMetadata) => setCustomizeTheme(theme),
    [],
  )

  const handleSelectCategory = useCallback((id: CategorySelection) => {
    setActiveCategory(id)
    document.getElementById('experiences')?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const handleOpenExperience = useCallback(
    (path: string) => {
      setCustomizeTheme(null)
      navigate(path)
    },
    [navigate],
  )

  const activeRegistration = themeRegistry[activeThemeId]
  const DemoExperience = activeRegistration?.component

  if (route.view === 'share' && route.shareId) {
    return <ExperienceView experienceId={route.shareId} onExit={goToStore} />
  }

  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden bg-[#FFFBF9] bg-gradient-to-b from-[#FFF9F6] via-[#FAF7F5] to-[#FDF2F4]">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[540px] w-[860px] -translate-x-1/2 rounded-full bg-rose-200/40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-[36%] -left-44 h-96 w-96 rounded-full bg-pink-100/60 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-[68%] -right-44 h-96 w-96 rounded-full bg-purple-100/50 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-10 left-1/4 h-80 w-80 rounded-full bg-rose-100/50 blur-3xl"
      />

      <Navbar onLaunchDemo={() => enterDemo('birthday-01')} />

      <main className="relative z-[1]">
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

      <CustomizerModal
        theme={customizeTheme}
        onClose={() => setCustomizeTheme(null)}
        onOpenExperience={handleOpenExperience}
      />

      <AnimatePresence>
        {view === 'demo' && DemoExperience && (
          <motion.div
            key="demo-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="demo-scope fixed inset-0 z-[100] bg-[#FFF9F6]"
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