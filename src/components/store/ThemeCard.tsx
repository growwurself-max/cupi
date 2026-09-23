import { ArrowRight, Play, Sparkles } from 'lucide-react'
import { getCategoryById } from '../../data/catalog'
import type { ExperienceBadge, ExperienceMetadata } from '../../types/catalog'

interface ThemeCardProps {
  theme: ExperienceMetadata
  onLaunchDemo: () => void
  onCustomize: () => void
}

const BADGE_CLASSES: Record<ExperienceBadge, string> = {
  BESTSELLER:
    'bg-gradient-to-r from-amber-400 to-rose-500 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm',
  PREMIUM:
    'bg-violet-100 text-violet-700 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full',
  POPULAR:
    'bg-pink-100 text-pink-700 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full',
  TRENDING:
    'bg-purple-100 text-purple-700 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full',
  'MOST LOVED':
    'bg-gradient-to-r from-rose-500 to-rose-400 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm',
  NEW: 'bg-emerald-100 text-emerald-700 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full',
}

export function ThemeCard({
  theme,
  onLaunchDemo,
  onCustomize,
}: ThemeCardProps) {
  const category = getCategoryById(theme.categoryId)
  const isBirthday = theme.categoryId === 'birthday'
  const quickTags = theme.tags?.slice(0, 2) ?? []

  return (
    <article
      id={theme.id}
      className="group relative flex h-full scroll-mt-28 flex-col overflow-hidden rounded-3xl border border-rose-100/70 bg-ivory shadow-[0_1px_2px_rgba(120,80,60,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-rose-200/80 hover:shadow-[0_18px_40px_-18px_rgba(190,110,130,0.35)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-rose-200/60 to-transparent"
      />

      {/* Preview */}
      <div
        className="relative flex h-36 items-center justify-center overflow-hidden sm:h-40"
        style={{ background: theme.previewVisual.gradient }}
      >
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-white/15 to-black/5"
        />
        <span
          aria-hidden
          className="animate-float-slow relative text-5xl drop-shadow-[0_10px_18px_rgba(0,0,0,0.18)] transition-transform duration-500 group-hover:scale-110 sm:text-6xl"
        >
          {theme.previewVisual.emoji}
        </span>

        {category && (
          <span className="absolute top-2.5 left-3 flex items-center gap-1 rounded-full border border-white/70 bg-white/85 px-2.5 py-1 text-[10px] font-bold text-stone-700 shadow-sm backdrop-blur-sm">
            <span aria-hidden>{category.emoji}</span>
            {category.name}
          </span>
        )}

        {theme.badge && (
          <span
            className={`absolute top-2.5 right-3 ${BADGE_CLASSES[theme.badge]}`}
          >
            {theme.badge}
          </span>
        )}

        {theme.supportsPhotos && (
          <span className="absolute bottom-2.5 left-3 flex items-center gap-1 rounded-full border border-rose-200/80 bg-white/90 px-2 py-0.5 text-[9px] font-bold tracking-wider text-rose-600 uppercase shadow-sm backdrop-blur-sm">
            📸 Photos
          </span>
        )}

        <span className="absolute right-3 bottom-2.5 rounded-full border border-white/70 bg-white/90 px-2.5 py-1 text-[9px] font-bold tracking-wide text-stone-500 uppercase shadow-sm backdrop-blur-sm">
          Exp. #{String(theme.experienceNumber).padStart(2, '0')}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 text-lg leading-snug font-bold text-stone-900">
            {theme.name}
          </h3>
          <span className="relative top-0.5 shrink-0 rounded-full border border-rose-100 bg-rose-50 px-2.5 py-1 text-sm font-black text-rose-600">
            {theme.price}
          </span>
        </div>

        <p className="line-clamp-1 text-[13px] leading-relaxed font-medium text-rose-500">
          {theme.tagline}
        </p>

        {quickTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {quickTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-stone-100 bg-cream-50 px-2 py-0.5 text-[10px] font-semibold text-stone-500"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-stretch gap-2 pt-3">
          <button
            type="button"
            onClick={onCustomize}
            className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 px-4 text-sm font-bold text-white shadow-lg shadow-rose-200/70 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-rose-200 active:scale-95"
          >
            {isBirthday && <Sparkles className="h-4 w-4" />}
            {isBirthday ? 'Create Yours' : 'Get Now'}
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onLaunchDemo}
            aria-label={`Watch demo of ${theme.name}`}
            title="Watch demo"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-stone-200/80 bg-white text-stone-600 transition-all duration-200 hover:scale-105 hover:border-rose-200 hover:text-rose-600 active:scale-95"
          >
            <Play className="h-4 w-4 fill-current" />
          </button>
        </div>
      </div>
    </article>
  )
}