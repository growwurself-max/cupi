import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { ContactUs } from './pages/legal/ContactUs'
import { PrivacyPolicy } from './pages/legal/PrivacyPolicy'
import { RefundPolicy } from './pages/legal/RefundPolicy'
import { TermsConditions } from './pages/legal/TermsConditions'
import { PaymentResult } from './pages/PaymentResult'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { Pricing } from './pages/Pricing'
import type { CategorySelection } from './components/store/CategoryFilter'
import { AudioPlayer } from './components/store/AudioPlayer'
import { AuthModal } from './components/auth/AuthModal'
import { BackgroundAnimation } from './components/store/BackgroundAnimation'
import { CustomizerModal } from './components/store/CustomizerModal'
import { ExperienceView } from './components/store/ExperienceView'
import { Footer } from './components/store/Footer'
import { HeroSection } from './components/store/HeroSection'
import { captureReferralFromUrl } from './lib/referral'
import { HowItWorks } from './components/store/HowItWorks'
import { useAuth } from './lib/authContext.ts'
import { Navbar } from './components/store/Navbar'
import { ThemeGrid } from './components/store/ThemeGrid'
import { themeRegistry } from './themes/registry'
import type { ExperienceMetadata } from './types/catalog'

type View = 'store' | 'demo'

type LegalPage = 'privacy' | 'terms' | 'refund' | 'contact'

interface Route {
  view:
    | View
    | 'share'
    | 'payment-result'
    | 'legal'
    | 'admin'
    | 'pricing'
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
  // Secret admin route - not linked anywhere publicly
  if (pathname === '/admin/dashboard') {
    return { view: 'admin', shareId: null, legalPage: null }
  }
  if (pathname === '/pricing') {
    return { view: 'pricing', shareId: null, legalPage: null }
  }
  return { view: 'store', shareId: null, legalPage: null }
}

export default function App() {
  const { customer, loading, openAuth } = useAuth()
  const [view, setView] = useState<View>('store')
  const [activeThemeId, setActiveThemeId] = useState('birthday-01')
  const [activeCategory, setActiveCategory] =
    useState<CategorySelection>('all')
  const [customizeTheme, setCustomizeTheme] =
    useState<ExperienceMetadata | null>(null)
  const [pendingCustomize, setPendingCustomize] =
    useState<ExperienceMetadata | null>(null)
  const [route, setRoute] = useState<Route>(() =>
    parsePath(typeof window !== 'undefined' ? window.location.pathname : '/'),
  )

  useEffect(() => {
    const onPopState = () => setRoute(parsePath(window.location.pathname))
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  // Read ?ref= once on load, before any checkout can happen. A returning buyer
  // who was sent a link earlier keeps that partner's code even on this visit.
  useEffect(() => {
    captureReferralFromUrl()
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

  // A guest who clicked "Get Now" went to the Login/Sign-Up modal instead of the
  // customizer (purchasing requires an account). Once they sign in, the customizer
  // they asked for opens automatically instead of making them find the card again.
  useEffect(() => {
    if (pendingCustomize && customer) {
      setCustomizeTheme(pendingCustomize)
      setPendingCustomize(null)
    }
  }, [pendingCustomize, customer])

  const handleCustomize = useCallback(
    (theme: ExperienceMetadata) => {
      // Session hydration is fast, but a guest must never start a purchase
      // (or be told they're signed out) just because the check hasn't finished.
      if (loading) return
      if (!customer) {
        setPendingCustomize(theme)
        openAuth('login')
        return
      }
      setCustomizeTheme(theme)
    },
    [customer, loading, openAuth],
  )

  const handleSelectCategory = useCallback((id: CategorySelection) => {
    setActiveCategory(id)
    document.getElementById('experiences')?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const activeRegistration = themeRegistry[activeThemeId]
  const DemoExperience = activeRegistration?.component

  const renderView = () => {
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

    if (route.view === 'admin') {
      return <AdminDashboard />
    }

    if (route.view === 'pricing') {
      return <Pricing onExit={goToStore} />
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

        <Navbar onLaunchDemo={() => enterDemo('birthday-01')} onNavigate={navigate} />

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
              <BackgroundAnimation templateId={activeThemeId} />
              <AudioPlayer templateId={activeThemeId} />
              <DemoExperience onExit={exitDemo} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // The auth dialog lives above the route so login/sign-up can be opened from
  // any page — including /pricing, a share link or the legal pages.
  return (
    <>
      <AuthModal />
      {renderView()}
    </>
  )
}