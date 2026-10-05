import { motion } from 'framer-motion'
import { Heart, Home } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { getExperienceById } from '../../data/catalog'
import { ApiError, fetchExperienceApi, type ExperienceData } from '../../lib/api'
import { themeRegistry } from '../../themes/registry'
import type { ExperienceConfig } from '../../types/experience'
import { deepMergeExperienceConfig } from '../../utils/configMerge'
import { AudioPlayer } from './AudioPlayer'
import { BackgroundAnimation } from './BackgroundAnimation'

interface ExperienceViewProps {
  experienceId: string
  onExit: () => void
}

type ViewState =
  | { phase: 'loading' }
  | { phase: 'found'; data: ExperienceData }
  /** The website genuinely does not exist. Never call this "expired". */
  | { phase: 'missing' }
  /** The API could not be reached right now. The link itself is permanent. */
  | { phase: 'unavailable' }

/**
 * A share link is permanent, so a temporary server hiccup must never be shown
 * as a dead one. The API host is a free-tier instance that sleeps when idle and
 * takes tens of seconds to wake; during that window it answers with 502/503 or
 * drops the connection. Retry those, and only treat a definitive answer from
 * the API as the truth.
 */
const RETRYABLE_STATUSES = new Set([0, 408, 425, 429, 500, 502, 503, 504, 522, 524])
const RETRY_DELAYS_MS = [0, 2000, 4000, 8000, 12000, 15000]

function isRetryable(error: unknown): boolean {
  if (error instanceof ApiError) {
    return RETRYABLE_STATUSES.has(error.status) || error.isNetworkError
  }
  return true
}

export function ExperienceView({ experienceId, onExit }: ExperienceViewProps) {
  const [state, setState] = useState<ViewState>({ phase: 'loading' })

  useEffect(() => {
    let active = true
    let timer: ReturnType<typeof setTimeout> | null = null
    let attempt = 0

    const run = async (): Promise<void> => {
      try {
        const data = await fetchExperienceApi(experienceId)
        if (active) setState({ phase: 'found', data })
      } catch (error) {
        if (!active) return
        if (isRetryable(error) && attempt < RETRY_DELAYS_MS.length - 1) {
          attempt += 1
          timer = setTimeout(() => {
            void run()
          }, RETRY_DELAYS_MS[attempt])
          return
        }
        // 404 is the API telling us the website does not exist. Anything else
        // that survived every retry is a reachability problem, not a verdict on
        // the link — say exactly that instead of implying it expired.
        const definitive = error instanceof ApiError && error.status === 404
        setState({ phase: definitive ? 'missing' : 'unavailable' })
      }
    }

    void run()

    return () => {
      active = false
      if (timer) clearTimeout(timer)
    }
  }, [experienceId])

  const handleExit = useCallback(() => {
    if (state.phase === 'found') {
      window.scrollTo({ top: 0 })
    }
    onExit()
  }, [onExit, state.phase])

  if (state.phase === 'found') {
    const registration = themeRegistry[state.data.templateId]
    const ThemeComponent =
      registration?.component ??
      themeRegistry['birthday-01']?.component ??
      null
    const defaultConfig =
      registration?.defaultConfig ??
      themeRegistry['birthday-01']?.defaultConfig ??
      null
    if (ThemeComponent) {
      const maxPhotos = getExperienceById(state.data.templateId)?.maxPhotos ?? 3
      const resolvedConfig = defaultConfig
        ? deepMergeExperienceConfig(
            defaultConfig,
            state.data.config as Partial<ExperienceConfig> | null,
            maxPhotos,
          )
        : (state.data.config as ExperienceConfig)
      return (
        <>
          <BackgroundAnimation templateId={state.data.templateId} />
          <AudioPlayer templateId={state.data.templateId} />
          <ThemeComponent
            config={resolvedConfig}
            onExit={handleExit}
            isSharedLink
          />
        </>
      )
    }
  }

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#FFFDFB] bg-gradient-to-b from-[#FFF7F3] via-[#FEFCFB] to-[#FBEDF0] px-5">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[520px] -translate-x-1/2 rounded-full bg-rose-100/35 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 -right-24 h-80 w-80 rounded-full bg-violet-100/30 blur-3xl"
      />

      {state.phase === 'loading' ? (
        <div className="relative z-10 flex flex-col items-center gap-6 text-center">
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="relative"
          >
            <span
              aria-hidden
              className="absolute -inset-6 rounded-full bg-rose-200/60 blur-2xl"
            />
            <span
              aria-hidden
              className="absolute inline-flex h-14 w-14 animate-ping rounded-full bg-rose-300/50 [animation-duration:1.6s]"
            />
            <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-500 shadow-xl shadow-rose-200">
              <Heart className="h-7 w-7 text-white" fill="currentColor" />
            </span>
          </motion.div>
          <div>
            <p className="font-display text-lg font-semibold text-stone-900">
              Waking up the surprise…
            </p>
            <p className="mt-1 text-sm text-stone-500">Fetching the moment for you.</p>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative z-10 flex max-w-md flex-col items-center gap-5 rounded-3xl border border-rose-100/70 bg-white p-8 text-center shadow-[0_12px_35px_rgba(244,63,94,0.1)]"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-4xl ring-1 ring-rose-100">
            {state.phase === 'missing' ? '💔' : '📡'}
          </span>
          <h1 className="font-display text-2xl font-bold text-stone-900">
            {state.phase === 'missing'
              ? 'This surprise could not be found'
              : 'We could not reach Cupi just now'}
          </h1>
          <p className="text-sm leading-relaxed text-stone-500">
            {state.phase === 'missing'
              ? 'This link might be mistyped, or the website it points to was never created. Cupi links do not expire.'
              : 'The website behind this link is safe and permanent — we just could not load it. Please check your connection and try again in a moment.'}
          </p>
          {state.phase === 'unavailable' && (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="flex min-h-12 items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 px-6 text-sm font-bold text-white shadow-lg shadow-rose-200 transition-all duration-200 hover:scale-[1.03] active:scale-95"
            >
              Try Again
            </button>
          )}
          <button
            type="button"
            onClick={handleExit}
            className="flex min-h-12 items-center gap-2 rounded-full border border-stone-200 bg-white px-5 text-sm font-semibold text-stone-700 transition-colors hover:border-rose-200 hover:text-rose-600"
          >
            <Home className="h-4 w-4" />
            Back to Cupi Store
          </button>
        </motion.div>
      )}
    </div>
  )
}