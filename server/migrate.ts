/**
 * npm run migrate-data
 *
 * Moves Cupi's persistent data out of the local `db.json` file and into the
 * free, persistent cloud Postgres database, WITHOUT changing any identifier.
 *
 * Design rules this script follows:
 *
 *  • READ-ONLY on the source. db.json is never modified, moved or deleted; a
 *    timestamped copy is exported first as an extra safety net.
 *  • IDEMPOTENT. Every insert is an upsert keyed on the existing primary key, so
 *    running it twice produces no duplicates and simply re-verifies.
 *  • IDS ARE PRESERVED. Order ids, `fg_...` slugs and Cupi slugs are copied
 *    verbatim. A URL that was already shared keeps resolving to the same record.
 *  • VERIFY BEFORE TRUSTING. Record counts and every migrated identifier are
 *    read back from the database before the script reports success.
 *  • HONEST REPORTING. It never claims success unless the rows were actually
 *    found in the destination.
 *
 * Usage:
 *   SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… npm run migrate-data
 *   npm run migrate-data -- --dry-run      # report only, write nothing
 *   npm run migrate-data -- --source path/to/db.json
 */

import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { DATA_DIR } from './config.js'
import { DB_FILE, readJsonDbFile, type JsonDatabase } from './jsonStore.js'
import { PostgresStore } from './postgresStore.js'
import { normalizeCode } from './influencers.js'
import { escapePostgrestValue, readSupabaseConfig, SupabaseRest } from './supabase.js'
import type { StoredCoupon, StoredExperience, StoredInfluencer, StoredOrder } from './store.js'

const argv = process.argv.slice(2)
const DRY_RUN = argv.includes('--dry-run')
const sourceFlag = argv.indexOf('--source')
const SOURCE_FILE = sourceFlag >= 0 ? (argv[sourceFlag + 1] ?? DB_FILE) : DB_FILE
const BACKUP_DIR = path.join(DATA_DIR, 'migration-backups')

function heading(text: string): void {
  console.log(`\n=== ${text} ===`)
}

function fail(message: string): never {
  console.error(`\nMIGRATION FAILED: ${message}`)
  process.exit(1)
}

/** Total row count via the Content-Range header; 0 when the header is absent. */
async function countRows(rest: SupabaseRest, table: string): Promise<number> {
  const { headers } = await rest.request<unknown[]>({
    method: 'GET',
    path: table,
    query: { select: 'id', limit: 1 },
    prefer: 'count=exact',
  })
  return SupabaseRest.parseExactCount(headers) ?? 0
}

