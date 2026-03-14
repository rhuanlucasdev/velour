create extension if not exists pgcrypto;

create table if not exists public.ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default 'Untitled Idea',
  content text not null default '{}',
  tags text[] not null default '{}',
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists ideas_user_id_created_at_idx
  on public.ideas (user_id, created_at desc);

alter table public.ideas enable row level security;

drop policy if exists "Users can access their own ideas" on public.ideas;
create policy "Users can access their own ideas"
  on public.ideas
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
