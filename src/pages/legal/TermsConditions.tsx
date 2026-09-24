import { LegalLayout, LegalList, LegalSection, SUPPORT_EMAIL } from './LegalLayout'

interface LegalPageProps {
  onExit: () => void
}

export function TermsConditions({ onExit }: LegalPageProps) {
  return (
    <LegalLayout
      title="Terms & Conditions"
      subtitle="Last updated: September 2026"
      onExit={onExit}
    >
      <LegalSection heading="1. Service Overview">
        <p>
          Cupi provides digital, animated, interactive mini-websites — called
          "experiences" or "surprises" — delivered via unique shareable links.
          Each experience is personalized with the names, notes, and letter text
          chosen by the purchaser and is experienced directly in a web browser
          on any device.
        </p>
      </LegalSection>

      <LegalSection heading="2. Business Model">
        <p>
          Cupi operates a simple, transparent one-purchase model:
        </p>
        <LegalList
          items={[
            '1 Payment = 1 Finalized/Locked Digital Experience = 1 Unique Shareable Link.',
            'Once payment is successfully verified, the experience is instantly generated and permanently locked with your personalized content.',
            'No subscriptions, hidden charges, or recurring fees.',
          ]}
        />
      </LegalSection>

      <LegalSection heading="3. User Responsibilities">
        <p>
          By using Cupi, you agree not to submit unlawful, hateful, abusive, or
          harmful content in customized letters or notes. Cupi reserves the
          right to remove any experience that violates these terms. You are
          responsible for the content you submit and for sharing your unique
          link responsibly.
        </p>
      </LegalSection>

      <LegalSection heading="4. Intellectual Property">
        <p>
          Cupi owns all rights to its animations, character artwork, code, and
          template designs. Purchasing an experience grants you a personal,
          non-transferable license to view and share your unique link — it does
          not transfer ownership of the underlying intellectual property.
        </p>
      </LegalSection>

      <LegalSection heading="5. Service Availability">
        <p>
          The generated link is intended for unlimited viewings by anyone
          possessing the URL. Cupi makes every effort to keep your experience
          available online and accessible; however, experiences may be removed
          if they are found to violate these terms.
        </p>
      </LegalSection>

      <LegalSection heading="6. Support Inquiries">
        <p>
          Direct all support inquiries, questions, or concerns to{' '}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="font-semibold text-rose-600 underline decoration-rose-200 underline-offset-4 hover:text-rose-500"
          >
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection heading="7. Business Information">
        <p>Legal Business Name: Mohammed Shafey</p>
      </LegalSection>
    </LegalLayout>
  )
}