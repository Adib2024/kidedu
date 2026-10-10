-- Live RLS smoke test for a Supabase project (dev/staging). Paste into the SQL editor and run.
-- Everything happens inside one transaction that is ROLLED BACK at the end (the final RAISE),
-- so no test users or rows are left behind. The results are printed in the error message.
do $t$
declare
  a uuid := gen_random_uuid(); b uuid := gen_random_uuid();
  ca uuid; cb uuid; r jsonb; n int; out text := '';
  quiz9 jsonb := (select jsonb_agg(jsonb_build_object('q','q'||i,'a',case when i<9 then 'x' else 'y' end,'c','x')) from generate_series(0,9) i);
  quiz4 jsonb := (select jsonb_agg(jsonb_build_object('q','q'||i,'a',case when i<4 then 'x' else 'y' end,'c','x')) from generate_series(0,9) i);
begin
  insert into auth.users (id, email, aud, role, raw_user_meta_data) values
    (a, 'itest-a@playora.test', 'authenticated', 'authenticated', '{"name":"Ujian A"}'),
    (b, 'itest-b@playora.test', 'authenticated', 'authenticated', '{}');
  out := out || 'profile trigger: ' || coalesce((select display_name from public.profiles where id = a), 'MISSING') || E'\n';
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  insert into public.children (name, age) values ('Adik A', 5) returning id into ca;
  r := public.record_attempt(ca, 'game:bijak-sifir:0', 9, 10, quiz9, 30000);
  out := out || 'valid attempt -> stars ' || (r->>'stars') || ', xp ' || (r->>'xp') || E'\n';
  begin perform public.record_attempt(ca, 'game:bijak-sifir:1', 10, 10, quiz4); out := out || 'FAIL inflated score accepted' || E'\n';
  exception when others then out := out || 'inflated score rejected: ' || sqlerrm || E'\n'; end;
  begin insert into public.progress (child_id, activity_id, parent_id, category, stars) values (ca, 'game:x:0', a, 'games', 3); out := out || 'FAIL direct progress write' || E'\n';
  exception when others then out := out || 'direct progress write denied: ' || sqlerrm || E'\n'; end;
  begin insert into public.admins (user_id) values (a); out := out || 'FAIL self-admin' || E'\n';
  exception when others then out := out || 'self-admin denied: ' || sqlerrm || E'\n'; end;
  with u as (update public.activities set published = false where id = 'game:bijak-sifir' returning 1) select count(*) into n from u;
  out := out || 'parent unpublish rows affected (expect 0): ' || n || E'\n';
  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  insert into public.children (name) values ('Adik B') returning id into cb;
  select count(*) into n from public.children where id = ca; out := out || 'B sees A child rows (expect 0): ' || n || E'\n';
  select count(*) into n from public.learning_attempts; out := out || 'B sees attempts (expect 0): ' || n || E'\n';
  begin perform public.record_attempt(ca, 'game:bijak-sifir:2', 9, 10, quiz9); out := out || 'FAIL B recorded for A child' || E'\n';
  exception when others then out := out || 'B record for A child denied: ' || sqlerrm || E'\n'; end;
  execute 'reset role';
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  execute 'set local role anon';
  select count(*) into n from public.activities; out := out || 'anon catalogue rows: ' || n || E'\n';
  select count(*) into n from public.children; out := out || 'anon children rows (expect 0): ' || n || E'\n';
  begin perform public.record_attempt(ca, 'game:bijak-sifir:3', 9, 10, quiz9); out := out || 'FAIL anon recorded' || E'\n';
  exception when others then out := out || 'anon record denied: ' || sqlerrm || E'\n'; end;
  execute 'reset role';
  raise exception E'ROLLBACK (test only) RESULTS:\n%', out;
end $t$;
