import { CheckCircle2, Heart, LogIn, LogOut, Mail, Send, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { resendVerification } from '../../lib/api.ts'
import { useAuth } from '../../lib/authContext.ts'

const TAGLINE = 'Interactive Digital Surprises'

const NAV_LINKS = [
  { label: 'Explore', href: '#experiences' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Special', href: '#special-01' },
]

interface NavbarProps {
  onLaunchDemo: () => void
  onNavigate?: (path: string) => void
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

export function Navbar({ onLaunchDemo, onNavigate }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const { customer, openAuth, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent'>('idle')
  const menuRef = useRef<HTMLDivElement | null>(null)

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

  const handleResend = async () => {
    if (!customer || resendState !== 'idle') return
    setResendState('sending')
    try {
      await resendVerification(customer.email)
      setResendState('sent')
    } catch {
      setResendState('idle')
    }
  }

  const handleSignOut = async () => {
    setMenuOpen(false)
    await signOut()
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
              {!customer.emailVerified && (
                <span
                  aria-hidden
                  title="E-mail not verified"
                  className="absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-amber-400"
                />
              )}
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="flex h-10 min-w-10 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-500 text-sm font-bold text-white shadow-lg shadow-rose-200 transition-all duration-200 hover:scale-105 active:scale-95"
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
                  className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-[0_18px_50px_rgba(30,15,20,0.18)]"
                >
                  <div className="border-b border-rose-50 px-4 py-3">
                    <p className="truncate text-sm font-bold text-stone-900">{customer.name}</p>
                    <p className="truncate text-xs text-stone-500">{customer.email}</p>
                    {customer.emailVerified ? (
                      <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                        <CheckCircle2 className="h-3 w-3" /> E-mail verified
                      </p>
                    ) : (
                      <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-amber-600">
                        <Mail className="h-3 w-3" /> E-mail not verified yet
                      </p>
                    )}
                  </div>
                  <div className="p-1.5">
                    {!customer.emailVerified && (
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={resendState !== 'idle'}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-stone-600 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                      >
                        <Send className="h-4 w-4 shrink-0" />
                        {resendState === 'sent'
                          ? 'Verification link sent'
                          : resendState === 'sending'
                            ? 'Sending…'
                            : 'Resend verification link'}
                      </button>
                    )}
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

          <button
            type="button"
            onClick={onLaunchDemo}
            className="flex min-h-12 items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 px-5 text-sm font-bold text-white shadow-lg shadow-rose-200 transition-all duration-200 hover:scale-[1.04] active:scale-95"
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Try </span>Birthday Demo
          </button>
        </div>
      </div>

      {customer && !customer.emailVerified && (
        <div className="rounded-xl bg-amber-50/95 px-4 py-2 text-center text-xs font-medium text-amber-700">
          Your e-mail isn’t verified yet —{' '}
          <button
            type="button"
            onClick={handleResend}
            disabled={resendState !== 'idle'}
            className="font-bold text-amber-800 underline underline-offset-2 hover:text-rose-600 disabled:opacity-50"
          >
            {resendState === 'sent' ? 'Link sent!' : resendState === 'sending' ? 'Sending…' : 'Send the link again'}
          </button>
        </div>
      )}
    </header>
  )
}