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

-- Template Audio: stores base64 audio data or external URLs for background music
create table if not exists public.cupi_template_audio (
  template_id text primary key,
  audio_data  text,
  audio_url   text,
  updated_at  timestamptz not null default now()
);

-- Influencers: partners who promote Cupi and earn commission on referred sales.
--
-- DESIGN NOTES
-- * unique_code is the referral/coupon handle ("SHAFEY20"). It is the JOIN key
--   every attribution flows through, so it carries a UNIQUE constraint rather
--   than a plain index: two live influencers sharing a code would make
--   "which partner gets the commission" undecidable and silently double-claim
--   revenue. Case-insensitive uniqueness is enforced by storing the
--   normalized (upper-cased, trimmed) code.
-- * discount_percentage and commission_percentage are bounded to 0..100 by a
--   CHECK so a bad API payload can never write a negative payout or a
--   discount that pays out more than it takes.
-- * status is the operator's intent ('active' | 'paused'). 'expired' is
--   DERIVED from expiry_date at read time rather than stored, because a coupon
--   becomes expired by the passage of time and no cron can be relied on to flip
--   a row at the right second.
create table if not exists public.cupi_influencers (
  id                     uuid primary key default gen_random_uuid(),
  name                   text not null check (length(btrim(name)) > 0),
  email                  text,
  phone                  text,
  unique_code            text not null,
  discount_percentage    numeric(5, 2) not null default 0
                           check (discount_percentage >= 0 and discount_percentage <= 100),
  -- Commission is a share of NET revenue (what Cupi keeps after the discount),
  -- never of the gross order amount: paying 20% of the pre-discount total on a
  -- 33%-off order would cost Cupi real margin on money it never received.
  commission_percentage  numeric(5, 2) not null default 0
                           check (commission_percentage >= 0 and commission_percentage <= 100),
  -- Total commission paid out to this influencer so far
  commission_paid        numeric(12, 2) not null default 0
                           check (commission_paid >= 0),
  -- NULL means "never expires"; otherwise the coupon stops working after this
  -- instant. Stored as a date so an expiry is inclusive of the whole day.
  expiry_date            date,
  status                 text not null default 'active'
                           check (status in ('active', 'paused', 'deleted')),
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

-- The referral handle. Case-insensitive uniqueness via a functional index over
-- upper(unique_code), so "shafey20" and "SHAFEY20" cannot both exist.
create unique index if not exists cupi_influencers_code_unique
  on public.cupi_influencers (upper(unique_code));
create index if not exists cupi_influencers_status_idx
  on public.cupi_influencers (status);

-- Coupons: operator-created campaign codes ("SAVE50"), a separate namespace
-- from partner referral codes.
--
-- DESIGN NOTES
-- * `code` IS the primary key and is stored normalized (upper-cased, trimmed),
--   so checkout resolves a code with a single index hit and "save5" can never
--   exist twice in different cases. The API refuses a code that collides with
--   cupi_influencers.unique_code or a legacy campaign code rather than letting
--   one namespace silently shadow another.
-- * There is deliberately NO redeemed_count column. Redemptions are COUNTed
--   from PAID cupi_orders rows through cupi_orders_coupon_code_idx, so the
--   number cannot drift from the money it describes, and an abandoned PENDING
--   checkout never consumes a redemption (nothing expires pending orders yet).
-- * `value` means different things by kind: percent (0..100) or flat (rupees
--   off, clamped to the price at quote time). The percent bound is enforced
--   here as well as by the API, so a bad payload cannot make an order cost
--   money Cupi never had.
-- * Schedule columns are judged at read time, like influencer expiry: no cron
--   can be relied on to flip a row at the right second.
create table if not exists public.cupi_coupons (
  code            text primary key,
  kind            text not null default 'percent'
                    check (kind in ('percent', 'flat')),
  value           numeric(12, 2) not null check (value > 0),
  -- Empty array = every template; otherwise the allow-list of template ids.
  applies_to      jsonb not null default '[]'::jsonb,
  min_amount      numeric(12, 2) not null default 0 check (min_amount >= 0),
  -- NULL = unlimited; otherwise the cap on PAID orders made with this code.
  max_redemptions integer check (max_redemptions is null or max_redemptions > 0),
  -- NULL = unbounded.
  starts_at       timestamptz,
  expires_at      timestamptz,
  status          text not null default 'active'
                    check (status in ('active', 'paused', 'deleted')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint cupi_coupons_percent_capped
    check (kind <> 'percent' or value <= 100)
);

-- The admin list is sorted newest-first; checkout never ranges over this table.
create index if not exists cupi_coupons_created_at_idx
  on public.cupi_coupons (created_at desc);

-- Keep `updated_at` honest on the coupon table too.
create or replace function public.touch_cupi_coupon_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists cupi_coupons_touch_updated_at on public.cupi_coupons;
create trigger cupi_coupons_touch_updated_at
  before update on public.cupi_coupons
  for each row execute function public.touch_cupi_coupon_updated_at();

-- Customer accounts: the people who buy from Cupi.
--
-- DESIGN NOTES
-- * email is stored normalized (trimmed, lower-cased) and is unique, so
--   "Ram@X.com" and "ram@x.com" can never both sign up, and login is a single
--   index hit.
-- * password_hash is NULL for accounts that only ever signed in with Google.
--   It holds a self-describing scrypt hash ("scrypt$N$r$p$salt$hash") for
--   password accounts — never the password itself.
-- * google_sub stores the Firebase Authentication UID for Google-linked
--   accounts (never an email, which a user can change). Unique, so one
--   Firebase identity maps to exactly one row.
-- * email_verified records verified identity status; checkout requires an
--   account but no longer blocks password signups on this flag.
create table if not exists public.cupi_customers (
  id             uuid primary key default gen_random_uuid(),
  email          text not null,
  password_hash  text,
  name           text not null default '',
  avatar_url     text,
  google_sub     text unique,
  email_verified boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint cupi_customers_email_format check (position('@' in email) > 1),
  constraint cupi_customers_email_len check (char_length(email) between 3 and 254)
);

-- Case-insensitive uniqueness even if a row were written with another case.
create unique index if not exists cupi_customers_email_unique
  on public.cupi_customers (lower(email));

create or replace function public.touch_cupi_customer_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists cupi_customers_touch_updated_at on public.cupi_customers;
create trigger cupi_customers_touch_updated_at
  before update on public.cupi_customers
  for each row execute function public.touch_cupi_customer_updated_at();

-- Legacy single-use auth-link storage. Current customer auth no longer
-- generates verification or password-reset e-mails; keep this table in place
-- so deployments do not need a schema migration.
--
-- DESIGN NOTES
-- * Only the SHA-256 HASH of the token is stored: a database leak must not
--   hand over live reset links. The raw token exists only in the e-mail.
-- * purpose makes one token usable for exactly one job, and `used_at` (set the
--   moment it is redeemed) makes it single-use even inside its expiry window.
-- * expires_at is mandatory: no token lives forever.
create table if not exists public.cupi_auth_tokens (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.cupi_customers (id) on delete cascade,
  purpose     text not null check (purpose in ('verify_email', 'reset_password')),
  token_hash  text not null unique,
  expires_at  timestamptz not null,
  used_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists cupi_auth_tokens_customer_idx
  on public.cupi_auth_tokens (customer_id, purpose);

-- Order attribution: which partner referred this order, what it was worth, and
-- how much of it is owed to them.
--
-- These live on cupi_orders rather than in a separate table so that money and
-- attribution are written in the SAME insert as the order itself. A separate
-- transactions row would need a second write, and any crash between the two
-- would record a paid sale that is silently unattributed — the exact failure an
-- affiliate payout dispute cannot be resolved against.
--
-- Monetary snapshot semantics: discount_given, net_revenue and
-- influencer_commission_earned are frozen at checkout. Editing an influencer's
-- commission rate later must never retroactively rewrite what a past order
-- owed, or the books would silently change under a partner who has already been
-- paid.
alter table public.cupi_orders add column if not exists influencer_id uuid
  references public.cupi_influencers (id) on delete set null;
alter table public.cupi_orders add column if not exists coupon_code text;
alter table public.cupi_orders add column if not exists original_amount numeric(12, 2);
alter table public.cupi_orders add column if not exists discount_given numeric(12, 2)
  not null default 0 check (discount_given >= 0);
alter table public.cupi_orders add column if not exists net_revenue numeric(12, 2)
  not null default 0 check (net_revenue >= 0);
alter table public.cupi_orders add column if not exists influencer_commission_earned numeric(12, 2)
  not null default 0 check (influencer_commission_earned >= 0);
alter table public.cupi_orders add column if not exists traffic_source text;
alter table public.cupi_orders add column if not exists customer_ip text;
-- The signed-in buyer this order belongs to, when there was one. Nullable and
-- ON DELETE SET NULL on purpose: checkout works signed out (it always has),
-- and deleting a customer account must never delete their orders.
alter table public.cupi_orders add column if not exists customer_id uuid
  references public.cupi_customers (id) on delete set null;

-- Purchase history: "orders for this customer" is a single index scan.
create index if not exists cupi_orders_customer_idx
  on public.cupi_orders (customer_id);

-- Anonymous buyer id (a browser-generated UUID v4) that powers a customer's own
-- "Store" page and payment recovery, with no login required. Null on orders that
-- predate the column.
alter table public.cupi_orders add column if not exists customer_id uuid;
create index if not exists cupi_orders_customer_id_idx
  on public.cupi_orders (customer_id);

-- Admin rollups group and filter by influencer over PAID orders only.
create index if not exists cupi_orders_influencer_idx
  on public.cupi_orders (influencer_id) where status = 'PAID';
create index if not exists cupi_orders_coupon_code_idx
  on public.cupi_orders (coupon_code);

-- Keep `updated_at` honest on the partner table too.
create or replace function public.touch_cupi_influencer_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists cupi_influencers_touch_updated_at on public.cupi_influencers;
create trigger cupi_influencers_touch_updated_at
  before update on public.cupi_influencers
  for each row execute function public.touch_cupi_influencer_updated_at();

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
alter table public.cupi_template_audio enable row level security;
alter table public.cupi_influencers    enable row level security;
alter table public.cupi_coupons        enable row level security;
alter table public.cupi_customers      enable row level security;
alter table public.cupi_auth_tokens    enable row level security;

-- Deliberately NOT granted:
--   grant usage on schema public to anon, authenticated;   <- would expose data
-- The tables are reachable only through the service_role key held by the
-- Cupi API. Revoke defensively in case an older project had grants.
revoke all on public.cupi_orders          from anon, authenticated;
revoke all on public.cupi_experiences    from anon, authenticated;
revoke all on public.cupi_product_prices from anon, authenticated;
revoke all on public.cupi_template_audio from anon, authenticated;
revoke all on public.cupi_influencers    from anon, authenticated;
revoke all on public.cupi_coupons        from anon, authenticated;
revoke all on public.cupi_customers      from anon, authenticated;
revoke all on public.cupi_auth_tokens    from anon, authenticated;

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
