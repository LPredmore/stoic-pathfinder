-- Enable RLS and add policies for new assessment tables; also make questions public-readable

-- 1) questions
alter table if exists public.questions enable row level security;
create policy if not exists "Questions are viewable by everyone"
  on public.questions for select
  using (true);

-- 2) question_traits
alter table if exists public.question_traits enable row level security;
create policy if not exists "Question traits are viewable by everyone"
  on public.question_traits for select
  using (true);

-- 3) responses (user-scoped)
alter table if exists public.responses enable row level security;
create policy if not exists "Users can view their own responses"
  on public.responses for select
  using (exists (
    select 1 from public.profiles p
    where p.id = responses.profile_id and p.user_id = auth.uid()
  ));
create policy if not exists "Users can insert their own responses"
  on public.responses for insert
  with check (exists (
    select 1 from public.profiles p
    where p.id = responses.profile_id and p.user_id = auth.uid()
  ));
create policy if not exists "Users can update their own responses"
  on public.responses for update
  using (exists (
    select 1 from public.profiles p
    where p.id = responses.profile_id and p.user_id = auth.uid()
  ));
create policy if not exists "Users can delete their own responses"
  on public.responses for delete
  using (exists (
    select 1 from public.profiles p
    where p.id = responses.profile_id and p.user_id = auth.uid()
  ));

-- 4) profile_scores (computed; read-only to clients)
alter table if exists public.profile_scores enable row level security;
create policy if not exists "Users can view their own profile_scores"
  on public.profile_scores for select
  using (exists (
    select 1 from public.profiles p
    where p.id = profile_scores.profile_id and p.user_id = auth.uid()
  ));
-- Note: no insert/update/delete policies for clients; maintained by server-side jobs
