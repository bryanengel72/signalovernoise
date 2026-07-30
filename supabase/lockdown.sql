-- Lock booking_inquiries down to server-side writes only.
--
-- Contact form submissions now go through /api/contact, which verifies a
-- Cloudflare Turnstile token before inserting with the service-role key. The
-- public anon key is embedded in the browser bundle, so anyone can read it — if
-- anon can still INSERT, the human check is one curl command away from bypass.
--
-- Run this in the Supabase SQL editor (Dashboard -> SQL Editor -> New query).

-- 1. Make sure RLS is on.
alter table public.booking_inquiries enable row level security;

-- 2. Remove table privileges from the public-facing roles. PostgREST connects as
--    `anon` for unauthenticated requests, so this alone blocks direct inserts
--    regardless of which policies exist. `service_role` is a separate role and
--    is unaffected, so /api/contact keeps working.
revoke insert, select, update, delete on public.booking_inquiries from anon;
revoke insert, select, update, delete on public.booking_inquiries from authenticated;

-- 3. Verify. Both of these should come back empty (or show no anon/authenticated
--    grants) after the revoke above.
select grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name = 'booking_inquiries'
  and grantee in ('anon', 'authenticated');

select policyname, roles, cmd
from pg_policies
where schemaname = 'public'
  and tablename = 'booking_inquiries';

-- Any leftover policies from step 3 are now inert (no privileges to apply them
-- to), but you can drop them for tidiness:
--   drop policy "<policyname>" on public.booking_inquiries;

-- 4. Prove the bypass is closed. This impersonates the public `anon` role — the
--    one the browser's anon key authenticates as — and tries the exact insert a
--    scammer would send straight at the REST API, skipping the form entirely.
--
--    Expected result: ERROR: permission denied for table booking_inquiries
--    If it succeeds instead, the lockdown did not take. Either way the rollback
--    means nothing is written.
begin;
set local role anon;
insert into public.booking_inquiries (name, email, message)
values ('bypass-test', 'test@example.com', 'should not be allowed');
rollback;
