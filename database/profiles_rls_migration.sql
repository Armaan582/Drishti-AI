-- Safe migration for an existing Drishti AI Supabase project.
-- Preserves profiles data and keeps RLS enabled.

alter table public.profiles enable row level security;
grant usage on schema public to authenticated;
grant select, insert, update on public.profiles to authenticated;

drop policy if exists "profiles own rows" on public.profiles;
drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can create their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "profiles select own" on public.profiles;
drop policy if exists "profiles insert own" on public.profiles;
drop policy if exists "profiles update own" on public.profiles;

create policy "profiles select own"
on public.profiles for select to authenticated
using (auth.uid() = id);

create policy "profiles insert own"
on public.profiles for insert to authenticated
with check (auth.uid() = id);

create policy "profiles update own"
on public.profiles for update to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);
