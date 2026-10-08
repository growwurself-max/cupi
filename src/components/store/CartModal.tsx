import { AnimatePresence, motion } from 'framer-motion'
import { LoaderCircle, Lock, X } from 'lucide-react'
import { useState } from 'react'
import { checkoutFirstInCart, removeFromCart, useCartItems } from '../../lib/cart'
import { formatRupees, useProductPrices } from '../../lib/prices'
import { themeRegistry } from '../../themes/registry'

interface CartModalProps {
  open: boolean
  onClose: () => void
}

export function CartModal({ open, onClose }: CartModalProps) {
  const items = useCartItems()
  const prices = useProductPrices()
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const withPrices = items.map((item) => {
    const meta = themeRegistry[item.templateId]?.metadata
    const price = prices[item.templateId]
    return {
      ...item,
      name: meta?.name ?? item.templateId,
      emoji: meta?.previewVisual.emoji ?? '🎁',
      price,
    }
  })
  const total = withPrices.reduce((sum, item) => sum + (item.price ?? 0), 0)
  const pricesReady = withPrices.every((item) => item.price !== undefined)
  const canCheckout = withPrices.length > 0 && !checking && pricesReady

  const handleCheckout = async () => {
    setChecking(true)
    setError(null)
    try {
      await checkoutFirstInCart()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start payment right now.')
      setChecking(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Your cart"
        >
          <div
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="relative max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-3xl border border-rose-100/70 bg-ivory p-6 shadow-[0_24px_70px_rgba(30,15,20,0.22)] sm:p-7"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-xl ring-1 ring-rose-100">
                  🛒
                </span>
                <div>
                  <h2 className="font-display text-lg font-semibold text-stone-900">
                    Your cart
                  </h2>
                  <p className="text-xs text-stone-500">
                    {withPrices.length === 0
                      ? 'Nothing here yet'
                      : `${withPrices.length} surprise${withPrices.length > 1 ? 's' : ''} ready to buy`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close cart"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-50 text-stone-500 transition-all duration-200 hover:bg-rose-50 hover:text-rose-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {withPrices.length === 0 && (
                <div className="rounded-2xl border border-dashed border-rose-200/80 bg-white/60 px-4 py-8 text-center">
                  <p className="text-sm text-stone-500">
                    Your cart is empty. Personalize a surprise and hit
                    <span className="font-semibold text-rose-500"> Add to cart </span>
                    on the last step.
                  </p>
                </div>
              )}

              {withPrices.map((item) => (
                <div
                  key={item.templateId}
                  className="flex items-center gap-3 rounded-2xl border border-rose-100/70 bg-white/80 p-3 shadow-sm"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-xl ring-1 ring-rose-100">
                    {item.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-stone-900">
                      {item.name}
                    </p>
                    <p className="text-xs text-stone-500">
                      {item.price !== undefined
                        ? formatRupees(item.price)
                        : 'Loading price…'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.templateId)}
                    aria-label={`Remove ${item.name} from cart`}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-rose-50 hover:text-rose-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {withPrices.length > 0 && (
              <div className="mt-5 rounded-2xl border border-rose-100 bg-white/70 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-stone-500">Subtotal</span>
                  <span className="font-display text-lg font-bold text-stone-900">
                    {pricesReady ? formatRupees(total) : '…'}
                  </span>
                </div>
                <p className="pt-1 text-[11px] leading-relaxed text-stone-400">
                  Each surprise is paid for one at a time. Your cart keeps the rest
                  safe — no duplicate charges, ever.
                </p>
              </div>
            )}

            {error && (
              <p className="mt-3 text-xs font-medium text-rose-500">{error}</p>
            )}

            <button
              type="button"
              disabled={!canCheckout}
              onClick={handleCheckout}
              className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 text-sm font-bold text-white shadow-lg shadow-rose-200 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
            >
              {checking ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Arranging payment…
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  {withPrices.length === 0
                    ? 'Checkout'
                    : pricesReady
                      ? `Checkout · ${formatRupees(total)}`
                      : 'Checkout'}
                </>
              )}
            </button>
            {withPrices.length > 0 && (
              <p className="pt-2 text-center text-[11px] font-medium text-stone-400">
                Prices shown are live and confirmed at checkout.
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}