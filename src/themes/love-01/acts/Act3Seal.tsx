import { ArrowRight, Heart } from 'lucide-react'
import { useCallback, useState, type CSSProperties } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { ScreenShell } from '../../shared/ScreenShell'

interface Act3SealProps {
  config: ExperienceConfig
  onKiss: () => void
  onContinue: () => void
}

const PUFF_HEARTS = [
  { emoji: '💗', x: -54, y: -64 },
  { emoji: '🤍', x: -8, y: -98 },
  { emoji: '💌', x: 46, y: -72 },
  { emoji: '💕', x: -76, y: -28 },
  { emoji: '✨', x: 70, y: -24 },
]

export function Act3Seal({ onKiss, onContinue }: Act3SealProps) {
  const [kissed, setKissed] = useState(false)

  const handleKiss = useCallback(() => {
    if (kissed) return
    setKissed(true)
    onKiss()
  }, [kissed, onKiss])

  return (
    <ScreenShell className="justify-start">
      <style>
        {`
          @keyframes kiss-pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.06); }
          }
          @keyframes kiss-rise {
            0% { opacity: 0; transform: translate(0, 0) scale(0.4) rotate(0deg); }
            12% { opacity: 1; }
            100% {
              opacity: 0;
              transform: translate(var(--hx), var(--hy)) scale(1.15) rotate(var(--hr));
            }
          }
          .kiss-pulse { animation: kiss-pulse 2.2s ease-in-out infinite; }
          .kiss-heart { animation: kiss-rise 1.5s ease-out forwards; }
          @media (prefers-reduced-motion: reduce) {
            .kiss-pulse, .kiss-heart { animation: none; }
          }
        `}
      </style>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(232,180,160,0.2),transparent_55%)]"
      />

      <p className="relative z-10 text-center text-xs font-bold tracking-[0.3em] text-[#b0555f] uppercase">
        the final touch
      </p>
      <h2 className="font-display relative z-10 mt-5 text-pretty text-center text-3xl font-bold text-[#5b3a34] sm:text-4xl">
        Seal it with a kiss
      </h2>
      <p className="relative z-10 mt-3 max-w-sm text-pretty text-center text-sm leading-relaxed text-[#8a5a4a]">
        Every word on that page is true.
      </p>

      <div className="relative z-10 mt-12 flex flex-col items-center">
        <button
          type="button"
          onClick={handleKiss}
          aria-label={kissed ? 'Your letter is sealed' : 'Seal your letter with a kiss'}
          className="kiss-pulse relative grid h-28 w-28 place-items-center rounded-full border border-[#e8b4a0]/50 bg-gradient-to-br from-[#f6dcc8] to-[#fbe9df] shadow-[0_24px_45px_-22px_rgba(176,85,95,0.5)] outline-none transition-transform duration-200 active:scale-95 motion-reduce:transition-none"
        >
          <Heart className="h-12 w-12 fill-[#b0555f] text-[#b0555f]" />
          {kissed && (
            <span aria-hidden className="pointer-events-none absolute inset-0">
              {PUFF_HEARTS.map((heart, i) => (
                <span
                  key={i}
                  className="kiss-heart absolute top-1/2 left-1/2 text-xl"
                  style={
                    {
                      '--hx': `${heart.x}px`,
                      '--hy': `${heart.y}px`,
                      '--hr': `${(i % 3) * 24 - 24}deg`,
                      animationDelay: `${i * 0.05}s`,
                    } as CSSProperties
                  }
                >
                  {heart.emoji}
                </span>
              ))}
            </span>
          )}
        </button>

        <p className="mt-6 min-h-5 text-sm font-semibold text-[#b0555f]">
          {kissed ? 'There. It’s sealed. 🥹' : 'press when the words feel just right'}
        </p>

        <div className="mt-8 min-h-[52px]">
          {kissed && (
            <button
              type="button"
              onClick={onContinue}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#b0555f] px-6 text-sm font-semibold text-white shadow-[0_12px_26px_-14px_rgba(176,85,95,0.6)] transition-all duration-200 hover:bg-[#9c4750] active:scale-95 motion-reduce:transition-none"
            >
              Finish your letter
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </ScreenShell>
  )
}