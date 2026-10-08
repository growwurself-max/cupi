import { useSyncExternalStore } from 'react'
import { createOrder } from './api'

/**
 * A cart line is a COMPLETE ready-to-buy customization, the exact same payload
 * the checkout would send: personalization, names, photos and the coupon the
 * buyer chose. That keeps "Add to cart" honest — the order can be created
 * seconds or days later without the buyer re-answering the customizer, and the
 * server still prices it fresh from the live price table at checkout.
 */
export interface CartItem {
  templateId: string
  customization: unknown
  couponCode: string | null
  referralCode: string | null
  trafficSource: string | null
}

const STORAGE_KEY = 'cupi_cart'

let cart: CartItem[] = read()
const listeners = new Set<() => void>()

function read(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (entry): entry is CartItem =>
        !!entry &&
        typeof entry === 'object' &&
        typeof (entry as CartItem).templateId === 'string' &&
        (entry as CartItem).customization !== undefined,
    )
  } catch {
    return []
  }
}

function persist(next: CartItem[]): void {
  cart = next
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Storage full/unavailable — the in-memory cart still works this session.
  }
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot(): CartItem[] {
  return cart
}

/** One template per cart line — adding again replaces the saved customization. */
export function addToCart(item: CartItem): CartItem[] {
  const next = [...cart.filter((entry) => entry.templateId !== item.templateId), item]
  persist(next)
  return next
}

export function removeFromCart(templateId: string): CartItem[] {
  persist(cart.filter((entry) => entry.templateId !== templateId))
  return cart
}

export function clearCart(): void {
  persist([])
}

export function isInCart(templateId: string): boolean {
  return cart.some((entry) => entry.templateId === templateId)
}

export function getCart(): CartItem[] {
  return cart
}

export function getCartCount(): number {
  return cart.length
}

/** Reactive cart contents for a component. Re-renders on every add/remove. */
export function useCartItems(): CartItem[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function useCartCount(): number {
  return useSyncExternalStore(subscribe, getCartCount, getCartCount)
}

/**
 * Pays for the oldest cart line right now: creates ONE order (one template) on
 * the server, removes it from the cart, and sends the buyer to the hosted
 * checkout. Returns true when a checkout was started. The item stays in the
 * cart if the order could not be arranged, so a failure never loses a purchase.
 */
export async function checkoutFirstInCart(): Promise<boolean> {
  const next = cart[0]
  if (!next) return false
  const order = await createOrder(
    next.templateId,
    next.customization,
    next.couponCode ?? undefined,
    {
      referralCode: next.referralCode ?? undefined,
      trafficSource: next.trafficSource,
    },
  )
  if (!order.checkoutUrl) {
    throw new Error('Failed to arrange payment. Please try again.')
  }
  removeFromCart(next.templateId)
  window.location.assign(order.checkoutUrl)
  return true
}