-- No personal data: device id is random, name never leaves the phone.
create table if not exists participants (
  id uuid primary key,
  lang text not null,
  age_group text not null,
  district text not null,
  created_at timestamptz not null default now(),
  last_seen timestamptz not null default now()
);

create table if not exists progress (
  participant_id uuid not null references participants(id) on delete cascade,
  lesson_id text not null,
  score int not null,
  total int not null,
  completed_at timestamptz not null default now(),
  primary key (participant_id, lesson_id)
);

create index if not exists progress_lesson_idx on progress (lesson_id);
create index if not exists participants_created_idx on participants (created_at);
