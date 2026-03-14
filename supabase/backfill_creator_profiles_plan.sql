-- Backfill creator profile plans based on owner account data.
-- Priority:
-- 1) auth.users.raw_user_meta_data.plan
-- 2) auth.users.raw_app_meta_data.plan
-- 3) public.profiles.is_pro => 'pro'
-- 4) fallback => 'free'

alter table public.creator_profiles
  add column if not exists plan text;

update public.creator_profiles
set plan = 'free'
where plan is null;

alter table public.creator_profiles
  alter column plan set default 'free';

alter table public.creator_profiles
  alter column plan set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'creator_profiles_plan_valid'
  ) then
    alter table public.creator_profiles
      add constraint creator_profiles_plan_valid
      check (plan in ('free', 'pro', 'creator'));
  end if;
end $$;

with resolved as (
  select
    cp.id,
    case
      when lower(coalesce(au.raw_user_meta_data ->> 'plan', '')) in ('free', 'pro', 'creator')
        then lower(au.raw_user_meta_data ->> 'plan')
      when lower(coalesce(au.raw_app_meta_data ->> 'plan', '')) in ('free', 'pro', 'creator')
        then lower(au.raw_app_meta_data ->> 'plan')
      when coalesce(p.is_pro, false) = true
        then 'pro'
      else 'free'
    end as resolved_plan
  from public.creator_profiles cp
  left join auth.users au on au.id = cp.id
  left join public.profiles p on p.id = cp.id
)
update public.creator_profiles cp
set
  plan = resolved.resolved_plan,
  updated_at = timezone('utc', now())
from resolved
where cp.id = resolved.id
  and cp.plan is distinct from resolved.resolved_plan;

-- Optional check:
-- select id, username, plan from public.creator_profiles order by updated_at desc limit 50;