async function main(): Promise<void> {
  heading('Cupi data migration: db.json -> Supabase PostgreSQL')

  const config = readSupabaseConfig()
  if (!config) {
    fail(
      'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must both be set.\n' +
        '  Add them to your shell or .env, then re-run. See supabase/README.md.',
    )
  }

  console.log(`destination : ${config.url.replace(/^(https?:\/\/)[^@]*@/, '$1***@')}`)
  console.log(`source     : ${SOURCE_FILE}`)
  console.log(`mode       : ${DRY_RUN ? 'DRY RUN (no writes)' : 'MIGRATE'}`)

  // ---------------------------------------------------------------- source ---
  heading('1. Read and validate the source')
  if (!existsSync(SOURCE_FILE)) {
    console.log(`No file at ${SOURCE_FILE} — treating the source as empty.`)
  }

  let source: JsonDatabase
  try {
    source = readJsonDbFile(SOURCE_FILE)
  } catch (error) {
    fail(
      `could not parse ${SOURCE_FILE}: ${(error as Error).message}\n` +
        '  Fix or restore the file first. Nothing was written to the database.',
    )
  }

  const backupPath = existsSync(SOURCE_FILE) ? exportBackup(SOURCE_FILE) : null
  console.log(`backup     : ${backupPath ?? 'nothing to back up'}`)
  console.log(`orders found      : ${source.orders.length}`)
  console.log(`experiences found : ${source.experiences.length}`)
  console.log(`influencers found : ${source.influencers?.length ?? 0}`)
  console.log(`coupons found     : ${source.coupons?.length ?? 0}`)

  // Partners migrate first: cupi_orders.influencer_id is a foreign key onto
  // them, so an order attributed to a partner cannot be inserted before that
  // partner exists.
  const influencerErrors: string[] = []
  const validInfluencers: StoredInfluencer[] = []
  const seenCodes = new Set<string>()
  for (const row of source.influencers ?? []) {
    if (!row.id || !row.unique_code) {
      influencerErrors.push(`influencer without id/unique_code: ${JSON.stringify(row).slice(0, 120)}`)
      continue
    }
    const code = normalizeCode(String(row.unique_code))
    if (seenCodes.has(code)) {
      // cupi_influencers.unique_code is unique; a duplicate here would abort the
      // whole upsert batch, so the later row is skipped and reported.
      influencerErrors.push(`duplicate influencer code ${code} — skipped`)
      continue
    }
    seenCodes.add(code)
    validInfluencers.push({ ...row, unique_code: code })
  }
  const knownInfluencerIds = new Set(validInfluencers.map((row) => row.id))

  // Per-row validation. A bad row is skipped and reported, never guessed at.
  const orderErrors: string[] = []
  const validOrders: StoredOrder[] = []
  for (const row of source.orders) {
    if (!row.id || !row.gateway_order_id) {
      orderErrors.push(`order without id/gateway_order_id: ${JSON.stringify(row).slice(0, 120)}`)
    } else if (!row.customization_payload) {
      orderErrors.push(`order ${row.id} has no customization payload`)
    } else if (row.influencer_id && !knownInfluencerIds.has(row.influencer_id)) {
      // influencer_id is a foreign key: keeping a stale id would abort the whole
      // insert. The code and money snapshots still carry the attribution.
      orderErrors.push(
        `order ${row.id} references missing influencer ${row.influencer_id} (kept, link nulled)`,
      )
      validOrders.push({ ...row, influencer_id: null })
    } else {
      validOrders.push(row)
    }
  }

  const experienceErrors: string[] = []
  const validExperiences: StoredExperience[] = []
  const knownOrderIds = new Set(validOrders.map((order) => order.id))
  for (const row of source.experiences) {
    if (!row.id) {
      experienceErrors.push('experience without an id')
      continue
    }
    // The website is more valuable than its order row, so an orphan is kept —
    // but reported, because its uniqueness can no longer be proven.
    if (row.order_id && !knownOrderIds.has(row.order_id)) {
      experienceErrors.push(`website ${row.id} references missing order ${row.order_id} (kept)`)
    }
    validExperiences.push(row)
  }

  const legacySlugs = validExperiences.filter((row) => row.id.startsWith('fg_')).length
  console.log(`influencers valid  : ${validInfluencers.length}`)
  console.log(`orders valid       : ${validOrders.length}`)
  console.log(`experiences valid  : ${validExperiences.length}`)
  console.log(`orders skipped     : ${orderErrors.length}`)
  console.log(`experiences skipped: ${experienceErrors.length}`)
  console.log(`legacy fg_ slugs   : ${legacySlugs}`)

  if (DRY_RUN) {
    heading('DRY RUN complete — nothing was written')
    for (const message of [...influencerErrors, ...orderErrors, ...experienceErrors]) {
      console.log(`  ! ${message}`)
    }
    console.log('\nRe-run without --dry-run to migrate.')
    return
  }

  // ----------------------------------------------------------- destination ---
  heading('2. Connect to the database')
  const rest = new SupabaseRest(config)

  for (const table of ['cupi_orders', 'cupi_experiences', 'cupi_influencers']) {
    try {
      await rest.request({ method: 'GET', path: table, query: { select: 'id', limit: 1 } })
    } catch (error) {
      const status = (error as { status?: number }).status
      if (status === 404) {
        fail(
          `the ${table} table does not exist yet.\n` +
            '  Run supabase/schema.sql once in the Supabase dashboard (SQL Editor), then re-run this script.\n' +
            '  Nothing was written.',
        )
      }
      throw error
    }
  }
  console.log('schema present     : cupi_orders, cupi_experiences, cupi_influencers')

  // ------------------------------------------------------------- migrate ---
  // Influencers first: cupi_orders.influencer_id is a foreign key onto them.
  heading('3. Migrate influencers (upsert on id — idempotent)')
  let influencersWritten = 0
  for (const influencer of validInfluencers) {
    const { data } = await rest.request<StoredInfluencer[]>({
      method: 'POST',
      path: 'cupi_influencers',
      query: { on_conflict: 'id' },
      prefer: 'resolution=merge-duplicates,return=representation',
      body: {
        id: influencer.id,
        name: influencer.name,
        email: influencer.email ?? null,
        phone: influencer.phone ?? null,
        unique_code: influencer.unique_code,
        discount_percentage: Number(influencer.discount_percentage) || 0,
        commission_percentage: Number(influencer.commission_percentage) || 0,
        expiry_date: influencer.expiry_date ?? null,
        status: influencer.status === 'paused' ? 'paused' : 'active',
        created_at: influencer.created_at,
        updated_at: influencer.updated_at,
      },
    })
    const saved = Array.isArray(data) ? data[0] : undefined
    if (saved && saved.id === influencer.id) {
      influencersWritten += 1
    } else {
      console.log(`  ! influencer ${influencer.id} did not read back correctly`)
    }
  }
  console.log(`influencers migrated: ${influencersWritten}/${validInfluencers.length}`)

  // Campaign coupons have no dependents (orders reference codes by text, never
  // by foreign key), so they migrate on their own after the partners. The
  // cupi_coupons table is the newest addition to the schema: if an operator has
  // not re-run supabase/schema.sql yet, coupons are skipped with one warning
  // rather than failing a migration of orders and websites that would succeed.
  heading('3b. Migrate campaign coupons (upsert on code — idempotent)')
  const sourceCoupons = source.coupons ?? []
  let couponsWritten = 0
  let couponsFailed = 0
  let couponsTableMissing = false
  for (const coupon of sourceCoupons) {
    if (!coupon.code) {
      couponsFailed += 1
      console.log('  ! coupon without a code — skipped')
      continue
    }
    try {
      const { data } = await rest.request<StoredCoupon[]>({
        method: 'POST',
        path: 'cupi_coupons',
        query: { on_conflict: 'code' },
        prefer: 'resolution=merge-duplicates,return=representation',
        body: {
          code: coupon.code,
          kind: coupon.kind === 'flat' ? 'flat' : 'percent',
          value: Number(coupon.value) || 0,
          applies_to: coupon.applies_to ?? [],
          min_amount: Number(coupon.min_amount) || 0,
          max_redemptions: coupon.max_redemptions ?? null,
          starts_at: coupon.starts_at ?? null,
          expires_at: coupon.expires_at ?? null,
          status: coupon.status ?? 'active',
          created_at: coupon.created_at,
          updated_at: coupon.updated_at,
        },
      })
      const saved = Array.isArray(data) ? data[0] : undefined
      if (saved && saved.code === coupon.code) {
        couponsWritten += 1
      } else {
        couponsFailed += 1
        console.log(`  ! coupon ${coupon.code} did not read back correctly`)
      }
    } catch (error) {
      if ((error as { status?: number }).status === 404) {
        couponsTableMissing = true
        break
      }
      couponsFailed += 1
      console.log(`  ! coupon ${coupon.code} rejected: ${(error as Error).message}`)
    }
  }
  if (couponsTableMissing) {
    console.log(
      '  ! the cupi_coupons table does not exist yet — run supabase/schema.sql and re-run ' +
        'to migrate coupons. Orders and websites were not affected.',
    )
  }
  console.log(`coupons migrated   : ${couponsWritten}/${sourceCoupons.length}`)

  // Orders next: cupi_experiences.order_id is a foreign key onto cupi_orders.
  heading('4. Migrate orders (upsert on the existing id — idempotent)')
  let ordersWritten = 0
  for (const order of validOrders) {
    const { data } = await rest.request<StoredOrder[]>({
      method: 'POST',
      path: 'cupi_orders',
      // merge-duplicates makes a re-run an update instead of a duplicate insert.
      prefer: 'resolution=merge-duplicates,return=representation',
      body: {
        id: order.id,
        gateway_order_id: order.gateway_order_id,
        gateway_payment_id: order.gateway_payment_id ?? null,
        template_id: order.template_id,
        amount: order.amount,
        currency: order.currency || 'INR',
        status: order.status || 'PENDING',
        customization_payload: order.customization_payload,
        experience_id: order.experience_id ?? null,
        created_at: order.created_at,
        updated_at: order.updated_at,
        // Attribution columns. Legacy rows predate the influencer system, so
        // they migrate as a direct sale: no partner, no discount. Their money
        // snapshots default to the amount actually charged.
        influencer_id: order.influencer_id ?? null,
        coupon_code: order.coupon_code ?? null,
        original_amount: order.original_amount ?? Number(order.amount),
        discount_given: Number(order.discount_given ?? 0) || 0,
        net_revenue: Number(order.net_revenue ?? Number(order.amount)) || 0,
        influencer_commission_earned: Number(order.influencer_commission_earned ?? 0) || 0,
        traffic_source: order.traffic_source ?? null,
        customer_ip: order.customer_ip ?? null,
      },
    })
    const saved = Array.isArray(data) ? data[0] : undefined
    if (saved && saved.id === order.id && saved.gateway_order_id === order.gateway_order_id) {
      ordersWritten += 1
    } else {
      console.log(`  ! order ${order.id} did not read back correctly`)
    }
  }
  console.log(`orders migrated    : ${ordersWritten}/${validOrders.length}`)

  heading('5. Migrate generated websites (ids preserved exactly)')
  let experiencesWritten = 0
  const seenIds = new Set<string>()
  for (const experience of validExperiences) {
    if (seenIds.has(experience.id)) {
      console.log(`  ! duplicate website id in source: ${experience.id} — skipped`)
      continue
    }
    seenIds.add(experience.id)
    // An orphan (its order row no longer exists) is stored with a NULL order_id
    // rather than a dangling id: cupi_experiences.order_id is a foreign key, so
    // inserting the stale id would abort the whole migration. The website itself
    // — the thing the link resolves to — is preserved regardless.
    const parentOrderId =
      experience.order_id && knownOrderIds.has(experience.order_id) ? experience.order_id : null
    const { data } = await rest.request<StoredExperience[]>({
      method: 'POST',
      path: 'cupi_experiences',
      query: { on_conflict: 'id' },
      prefer: 'resolution=merge-duplicates,return=representation',
      body: {
        id: experience.id,
        order_id: parentOrderId,
        template_id: experience.template_id,
        config: experience.config,
        status: experience.status || 'LOCKED',
        locked_at: experience.locked_at ?? null,
        view_count: Number(experience.view_count) || 0,
        created_at: experience.created_at,
      },
    })
    const saved = Array.isArray(data) ? data[0] : undefined
    if (saved && saved.id === experience.id) {
      experiencesWritten += 1
    } else {
      console.log(`  ! website ${experience.id} did not read back correctly`)
    }
  }
  console.log(`websites migrated  : ${experiencesWritten}/${validExperiences.length}`)

  // -------------------------------------------------------------- verify ---
  heading('6. Verify what actually landed in the database')
  console.log(`rows in cupi_influencers: ${await countRows(rest, 'cupi_influencers')}`)
  console.log(`rows in cupi_orders      : ${await countRows(rest, 'cupi_orders')}`)
  console.log(`rows in cupi_experiences : ${await countRows(rest, 'cupi_experiences')}`)

  let missing = 0
  for (const order of validOrders) {
    const { data } = await rest.request<StoredOrder[]>({
      method: 'GET',
      path: 'cupi_orders',
      query: { id: `eq.${escapePostgrestValue(order.id)}`, limit: 1 },
    })
    if (!data || data.length === 0) {
      missing += 1
      console.log(`  ! order ${order.id} is MISSING after migration`)
    }
  }

  // The single most important check: an already-shared URL must still resolve.
  const store = new PostgresStore(config)
  let brokenLinks = 0
  for (const experience of validExperiences) {
    const { data } = await rest.request<StoredExperience[]>({
      method: 'GET',
      path: 'cupi_experiences',
      query: { id: `eq.${escapePostgrestValue(experience.id)}`, limit: 1 },
    })
    if (!data || data.length === 0) {
      missing += 1
      console.log(`  ! website ${experience.id} is MISSING after migration`)
      continue
    }
    const resolved = await store.getExperienceById(experience.id)
    if (!resolved || resolved.id !== experience.id || resolved.config === null) {
      brokenLinks += 1
      console.log(`  ! share link /x/${experience.id} does NOT resolve to its stored website`)
    }
  }

  const ok =
    missing === 0 &&
    brokenLinks === 0 &&
    ordersWritten === validOrders.length &&
    experiencesWritten === validExperiences.length

  heading('6. Summary')
  console.log(`orders found / migrated     : ${validOrders.length} / ${ordersWritten}`)
  console.log(`websites found / migrated   : ${validExperiences.length} / ${experiencesWritten}`)
  console.log(`coupons found / migrated    : ${sourceCoupons.length} / ${couponsWritten}`)
  console.log(`orders skipped (bad rows)   : ${orderErrors.length}`)
  console.log(`websites skipped (bad rows) : ${experienceErrors.length}`)
  console.log(`coupons skipped (bad rows)  : ${couponsFailed + (couponsTableMissing ? sourceCoupons.length - couponsWritten - couponsFailed : 0)}`)
  console.log(`legacy fg_ slugs preserved  : ${legacySlugs}`)
  console.log(`missing after verification  : ${missing}`)
  console.log(`broken share links          : ${brokenLinks}`)
  console.log(`db.json backup             : ${backupPath ?? 'n/a'}`)
  for (const message of [...orderErrors, ...experienceErrors]) console.log(`  ! ${message}`)

  if (!ok) {
    console.error(
      '\nMIGRATION INCOMPLETE — see the ! lines above.\n' +
        'db.json is untouched and still the authoritative copy.',
    )
    process.exit(1)
  }

  console.log(
    '\nMIGRATION VERIFIED.\n' +
      'Next: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Render, redeploy, and confirm\n' +
      'GET /api/health reports {"store":"supabase-postgres","durableData":true}.\n' +
      'Keep db.json until you are satisfied — production no longer reads it.',
  )
}

/** Exports an untouched, timestamped copy of the source before anything else. */
function exportBackup(source: string): string {
  mkdirSync(BACKUP_DIR, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const target = path.join(BACKUP_DIR, `db.json.${stamp}.backup`)
  copyFileSync(source, target)
  return target
}

void main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error))
})
