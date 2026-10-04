-- ---------------------------------------------------------------------------
-- Cupi persistent store (Supabase / PostgreSQL)
-- ---------------------------------------------------------------------------
-- Run this ONCE in the Supabase dashboard -> SQL Editor, or via
-- `npx supabase db push`. It is idempotent (every statement is IF NOT EXISTS /
-- OR REPLACE), so re-running it is safe.
--
-- WHY THIS EXISTS
-- Cupi used to keep every order and every generated wish website in a local
-- `db.json`. On Render the container filesystem is ephemeral: it is wiped on
-- every deploy, config change, crash-restart and free-tier spin-down, which is
-- why already-shared /x/:id links used to stop resolving after a while. This
-- schema moves that data into a free, persistent, managed Postgres.
--
-- SAFETY
-- Row Level Security is ENABLED on both tables and NO anon/authenticated policy
-- is created, so the database is unreachable from any browser. Only the
-- server-side `service_role` key (used exclusively by the Render backend, never
-- shipped to the frontend) can read or write these tables.
-- ---------------------------------------------------------------------------

-- Orders: one row per checkout attempt, created before the gateway redirect.
create table if not exists public.cupi_orders (
  -- Cupi's own order id (a UUID string). Kept as text so an id can never be
  -- rewritten by a type cast, which would break the /payment-result redirect.
  id                     text primary key,
  -- FamGateway order id. Unique so a webhook replay can never create a second
  -- order for the same gateway payment.
  gateway_order_id       text not null unique,
  gateway_payment_id     text,
  template_id            text not null,
  amount                 numeric(12, 2) not null,
  currency               text not null default 'INR',
  status                 text not null default 'PENDING'
                           check (status in ('PENDING', 'PAID', 'FAILED')),
  -- The customer's customization, verbatim. jsonb holds multi-MB photo data
  -- fine (TOAST); it is never rewritten after creation.
  customization_payload  jsonb not null,
  -- Slug of the website generated for this order. Exactly one, ever.
  experience_id          text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

-- Generated websites ("wishes"): the permanent, view-only share artifacts.
create table if not exists public.cupi_experiences (
  -- THE PERMANENT PUBLIC IDENTIFIER. This is the slug in the /x/:id URL.
  -- `text`, not uuid, so BOTH identifier styles resolve unchanged forever:
  --   * legacy links  -> 'fg_9f8e7d6c5b4a3210'  (FamGateway order id)
  --   * current links -> 'tMfEetZFTUf0'        (Cupi-generated slug)
  id          text primary key,
  -- ONE PAYMENT = ONE GENERATED WEBSITE.
  -- This unique constraint is the business rule, enforced by the database
  -- itself: a duplicate webhook, a double-tap on "pay", or two concurrent
  -- verify calls can never produce a second website for the same order.
  -- Nullable only so a migrated row whose original order is already missing can
  -- still be preserved (NULLs do not collide under a unique constraint).
  order_id    text unique
                references public.cupi_orders (id) on delete cascade,
  template_id text not null,
  -- The finalized customization. Write-once by contract: no code path in
  -- Cupi ever updates this column, which is what makes a shared link
  -- permanently read-only.
  config      jsonb not null,
  status      text not null default 'LOCKED'
                check (status in ('DRAFT', 'LOCKED')),
  -- Set once, when the payment is confirmed. There is deliberately NO
  -- expires_at / ttl column: a completed wish never expires.
  locked_at   timestamptz,
  view_count  integer not null default 0 check (view_count >= 0),
  created_at  timestamptz not null default now()
);

-- Product prices: custom pricing for templates managed by Super Admin.
create table if not exists public.cupi_product_prices (
  template_id text primary key,
  price       numeric(12, 2) not null check (price >= 0),
  updated_at  timestamptz not null default now()
);

-- Operational indexes. Every lookup Cupi performs is already covered by a
-- primary key or unique constraint; these two only help admin/ops queries.
create index if not exists cupi_orders_created_at_idx
  on public.cupi_orders (created_at desc);
create index if not exists cupi_experiences_status_idx
  on public.cupi_experiences (status);

-- Lock the database down. The service_role key bypasses RLS (that is how the
-- backend talks to it); every other role is denied, so a leaked anon key or a
-- direct browser call cannot read a customer's personalized wish.
alter table public.cupi_orders          enable row level security;
alter table public.cupi_experiences    enable row level security;
alter table public.cupi_product_prices enable row level security;

-- Deliberately NOT granted:
--   grant usage on schema public to anon, authenticated;   <- would expose data
-- The tables are reachable only through the service_role key held by the
-- Cupi API. Revoke defensively in case an older project had grants.
revoke all on public.cupi_orders          from anon, authenticated;
revoke all on public.cupi_experiences    from anon, authenticated;
revoke all on public.cupi_product_prices from anon, authenticated;

-- Keep `updated_at` honest for any future code path that forgets to set it.
create or replace function public.touch_cupi_order_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists cupi_orders_touch_updated_at on public.cupi_orders;
create trigger cupi_orders_touch_updated_at
  before update on public.cupi_orders
  for each row execute function public.touch_cupi_order_updated_at();
