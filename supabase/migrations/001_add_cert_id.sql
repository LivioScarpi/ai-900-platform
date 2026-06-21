-- Migration: add cert_id to attempts + exam_sessions
-- Run in Supabase SQL Editor: https://app.supabase.com → your project → SQL Editor
--
-- Adds per-certification scoping so dashboards can show stats for a single cert.
-- Existing rows predate AZ-900 and are backfilled to 'ai900'.

-- ── attempts ────────────────────────────────────────────────────────────────
alter table attempts add column if not exists cert_id text;
update attempts set cert_id = 'ai900' where cert_id is null;
alter table attempts alter column cert_id set default 'ai900';
create index if not exists attempts_cert_id_idx on attempts(user_id, cert_id);

-- ── exam_sessions ─────────────────────────────────────────────────────────────
alter table exam_sessions add column if not exists cert_id text;
update exam_sessions set cert_id = 'ai900' where cert_id is null;
alter table exam_sessions alter column cert_id set default 'ai900';
create index if not exists exam_sessions_cert_id_idx on exam_sessions(user_id, cert_id);
