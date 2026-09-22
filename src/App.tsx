import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { ContactUs } from './pages/legal/ContactUs'
import { PrivacyPolicy } from './pages/legal/PrivacyPolicy'
import { RefundPolicy } from './pages/legal/RefundPolicy'
import { TermsConditions } from './pages/legal/TermsConditions'
import { PaymentResult } from './pages/PaymentResult'
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

type LegalPage = 'privacy' | 'terms' | 'refund' | 'contact'

interface Route {
  view: View | 'share' | 'payment-result' | 'legal'
  shareId: string | null
  legalPage: LegalPage | null
}

const LEGAL_ROUTES: Record<string, LegalPage> = {
  '/privacy': 'privacy',
  '/privacy-policy': 'privacy',
  '/terms': 'terms',
  '/terms-and-conditions': 'terms',
  '/refund': 'refund',
  '/cancellation-and-refund': 'refund',
  '/contact': 'contact',
  '/contact-us': 'contact',
}

function parsePath(pathname: string): Route {
  if (pathname.startsWith('/payment-result')) {
    return { view: 'payment-result', shareId: null, legalPage: null }
  }
  const match = pathname.match(/^\/x\/([A-Za-z0-9_-]{4,64})$/)
  if (match) {
    return { view: 'share', shareId: match[1], legalPage: null }
  }
  const legalPage = LEGAL_ROUTES[pathname]
  if (legalPage) {
    return { view: 'legal', shareId: null, legalPage }
  }
  return { view: 'store', shareId: null, legalPage: null }
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

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [route])

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

  const activeRegistration = themeRegistry[activeThemeId]
  const DemoExperience = activeRegistration?.component

  if (route.view === 'share' && route.shareId) {
    return <ExperienceView experienceId={route.shareId} onExit={goToStore} />
  }

  if (route.view === 'payment-result') {
    return <PaymentResult onExit={goToStore} />
  }

  if (route.view === 'legal') {
    const legalPage = route.legalPage ?? 'privacy'
    const LegalPage =
      legalPage === 'privacy'
        ? PrivacyPolicy
        : legalPage === 'terms'
          ? TermsConditions
          : legalPage === 'refund'
            ? RefundPolicy
            : ContactUs
    return <LegalPage onExit={goToStore} />
  }

  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden bg-[#FEFAF4] bg-gradient-to-b from-[#FDF3EC] via-[#FEF9F4] to-[#FBE9EC]">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[540px] w-[860px] -translate-x-1/2 rounded-full bg-rose-100/35 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-[36%] -left-44 h-96 w-96 rounded-full bg-pink-100/40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-[68%] -right-44 h-96 w-96 rounded-full bg-violet-100/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-10 left-1/4 h-80 w-80 rounded-full bg-rose-100/30 blur-3xl"
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

      <Footer onSelectCategory={handleSelectCategory} onNavigate={navigate} />

      <CustomizerModal
        theme={customizeTheme}
        onClose={() => setCustomizeTheme(null)}
      />

      <AnimatePresence>
        {view === 'demo' && DemoExperience && (
          <motion.div
            key="demo-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="demo-scope fixed inset-0 z-[100] bg-[#FEFAF4]"
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