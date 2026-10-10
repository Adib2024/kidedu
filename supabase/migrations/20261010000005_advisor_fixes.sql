-- Playora — 0005 fixes from the Supabase security & performance advisors
-- 1) Trigger functions must not be callable through /rest/v1/rpc (they only run as triggers).
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.audit_activities() from public, anon, authenticated;
revoke execute on function public.limit_children() from public, anon, authenticated;
revoke execute on function public.user_kv_size_guard() from public, anon, authenticated;
-- 2) is_admin() is only meaningful for signed-in users. Anonymous catalogue reads get their own
--    policy that does not call it, then anon loses EXECUTE.
alter policy "activities: read published" on public.activities to authenticated;
do $pol$ begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'activities' and policyname = 'activities: anon read published') then
    create policy "activities: anon read published" on public.activities for select to anon using (published);
  end if;
end $pol$;
revoke execute on function public.is_admin() from anon;
-- 3) Cover foreign keys with indexes.
create index if not exists activities_updated_by_idx on public.activities (updated_by);
create index if not exists admin_audit_actor_idx on public.admin_audit (actor);
create index if not exists feedback_user_id_idx on public.feedback (user_id);
create index if not exists learning_attempts_family_idx on public.learning_attempts (family_id);
-- Intentional, reviewed:
--   * record_attempt() is SECURITY DEFINER and callable by signed-in users: it is the only write path
--     for progress and validates everything itself.
--   * public.admins has RLS with no policies: invisible and unwritable through the API by design.
