-- Leads captured by the Get Quotes form (web/app/api/leads/route.ts).
-- Apply in the Supabase SQL editor. The API uses the service-role key from the
-- server only; RLS stays enabled with no public policies.

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  contact text not null,
  buyer_type text,
  items text not null,
  locale text not null default 'en',
  handled boolean not null default false,
  notes text
);

alter table public.leads enable row level security;
