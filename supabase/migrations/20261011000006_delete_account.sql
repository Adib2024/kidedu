-- Playora — 0006 self-service account deletion (idempotent, additive)
-- A signed-in parent can delete their own account. Every family table references auth.users
-- with ON DELETE CASCADE (children, progress, learning_attempts, user_kv, favorites, profiles,
-- admins); pilot feedback is kept but anonymised (ON DELETE SET NULL).
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not_signed_in' using errcode = '28000';
  end if;
  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_my_account() from public;
revoke all on function public.delete_my_account() from anon;
grant execute on function public.delete_my_account() to authenticated;

comment on function public.delete_my_account() is 'Deletes the calling user and (by cascade) all of their family data.';
