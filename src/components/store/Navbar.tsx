import { ChevronRight, Heart, LogIn, LogOut, ShoppingBag, Sparkles, Store } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../lib/authContext.ts'
import { useCartCount } from '../../lib/cart'

const TAGLINE = 'Interactive Digital Surprises'

const NAV_LINKS = [
  { label: 'Explore', href: '#experiences' },
  { label: 'Store', href: '/store' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Special', href: '#special-01' },
]

interface NavbarProps {
  onLaunchDemo: () => void
  onNavigate?: (path: string) => void
  onOpenCart?: () => void
}

/** Two initials on the brand's gradient, for accounts without a photo. */
function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'C'
}

export function Navbar({ onLaunchDemo, onNavigate, onOpenCart }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const { customer, openAuth, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const cartCount = useCartCount()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the account menu on any outside click or Escape.
  useEffect(() => {
    if (!menuOpen) return
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/') && onNavigate) {
      e.preventDefault()
      onNavigate(href)
    }
  }

  const handleSignOut = async () => {
    setMenuOpen(false)
    await signOut()
  }

  // The profile menu is the only navigation that survives on phones (the text
  // nav above is desktop-only), so the customer's purchased templates live here.
  const handleGoToStore = () => {
    setMenuOpen(false)
    if (onNavigate) onNavigate('/store')
    else window.location.assign('/store')
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 bg-white/70 backdrop-blur-md transition-all duration-300 ${
        scrolled
          ? 'border-b border-rose-100/70 shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
          : 'border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <a href="/" onClick={(e) => handleNavClick(e, '/')} className="group flex items-center gap-2.5" aria-label="Cupi home">
          <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-500 shadow-lg shadow-rose-200">
            <Heart
              className="h-5 w-5 text-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
              strokeWidth={2.2}
            />
            <Sparkles className="absolute -top-1 -right-1 h-3.5 w-3.5 text-rose-300" />
          </span>
          <span className="flex flex-col">
            <span className="font-display text-lg font-bold tracking-tight text-stone-900">
              Cupi
            </span>
            <span className="hidden text-[10px] font-semibold tracking-[0.14em] text-stone-400 uppercase sm:block">
              {TAGLINE}
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="text-sm font-medium text-stone-600 transition-colors hover:text-rose-500"
            >
              {link.label}
            </a>
          ))}
        </nav>

<div className="flex items-center gap-2 sm:gap-3">
          {customer ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label="Open account menu"
                className="flex h-10 min-w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-500 text-sm font-bold text-white shadow-lg shadow-rose-200 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                {customer.avatarUrl ? (
                  <img
                    src={customer.avatarUrl}
                    alt=""
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-white/60"
                  />
                ) : (
                  initialsOf(customer.name)
                )}
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="fixed inset-x-3 top-[4.75rem] z-50 overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-[0_18px_50px_rgba(30,15,20,0.18)] sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:mt-2 sm:w-64"
                >
                  <div className="border-b border-rose-50 px-4 py-3">
                    <p className="truncate text-sm font-bold text-stone-900">{customer.name}</p>
                    <p className="truncate text-xs text-stone-500">{customer.email}</p>
                  </div>
                  <div className="p-1.5">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleGoToStore}
                      className="group flex w-full items-center gap-3 rounded-xl bg-rose-50/70 px-3 py-2.5 text-left transition-colors hover:bg-rose-100 active:bg-rose-100"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-md shadow-rose-200">
                        <Store className="h-4 w-4" strokeWidth={2.2} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold text-stone-900">Store</span>
                        <span className="block text-[11px] font-medium text-stone-500">
                          My purchased templates
                        </span>
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-rose-300 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                  <div className="border-t border-rose-50 p-1.5">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-stone-600 transition-colors hover:bg-rose-50 hover:text-rose-600"
                    >
                      <LogOut className="h-4 w-4 shrink-0" /> Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openAuth('login')}
              className="flex h-10 items-center gap-1.5 rounded-full border border-rose-100 bg-white px-3.5 text-sm font-semibold text-stone-700 transition-all duration-200 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
            >
              <LogIn className="h-4 w-4 text-rose-400" />
              <span className="hidden sm:inline">Sign in</span>
            </button>
          )}

          {onOpenCart && (
            <button
              type="button"
              onClick={onOpenCart}
              aria-label={`Open cart${cartCount > 0 ? ` (${cartCount} item${cartCount > 1 ? 's' : ''})` : ''}`}
              className="relative flex h-12 w-12 items-center justify-center rounded-full border border-rose-100 bg-white/80 text-stone-600 transition-colors hover:border-rose-200 hover:text-rose-500"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>
          )}
          <button
            type="button"
            onClick={onLaunchDemo}
            className="flex min-h-12 items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 px-4 text-sm font-bold text-white shadow-lg shadow-rose-200 transition-all duration-200 hover:scale-[1.04] active:scale-95 sm:px-5"
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Try Birthday Demo</span>
            <span className="sm:hidden">Demo</span>
          </button>
        </div>
      </div>

    </header>
  )
}