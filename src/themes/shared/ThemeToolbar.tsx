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
}

export function ThemeToolbar({
  themeLabel,
  step,
  totalSteps,
  isMuted,
  soundEnabled,
  onToggleMute,
  onExit,
}: ThemeToolbarProps) {
  const MuteIcon = isMuted ? VolumeX : Volume2

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <span className="glass-panel flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-gold opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-gold" />
            </span>
            <span className="text-xs font-bold tracking-wide text-white/80 uppercase">
              Demo Preview Mode
            </span>
          </span>
          <span className="glass-panel hidden max-w-[40vw] truncate rounded-full px-3 py-2 text-xs font-semibold text-white/55 lg:inline-block">
            {themeLabel}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="glass-panel hidden items-center gap-2 rounded-full px-4 py-2 sm:flex">
            <span className="text-xs font-medium text-white/55">Act {step}</span>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i + 1 === step
                      ? 'w-4 bg-rose-gold'
                      : i + 1 < step
                        ? 'w-1.5 bg-soft-violet'
                        : 'w-1.5 bg-white/15'
                  }`}
                />
              ))}
            </div>
          </div>

          {soundEnabled && (
            <button
              type="button"
              onClick={onToggleMute}
              aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
              title={isMuted ? 'Unmute' : 'Mute'}
              className="glass-panel flex h-12 w-12 items-center justify-center rounded-full text-white/75 transition-all duration-200 hover:scale-105 hover:text-white active:scale-95"
            >
              <MuteIcon className="h-5 w-5" />
            </button>
          )}

          {!soundEnabled && (
            <span
              title="Sound unavailable in this browser"
              className="glass-panel flex h-12 w-12 items-center justify-center rounded-full text-white/30"
            >
              <AudioLines className="h-5 w-5" />
            </span>
          )}

          <button
            type="button"
            onClick={onExit}
            aria-label="Back to Cupi Store"
            className="glass-panel flex h-12 items-center gap-2 rounded-full px-4 text-sm font-semibold text-white/80 transition-all duration-200 hover:scale-105 hover:text-white active:scale-95"
          >
            <X className="h-5 w-5" />
            <span className="hidden sm:inline">Back to Cupi Store</span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}