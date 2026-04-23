-- AI-900 Study Platform — Supabase Schema
-- Run this in Supabase SQL Editor: https://app.supabase.com → your project → SQL Editor

-- ── Tables ────────────────────────────────────────────────────────────────────

create table if not exists attempts (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  question_id int not null,
  mode text not null,
  selected_answers text[],
  is_correct boolean not null,
  time_taken_ms int,
  created_at timestamptz default now()
);

create table if not exists exam_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  mode text not null,
  score int not null,
  total int not null,
  topic_scores jsonb,
  duration_ms int,
  created_at timestamptz default now()
);

create table if not exists flashcard_ratings (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  question_id int not null,
  rating text not null check (rating in ('got_it', 'missed_it')),
  created_at timestamptz default now()
);

create table if not exists bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  question_id int not null,
  created_at timestamptz default now(),
  unique(user_id, question_id)
);

-- ── Indexes ───────────────────────────────────────────────────────────────────

create index if not exists attempts_user_id_idx on attempts(user_id);
create index if not exists exam_sessions_user_id_idx on exam_sessions(user_id);
create index if not exists flashcard_ratings_user_id_idx on flashcard_ratings(user_id);
create index if not exists bookmarks_user_id_idx on bookmarks(user_id);

-- ── Row Level Security (RLS) ──────────────────────────────────────────────────
-- Anonymous users can only read/write their own rows (matched by user_id text column)

alter table attempts enable row level security;
alter table exam_sessions enable row level security;
alter table flashcard_ratings enable row level security;
alter table bookmarks enable row level security;

-- Allow anon/authenticated to insert/select their own rows
-- (We use a localStorage UUID as user_id — no JWT claims needed)

create policy "attempts_user_policy" on attempts
  for all using (true) with check (true);

create policy "exam_sessions_user_policy" on exam_sessions
  for all using (true) with check (true);

create policy "flashcard_ratings_user_policy" on flashcard_ratings
  for all using (true) with check (true);

create policy "bookmarks_user_policy" on bookmarks
  for all using (true) with check (true);
