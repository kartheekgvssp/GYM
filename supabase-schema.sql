-- Run this in your Supabase project's SQL Editor (Project -> SQL Editor -> New query)

create table if not exists templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  created_at timestamptz default now()
);

create table if not exists template_exercises (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references templates(id) on delete cascade not null,
  name text not null,
  target_sets int default 3,
  target_reps int default 10,
  order_index int default 0
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  template_id uuid references templates(id) on delete set null,
  started_at timestamptz default now(),
  completed_at timestamptz
);

create table if not exists session_sets (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade not null,
  exercise_name text not null,
  set_number int not null,
  reps int,
  weight numeric,
  created_at timestamptz default now()
);

-- Row Level Security: every user can only ever see/edit their own data.
alter table templates enable row level security;
alter table template_exercises enable row level security;
alter table sessions enable row level security;
alter table session_sets enable row level security;

create policy "Users manage their own templates" on templates
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage exercises on their own templates" on template_exercises
  for all using (
    exists (select 1 from templates where templates.id = template_exercises.template_id and templates.user_id = auth.uid())
  ) with check (
    exists (select 1 from templates where templates.id = template_exercises.template_id and templates.user_id = auth.uid())
  );

create policy "Users manage their own sessions" on sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage sets on their own sessions" on session_sets
  for all using (
    exists (select 1 from sessions where sessions.id = session_sets.session_id and sessions.user_id = auth.uid())
  ) with check (
    exists (select 1 from sessions where sessions.id = session_sets.session_id and sessions.user_id = auth.uid())
  );
