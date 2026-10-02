# Cupi persistent storage (Supabase — free tier)

Cupi stores every order and every generated website as a record. The public
`/x/:id` link **is** that record, so if the record disappears the link is dead.
That is exactly what happened when the data lived in `db.json` on Render's
container filesystem: every deploy, restart and free-tier spin-down wiped it.

This directory moves that data to **Supabase Postgres (free tier)** — a real
database that outlives the server. No paid Render disk, no new npm dependency.

---

## 1. Create the project (free)

1. Go to <https://supabase.com> → **New project**.
2. Pick any region near your users and save the database password. You need it
   for the CLI/psql only; the app itself uses the service-role key below.
3. Wait for the project to finish provisioning.

The free tier is more than enough: Cupi uses two small tables and a few queries
per page view.

## 2. Create the tables

1. In the Supabase dashboard open **SQL Editor → New query**.
2. Paste the entire contents of [`schema.sql`](./schema.sql).
3. Click **Run**.

That script is idempotent — running it twice is safe — and it creates:

| Table              | Holds                                                     |
| ------------------ | --------------------------------------------------------- |
| `cupi_orders`      | FamGateway order ids, amount, payment state, customization payload |
| `cupi_experiences` | the generated website, its public `id`, config and view count |

It also creates the two constraints that protect the product:

- `cupi_orders.gateway_order_id` is unique — one Cupi order per checkout.
- `cupi_experiences.order_id` is unique — **one payment = one generated website**,
  enforced by the database even if a webhook is delivered twice or the buyer
  double-taps "pay".

Row Level Security is switched on with no client policies, so the tables are
unreachable with the browser-facing `anon` key. Only the server, using the
service-role key, can read or write them.

## 3. Get the credentials

**Project Settings → Data API** → copy the **Project URL**.

**Project Settings → API Keys** → copy **`service_role`**.

> Use `service_role`, **not** `anon`. The anon key is designed to be public and
> is blocked by the RLS setup above, so it would simply fail.

Treat the service-role key like a password: it bypasses row-level security. Never
commit it, never put it in a `VITE_` variable (Vite ships those to the browser),
and rotate it in the dashboard if it is ever exposed.

## 4. Configure the server

Set both variables wherever the API runs.

**Local** — add to `.env` (see `.env.example`):

```bash
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
```

**Render** — *Service → Environment*:

| Key                         | Value                                   |
| --------------------------- | --------------------------------------- |
| `SUPABASE_URL`              | `https://your-project-ref.supabase.co`  |
| `SUPABASE_SERVICE_ROLE_KEY` | *(your service_role key)*               |

`CUPI_DATA_DIR` is **local development only** now. In production the server
refuses to start on the file store, so a missing Supabase config fails loudly at
boot instead of silently writing to an ephemeral disk.

## 5. Move any existing data across

```bash
SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… npm run migrate-data -- --dry-run   # report only
SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… npm run migrate-data              # migrate
```

The script never modifies `db.json`. It takes a timestamped backup into
`server/data/migration-backups/` first, upserts every order and website **under
its existing id**, then reads each row back and re-resolves each share link
before reporting success. Running it twice changes nothing.

Order and `fg_...` ids are copied verbatim, so a link you have already shared
keeps working. If the source `db.json` is empty — which is normal on a machine
that never received the production data — the script reports `0 / 0` migrated and
exits successfully.

To migrate from a machine other than your dev box, copy the old `db.json` next to
the repo and point the script at it:

```bash
npm run migrate-data -- --source /path/to/db.json
```

## 6. Deploy and verify

Redeploy the API. It now boots against Supabase and logs the store it resolved.

```bash
curl https://cupi-psmr.onrender.com/api/health
# {"status":"ok","service":"cupi-api","store":"supabase-postgres","durableData":true}

curl https://cupi-psmr.onrender.com/api/store-status
# a deeper check: performs a real query against the database
```

`"store":"supabase-postgres"` with `"durableData":true` is the confirmation that
links are permanent.

---

## Troubleshooting

| Symptom                                         | Cause                                                                |
| ----------------------------------------------- | -------------------------------------------------------------------- |
| `the cupi_orders table does not exist yet`       | `schema.sql` was not run in the SQL Editor                          |
| Boot fails with `refusing to start`              | one of the two variables is missing or wrong                        |
| Every request returns `503`                      | project paused, or the service-role key was rotated                  |
| `{"error":"","code":"PGRST…"}` in the logs       | `schema.sql` is out of date — re-run it (it is idempotent)           |

## Files

- `schema.sql` — tables, constraints, indexes, RLS, trigger.
- `../server/supabase.ts` — PostgREST client (plain `fetch`, no dependency).
- `../server/postgresStore.ts` — the persistence implementation.
- `../server/db.ts` — picks the store and refuses the file store in production.
- `../server/migrate.ts` — `npm run migrate-data`.

## Tests

```bash
npm run test:server
```

Runs three suites with no external services and no cloud account:

1. **`test/supabase-store.test.mts`** — applies `schema.sql` to a real PostgreSQL
   engine (PGlite) and asserts the RLS lockdown plus the one-payment/one-website
   constraint, then exercises `PostgresStore` over a PostgREST-compatible shim.
2. **`test/migrate.test.mts`** — runs the real `migrate-data` against a shim using
   a legacy camelCase `db.json`, and asserts ids/slugs are preserved, the source
   file is byte-identical afterwards, re-running is idempotent, and an
   already-shared `/x/:id` link still resolves.
3. **`test/server.test.mts`** — boots the real API and drives checkout → payment →
   webhook → share link → read-only refusal, then simulates a database outage to
   prove a link never degrades into "expired", and that production refuses to
   boot without a reachable Supabase.
