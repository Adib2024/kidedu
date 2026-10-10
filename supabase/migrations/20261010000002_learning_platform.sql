-- Playora — 0002 learning platform
-- Adds: profiles, admin role table, activity catalogue (+ audit log), learning attempts with
-- server-validated scoring (record_attempt RPC), child stats, favourites, weekly goals.
-- Safe to apply on top of 0001: no table is dropped, no data is deleted. Idempotent where practical.
--
-- Security model
--   * Parents (authenticated users) own their children and everything recorded for them.
--   * Progress/attempts can ONLY be written through public.record_attempt(), which validates
--     ownership, the activity, score bounds and the answer log, and computes stars & XP itself.
--   * Admins are listed in public.admins. There is NO API path to insert into that table:
--     grant admin with SQL in the dashboard (see README). Admins may publish/unpublish activities.

-- ============================================================ profiles
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text not null default '' check (char_length(display_name) <= 60),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
alter table public.profiles enable row level security;
drop policy if exists "profiles: read own" on public.profiles;
create policy "profiles: read own" on public.profiles for select to authenticated using (id = (select auth.uid()));
drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;   -- only this column is user-editable

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, left(coalesce(new.raw_user_meta_data->>'name', ''), 60))
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
insert into public.profiles (id, display_name)
  select id, left(coalesce(raw_user_meta_data->>'name', ''), 60) from auth.users
  on conflict (id) do nothing;

-- ============================================================ admins (role model)
create table if not exists public.admins (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now()
);
alter table public.admins enable row level security;   -- no policies: invisible & unwritable through the API
revoke all on public.admins from anon, authenticated;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- ============================================================ activity catalogue
-- One row per activity "family" (a game, a map, a book, a pensel activity, the routine).
-- An attempt id is "<family id>" or "<family id>:<item>" (e.g. game:bijak-sifir:3, pensel:tulis-huruf:A).
create table if not exists public.activities (
  id             text primary key check (id ~ '^[a-z]+(:[a-z0-9-]+)?$' and char_length(id) <= 80),
  category       text not null check (category in ('games', 'peta', 'buku', 'pensel', 'rutin')),
  title          text not null check (char_length(title) between 1 and 120),
  kind           text not null check (kind in ('quiz', 'stars', 'once')),
  question_count smallint check (question_count between 1 and 50),   -- required for kind = quiz
  items          text[],                                              -- allowed item suffixes, or null
  item_pattern   text,                                                -- regex for item suffixes, or null
  published      boolean not null default true,
  sort_order     integer not null default 0,
  updated_at     timestamptz not null default now(),
  updated_by     uuid references auth.users(id) on delete set null,
  constraint quiz_needs_count check (kind <> 'quiz' or question_count is not null)
);
alter table public.activities enable row level security;
drop policy if exists "activities: read published" on public.activities;
create policy "activities: read published" on public.activities for select to anon, authenticated
  using (published or (select public.is_admin()));
drop policy if exists "activities: admin update" on public.activities;
create policy "activities: admin update" on public.activities for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
revoke all on public.activities from anon, authenticated;
grant select on public.activities to anon, authenticated;
grant update (published, title, sort_order) on public.activities to authenticated;  -- RLS limits to admins

create table if not exists public.admin_audit (
  id          bigint generated always as identity primary key,
  actor       uuid references auth.users(id) on delete set null,
  table_name  text not null,
  row_id      text not null,
  action      text not null,
  old_value   jsonb,
  new_value   jsonb,
  created_at  timestamptz not null default now()
);
alter table public.admin_audit enable row level security;
drop policy if exists "audit: admins read" on public.admin_audit;
create policy "audit: admins read" on public.admin_audit for select to authenticated using ((select public.is_admin()));
revoke all on public.admin_audit from anon, authenticated;
grant select on public.admin_audit to authenticated;

create or replace function public.audit_activities() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  insert into public.admin_audit (actor, table_name, row_id, action, old_value, new_value)
  values (auth.uid(), 'activities', new.id, tg_op,
          jsonb_build_object('published', old.published, 'title', old.title, 'sort_order', old.sort_order),
          jsonb_build_object('published', new.published, 'title', new.title, 'sort_order', new.sort_order));
  return new;
end $$;
drop trigger if exists activities_audit on public.activities;
create trigger activities_audit before update on public.activities for each row execute function public.audit_activities();

