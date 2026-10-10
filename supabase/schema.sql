-- Pelangi Pop Land — Supabase schema
-- Run in Supabase Dashboard → SQL Editor (or `supabase db push`).
-- Every table is protected by Row Level Security: a parent can only see their own rows.

-- ---------------------------------------------------------------- children
create table if not exists public.children (
  id          uuid primary key default gen_random_uuid(),
  parent_id   uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 30),
  age         smallint check (age between 1 and 18),
  avatar      text default '🐼',
  created_at  timestamptz not null default now()
);
create index if not exists children_parent_idx on public.children(parent_id);

-- ---------------------------------------------------------------- progress (best result per activity)
create table if not exists public.progress (
  child_id     uuid not null references public.children(id) on delete cascade,
  activity_id  text not null check (char_length(activity_id) <= 120),
  parent_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  category     text not null,
  stars        smallint not null default 0 check (stars between 0 and 3),
  best_score   integer not null default 0,
  total        integer not null default 0,
  plays        integer not null default 0,
  updated_at   timestamptz not null default now(),
  primary key (child_id, activity_id)
);
create index if not exists progress_parent_idx on public.progress(parent_id);

-- ---------------------------------------------------------------- key/value (planner, journals, gallery…)
create table if not exists public.user_kv (
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  key         text not null check (char_length(key) <= 160),
  value       jsonb not null,
  updated_at  timestamptz not null default now(),
  primary key (user_id, key)
);

-- ---------------------------------------------------------------- RLS
alter table public.children enable row level security;
alter table public.progress enable row level security;
alter table public.user_kv  enable row level security;

drop policy if exists "children: own rows" on public.children;
create policy "children: own rows" on public.children
  for all to authenticated
  using (parent_id = (select auth.uid()))
  with check (parent_id = (select auth.uid()));

drop policy if exists "progress: own rows" on public.progress;
create policy "progress: own rows" on public.progress
  for all to authenticated
  using (parent_id = (select auth.uid()))
  with check (
    parent_id = (select auth.uid())
    and exists (select 1 from public.children c where c.id = child_id and c.parent_id = (select auth.uid()))
  );

drop policy if exists "kv: own rows" on public.user_kv;
create policy "kv: own rows" on public.user_kv
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Limit stored blob size (gallery images are compressed client-side; this is a safety net, ~2 MB).
create or replace function public.user_kv_size_guard() returns trigger
language plpgsql set search_path = '' as $$
begin
  if pg_column_size(new.value) > 2000000 then
    raise exception 'Data terlalu besar';
  end if;
  return new;
end $$;
drop trigger if exists user_kv_size_guard on public.user_kv;
create trigger user_kv_size_guard before insert or update on public.user_kv
  for each row execute function public.user_kv_size_guard();

grant select, insert, update, delete on public.children, public.progress, public.user_kv to authenticated;

-- ---------------------------------------------------------------- pilot feedback (insert-only; read it in the Dashboard)
create table if not exists public.feedback (
  id          bigint generated always as identity primary key,
  user_id     uuid default auth.uid() references auth.users(id) on delete set null,
  payload     jsonb not null check (pg_column_size(payload) < 20000),
  created_at  timestamptz not null default now()
);
alter table public.feedback enable row level security;
drop policy if exists "feedback: anyone can send" on public.feedback;
create policy "feedback: anyone can send" on public.feedback
  for insert to anon, authenticated with check (true);
grant insert on public.feedback to anon, authenticated;
