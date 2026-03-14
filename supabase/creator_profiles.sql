create extension if not exists pgcrypto;

create table if not exists public.creator_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists creator_profiles_username_idx
  on public.creator_profiles (username);

alter table public.creator_profiles enable row level security;

drop policy if exists "Anyone can read creator profiles" on public.creator_profiles;
create policy "Anyone can read creator profiles"
  on public.creator_profiles
  for select
  using (true);

drop policy if exists "Users can insert their own creator profile" on public.creator_profiles;
create policy "Users can insert their own creator profile"
  on public.creator_profiles
  for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update their own creator profile" on public.creator_profiles;
create policy "Users can update their own creator profile"
  on public.creator_profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create table if not exists public.creator_follows (
  follower_id uuid not null references auth.users (id) on delete cascade,
  creator_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (follower_id, creator_id),
  constraint creator_follows_no_self_follow check (follower_id <> creator_id)
);

create index if not exists creator_follows_creator_id_idx
  on public.creator_follows (creator_id);

alter table public.creator_follows enable row level security;

drop policy if exists "Anyone can read creator follows" on public.creator_follows;
create policy "Anyone can read creator follows"
  on public.creator_follows
  for select
  using (true);

drop policy if exists "Users can follow creators" on public.creator_follows;
create policy "Users can follow creators"
  on public.creator_follows
  for insert
  with check (auth.uid() = follower_id);

drop policy if exists "Users can unfollow creators" on public.creator_follows;
create policy "Users can unfollow creators"
  on public.creator_follows
  for delete
  using (auth.uid() = follower_id);
