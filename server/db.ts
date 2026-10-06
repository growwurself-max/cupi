/**
 * Cupi's data facade.
 *
 * Every route imports from here, and nothing above this file knows or cares
 * where the records physically live. Production is backed by a free, persistent
 * cloud Postgres (see `postgresStore.ts`); local development falls back to
 * `db.json` (`jsonStore.ts`) so the project still runs with no cloud account.
 *
 * IMPORTANT: in production the JSON file store is refused outright. Falling back
 * to a container filesystem silently is what made already-shared /x/:id links
 * stop resolving after a Render restart.
 */

import { createPostgresStoreFromEnv } from './postgresStore.js'
import { JsonFileStore } from './jsonStore.js'
import { readSupabaseConfig } from './supabase.js'
import type {
  CouponRecord,
  CreateCouponInput,
  CreateInfluencerInput,
  CreateOrderInput,
  ExperienceRecord,
  ExperienceStatus,
  InfluencerMetrics,
  InfluencerRecord,
  InfluencerStatus,
  OrderAttribution,
  OrderRecord,
  OrderStatus,
  Store,
  UpdateCouponInput,
  UpdateInfluencerInput,
} from './store.js'

export type {
  CouponRecord,
  CreateCouponInput,
  CreateInfluencerInput,
  CreateOrderInput,
  ExperienceRecord,
  ExperienceStatus,
  InfluencerMetrics,
  InfluencerRecord,
  InfluencerStatus,
  OrderAttribution,
  OrderRecord,
  OrderStatus,
  Store,
  UpdateCouponInput,
  UpdateInfluencerInput,
}

/**
 * Resolved lazily-but-eagerly: at import time, so every route sees the same
 * store. A configuration problem is CAPTURED rather than thrown here, because a
 * throw at module scope surfaces as a bare stack trace before the boot handler
 * can explain it. `assertStoreReady()` re-throws it at boot, where it is logged
 * as one actionable line.
 */
let store: Store | null = null
let storeError: Error | null = null

function resolveStore(): void {
  if (readSupabaseConfig() !== null) {
    console.log('[db] using Supabase PostgreSQL (persistent cloud storage)')
    store = createPostgresStoreFromEnv()
    return
  }

  if (process.env.NODE_ENV === 'production') {
    storeError = new Error(
      'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in production. ' +
        'Refusing to run on the local db.json file store, because a container filesystem is wiped on ' +
        'every deploy and free-tier spin-down, which breaks every generated-website share link. ' +
        'Set both variables in the Render dashboard (see supabase/README.md).',
    )
    return
  }

  console.warn(
    '[db] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set — using the local db.json file store. ' +
      'This is fine for development only: data here does not survive a redeploy.',
  )
  store = new JsonFileStore()
}

resolveStore()

/** The live store. Throws rather than silently doing nothing if unconfigured. */
function activeStore(): Store {
  if (!store) {
    throw storeError ?? new Error('No data store is configured.')
  }
  return store
}

/** Which backend is live. Reported by /api/health so it can never be a surprise. */
export function activeStoreKind(): string {
  return store?.kind ?? 'unconfigured'
}

/** False when records live on an ephemeral disk (local dev only). */
export function isStoreDurable(): boolean {
  return store?.durable ?? false
}

/** Called at boot so a misconfigured or unreachable database fails loudly. */
export async function assertStoreReady(): Promise<void> {
  const active = activeStore()
  const health = await active.healthCheck()
  if (!health.ok) {
    throw new Error(
      `Cupi cannot reach its persistent store (${active.kind}): ${health.detail}. ` +
        'Orders and generated websites cannot be saved safely, so the API refuses to start.',
    )
  }
  console.log(`[db] ${active.kind} ready: ${health.detail}`)
}

export function createOrder(input: CreateOrderInput): Promise<OrderRecord> {
  return activeStore().createOrder(input)
}

export function getOrderById(id: string): Promise<OrderRecord | null> {
  return activeStore().getOrderById(id)
}

