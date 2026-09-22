import { ArrowRight } from 'lucide-react'
import type { ExperienceConfig } from '../../../types/experience'
import { ScreenShell } from '../../shared/ScreenShell'

interface Act2LetterProps {
  config: ExperienceConfig
  onContinue: () => void
}

const CTA_CLASS =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#b0555f] px-6 text-sm font-semibold text-white shadow-[0_12px_26px_-14px_rgba(176,85,95,0.6)] transition-all duration-200 hover:bg-[#9c4750] active:scale-95 motion-reduce:transition-none'

export function Act2Letter({ config, onContinue }: Act2LetterProps) {
  const recipient = config.recipient.name
  const lines = config.content.letterLines
  const date = config.content.memoryDate?.trim()
  const tag = config.content.memoryTag?.trim()
  const hasMemory = Boolean(date || tag)
  const memoryLine = [date, tag].filter(Boolean).join(' · ')

  return (
    <ScreenShell className="justify-start pb-14">
      <style>
        {`
          @keyframes lv-lift {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: none; }
          }
          .lv-line { animation: lv-lift 0.55s ease-out both; }
          @media (prefers-reduced-motion: reduce) {
            .lv-line { animation: none; }
          }
        `}
      </style>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(232,180,160,0.2),transparent_52%)]"
      />

      <p className="relative z-10 text-center text-xs font-bold tracking-[0.3em] text-[#b0555f] uppercase">
        {config.content.letterIntro}
      </p>

      <div
        className="relative z-10 mt-6 w-full max-w-lg rounded-[20px] border border-[#e8b4a0]/40 bg-[#fffdf7] px-6 py-9 shadow-[0_30px_55px_-28px_rgba(120,60,40,0.35)] sm:px-10 sm:py-12"
        style={{
          backgroundImage:
            'repeating-linear-gradient(180deg, transparent 0 31px, rgba(232,180,160,0.16) 31px 32px)',
        }}
      >
        <p className="font-script text-3xl text-[#5b3a34] sm:text-[34px]">
          Dear {recipient},
        </p>

        <div className="mt-6 space-y-5">
          {lines.filter((line) => line.trim()).map((line, i) => (
            <p
              key={i}
              className="lv-line text-left text-[15px] leading-[2.05] text-[#5b3a34] sm:text-base"
              style={{ animationDelay: `${0.15 + i * 0.14}s` }}
            >
              {line}
            </p>
          ))}
        </div>

        {hasMemory && (
          <div
            className="lv-line mt-8 flex items-center justify-center gap-3"
            style={{ animationDelay: '0.9s' }}
          >
            <span className="h-px w-10 shrink-0 bg-[#e8b4a0]/70" />
            <p className="font-script max-w-[80%] text-center text-lg text-[#b0555f]">
              ✿ remember {memoryLine}
            </p>
            <span className="h-px w-10 shrink-0 bg-[#e8b4a0]/70" />
          </div>
        )}

        <div className="mt-10 flex flex-col items-end">
          <p className="text-sm text-[#8a5a4a] italic">
            {config.content.letterSignoff}
          </p>
          <p className="font-script mt-1 text-3xl text-[#b0555f]">
            {config.sender.name}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onContinue}
        className={`${CTA_CLASS} mt-10`}
      >
        Seal it with a kiss
        <ArrowRight className="h-4 w-4" />
      </button>
    </ScreenShell>
  )
}