-- 1) Create text_responses table for raw open-ended and binary labels
create table if not exists public.text_responses (
  id           uuid        not null default gen_random_uuid() primary key,
  profile_id   uuid        not null references public.profiles(id) on delete cascade,
  question_id  uuid        not null references public.questions(id) on delete cascade,
  response     text        not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint uq_text_response unique(profile_id, question_id)
);

-- Enable RLS
alter table public.text_responses enable row level security;

-- RLS policies mirroring `responses` (owner-only access)
create policy if not exists "Users can view their own text_responses"
  on public.text_responses for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = text_responses.profile_id and p.user_id = auth.uid()
    )
  );

create policy if not exists "Users can insert their own text_responses"
  on public.text_responses for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = text_responses.profile_id and p.user_id = auth.uid()
    )
  );

create policy if not exists "Users can update their own text_responses"
  on public.text_responses for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = text_responses.profile_id and p.user_id = auth.uid()
    )
  );

create policy if not exists "Users can delete their own text_responses"
  on public.text_responses for delete
  using (
    exists (
      select 1 from public.profiles p
      where p.id = text_responses.profile_id and p.user_id = auth.uid()
    )
  );

-- 2) Create qualitative_scores table to hold numeric mappings (to be populated by a scheduled job later)
create table if not exists public.qualitative_scores (
  id           uuid        not null default gen_random_uuid() primary key,
  profile_id   uuid        not null references public.profiles(id) on delete cascade,
  question_id  uuid        not null references public.questions(id) on delete cascade,
  score        numeric     not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint uq_qual_score unique(profile_id, question_id)
);

-- Enable RLS
alter table public.qualitative_scores enable row level security;

-- RLS policies (owner-only access)
create policy if not exists "Users can view their own qualitative_scores"
  on public.qualitative_scores for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = qualitative_scores.profile_id and p.user_id = auth.uid()
    )
  );

create policy if not exists "Users can insert their own qualitative_scores"
  on public.qualitative_scores for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = qualitative_scores.profile_id and p.user_id = auth.uid()
    )
  );

create policy if not exists "Users can update their own qualitative_scores"
  on public.qualitative_scores for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = qualitative_scores.profile_id and p.user_id = auth.uid()
    )
  );

create policy if not exists "Users can delete their own qualitative_scores"
  on public.qualitative_scores for delete
  using (
    exists (
      select 1 from public.profiles p
      where p.id = qualitative_scores.profile_id and p.user_id = auth.uid()
    )
  );