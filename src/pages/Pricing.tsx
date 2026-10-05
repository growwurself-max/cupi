import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import { themeRegistry } from '../themes/registry'

interface PricingProps {
  onExit: () => void
}

export function Pricing({ onExit }: PricingProps) {
  const [prices, setPrices] = useState<Record<string, number>>({})

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0)

    // Fetch prices
    fetch(`${import.meta.env.VITE_API_URL || '/api'}/products/prices`)
      .then((res) => res.json())
      .then((data) => {
        if (data.prices) {
          setPrices(data.prices)
        }
      })
      .catch((err) => console.error('Failed to load prices:', err))
  }, [])

  return (
    <div className="min-h-screen bg-[#FEFAF4] text-stone-800">
      <header className="sticky top-0 z-40 flex h-16 items-center border-b border-rose-100/70 bg-white/70 px-4 backdrop-blur-md">
        <button
          type="button"
          onClick={onExit}
          className="flex h-10 w-10 items-center justify-center rounded-full text-stone-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="ml-2 font-display text-lg font-bold">Pricing & Plans</span>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="mb-4 font-display text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-stone-600">
            Choose the perfect template for your special occasion. Pay once, keep it forever.
            No hidden fees, no subscriptions.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(themeRegistry).map(([id, theme]: [string, any]) => {
            const price = prices[id]
            const isPremium = price && price > 100
            const themeMeta = theme?.metadata || {}

            return (
              <div
                key={id}
                className={`relative flex flex-col rounded-3xl border ${
                  isPremium
                    ? 'border-rose-200 bg-rose-50/50 shadow-xl shadow-rose-200/40'
                    : 'border-stone-200 bg-white shadow-lg'
                } p-8`}
              >
                {isPremium && (
                  <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-4 py-1 text-xs font-bold text-white shadow-sm">
                    Premium Template
                  </div>
                )}
                
                <h3 className="mb-2 font-display text-xl font-bold">{themeMeta.name || id}</h3>
                <p className="mb-6 text-sm text-stone-500 line-clamp-2">
                  {themeMeta.description || ''}
                </p>

                <div className="mb-6 flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-stone-900">
                    {price !== undefined ? `₹${price}` : '...'}
                  </span>
                  <span className="text-sm font-medium text-stone-500">one-time</span>
                </div>

                <ul className="mb-8 flex flex-1 flex-col gap-4">
                  <li className="flex items-start gap-3 text-sm text-stone-600">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-rose-500" />
                    <span>Permanent interactive link</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-stone-600">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-rose-500" />
                    <span>Background music included</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-stone-600">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-rose-500" />
                    <span>Up to {themeMeta.photoLimit || 0} personal photos</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-stone-600">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-rose-500" />
                    <span>Customizable messages</span>
                  </li>
                </ul>

                <button
                  type="button"
                  onClick={onExit}
                  className={`mt-auto flex w-full items-center justify-center rounded-full py-3 text-sm font-bold transition-all ${
                    isPremium
                      ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-md hover:shadow-lg'
                      : 'bg-stone-900 text-white hover:bg-stone-800'
                  }`}
                >
                  Explore Template
                </button>
              </div>
            )
          })}
        </div>

        <div className="mt-16 rounded-2xl bg-white p-8 text-center shadow-sm border border-stone-100">
          <h2 className="mb-3 font-display text-2xl font-bold text-stone-900">Need help deciding?</h2>
          <p className="mb-6 text-stone-600">Try our free previews before you buy. You only pay when you're ready to share the final surprise.</p>
          <button
            type="button"
            onClick={onExit}
            className="rounded-full bg-stone-100 px-6 py-2.5 text-sm font-bold text-stone-700 transition-colors hover:bg-stone-200"
          >
            View Demo Store
          </button>
        </div>
      </main>
    </div>
  )
}
