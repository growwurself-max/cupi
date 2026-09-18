import { Mail } from 'lucide-react'
import { LegalLayout, LegalSection, SUPPORT_EMAIL } from './LegalLayout'

interface LegalPageProps {
  onExit: () => void
}

export function ContactUs({ onExit }: LegalPageProps) {
  return (
    <LegalLayout
      title="Contact Us & Digital Delivery Policy"
      subtitle="We're here to help you celebrate"
      onExit={onExit}
    >
      <LegalSection heading="1. Brand / Operating Name">
        <p>
          Cupi — an interactive digital surprises brand. All experiences are
          created, hosted, and delivered by Cupi.
        </p>
      </LegalSection>

      <LegalSection heading="2. Support Email">
        <p>
          For any questions, concerns, or assistance, reach us at{' '}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="font-semibold text-rose-600 underline decoration-rose-200 underline-offset-4 hover:text-rose-500"
          >
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection heading="3. Response Time">
        <p>
          We respond to all inquiries within 24 to 48 business hours. Your
          moments matter to us, and every message is read personally.
        </p>
      </LegalSection>

      <LegalSection heading="4. Instant Digital Delivery Statement">
        <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-5">
          <p className="font-medium text-stone-800">
            "Cupi does not ship physical products. All experiences are 100%
            digital goods delivered instantly on-screen and accessible via a
            shareable URL upon successful payment."
          </p>
        </div>
      </LegalSection>

      <LegalSection heading="5. Get in Touch">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 px-6 text-sm font-bold text-white shadow-lg shadow-rose-200 transition-all duration-200 hover:scale-[1.03] active:scale-95"
          >
            <Mail className="h-4 w-4" />
            Email Us at {SUPPORT_EMAIL} 💌
          </a>
          <span className="text-xs font-medium text-stone-400 sm:text-sm">
            We usually reply within 24–48 business hours.
          </span>
        </div>
      </LegalSection>
    </LegalLayout>
  )
}