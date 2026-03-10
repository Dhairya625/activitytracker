-- Run this in your Supabase SQL Editor to initialize the Activity Tracker schema

-- 1. Create profiles table
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  role text not null default 'member', -- 'member' | 'leader'
  created_at timestamptz default now()
);

-- 2. Create activities table
create table public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  task_name text not null,
  description text,
  category text not null,
  hours numeric(5,2) not null,
  logged_at timestamptz default now(),
  created_at timestamptz default now()
);

-- 3. Set up RLS (Row Level Security)
alter table public.profiles enable row level security;
alter table public.activities enable row level security;

-- Activities policies: Everyone can view, users can insert their own, leaders can insert for anyone
create policy "Activities are viewable by everyone." on public.activities for select using (true);
create policy "Users can insert their own activities." on public.activities for insert with check (auth.uid() = user_id);
create policy "Leaders can insert for anyone." on public.activities for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'leader')
);

-- Profiles policies
create policy "Profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- 4. Enable Realtime for activities feed
alter publication supabase_realtime add table public.activities;

-- 5. Trigger to automatically create a profile when a new auth.user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), 'member');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
