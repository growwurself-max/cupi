export {}

interface RazorpayPaymentResponse {
  razorpay_order_id?: string
  razorpay_payment_id?: string
  razorpay_signature?: string
  orderId?: string
  paymentId?: string
  signature?: string
}

interface RazorpayCheckoutOptions {
  key: string
  amount: number
  currency: string
  name: string
  description?: string
  order_id?: string
  image?: string
  notes?: Record<string, string>
  prefill?: { name?: string; email?: string; contact?: string }
  theme?: { color?: string; backdrop_color?: string }
  modal?: { ondismiss?: () => void }
  handler: (response: RazorpayPaymentResponse) => void | Promise<void>
}

interface RazorpayCheckoutInstance {
  open: () => void
  close: () => void
  on: (event: 'payment.failed', callback: (response: unknown) => void) => void
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayCheckoutInstance
  }
}