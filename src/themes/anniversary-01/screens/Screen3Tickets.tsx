import { motion } from 'framer-motion'
import type { ExperienceConfig } from '../../../types/experience'
import { FloatingParticles } from '../../shared/FloatingParticles'
import { ScreenShell } from '../../shared/ScreenShell'

const TICKETS = [
  { emoji: '📦', year: 'Year 1 · 2019', note: 'The day we met' },
  { emoji: '✈️', year: 'Year 3 · 2021', note: 'Our favorite trip' },
  { emoji: '🏡', year: 'Year 5 · 2023', note: 'Our little home' },
]

interface TicketsScreenProps {
  config: ExperienceConfig
  onContinue: () => void
}

export function TicketsScreen({ config, onContinue }: TicketsScreenProps) {
  return (
    <ScreenShell>
      <FloatingParticles
        type="gold-sparkles"
        colors={[config.branding.accentColor, config.branding.accentSecondary]}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(245,184,97,0.16),transparent_55%)]"
      />

      <span className="relative z-10 rounded-full border border-[#E7C98A] bg-[#FFF3D6]/80 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-[#A16207]">
        Chapter Tickets
      </span>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 font-display mt-6 text-center text-3xl font-black text-[#78350F] sm:text-4xl"
      >
        Boarding passes to our story
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.6 }}
        className="relative z-10 mt-3 max-w-md text-center text-sm leading-relaxed text-stone-600"
      >
        Three little tickets, one big timeline. Punch them as you go.
      </motion.p>

      <div className="relative z-10 mt-9 flex w-full flex-col items-center gap-6">
        {TICKETS.map((ticket, i) => (
          <motion.div
            key={ticket.year}
            initial={{ opacity: 0, y: 60, rotate: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
            transition={{ delay: 0.2 + i * 0.18, type: 'spring', stiffness: 90, damping: 13 }}
            className="relative w-full max-w-md"
          >
            <div className="relative overflow-visible rounded-2xl border border-[#E7C98A] bg-[#FFF3D6] shadow-[0_16px_36px_-18px_rgba(180,83,9,0.4)]">
              <span
                aria-hidden
                className="absolute -left-2.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border border-[#E7C98A] bg-[#FFF3D6] shadow-[inset_0_0_4px_rgba(231,201,138,0.8)]"
              />
              <span
                aria-hidden
                className="absolute -right-2.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border border-[#E7C98A] bg-[#FFF3D6] shadow-[inset_0_0_4px_rgba(231,201,138,0.8)]"
              />

              <div className="px-6 py-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-[#E7C98A] bg-[#FFE9B8] text-3xl">
                    {ticket.emoji}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#A16207]/70">
                      Chapter Ticket
                    </p>
                    <p className="font-display text-xl font-black text-[#78350F]">
                      {ticket.year}
                    </p>
                  </div>
                  <span aria-hidden className="ml-auto text-2xl text-[#A16207]/50">
                    ✂
                  </span>
                </div>

                <div className="my-4 flex items-center gap-3">
                  <div className="h-2 flex-1 border-t-2 border-dashed border-[#E7C98A]" />
                  <div className="h-1.5 w-1.5 rounded-full bg-[#E7C98A]" />
                  <div className="h-2 flex-1 border-t-2 border-dashed border-[#E7C98A]" />
                </div>

                <div className="flex items-end justify-between gap-4">
                  <p className="font-display text-2xl font-bold text-[#B45309]">
                    {ticket.note}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#A16207]/60">
                    ADMIT TWO · Forever
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 mt-10"
      >
        <button
          type="button"
          onClick={onContinue}
          className="flex min-h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-400 px-7 text-sm font-bold text-white shadow-lg shadow-amber-500/30 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          Open the Vault 📸
        </button>
      </motion.div>
    </ScreenShell>
  )
}