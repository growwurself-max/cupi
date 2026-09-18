import axios from 'axios'

const CASHFREE_APP_ID =
  process.env.CASHFREE_APP_ID || 'CF11236832DAMKPJVE7LSC73ABALIG'
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || ''
const IS_PRODUCTION = process.env.CASHFREE_ENVIRONMENT === 'PRODUCTION'

const CASHFREE_BASE_URL = IS_PRODUCTION
  ? 'https://api.cashfree.com/pg'
  : 'https://sandbox.cashfree.com/pg'

const headers = {
  'Content-Type': 'application/json',
  'x-client-id': CASHFREE_APP_ID,
  'x-client-secret': CASHFREE_SECRET_KEY,
  'x-api-version': '2023-08-01',
}

export interface CashfreeCreateOrderInput {
  orderId: string
  amount: number
  customerName: string
}

export interface CashfreeOrderData {
  payment_session_id?: string
  order_id?: string
  order_status?: 'ACTIVE' | 'PAID' | 'EXPIRED'
  order_amount?: number
  order_currency?: string
  cf_order_id?: string
  customer_details?: {
    customer_id?: string
    customer_email?: string
    customer_name?: string
    customer_phone?: string
  }
}

export async function createCashfreeOrder({
  orderId,
  amount,
  customerName,
}: CashfreeCreateOrderInput): Promise<CashfreeOrderData> {
  const payload = {
    order_id: orderId,
    order_amount: amount, // Float in INR, e.g. 9.00, 29.00, 49.00, 69.00
    order_currency: 'INR',
    customer_details: {
      customer_id: `cust_${Date.now()}`,
      customer_name: customerName || 'Valued Customer',
      customer_email: 'cupisupport@gmail.com',
      customer_phone: '9999999999',
    },
    order_meta: {
      return_url: `${process.env.FRONTEND_URL || 'https://cupi-one.vercel.app'}/x/${orderId}?order_id={order_id}`,
    },
  }

  const response = await axios.post<CashfreeOrderData>(
    `${CASHFREE_BASE_URL}/orders`,
    payload,
    { headers },
  )
  return response.data // contains payment_session_id
}

export async function getCashfreeOrderStatus(
  orderId: string,
): Promise<CashfreeOrderData> {
  const response = await axios.get<CashfreeOrderData>(
    `${CASHFREE_BASE_URL}/orders/${orderId}`,
    { headers },
  )
  return response.data // contains order_status: 'PAID' | 'ACTIVE' | 'EXPIRED'
}