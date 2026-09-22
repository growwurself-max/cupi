import { RotateCcw, Sparkles } from 'lucide-react'
import type { ExperienceConfig } from '../../../types/experience'
import { ScreenShell } from '../../shared/ScreenShell'

interface Act4ClosingProps {
  config: ExperienceConfig
  onReplay: () => void
  onExit: () => void
}

export function Act4Closing({
  config,
  onReplay,
  onExit,
}: Act4ClosingProps) {
  return (
    <ScreenShell className="justify-start pb-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_16%,rgba(232,180,160,0.22),transparent_55%)]"
      />

      <p className="relative z-10 text-center text-xs font-bold tracking-[0.3em] text-[#b0555f] uppercase">
        one last line
      </p>

      <h1 className="font-display relative z-10 mt-6 max-w-lg text-pretty text-center text-4xl leading-tight font-bold text-[#5b3a34] sm:text-5xl">
        {config.content.finalMessage}
      </h1>

      <p className="relative z-10 mt-5 max-w-md text-pretty text-center text-sm leading-relaxed text-[#8a5a4a]">
        {config.content.finalCelebration}
      </p>

      <div className="relative z-10 mt-12 flex flex-col items-center">
        <p className="font-script text-2xl text-[#8a5a4a]">with all my love,</p>
        <p className="font-script mt-2 text-4xl text-[#b0555f] sm:text-5xl">
          {config.sender.name}
        </p>
      </div>

      <p className="relative z-10 mt-12 text-[11px] font-semibold tracking-[0.25em] text-[#8a5a4a]/70 uppercase">
        made with 💗 by Cupi
      </p>

      <div className="relative z-10 mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onReplay}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#e8b4a0]/60 bg-white/70 px-6 text-sm font-semibold text-[#8a5a4a] transition-all duration-200 hover:border-[#e8b4a0] hover:text-[#5b3a34] active:scale-95 motion-reduce:transition-none"
        >
          <RotateCcw className="h-4 w-4" />
          Read it again
        </button>
        <button
          type="button"
          onClick={onExit}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#b0555f] px-6 text-sm font-semibold text-white shadow-[0_12px_26px_-14px_rgba(176,85,95,0.6)] transition-all duration-200 hover:bg-[#9c4750] active:scale-95 motion-reduce:transition-none"
        >
          <Sparkles className="h-4 w-4" />
          Create a surprise like this
        </button>
      </div>
    </ScreenShell>
  )
}