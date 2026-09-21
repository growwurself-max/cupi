import { motion } from 'framer-motion'
import { AudioLines, Volume2, VolumeX, X } from 'lucide-react'

interface ThemeToolbarProps {
  themeLabel: string
  step: number
  totalSteps: number
  isMuted: boolean
  soundEnabled: boolean
  onToggleMute: () => void
  onExit: () => void
  /** 'demo' = preview/demo render, 'shared' = live shareable link (/x/:id). */
  variant?: 'demo' | 'shared'
  /** Demo only: jump to any act/screen for QA. */
  onJumpToStep?: (step: number) => void
}

export function ThemeToolbar({
  themeLabel,
  step,
  totalSteps,
  isMuted,
  soundEnabled,
  onToggleMute,
  onExit,
  variant = 'demo',
  onJumpToStep,
}: ThemeToolbarProps) {
  const MuteIcon = isMuted ? VolumeX : Volume2
  const badgeLabel =
    variant === 'shared' ? 'A Special Surprise' : 'Demo Preview Mode'

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex shrink-0 items-center gap-2 rounded-full border border-rose-200/70 bg-white/80 px-3.5 py-2 shadow-sm backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
            </span>
            <span className="text-xs font-bold tracking-wide text-rose-900 uppercase">
              {badgeLabel}
            </span>
          </span>
          <span className="hidden max-w-[40vw] truncate rounded-full border border-stone-200/70 bg-white/80 px-3 py-2 text-xs font-semibold text-stone-600 shadow-sm backdrop-blur-md lg:inline-block">
            {themeLabel}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {variant === 'demo' && onJumpToStep && (
            <select
              value={step}
              onChange={(e) => onJumpToStep(Number(e.target.value))}
              className="max-w-[6.5rem] cursor-pointer rounded-full border border-stone-200/70 bg-white/80 px-2 py-2 text-[10px] font-semibold text-stone-600 shadow-sm backdrop-blur-md sm:hidden"
              aria-label="Skip to screen"
            >
              {Array.from({ length: totalSteps }).map((_, i) => (
                <option key={i} value={i + 1}>
                  Screen {i + 1}
                </option>
              ))}
            </select>
          )}
          <div className="hidden items-center gap-2 rounded-full border border-stone-200/70 bg-white/80 px-4 py-2 shadow-sm backdrop-blur-md sm:flex">
            <span className="text-xs font-medium text-stone-600">Act {step}</span>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalSteps }).map((_, i) => {
                const stepNum = i + 1
                const canJump = variant === 'demo' && onJumpToStep
                const dotClass = `h-1.5 rounded-full transition-all duration-300 ${
                  stepNum === step
                    ? 'w-4 bg-rose-500'
                    : stepNum < step
                      ? 'w-1.5 bg-rose-300'
                      : 'w-1.5 bg-stone-200'
                }`
                if (canJump) {
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onJumpToStep(stepNum)}
                      aria-label={`Skip to screen ${stepNum}`}
                      title={`Skip to screen ${stepNum}`}
                      className={`${dotClass} cursor-pointer hover:scale-125 hover:bg-rose-400`}
                    />
                  )
                }
                return <span key={i} className={dotClass} />
              })}
            </div>
            {variant === 'demo' && onJumpToStep && (
              <label className="ml-1 flex items-center gap-1 border-l border-stone-200 pl-2">
                <span className="sr-only">Skip to screen</span>
                <select
                  value={step}
                  onChange={(e) => onJumpToStep(Number(e.target.value))}
                  className="max-w-[7.5rem] cursor-pointer rounded-md border-0 bg-transparent py-0.5 text-[11px] font-semibold text-stone-600 outline-none focus:ring-1 focus:ring-rose-300"
                  aria-label="Skip to screen"
                >
                  {Array.from({ length: totalSteps }).map((_, i) => (
                    <option key={i} value={i + 1}>
                      Screen {i + 1}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>

          {soundEnabled && (
            <button
              type="button"
              onClick={onToggleMute}
              aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
              title={isMuted ? 'Unmute' : 'Mute'}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-stone-200/70 bg-white/80 text-stone-600 shadow-sm backdrop-blur-md transition-all duration-200 hover:scale-105 hover:text-rose-600 active:scale-95"
            >
              <MuteIcon className="h-5 w-5" />
            </button>
          )}

          {!soundEnabled && (
            <span
              title="Sound unavailable in this browser"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-stone-200/70 bg-white/80 text-stone-300 shadow-sm backdrop-blur-md"
            >
              <AudioLines className="h-5 w-5" />
            </span>
          )}

          <button
            type="button"
            onClick={onExit}
            aria-label="Back to Cupi Store"
            className="flex h-12 items-center gap-2 rounded-full border border-stone-200/70 bg-white/80 px-4 text-sm font-semibold text-stone-700 shadow-sm backdrop-blur-md transition-all duration-200 hover:scale-105 hover:text-rose-600 active:scale-95"
          >
            <X className="h-5 w-5" />
            <span className="hidden sm:inline">Back to Cupi Store</span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}