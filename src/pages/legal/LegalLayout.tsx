import { ArrowLeft, Heart, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'

export const SUPPORT_EMAIL = 'cupisupport@gmail.com'

interface LegalLayoutProps {
  title: string
  subtitle?: string
  onExit: () => void
  children: ReactNode
}

export function LegalLayout({
  title,
  subtitle,
  onExit,
  children,
}: LegalLayoutProps) {
  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden bg-gradient-to-b from-[#FFF9F6] via-[#FAF7F5] to-[#FDF2F4]">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-rose-100/40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-[38%] -left-44 h-96 w-96 rounded-full bg-pink-100/40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-[68%] -right-44 h-96 w-96 rounded-full bg-violet-100/30 blur-3xl"
      />

      <header className="sticky top-0 z-40 border-b border-rose-100/70 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-500 shadow-lg shadow-rose-200">
              <Heart className="h-5 w-5 text-white" strokeWidth={2.2} />
              <Sparkles className="absolute -top-1 -right-1 h-3.5 w-3.5 text-rose-300" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-stone-900">
              Cupi ✨
            </span>
          </div>

          <button
            type="button"
            onClick={onExit}
            className="flex min-h-10 items-center gap-1.5 rounded-full border border-rose-200 bg-white px-4 text-sm font-semibold text-rose-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-300 hover:text-rose-500 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Store
          </button>
        </div>
      </header>

      <main className="relative z-[1] px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-3xl rounded-3xl border border-rose-100 bg-white/95 p-6 text-stone-700 leading-relaxed shadow-sm sm:p-10">
          <h1 className="font-display text-2xl font-bold text-stone-900 sm:text-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm font-medium text-stone-400">{subtitle}</p>
          )}
          <div className="mt-8 space-y-8">{children}</div>
        </div>
      </main>

      <footer className="relative z-[1] px-4 pb-10 text-center text-xs text-stone-400">
        <p>
          © {new Date().getFullYear()} Cupi. Made with{' '}
          <span className="text-rose-500">♥</span> for celebration.
        </p>
      </footer>
    </div>
  )
}

interface LegalSectionProps {
  heading: string
  children: ReactNode
}

export function LegalSection({ heading, children }: LegalSectionProps) {
  return (
    <section>
      <h2 className="mb-4 font-serif text-xl font-bold text-stone-900 sm:text-2xl">
        {heading}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-2 pl-6 marker:text-rose-300">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}