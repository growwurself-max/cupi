/**
 * npm run update-prices
 *
 * Updates product prices in the Supabase database using the Super Admin
 * price-management system. This script directly inserts/updates prices in the
 * cupi_product_prices table.
 *
 * Usage:
 *   SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… npm run update-prices
 */

import { readSupabaseConfig, SupabaseRest, escapePostgrestValue } from './supabase.js'

interface PriceUpdate {
  templateId: string
  price: number
}

const PRICE_UPDATES: PriceUpdate[] = [
  { templateId: 'parent-01', price: 297 },
  { templateId: 'parent-02', price: 297 },
]

async function main(): Promise<void> {
  console.log('=== Cupi Product Price Update ===\n')

  const config = readSupabaseConfig()
  if (!config) {
    console.error(
      'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must both be set.\n' +
        '  Add them to your shell or .env, then re-run.',
    )
    process.exit(1)
  }

  console.log(`Connecting to: ${config.url.replace(/^(https?:\/\/)[^@]*@/, '$1***@')}`)
  const rest = new SupabaseRest(config)

  // Verify the table exists
  try {
    await rest.request({ method: 'GET', path: 'cupi_product_prices', query: { select: 'template_id', limit: 1 } })
  } catch (error) {
    const status = (error as { status?: number }).status
    if (status === 404) {
      console.error(
        'The cupi_product_prices table does not exist.\n' +
          '  Run supabase/schema.sql in the Supabase dashboard (SQL Editor) first.',
      )
      process.exit(1)
    }
    throw error
  }

  console.log('\nUpdating prices:')
  for (const { templateId, price } of PRICE_UPDATES) {
    console.log(`  ${templateId}: ₹${price}`)
  }

  // Update each price
  const now = new Date().toISOString()
  for (const { templateId, price } of PRICE_UPDATES) {
    // First try to update existing record
    const { data: updateData } = await rest.request<{ price: number }[]>({
      method: 'PATCH',
      path: 'cupi_product_prices',
      query: { template_id: `eq.${escapePostgrestValue(templateId)}` },
      prefer: 'return=representation',
      body: {
        price,
        updated_at: now,
      },
    })

    const updated = Array.isArray(updateData) && updateData.length > 0 ? updateData[0] : null

    if (updated && Number(updated.price) === price) {
      console.log(`✓ ${templateId} updated to ₹${price}`)
    } else {
      // If no existing record, insert new one
      const { data: insertData } = await rest.request<{ price: number }[]>({
        method: 'POST',
        path: 'cupi_product_prices',
        query: { on_conflict: 'template_id' },
        prefer: 'return=representation',
        body: {
          template_id: templateId,
          price,
          updated_at: now,
        },
      })

      const saved = Array.isArray(insertData) && insertData.length > 0 ? insertData[0] : null
      if (saved && Number(saved.price) === price) {
        console.log(`✓ ${templateId} inserted at ₹${price}`)
      } else {
        console.error(`✗ ${templateId} failed to update`)
      }
    }
  }

  console.log('\nPrice update complete!')
  console.log('These prices will now be used for all new orders.')
  console.log('Existing orders retain their original prices.')
}

void main().catch((error) => {
  console.error('\nPrice update failed:', error)
  process.exit(1)
})
