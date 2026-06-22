-- PropSocial AI — subscriptions table
-- One row per user reflecting the current state of their Stripe subscription.
-- Webhooks (`/api/stripe/webhook`) write via the service-role key; the user-
-- facing app reads via RLS using `auth.uid()`.

create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  tier text not null check (tier in ('starter', 'pro')),
  status text not null check (
    status in (
      'trialing', 'active', 'past_due', 'canceled',
      'incomplete', 'unpaid', 'incomplete_expired', 'paused'
    )
  ),
  current_period_end timestamptz,
  trial_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_stripe_customer_idx
  on public.subscriptions(stripe_customer_id);
create index if not exists subscriptions_stripe_subscription_idx
  on public.subscriptions(stripe_subscription_id);

-- RLS: users can read only their own row; writes are service-role only.
alter table public.subscriptions enable row level security;

drop policy if exists "Users read own subscription" on public.subscriptions;
create policy "Users read own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();