export function getOrderByGatewayOrderId(
  gatewayOrderId: string,
): Promise<OrderRecord | null> {
  return activeStore().getOrderByGatewayOrderId(gatewayOrderId)
}

/**
 * Creates the single LOCKED website for a verified payment. Safe to call again
 * for the same order — a duplicate webhook or a replayed verify returns the one
 * existing website and never produces a second one.
 */
export function finalizeOrderForPayment(input: {
  orderId: string
  gatewayPaymentId?: string | null
}): Promise<ExperienceRecord> {
  return activeStore().finalizeOrderForPayment(input)
}

export function getExperienceById(id: string): Promise<ExperienceRecord | null> {
  return activeStore().getExperienceById(id)
}

export function isExperienceLocked(id: string): Promise<boolean> {
  return activeStore().isExperienceLocked(id)
}

/** Best-effort; never throws and never affects website content. */
export function incrementViewCount(id: string): Promise<void> {
  return activeStore().incrementViewCount(id)
}

export function countExperiences(): Promise<number> {
  return activeStore().countExperiences()
}

export function getProductPrice(templateId: string): Promise<number | null> {
  return activeStore().getProductPrice(templateId)
}

export function updateProductPrice(templateId: string, price: number): Promise<number> {
  return activeStore().updateProductPrice(templateId, price)
}

export function getTemplateAudio(templateId: string): Promise<{ audioData?: string; audioUrl?: string } | null> {
  return activeStore().getTemplateAudio(templateId)
}

export function setTemplateAudio(templateId: string, audioData: string | null, audioUrl: string | null): Promise<void> {
  return activeStore().setTemplateAudio(templateId, audioData, audioUrl)
}

export function listInfluencers(): Promise<InfluencerRecord[]> {
  return activeStore().listInfluencers()
}

export function getInfluencerById(id: string): Promise<InfluencerRecord | null> {
  return activeStore().getInfluencerById(id)
}

export function getInfluencerByCode(code: string): Promise<InfluencerRecord | null> {
  return activeStore().getInfluencerByCode(code)
}

export function createInfluencer(input: CreateInfluencerInput): Promise<InfluencerRecord> {
  return activeStore().createInfluencer(input)
}

export function updateInfluencer(
  id: string,
  input: UpdateInfluencerInput,
): Promise<InfluencerRecord | null> {
  return activeStore().updateInfluencer(id, input)
}

export function deleteInfluencer(id: string): Promise<boolean> {
  return activeStore().deleteInfluencer(id)
}

export function getInfluencerMetrics(): Promise<Map<string, InfluencerMetrics>> {
  return activeStore().getInfluencerMetrics()
}

// ---------------------------------------------------------------- coupons --

export type { CouponKind, CouponStatus } from './store.js'

export function listCoupons(): Promise<CouponRecord[]> {
  return activeStore().listCoupons()
}

export function getCouponByCode(code: string): Promise<CouponRecord | null> {
  return activeStore().getCouponByCode(code)
}

export function createCoupon(input: CreateCouponInput): Promise<CouponRecord> {
  return activeStore().createCoupon(input)
}

export function updateCoupon(
  code: string,
  input: UpdateCouponInput,
): Promise<CouponRecord | null> {
  return activeStore().updateCoupon(code, input)
}

export function deleteCoupon(code: string): Promise<boolean> {
  return activeStore().deleteCoupon(code)
}

/**
 * PAID orders only — the count `max_redemptions` is checked against. Derived
 * from the orders table so it cannot drift from the orders it describes.
 */
export function countCouponRedemptions(code: string): Promise<number> {
  return activeStore().countCouponRedemptions(code)
}

/** One grouped query for the admin list. */
export function getCouponRedemptionCounts(): Promise<Map<string, number>> {
  return activeStore().getCouponRedemptionCounts()
}

export { shortId } from './jsonStore.js'
export { systemId } from './systemId.js'
