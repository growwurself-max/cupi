import { ArrowRight } from 'lucide-react'
import { useCallback, useState } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { ScreenShell } from '../../shared/ScreenShell'

interface Act1EnvelopeProps {
  config: ExperienceConfig
  onReveal: () => void
  onContinue: () => void
}

const CTA_CLASS =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#b0555f] px-6 text-sm font-semibold text-white shadow-[0_12px_26px_-14px_rgba(176,85,95,0.6)] transition-all duration-200 hover:bg-[#9c4750] active:scale-95 motion-reduce:transition-none'

export function Act1Envelope({
  config,
  onReveal,
  onContinue,
}: Act1EnvelopeProps) {
  const [opened, setOpened] = useState(false)
  const initial = (config.recipient.name.trim() || '?').charAt(0).toUpperCase()

  const handleOpen = useCallback(() => {
    if (opened) return
    setOpened(true)
    onReveal()
  }, [opened, onReveal])

  return (
    <ScreenShell className="justify-start">
      <style>
        {`
          .env-flap {
            transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
          }
          .env-flap.is-open {
            transform: rotateX(-168deg);
          }
          .env-paper {
            transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.12s;
          }
          .env-seal {
            transition: transform 0.4s ease, opacity 0.3s ease 0.05s;
          }
          .env-seal.is-open {
            transform: scale(0) rotate(28deg);
            opacity: 0;
          }
          @media (prefers-reduced-motion: reduce) {
            .env-flap, .env-paper, .env-seal { transition: none; }
          }
        `}
      </style>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(232,180,160,0.22),transparent_58%)]"
      />

      <p className="font-display relative z-10 max-w-md text-pretty text-center text-2xl font-semibold text-[#5b3a34] sm:text-3xl">
        {config.content.teaserHeading}
      </p>
      <p className="relative z-10 mt-3 max-w-md text-pretty text-center text-sm leading-relaxed text-[#8a5a4a]">
        {config.content.teaserSubtext}
      </p>

      <div className="relative z-10 mt-10 w-full max-w-sm" style={{ perspective: 1400 }}>
        {/* Letter paper emerging from behind the envelope */}
        <div
          aria-hidden
          className="env-paper absolute top-0 left-1/2 z-0 h-full w-[84%] rounded-t-[14px] rounded-b-[6px] border border-[#e8b4a0]/40 bg-[#fffdf7] shadow-[0_-14px_30px_-20px_rgba(60,30,20,0.35)]"
          style={{ transform: `translate(-50%, ${opened ? '-22%' : '54%'})` }}
        />

        {/* Envelope */}
        <button
          type="button"
          onClick={handleOpen}
          aria-label={
            opened
              ? 'Your letter is open'
              : 'Break the seal and open your letter'
          }
          className="relative z-10 block aspect-[10/7] w-full rounded-2xl border border-[#e8b4a0]/50 bg-gradient-to-br from-[#fbe9df] to-[#f3d3bf] shadow-[0_30px_60px_-28px_rgba(120,60,40,0.45)] outline-none transition-transform duration-200 active:scale-[0.99] motion-reduce:transition-none"
        >
          <span
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-[58%]"
            style={{
              clipPath: 'polygon(0 100%, 100% 100%, 50% 0)',
              background: 'linear-gradient(180deg, #f0d3bd, #e9c3a9)',
            }}
          />
          <span className="relative z-10 flex flex-col items-center pt-[60%]">
            <span className="font-script text-3xl text-[#5b3a34] sm:text-4xl">
              for {config.recipient.name}
            </span>
            <span className="mt-1 text-[10px] font-semibold tracking-[0.3em] text-[#8a5a4a]/80 uppercase">
              a letter, sealed with love
            </span>
          </span>
          <span
            aria-hidden
            className={`env-flap absolute inset-x-0 top-0 z-20 h-[58%] ${opened ? 'is-open' : ''}`}
            style={{
              transformOrigin: 'top',
              clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
              background: 'linear-gradient(180deg, #fdf0e9, #f6dcc8)',
            }}
          />
        </button>

        {/* Wax seal */}
        <span
          aria-hidden
          className="absolute top-[46%] left-1/2 z-30 -translate-x-1/2 -translate-y-1/2"
        >
          <span
            className={`env-seal flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#efd9c2] bg-[#b0555f] shadow-[0_10px_20px_-8px_rgba(176,85,95,0.55)] ${opened ? 'is-open' : ''}`}
          >
            <span className="font-display text-xl text-[#fff8f2]">{initial}</span>
          </span>
        </span>
      </div>

      <div className="relative z-10 mt-10 flex min-h-[86px] flex-col items-center justify-start gap-3">
        {opened ? (
          <>
            <button type="button" onClick={onContinue} className={CTA_CLASS}>
              Open your letter
              <ArrowRight className="h-4 w-4" />
            </button>
            <p className="text-xs font-semibold tracking-[0.25em] text-[#8a5a4a] uppercase">
              gently now — it’s been waiting for you
            </p>
          </>
        ) : (
          <p className="text-xs font-semibold tracking-[0.25em] text-[#8a5a4a] uppercase motion-reduce:animate-none">
            tap the envelope to break the seal
          </p>
        )}
      </div>
    </ScreenShell>
  )
}