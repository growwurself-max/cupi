import { Bell, Play, Sparkles, WandSparkles } from 'lucide-react'
import { getCategoryById } from '../../data/catalog'
import type { ThemeMetadata } from '../../types/catalog'

interface ThemeCardProps {
  theme: ThemeMetadata
  available: boolean
  onLaunchDemo: () => void
  onCustomize: () => void
  onNotify: () => void
}

export function ThemeCard({
  theme,
  available,
  onLaunchDemo,
  onCustomize,
  onNotify,
}: ThemeCardProps) {
  const category = getCategoryById(theme.categoryId)

  return (
    <article
      id={theme.id}
      className="glass-panel group relative flex h-full scroll-mt-28 flex-col overflow-hidden rounded-3xl transition-transform duration-300 hover:-translate-y-1.5"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
      />

      {/* Preview thumbnail */}
      <div
        className="relative flex h-44 items-center justify-center overflow-hidden"
        style={{ background: theme.gradient }}
      >
        <div aria-hidden className="absolute inset-0 bg-obsidian-900/15" />
        <span className="animate-float-slow relative text-6xl drop-shadow-2xl transition-transform duration-500 group-hover:scale-110">
          {theme.emoji}
        </span>

        {category && (
          <span className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-obsidian-900/60 px-3 py-1.5 text-[11px] font-bold text-white ring-1 ring-white/20 backdrop-blur-sm">
            <span aria-hidden>{category.emoji}</span>
            {category.name}
          </span>
        )}

        {available && theme.badge ? (
          <span className="absolute top-3 right-3 rounded-full bg-obsidian-900/60 px-3 py-1.5 text-[11px] font-black text-soft-amber ring-1 ring-soft-amber/40 backdrop-blur-sm">
            {theme.badge}
          </span>
        ) : (
          <span className="absolute top-3 right-3 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white/80 ring-1 ring-white/25 backdrop-blur-sm">
            Coming Soon
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-4 p-6 pt-5">
        <div>
          <h3 className="text-xl font-bold text-white">{theme.name}</h3>
          <p className="mt-1 text-sm font-medium text-rose-gold/80">
            {theme.tagline}
          </p>
          <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-white/55">
            {theme.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {theme.features.map((feature) => (
            <span
              key={feature.id}
              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/70"
            >
              {feature.label}
            </span>
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-2.5 pt-1">
          {available ? (
            <>
              <button
                type="button"
                onClick={onLaunchDemo}
                className="glow-primary flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-gold to-soft-violet text-sm font-bold text-obsidian-900 transition-transform duration-200 hover:scale-[1.03] active:scale-95"
              >
                <Play className="h-4 w-4 fill-current" />
                Watch Demo
              </button>
              <button
                type="button"
                onClick={onCustomize}
                className="glass-panel flex min-h-12 items-center justify-center gap-2 rounded-full text-sm font-bold text-white transition-all duration-200 hover:scale-[1.03] hover:text-soft-amber active:scale-95"
              >
                <WandSparkles className="h-4 w-4 text-soft-violet" />
                Create Yours
              </button>
            </>
          ) : (
            <>
              <span className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-dashed border-white/15 bg-white/[0.03] text-sm font-semibold text-white/40">
                <Sparkles className="h-4 w-4" />
                Coming Soon
              </span>
              <button
                type="button"
                onClick={onNotify}
                className="glass-panel flex min-h-12 items-center justify-center gap-2 rounded-full text-sm font-bold text-white/80 transition-all duration-200 hover:scale-[1.03] hover:border-soft-violet/50 hover:text-soft-violet active:scale-95"
              >
                <Bell className="h-4 w-4" />
                Notify Me
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  )
}