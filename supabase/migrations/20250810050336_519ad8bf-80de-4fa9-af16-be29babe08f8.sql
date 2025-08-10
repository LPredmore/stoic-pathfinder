-- Create profiles table for user data without FK to auth.users (avoid reserved schema dependencies)
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Recreate policies idempotently
drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can create their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Users can delete their own profile" on public.profiles;

create policy "Users can view their own profile"
  on public.profiles
  for select
  using (auth.uid() = user_id);

create policy "Users can create their own profile"
  on public.profiles
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own profile"
  on public.profiles
  for update
  using (auth.uid() = user_id);

create policy "Users can delete their own profile"
  on public.profiles
  for delete
  using (auth.uid() = user_id);

-- Timestamp update function (idempotent)
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for automatic updated_at
create trigger if not exists update_profiles_updated_at
before update on public.profiles
for each row
execute function public.update_updated_at_column();

-- Helpful index for user_id lookups
create index if not exists idx_profiles_user_id on public.profiles(user_id);
