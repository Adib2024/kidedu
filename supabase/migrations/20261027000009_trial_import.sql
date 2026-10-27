-- Playora 0009: "Cuba Terus" trial → account. A family that tried Playora without signing up (data kept on
-- their device) can move that progress into their new account once. Every attempt is re-validated and re-scored
-- by the same rules as record_attempt (answer logs are recomputed — stars cannot be forged); only the abuse
-- rate limit is skipped, and only for a brand-new child profile with no attempts yet, at most 400 attempts.
-- Non-destructive: record_attempt keeps its signature and behaviour; its body moves into attempt_core().

-- 1. shared core (NOT callable through the API: it trusts p_uid)
create or replace function public.attempt_core(
  p_uid uuid, p_child uuid, p_activity text, p_score integer, p_total integer,
  p_answers jsonb, p_duration_ms integer, p_limits boolean
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := p_uid;
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
  --    (skipped only by import_trial_attempts, which is one-time and capped)
  if p_limits then
  select count(*) into v_recent from public.learning_attempts
   where child_id = p_child and activity_id = p_activity and created_at > now() - interval '5 seconds';
  if v_recent > 0 then raise exception 'too_fast' using errcode = '54000'; end if;
  select count(*) into v_recent from public.learning_attempts
   where child_id = p_child and created_at > now() - interval '10 minutes';
  if v_recent >= 40 then raise exception 'rate_limited' using errcode = '54000'; end if;
  end if;

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
revoke all on function public.attempt_core(uuid, uuid, text, integer, integer, jsonb, integer, boolean) from public, anon, authenticated;

-- 2. record_attempt: unchanged contract, now a thin wrapper
create or replace function public.record_attempt(
  p_child uuid, p_activity text, p_score integer, p_total integer,
  p_answers jsonb default null, p_duration_ms integer default null
) returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  return public.attempt_core(auth.uid(), p_child, p_activity, p_score, p_total, p_answers, p_duration_ms, true);
end $$;
revoke all on function public.record_attempt(uuid, text, integer, integer, jsonb, integer) from public, anon;
grant execute on function public.record_attempt(uuid, text, integer, integer, jsonb, integer) to authenticated;

-- 3. one-time import of a trial's attempts into a freshly created child
create or replace function public.import_trial_attempts(p_child uuid, p_attempts jsonb)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_child public.children;
  e jsonb;
  v_ok integer := 0;
  v_skip integer := 0;
begin
  if v_uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  select * into v_child from public.children where id = p_child and parent_id = v_uid;
  if v_child.id is null then raise exception 'child_not_found' using errcode = '42501'; end if;
  if v_child.created_at < now() - interval '1 hour'
     or exists (select 1 from public.learning_attempts where child_id = p_child) then
    raise exception 'import_not_allowed' using errcode = '42501';
  end if;
  if p_attempts is null or jsonb_typeof(p_attempts) <> 'array' then raise exception 'invalid_import' using errcode = '22023'; end if;
  if jsonb_array_length(p_attempts) > 400 then raise exception 'import_too_large' using errcode = '22023'; end if;

  for e in select value from jsonb_array_elements(p_attempts) loop
    begin
      perform public.attempt_core(v_uid, p_child, e->>'activity', (e->>'score')::integer, (e->>'total')::integer,
        nullif(e->'answers', 'null'::jsonb), nullif(e->>'duration_ms', '')::integer, false);
      v_ok := v_ok + 1;
    exception when others then
      v_skip := v_skip + 1;   -- unknown/hidden activity, bad score, … : leave it out, keep the rest
    end;
  end loop;
  return jsonb_build_object('imported', v_ok, 'skipped', v_skip,
    'total_xp', (select coalesce(sum(xp), 0) from public.learning_attempts where child_id = p_child));
end $$;
revoke all on function public.import_trial_attempts(uuid, jsonb) from public, anon;
grant execute on function public.import_trial_attempts(uuid, jsonb) to authenticated;
