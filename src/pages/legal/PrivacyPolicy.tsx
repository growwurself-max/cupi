import { LegalLayout, LegalList, LegalSection, SUPPORT_EMAIL } from './LegalLayout'

interface LegalPageProps {
  onExit: () => void
}

export function PrivacyPolicy({ onExit }: LegalPageProps) {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="Last updated: September 2026"
      onExit={onExit}
    >
      <LegalSection heading="1. Information We Collect">
        <p>
          Cupi is built to help you celebrate the people you love with
          personalized, digital experiences. To create a surprise we collect
          only the details you choose to share with us during customization:
        </p>
        <LegalList
          items={[
            'Recipient and sender names.',
            'Custom celebration notes.',
            'Optional letter text submitted during experience customization.',
          ]}
        />
        <p>
          We do not require account registration, and we never ask for
          passwords, government IDs, bank credentials, or any financial
          information beyond what the payment gateway securely handles.
        </p>
      </LegalSection>

      <LegalSection heading="2. Payment Processing">
        <p>
          Payments on Cupi are processed securely through certified third-party
          payment aggregators (<strong>PhonePe</strong> and{' '}
          <strong>Razorpay</strong>). Cupi does not see, collect, or store card
          numbers, card CVVs, UPI PINs, or any sensitive payment credentials.
          All payment data stays within the secure, PCI-DSS compliant
          infrastructure of our trusted payment partners.
        </p>
      </LegalSection>

      <LegalSection heading="3. Data Retention & Security">
        <p>
          The personalized surprise data you provide (names, notes, and letter
          text) is encrypted in transit and stored securely on our servers — and
          only for as long as needed to display the recipient's experience at
          their unique URL. Should you ever wish to have an experience removed,
          simply contact us and we will delete it promptly.
        </p>
      </LegalSection>

      <LegalSection heading="4. Third-Party Sharing">
        <p>
          We are proud to keep your moments private. Cupi never sells, rents, or
          shares your personal data with advertisers, data brokers, or any other
          third parties. The only exception is processing your payment through
          our secured payment aggregators (PhonePe / Razorpay), which is
          necessary to complete your purchase.
        </p>
      </LegalSection>

      <LegalSection heading="5. Contact for Privacy Concerns">
        <p>
          If you have any questions, concerns, or requests regarding your data
          or this privacy policy, email us at{' '}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="font-semibold text-rose-600 underline decoration-rose-200 underline-offset-4 hover:text-rose-500"
          >
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  )
}