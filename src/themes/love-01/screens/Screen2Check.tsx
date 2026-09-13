import type { ExperienceConfig } from '../../../types/experience'
import { FloatingEmojis } from '../../shared/FloatingEmojis'
import { FloatingParticles } from '../../shared/FloatingParticles'
import { PlayfulQuestion } from '../../shared/PlayfulQuestion'
import { ScreenShell } from '../../shared/ScreenShell'

interface CheckScreenProps {
  config: ExperienceConfig
  onYes: () => void
}

export function CheckScreen({ config, onYes }: CheckScreenProps) {
  return (
    <ScreenShell>
      <FloatingParticles
        type="heart-petals"
        colors={[config.branding.accentColor, config.branding.accentSecondary]}
      />
      <FloatingEmojis emojis={['💗', '🤍', '🧸', '💌', '✨']} count={12} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(214,93,122,0.14),transparent_55%)]"
      />

      <div className="relative z-10 flex flex-col items-center text-center">
        <span className="flex min-h-9 items-center rounded-full border border-[#FFC9D4] bg-white/80 px-4 text-[11px] font-bold tracking-[0.3em] text-[#D65D7A] uppercase shadow-sm backdrop-blur-md">
          💌 A tiny note from me
        </span>

        <p className="font-display mt-10 text-balance text-3xl font-black text-[#831843] sm:text-4xl">
          A quick check before we continue…
        </p>

        <div className="mt-10 w-full">
          <PlayfulQuestion
            question="Do you know how much you're loved?"
            yesLabel="Yes 💖"
            noLabel="No"
            onYes={onYes}
          />
        </div>
      </div>
    </ScreenShell>
  )
}