-- ============================================================ children: weekly goal + sane limits
alter table public.children add column if not exists weekly_goal smallint not null default 5;
do $$ begin
  alter table public.children add constraint children_weekly_goal_range check (weekly_goal between 1 and 50);
exception when duplicate_object then null; end $$;

create or replace function public.limit_children() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if (select count(*) from public.children where parent_id = new.parent_id) >= 10 then
    raise exception 'Had maksimum 10 profil anak bagi setiap akaun' using errcode = 'check_violation';
  end if;
  return new;
end $$;
drop trigger if exists children_limit on public.children;
create trigger children_limit before insert on public.children for each row execute function public.limit_children();

-- ============================================================ learning attempts
create table if not exists public.learning_attempts (
  id           uuid primary key default gen_random_uuid(),
  child_id     uuid not null references public.children(id) on delete cascade,
  parent_id    uuid not null references auth.users(id) on delete cascade,
  activity_id  text not null check (char_length(activity_id) <= 120),
  family_id    text not null references public.activities(id),
  category     text not null,
  score        integer not null,
  total        integer not null,
  stars        smallint not null check (stars between 0 and 3),
  xp           integer not null check (xp >= 0),
  answers      jsonb,
  duration_ms  integer check (duration_ms is null or duration_ms between 0 and 86400000),
  created_at   timestamptz not null default now()
);
create index if not exists learning_attempts_child_created_idx on public.learning_attempts (child_id, created_at desc);
create index if not exists learning_attempts_parent_idx on public.learning_attempts (parent_id);
alter table public.learning_attempts enable row level security;
drop policy if exists "attempts: parent reads own" on public.learning_attempts;
create policy "attempts: parent reads own" on public.learning_attempts for select to authenticated
  using (parent_id = (select auth.uid()));
revoke all on public.learning_attempts from anon, authenticated;
grant select on public.learning_attempts to authenticated;          -- writes only via record_attempt()

-- progress becomes read-only for clients (best result per activity is maintained by record_attempt)
drop policy if exists "progress: own rows" on public.progress;
drop policy if exists "progress: parent reads own" on public.progress;
create policy "progress: parent reads own" on public.progress for select to authenticated
  using (parent_id = (select auth.uid()));
revoke insert, update, delete on public.progress from anon, authenticated;
grant select on public.progress to authenticated;

-- per-child totals (respects RLS of the caller)
create or replace view public.child_stats with (security_invoker = true) as
  select child_id, sum(xp)::integer as xp, count(*)::integer as attempts, max(created_at) as last_at
  from public.learning_attempts group by child_id;
grant select on public.child_stats to authenticated;

-- ============================================================ record_attempt (trusted scoring)
create or replace function public.stars_for(p_score integer, p_total integer) returns smallint
language sql immutable set search_path = '' as $$
  select case when p_total <= 0 then 0
              when p_score::numeric / p_total >= 0.9 then 3
              when p_score::numeric / p_total >= 0.7 then 2
              when p_score::numeric / p_total >= 0.5 then 1
              else 0 end::smallint;
$$;

