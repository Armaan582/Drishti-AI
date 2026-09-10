-- Drishti AI Supabase schema. Run in the Supabase SQL Editor.
-- This creates no demo data and stores no passwords or secret keys.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  phone text,
  specialization text,
  hospital_clinic text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles add column if not exists specialization text;
alter table public.profiles add column if not exists hospital_clinic text;

create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references auth.users(id) on delete cascade,
  image_path text,
  original_filename text not null,
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png')),
  file_size_bytes bigint not null check (file_size_bytes > 0 and file_size_bytes <= 10485760),
  image_width integer check (image_width is null or image_width > 0),
  image_height integer check (image_height is null or image_height > 0),
  status text not null default 'uploaded' check (status in ('uploaded', 'quality_check', 'preprocessing', 'processing', 'completed', 'failed')),
  quality_status text check (quality_status is null or quality_status in ('pending', 'passed', 'insufficient', 'failed')),
  quality_score numeric(5,2) check (quality_score is null or (quality_score >= 0 and quality_score <= 100)),
  risk_level text check (risk_level is null or risk_level in ('normal', 'mild', 'moderate', 'high')),
  dr_grade smallint check (dr_grade is null or dr_grade between 0 and 4),
  confidence numeric(5,2) check (confidence is null or (confidence >= 0 and confidence <= 100)),
  findings jsonb,
  heatmap_path text,
  recommendation text,
  referral_priority text check (referral_priority is null or referral_priority in ('routine', 'soon', 'urgent')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid unique references public.analyses(id) on delete cascade,
  doctor_id uuid not null references auth.users(id) on delete cascade,
  report_name text,
  report_status text not null default 'pending' check (report_status in ('pending', 'available', 'failed')),
  document_path text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references auth.users(id) on delete cascade,
  patient_name text not null,
  case_name text,
  appointment_type text not null,
  scheduled_at timestamptz not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  reason text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.appointments add column if not exists patient_name text;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  related_type text,
  related_id uuid,
  is_read boolean not null default false,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notifications_read_timestamp check ((is_read = false and read_at is null) or is_read = true)
);

create index if not exists analyses_doctor_created_idx on public.analyses (doctor_id, created_at desc);
create index if not exists analyses_doctor_status_idx on public.analyses (doctor_id, status);
create index if not exists reports_doctor_created_idx on public.reports (doctor_id, created_at desc);
create index if not exists appointments_doctor_scheduled_idx on public.appointments (doctor_id, scheduled_at);
create index if not exists notifications_doctor_unread_idx on public.notifications (doctor_id, is_read, created_at desc);

create or replace function public.set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email, phone, specialization, hospital_clinic)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), coalesce(new.email, ''), new.raw_user_meta_data ->> 'phone', new.raw_user_meta_data ->> 'specialization', new.raw_user_meta_data ->> 'hospital_clinic')
  on conflict (id) do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
drop trigger if exists analyses_set_updated_at on public.analyses;
create trigger analyses_set_updated_at before update on public.analyses for each row execute procedure public.set_updated_at();
drop trigger if exists reports_set_updated_at on public.reports;
create trigger reports_set_updated_at before update on public.reports for each row execute procedure public.set_updated_at();
drop trigger if exists appointments_set_updated_at on public.appointments;
create trigger appointments_set_updated_at before update on public.appointments for each row execute procedure public.set_updated_at();
drop trigger if exists notifications_set_updated_at on public.notifications;
create trigger notifications_set_updated_at before update on public.notifications for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
grant usage on schema public to authenticated;
grant select, insert, update on public.profiles to authenticated;
alter table public.analyses enable row level security;
alter table public.reports enable row level security;
alter table public.appointments enable row level security;
alter table public.notifications enable row level security;
drop policy if exists "profiles own rows" on public.profiles;
drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can create their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
create policy "profiles select own" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "profiles insert own" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "profiles update own" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
drop policy if exists "analyses own rows" on public.analyses;
create policy "analyses own rows" on public.analyses for all to authenticated using (auth.uid() = doctor_id) with check (auth.uid() = doctor_id);
drop policy if exists "reports own rows" on public.reports;
create policy "reports own rows" on public.reports for all to authenticated using (auth.uid() = doctor_id) with check (auth.uid() = doctor_id);
drop policy if exists "appointments own rows" on public.appointments;
create policy "appointments own rows" on public.appointments for all to authenticated using (auth.uid() = doctor_id) with check (auth.uid() = doctor_id);
drop policy if exists "notifications own rows" on public.notifications;
create policy "notifications own rows" on public.notifications for all to authenticated using (auth.uid() = doctor_id) with check (auth.uid() = doctor_id);

-- Private retinal-image bucket. Objects are stored as {doctor_id}/{analysis_id}/{filename}.
insert into storage.buckets (id, name, public) values ('retinal-images', 'retinal-images', false) on conflict (id) do update set public = false;
drop policy if exists "retinal images select own" on storage.objects;
create policy "retinal images select own" on storage.objects for select to authenticated using (bucket_id = 'retinal-images' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "retinal images insert own" on storage.objects;
create policy "retinal images insert own" on storage.objects for insert to authenticated with check (bucket_id = 'retinal-images' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "retinal images update own" on storage.objects;
create policy "retinal images update own" on storage.objects for update to authenticated using (bucket_id = 'retinal-images' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "retinal images delete own" on storage.objects;
create policy "retinal images delete own" on storage.objects for delete to authenticated using (bucket_id = 'retinal-images' and (storage.foldername(name))[1] = auth.uid()::text);
