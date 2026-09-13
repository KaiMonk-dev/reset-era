-- RESET ERA — reminders schema (run in Supabase SQL editor when project exists)
create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  reminder_time text not null default '07:00', -- local HH:MM from the app
  arc_day int not null default 1,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.subscribers enable row level security;

-- V0: anon can subscribe (insert-only); reads/updates are service-role only
create policy "anon can subscribe" on public.subscribers
  for insert to anon with check (true);