create or replace function public.record_attempt(
  p_child uuid, p_activity text, p_score integer, p_total integer,
  p_answers jsonb default null, p_duration_ms integer default null
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_act public.activities;
  v_item text;
  v_stars smallint;
  v_prev public.progress;
  v_xp integer;
  v_today_count integer;
  v_recent integer;
  v_correct integer;
  v_row public.progress;
begin
  if v_uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;

  -- 1. the child must belong to the caller
  if not exists (select 1 from public.children where id = p_child and parent_id = v_uid) then
    raise exception 'child_not_found' using errcode = '42501';
  end if;

  -- 2. the activity must exist, be published, and the item must be allowed
  select * into v_act from public.activities a
   where a.published and (p_activity = a.id or p_activity like a.id || ':%')
   order by char_length(a.id) desc limit 1;
  if v_act.id is null then raise exception 'unknown_activity' using errcode = '22023'; end if;
  v_item := nullif(substr(p_activity, char_length(v_act.id) + 2), '');
  if v_item is null then
    if v_act.items is not null or v_act.item_pattern is not null then raise exception 'item_required' using errcode = '22023'; end if;
  elsif not ((v_act.items is not null and v_item = any (v_act.items))
          or (v_act.item_pattern is not null and v_item ~ v_act.item_pattern)) then
    raise exception 'invalid_item' using errcode = '22023';
  end if;

  -- 3. score bounds by activity kind; quiz scores are recomputed from the answer log
  if v_act.kind = 'quiz' then
    if p_total is distinct from v_act.question_count then raise exception 'invalid_total' using errcode = '22023'; end if;
    if p_answers is null or jsonb_typeof(p_answers) <> 'array' or jsonb_array_length(p_answers) <> p_total then
      raise exception 'answers_required' using errcode = '22023';
    end if;
    select count(*) into v_correct from jsonb_array_elements(p_answers) e
     where jsonb_typeof(e) = 'object' and (e ? 'a') and (e ? 'c') and (e->>'a') = (e->>'c');
    if v_correct <> p_score then raise exception 'score_mismatch' using errcode = '22023'; end if;
    v_stars := case when v_act.category = 'buku' then least(3, p_score)::smallint else public.stars_for(p_score, p_total) end;
  elsif v_act.kind = 'stars' then
    if p_total <> 3 or p_score not between 0 and 3 then raise exception 'invalid_score' using errcode = '22023'; end if;
    v_stars := p_score::smallint;
    p_answers := null;
  else -- once (e.g. a completed routine)
    if p_total <> 1 or p_score <> 1 then raise exception 'invalid_score' using errcode = '22023'; end if;
    v_stars := 1;
    p_answers := null;
  end if;
  if pg_column_size(p_answers) > 20000 then raise exception 'answers_too_large' using errcode = '22023'; end if;

  -- 4. abuse limits: same activity at most once per 5 s; at most 40 attempts per child per 10 min
  select count(*) into v_recent from public.learning_attempts
   where child_id = p_child and activity_id = p_activity and created_at > now() - interval '5 seconds';
  if v_recent > 0 then raise exception 'too_fast' using errcode = '54000'; end if;
  select count(*) into v_recent from public.learning_attempts
   where child_id = p_child and created_at > now() - interval '10 minutes';
  if v_recent >= 40 then raise exception 'rate_limited' using errcode = '54000'; end if;

  -- 5. reward rules: 5 XP for taking part (first 30 attempts per child per day),
  --    + 10 XP per star improvement on this activity (replaying cannot farm stars)
  select * into v_prev from public.progress where child_id = p_child and activity_id = p_activity;
  select count(*) into v_today_count from public.learning_attempts
   where child_id = p_child and created_at >= date_trunc('day', now() at time zone 'Asia/Kuala_Lumpur') at time zone 'Asia/Kuala_Lumpur';
  v_xp := (case when v_today_count < 30 then 5 else 0 end) + 10 * greatest(0, v_stars - coalesce(v_prev.stars, 0));

  insert into public.learning_attempts (child_id, parent_id, activity_id, family_id, category, score, total, stars, xp, answers, duration_ms)
  values (p_child, v_uid, p_activity, v_act.id, v_act.category, p_score, p_total, v_stars, v_xp, p_answers, p_duration_ms);

  insert into public.progress as pr (child_id, activity_id, parent_id, category, stars, best_score, total, plays, updated_at)
  values (p_child, p_activity, v_uid, v_act.category, v_stars, p_score, p_total, 1, now())
  on conflict (child_id, activity_id) do update
    set stars = greatest(pr.stars, excluded.stars),
        best_score = greatest(pr.best_score, excluded.best_score),
        total = excluded.total,
        plays = pr.plays + 1,
        updated_at = now()
  returning * into v_row;

  return jsonb_build_object(
    'stars', v_stars, 'xp', v_xp,
    'progress', to_jsonb(v_row),
    'total_xp', (select coalesce(sum(xp), 0) from public.learning_attempts where child_id = p_child)
  );
end $$;
revoke all on function public.record_attempt(uuid, text, integer, integer, jsonb, integer) from public, anon;
grant execute on function public.record_attempt(uuid, text, integer, integer, jsonb, integer) to authenticated;
revoke all on function public.stars_for(integer, integer) from public, anon;

-- ============================================================ favourites
create table if not exists public.favorites (
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  item_type  text not null check (item_type in ('worksheet', 'game', 'book', 'map', 'pensel')),
  item_id    text not null check (item_id ~ '^[a-z0-9-]{1,60}$'),
  created_at timestamptz not null default now(),
  primary key (user_id, item_type, item_id)
);
alter table public.favorites enable row level security;
drop policy if exists "favorites: own rows" on public.favorites;
create policy "favorites: own rows" on public.favorites for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
revoke all on public.favorites from anon, authenticated;
grant select, insert, delete on public.favorites to authenticated;
