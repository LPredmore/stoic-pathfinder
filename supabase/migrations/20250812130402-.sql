-- Create goals table for user-specific goals with progress
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null,
  title text not null,
  description text,
  progress integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint goals_progress_range check (progress >= 0 and progress <= 100)
);

-- Add FK to profiles and index for performance
alter table public.goals
  add constraint goals_profile_id_fkey
  foreign key (profile_id) references public.profiles(id) on delete cascade;

create index if not exists idx_goals_profile_id on public.goals(profile_id);

-- Enable RLS
alter table public.goals enable row level security;

-- RLS policies mirroring other user-owned tables
create policy "Users can view their own goals"
  on public.goals for select
  using (exists (select 1 from public.profiles p where p.id = goals.profile_id and p.user_id = auth.uid()));

create policy "Users can insert their own goals"
  on public.goals for insert
  with check (exists (select 1 from public.profiles p where p.id = goals.profile_id and p.user_id = auth.uid()));

create policy "Users can update their own goals"
  on public.goals for update
  using (exists (select 1 from public.profiles p where p.id = goals.profile_id and p.user_id = auth.uid()));

create policy "Users can delete their own goals"
  on public.goals for delete
  using (exists (select 1 from public.profiles p where p.id = goals.profile_id and p.user_id = auth.uid()));

-- Trigger to maintain updated_at
create trigger update_goals_updated_at
  before update on public.goals
  for each row execute function public.update_updated_at_column();