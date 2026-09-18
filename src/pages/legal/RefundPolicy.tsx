import { LegalLayout, LegalList, LegalSection, SUPPORT_EMAIL } from './LegalLayout'

interface LegalPageProps {
  onExit: () => void
}

export function RefundPolicy({ onExit }: LegalPageProps) {
  return (
    <LegalLayout
      title="Cancellation & Refund Policy"
      subtitle="Last updated: September 2026"
      onExit={onExit}
    >
      <LegalSection heading="1. Digital Nature of Product">
        <p>
          Cupi surprises are customized, instantly generated, and locked upon
          payment verification. Because the product is a personalized digital
          experience delivered immediately through a unique link, standard
          cancellations are not applicable once the link has been generated and
          the experience delivered.
        </p>
      </LegalSection>

      <LegalSection heading="2. Eligible Refund Cases">
        <p>Refunds are issued only in the following circumstances:</p>
        <LegalList
          items={[
            'Technical Failure: If payment was debited from your account but the unique experience link was not generated or delivered.',
            'Duplicate Billing: If an order was inadvertently charged more than once due to a network or gateway glitch.',
          ]}
        />
        <p>
          Any other requests are evaluated on a case-by-case basis at Cupi's sole
          discretion.
        </p>
      </LegalSection>

      <LegalSection heading="3. Refund Timeline">
        <p>
          Once approved, refunds are processed back to the original payment
          method (Bank Account / UPI / Card) within{' '}
          <strong>5–7 working days</strong>. The exact credit time may vary
          depending on your bank or payment gateway's processing policies.
        </p>
      </LegalSection>

      <LegalSection heading="4. How to Request a Refund">
        <p>
          Email us at{' '}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="font-semibold text-rose-600 underline decoration-rose-200 underline-offset-4 hover:text-rose-500"
          >
            {SUPPORT_EMAIL}
          </a>{' '}
          with your payment ID, transaction date, and order details, and our
          support team will assist you promptly.
        </p>
      </LegalSection>
    </LegalLayout>
  )
}