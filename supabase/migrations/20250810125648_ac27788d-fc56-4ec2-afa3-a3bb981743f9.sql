-- Create table for Always→Never responses
create table if not exists public.always_never (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  -- 1–5 Likert values (nullable until user completes)
  making_plans_prefer_schedule integer,
  thrill_seeking_frequency integer,
  analyze_vs_distract_when_stressed integer,
  understand_upset_friend_immediately integer,
  rely_logic_over_gut integer,
  follow_through_long_term_goals integer,
  anxious_talk_it_out_vs_internal integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(profile_id),
  -- Range checks (allow null while incomplete)
  constraint chk_making_plans_prefer_schedule_range check (making_plans_prefer_schedule between 1 and 5 or making_plans_prefer_schedule is null),
  constraint chk_thrill_seeking_frequency_range check (thrill_seeking_frequency between 1 and 5 or thrill_seeking_frequency is null),
  constraint chk_analyze_vs_distract_when_stressed_range check (analyze_vs_distract_when_stressed between 1 and 5 or analyze_vs_distract_when_stressed is null),
  constraint chk_understand_upset_friend_immediately_range check (understand_upset_friend_immediately between 1 and 5 or understand_upset_friend_immediately is null),
  constraint chk_rely_logic_over_gut_range check (rely_logic_over_gut between 1 and 5 or rely_logic_over_gut is null),
  constraint chk_follow_through_long_term_goals_range check (follow_through_long_term_goals between 1 and 5 or follow_through_long_term_goals is null),
  constraint chk_anxious_talk_it_out_vs_internal_range check (anxious_talk_it_out_vs_internal between 1 and 5 or anxious_talk_it_out_vs_internal is null)
);

-- Create table for Strongly Agree→Strongly Disagree responses
create table if not exists public.agree_disagree (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  -- 1–5 Likert values (nullable until user completes)
  energized_by_many_people integer,
  own_emotions_easier_than_others integer,
  highly_organized_person integer,
  notice_subtle_mood_changes integer,
  comfortable_challenging_norms integer,
  easy_to_admit_wrong integer,
  prefer_exploring_new_ideas integer,
  fairness_honesty_important integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(profile_id),
  -- Range checks (allow null while incomplete)
  constraint chk_energized_by_many_people_range check (energized_by_many_people between 1 and 5 or energized_by_many_people is null),
  constraint chk_own_emotions_easier_than_others_range check (own_emotions_easier_than_others between 1 and 5 or own_emotions_easier_than_others is null),
  constraint chk_highly_organized_person_range check (highly_organized_person between 1 and 5 or highly_organized_person is null),
  constraint chk_notice_subtle_mood_changes_range check (notice_subtle_mood_changes between 1 and 5 or notice_subtle_mood_changes is null),
  constraint chk_comfortable_challenging_norms_range check (comfortable_challenging_norms between 1 and 5 or comfortable_challenging_norms is null),
  constraint chk_easy_to_admit_wrong_range check (easy_to_admit_wrong between 1 and 5 or easy_to_admit_wrong is null),
  constraint chk_prefer_exploring_new_ideas_range check (prefer_exploring_new_ideas between 1 and 5 or prefer_exploring_new_ideas is null),
  constraint chk_fairness_honesty_important_range check (fairness_honesty_important between 1 and 5 or fairness_honesty_important is null)
);

-- Enable RLS
alter table public.always_never enable row level security;
alter table public.agree_disagree enable row level security;

-- Replace policies for always_never
drop policy if exists "Users can view their own always_never" on public.always_never;
drop policy if exists "Users can insert their own always_never" on public.always_never;
drop policy if exists "Users can update their own always_never" on public.always_never;
drop policy if exists "Users can delete their own always_never" on public.always_never;

create policy "Users can view their own always_never"
  on public.always_never for select
  using (exists (
    select 1 from public.profiles p where p.id = always_never.profile_id and p.user_id = auth.uid()
  ));

create policy "Users can insert their own always_never"
  on public.always_never for insert
  with check (exists (
    select 1 from public.profiles p where p.id = always_never.profile_id and p.user_id = auth.uid()
  ));

create policy "Users can update their own always_never"
  on public.always_never for update
  using (exists (
    select 1 from public.profiles p where p.id = always_never.profile_id and p.user_id = auth.uid()
  ));

create policy "Users can delete their own always_never"
  on public.always_never for delete
  using (exists (
    select 1 from public.profiles p where p.id = always_never.profile_id and p.user_id = auth.uid()
  ));

-- Replace policies for agree_disagree
drop policy if exists "Users can view their own agree_disagree" on public.agree_disagree;
drop policy if exists "Users can insert their own agree_disagree" on public.agree_disagree;
drop policy if exists "Users can update their own agree_disagree" on public.agree_disagree;
drop policy if exists "Users can delete their own agree_disagree" on public.agree_disagree;

create policy "Users can view their own agree_disagree"
  on public.agree_disagree for select
  using (exists (
    select 1 from public.profiles p where p.id = agree_disagree.profile_id and p.user_id = auth.uid()
  ));

create policy "Users can insert their own agree_disagree"
  on public.agree_disagree for insert
  with check (exists (
    select 1 from public.profiles p where p.id = agree_disagree.profile_id and p.user_id = auth.uid()
  ));

create policy "Users can update their own agree_disagree"
  on public.agree_disagree for update
  using (exists (
    select 1 from public.profiles p where p.id = agree_disagree.profile_id and p.user_id = auth.uid()
  ));

create policy "Users can delete their own agree_disagree"
  on public.agree_disagree for delete
  using (exists (
    select 1 from public.profiles p where p.id = agree_disagree.profile_id and p.user_id = auth.uid()
  ));

-- Timestamp triggers (replace if exist)
drop trigger if exists update_always_never_updated_at on public.always_never;
create trigger update_always_never_updated_at
  before update on public.always_never
  for each row execute function public.update_updated_at_column();

drop trigger if exists update_agree_disagree_updated_at on public.agree_disagree;
create trigger update_agree_disagree_updated_at
  before update on public.agree_disagree
  for each row execute function public.update_updated_at_column();