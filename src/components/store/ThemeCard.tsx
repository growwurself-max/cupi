import { Play, WandSparkles } from 'lucide-react'
import { getCategoryById } from '../../data/catalog'
import type { ExperienceBadge, ExperienceMetadata } from '../../types/catalog'

interface ThemeCardProps {
  theme: ExperienceMetadata
  onLaunchDemo: () => void
  onCustomize: () => void
}

const BADGE_CLASSES: Record<ExperienceBadge, string> = {
  BESTSELLER:
    'bg-gradient-to-r from-amber-400 to-rose-500 text-white shadow-sm font-bold text-[10px] tracking-wider uppercase px-2.5 py-0.5 rounded-full',
  PREMIUM:
    'bg-violet-100 text-violet-700 font-bold text-[10px] tracking-wider uppercase px-2.5 py-0.5 rounded-full',
  POPULAR:
    'bg-pink-100 text-pink-700 font-bold text-[10px] tracking-wider uppercase px-2.5 py-0.5 rounded-full',
  TRENDING:
    'bg-purple-100 text-purple-700 font-bold text-[10px] tracking-wider uppercase px-2.5 py-0.5 rounded-full',
}

export function ThemeCard({
  theme,
  onLaunchDemo,
  onCustomize,
}: ThemeCardProps) {
  const category = getCategoryById(theme.categoryId)

  return (
    <article
      id={theme.id}
      className="group relative flex h-full scroll-mt-28 flex-col overflow-hidden rounded-3xl border border-stone-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_35px_rgba(244,63,94,0.12)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-rose-200/60 to-transparent"
      />

      {/* Preview thumbnail */}
      <div
        className="relative flex h-44 items-center justify-center overflow-hidden"
        style={{ background: theme.previewVisual.gradient }}
      >
        <div aria-hidden className="absolute inset-0 bg-white/10" />
        <span
          className="animate-float-slow relative text-6xl drop-shadow-[0_10px_20px_rgba(0,0,0,0.15)] transition-transform duration-500 group-hover:scale-110"
          aria-hidden
        >
          {theme.previewVisual.emoji}
        </span>

        {category && (
          <span className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full border border-white/70 bg-white/85 px-3 py-1.5 text-[11px] font-bold text-stone-700 shadow-sm backdrop-blur-sm">
            <span aria-hidden>{category.emoji}</span>
            {category.name}
          </span>
        )}

        {theme.badge && (
          <span className={`absolute top-3 right-3 ${BADGE_CLASSES[theme.badge]}`}>
            {theme.badge}
          </span>
        )}

        <span className="absolute right-3 bottom-3 flex flex-col items-end rounded-2xl border border-white/70 bg-white/95 px-3 py-1.5 shadow-sm backdrop-blur-sm">
          <span className="text-lg leading-none font-black text-rose-600">
            {theme.price}
          </span>
          <span className="mt-0.5 text-[10px] font-bold tracking-wide text-stone-500 uppercase">
            Experience #{String(theme.experienceNumber).padStart(2, '0')}
          </span>
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-4 p-6 pt-5">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-xl font-bold text-stone-900">{theme.name}</h3>
            <span className="relative top-0.5 shrink-0 rounded-full border border-rose-100 bg-rose-50 px-2.5 py-1 text-sm font-black text-rose-600">
              {theme.price}
            </span>
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-rose-500">
            <span className="text-rose-400" aria-hidden>✦</span>
            {theme.tagline}
            <span className="text-rose-400" aria-hidden>✦</span>
          </p>
          <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-stone-500">
            {theme.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {theme.features.map((feature) => (
            <span
              key={feature}
              className="rounded-full border border-rose-100 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700"
            >
              {feature}
            </span>
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-2.5 pt-1">
          <button
            type="button"
            onClick={onLaunchDemo}
            className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-sm font-bold text-white shadow-lg shadow-rose-200 transition-all duration-200 hover:scale-[1.03] hover:shadow-xl hover:shadow-rose-200 active:scale-95"
          >
            <Play className="h-4 w-4 fill-current" />
            Watch Demo
          </button>
          <button
            type="button"
            onClick={onCustomize}
            className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-stone-100 text-sm font-bold text-stone-800 transition-all duration-200 hover:scale-[1.03] hover:bg-stone-200 active:scale-95"
          >
            <WandSparkles className="h-4 w-4 text-rose-400" />
            Create Yours · {theme.price}
          </button>
        </div>
      </div>
    </article>
  )
}