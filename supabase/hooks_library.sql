create extension if not exists pgcrypto;

create table if not exists public.hooks_library (
  id uuid primary key default gen_random_uuid(),
  hook_text text not null,
  category text not null default 'general',
  likes integer not null default 0,
  copies integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  created_by uuid not null references auth.users (id) on delete cascade
);

create index if not exists hooks_library_created_at_idx
  on public.hooks_library (created_at desc);

create index if not exists hooks_library_likes_idx
  on public.hooks_library (likes desc, copies desc);

create index if not exists hooks_library_copies_idx
  on public.hooks_library (copies desc, likes desc);

alter table public.hooks_library enable row level security;

drop policy if exists "Authenticated users can read hooks library" on public.hooks_library;
create policy "Authenticated users can read hooks library"
  on public.hooks_library
  for select
  using (auth.uid() is not null);

drop policy if exists "Authenticated users can insert hooks" on public.hooks_library;
create policy "Authenticated users can insert hooks"
  on public.hooks_library
  for insert
  with check (auth.uid() = created_by);

drop policy if exists "Authenticated users can update hooks" on public.hooks_library;
create policy "Authenticated users can update hooks"
  on public.hooks_library
  for update
  using (auth.uid() is not null)
  with check (auth.uid() is not null);
