-- Playora — 0004 feedback hardening
-- Feedback is write-only for the API: senders cannot read, change or delete any row
-- (RLS already returned nothing; this also removes the privileges — defence in depth).
-- Read feedback in the Supabase dashboard (Table Editor) or with the SQL editor.
revoke select, update, delete, truncate on public.feedback from anon, authenticated;
grant insert on public.feedback to anon, authenticated;
