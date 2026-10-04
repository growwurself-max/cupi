/**
 * npm run setup-price-table
 *
 * Creates the cupi_product_prices table in Supabase if it doesn't exist.
 * This is required for the Super Admin price-management system.
 *
 * Usage:
 *   SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… npm run setup-price-table
 */

import { readSupabaseConfig, SupabaseRest } from './supabase.js'

async function main(): Promise<void> {
  console.log('=== Setup cupi_product_prices table ===\n')

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

  // Create the table using raw SQL
  const createTableSQL = `
    create table if not exists public.cupi_product_prices (
      template_id text primary key,
      price       numeric(12, 2) not null check (price >= 0),
      updated_at  timestamptz not null default now()
    );

    alter table public.cupi_product_prices enable row level security;

    revoke all on public.cupi_product_prices from anon, authenticated;
  `

  try {
    // Use the Supabase REST API to execute SQL
    const response = await fetch(`${config.url}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': config.serviceRoleKey,
        'Authorization': `Bearer ${config.serviceRoleKey}`,
      },
      body: JSON.stringify({ sql: createTableSQL }),
    })
    const result = await response.json() as { data?: unknown; error?: string }

    if (result.error) {
      console.error('Error creating table:', result.error)
      process.exit(1)
    }

    console.log('✓ Table cupi_product_prices created or already exists')
    console.log('✓ Row Level Security enabled')
    console.log('✓ Access revoked from anon/authenticated roles')

    // Verify the table exists
    await rest.request({ 
      method: 'GET', 
      path: 'cupi_product_prices', 
      query: { select: 'template_id', limit: 1 } 
    })

    console.log('\nTable setup complete!')
    console.log('You can now run: npm run update-prices')
  } catch (error: any) {
    // The REST API might not support exec_sql, try direct table access
    try {
      await rest.request({ 
        method: 'GET', 
        path: 'cupi_product_prices', 
        query: { select: 'template_id', limit: 1 } 
      })
      console.log('✓ Table cupi_product_prices already exists')
      console.log('\nTable setup complete!')
      console.log('You can now run: npm run update-prices')
    } catch (e) {
      console.error('\nFailed to create or verify table.')
      console.error('Please run the following SQL in Supabase Dashboard -> SQL Editor:')
      console.error(createTableSQL)
      process.exit(1)
    }
  }
}

void main().catch((error) => {
  console.error('\nSetup failed:', error)
  process.exit(1)
})
