import { Heart, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'

const TAGLINE = 'Interactive Digital Surprises'

const NAV_LINKS = [
  { label: 'Explore', href: '#experiences' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Birthday Experience', href: '#birthday-01' },
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
      className={`fixed inset-x-0 top-0 z-40 bg-white/70 backdrop-blur-md transition-all duration-300 ${
        scrolled
          ? 'border-b border-rose-100/70 shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
          : 'border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <a href="#top" className="group flex items-center gap-2.5" aria-label="Cupi home">
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
              className="text-sm font-medium text-stone-600 transition-colors hover:text-rose-500"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          onClick={onLaunchDemo}
          className="flex min-h-12 items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 px-5 text-sm font-bold text-white shadow-lg shadow-rose-200 transition-all duration-200 hover:scale-[1.04] active:scale-95"
        >
          <Sparkles className="h-4 w-4" />
          <span className="hidden sm:inline">Try </span>Birthday Demo
        </button>
      </div>
    </header>
  )
}