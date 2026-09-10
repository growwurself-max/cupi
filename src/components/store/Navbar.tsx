import { Heart, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'

const TAGLINE = 'Interactive Digital Surprises'

const NAV_LINKS = [
  { label: 'Explore', href: '#themes' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Birthday Theme', href: '#birthday-01' },
]

interface NavbarProps {
  onLaunchDemo: () => void
}

export function Navbar({ onLaunchDemo }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        scrolled ? 'glass-panel border-x-0 border-t-0' : ''
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <a href="#top" className="group flex items-center gap-2.5" aria-label="Cupi home">
          <span className="glass-panel relative flex h-10 w-10 items-center justify-center rounded-xl shadow-lg shadow-rose-gold/10">
            <Heart
              className="h-5 w-5 text-rose-gold transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
              strokeWidth={2.2}
            />
            <Sparkles className="absolute -top-1 -right-1 h-3.5 w-3.5 text-soft-amber" />
          </span>
          <span className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white">Cupi</span>
            <span className="hidden text-[10px] font-semibold tracking-[0.14em] text-white/45 uppercase sm:block">
              {TAGLINE}
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-white/60 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          onClick={onLaunchDemo}
          className="flex min-h-12 items-center gap-2 rounded-full bg-gradient-to-r from-rose-gold via-soft-amber to-soft-violet px-5 text-sm font-bold text-obsidian-900 shadow-lg shadow-rose-gold/20 transition-transform duration-200 hover:scale-[1.04] active:scale-95"
        >
          <Sparkles className="h-4 w-4" />
          <span className="hidden sm:inline">Try </span>Birthday Demo
        </button>
      </div>
    </header>
  )
}