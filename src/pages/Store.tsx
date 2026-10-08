import { CheckCircle2, Home, LoaderCircle, RefreshCw, ShoppingCart } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { fetchMyOrders, verifyOrder, type MyOrder } from '../lib/api'
import { themeRegistry } from '../themes/registry'

interface StoreProps {
  onExit: () => void
  onOpenCart: () => void
}

type LoadState =
  | { phase: 'loading' }
  | { phase: 'error'; message: string }
  | { phase: 'ready'; orders: MyOrder[] }

const STATUS_LABEL: Record<MyOrder['status'], string> = {
  PAID: 'Purchased',
  PENDING: 'Payment pending',
  FAILED: 'Not completed',
}

const STATUS_CHIP: Record<MyOrder['status'], string> = {
  PAID: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
  PENDING: 'bg-amber-50 text-amber-600 ring-amber-100',
  FAILED: 'bg-rose-50 text-rose-500 ring-rose-100',
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

export function Store({ onExit, onOpenCart }: StoreProps) {
  const [state, setState] = useState<LoadState>({ phase: 'loading' })
  const [reloadKey, setReloadKey] = useState(0)
  const [finishing, setFinishing] = useState<string | null>(null)
  const [finishMessage, setFinishMessage] = useState<{
    orderId: string
    text: string
    ok: boolean
  } | null>(null)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const res = await fetchMyOrders()
        if (active) setState({ phase: 'ready', orders: res.orders })
      } catch (err) {
        if (active) {
          setState({
            phase: 'error',
            message: err instanceof Error ? err.message : 'Could not load your purchases.',
          })
        }
      }
    })()
    return () => {
      active = false
    }
  }, [reloadKey])

  const bumpReload = () => setReloadKey((k) => k + 1)

  const finishPayment = useCallback(
    async (orderId: string) => {
      setFinishing(orderId)
      setFinishMessage(null)
      try {
        const res = await verifyOrder({ orderId })
        if (res.success && res.experienceId) {
          setFinishMessage({
            orderId,
            text: 'Payment confirmed — your surprise is ready to open.',
            ok: true,
          })
        } else {
          setFinishMessage({
            orderId,
            text:
              res.status === 'pending'
                ? 'Your payment is still processing. We’re checking — nothing will be charged twice.'
                : 'This payment was not completed. You are safe to try again — nothing was charged.',
            ok: false,
          })
        }
        bumpReload()
      } catch (err) {
        setFinishMessage({
          orderId,
          text:
            err instanceof Error && err.message
              ? err.message
              : 'Could not check this payment right now. Please try again.',
          ok: false,
        })
      } finally {
        setFinishing(null)
      }
    },
    [],
  )

  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden bg-[#FEFAF4] bg-gradient-to-b from-[#FDF3EC] via-[#FEF9F4] to-[#FBE9EC]">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[540px] w-[860px] -translate-x-1/2 rounded-full bg-rose-100/35 blur-3xl"
      />
      <div className="relative z-[1] mx-auto max-w-3xl px-4 pt-28 pb-16 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-rose-500 uppercase">
              Cupi · My Store
            </p>
            <h1 className="font-display mt-1 text-3xl font-bold text-stone-900">
              Your surprises
            </h1>
            <p className="mt-1.5 max-w-md text-sm leading-relaxed text-stone-500">
              Every purchase and unfinished payment linked to your account, in
              one place — so a closed tab or a dropped internet connection never
              costs you your surprise.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenCart}
            className="flex h-12 shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 px-4 text-sm font-bold text-white shadow-lg shadow-rose-200 transition-all duration-200 hover:scale-[1.03] active:scale-95"
          >
            <ShoppingCart className="h-4 w-4" />
            Cart
          </button>
        </div>

        <div className="mt-8 space-y-3">
          {state.phase === 'loading' && (
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-rose-100/70 bg-white/70 py-14 text-center">
              <LoaderCircle className="h-6 w-6 animate-spin text-rose-400" />
              <p className="text-sm text-stone-500">Loading your purchases…</p>
            </div>
          )}

          {state.phase === 'error' && (
            <div className="rounded-3xl border border-rose-100/70 bg-white/70 p-8 text-center">
              <p className="text-sm text-stone-600">We couldn’t load your purchases.</p>
              <button
                type="button"
                onClick={() => {
                  setState({ phase: 'loading' })
                  bumpReload()
                }}
                className="mt-4 flex min-h-11 items-center gap-2 rounded-full bg-rose-500 px-5 text-sm font-bold text-white transition-colors hover:bg-rose-600"
              >
                <RefreshCw className="h-4 w-4" />
                Try again
              </button>
            </div>
          )}

          {state.phase === 'ready' && state.orders.length === 0 && (
            <div className="rounded-3xl border border-dashed border-rose-200/80 bg-white/60 px-6 py-12 text-center">
              <span className="text-4xl">🎁</span>
              <p className="font-display mt-3 text-lg font-semibold text-stone-800">
                Nothing here yet
              </p>
              <p className="mx-auto max-w-sm pt-1 text-sm leading-relaxed text-stone-500">
                When you buy a surprise, it will show up here automatically —
                and you can finish it from any device after you sign in.
              </p>
              <button
                type="button"
                onClick={onExit}
                className="mt-5 flex min-h-11 items-center gap-2 rounded-full bg-rose-500 px-5 text-sm font-bold text-white transition-colors hover:bg-rose-600"
              >
                <Home className="h-4 w-4" />
                Explore surprises
              </button>
            </div>
          )}

          {state.phase === 'ready' &&
            state.orders.map((order) => {
              const meta = themeRegistry[order.templateId]?.metadata
              return (
                <div
                  key={order.orderId}
                  className="flex flex-col gap-3 rounded-3xl border border-rose-100/70 bg-white/80 p-4 shadow-[0_2px_12px_rgba(244,63,94,0.06)] sm:flex-row sm:items-center"
                >
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-2xl ring-1 ring-rose-100">
                    {meta?.previewVisual.emoji ?? '🎁'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-base font-semibold text-stone-900">
                        {meta?.name ?? order.templateId}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${STATUS_CHIP[order.status]}`}
                      >
                        {order.status === 'PAID' && (
                          <CheckCircle2 className="h-3 w-3" />
                        )}
                        {STATUS_LABEL[order.status]}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-stone-500">
                      ₹{order.amount} · {formatDate(order.createdAt)}
                    </p>
                    {finishMessage && finishMessage.orderId === order.orderId && (
                      <p
                        className={`pt-1.5 text-xs leading-relaxed ${
                          finishMessage.ok ? 'text-emerald-600' : 'text-stone-500'
                        }`}
                      >
                        {finishMessage.text}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0">
                    {order.status === 'PAID' && order.sharePath ? (
                      <a
                        href={order.sharePath}
                        className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 px-5 text-sm font-bold text-white shadow-lg shadow-rose-200 transition-all duration-200 hover:scale-[1.03] active:scale-95"
                      >
                        Open your surprise
                      </a>
                    ) : (
                      <button
                        type="button"
                        disabled={finishing === order.orderId}
                        onClick={() => void finishPayment(order.orderId)}
                        className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-rose-200 bg-white px-5 text-sm font-semibold text-rose-600 transition-all duration-200 hover:bg-rose-50 active:scale-95 disabled:opacity-60"
                      >
                        {finishing === order.orderId ? (
                          <>
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                            Checking…
                          </>
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                        {order.status === 'PAID' ? 'Re-check order' : 'Finish payment'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
        </div>

        <div className="mt-8 rounded-3xl border border-rose-100 bg-white/60 p-5">
          <p className="text-sm font-semibold text-stone-800">
            Didn’t finish paying? No stress.
          </p>
          <ul className="mt-2 space-y-1.5 text-[13px] leading-relaxed text-stone-500">
            <li>• Payments are checked with the gateway directly — never trusted blindly.</li>
            <li>• The same order can be finished safely; you are never charged twice.</li>
            <li>• Orders placed while signed out or before this feature existed won’t appear here.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}