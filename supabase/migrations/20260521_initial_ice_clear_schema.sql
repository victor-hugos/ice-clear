create extension if not exists pgcrypto;

create table if not exists public.technician_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null,
  business_name text,
  whatsapp text not null,
  city text not null,
  state text not null,
  slug text not null unique,
  service_radius_km integer not null default 15,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint technician_profiles_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table if not exists public.technician_services (
  id uuid primary key default gen_random_uuid(),
  technician_profile_id uuid not null references public.technician_profiles(id) on delete cascade,
  service_name text not null,
  base_price numeric(10,2),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.technician_qr_codes (
  id uuid primary key default gen_random_uuid(),
  technician_profile_id uuid not null unique references public.technician_profiles(id) on delete cascade,
  qr_slug text not null unique,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  constraint technician_qr_codes_status_check check (status in ('active', 'inactive')),
  constraint technician_qr_codes_slug_format check (qr_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_technician_profiles_updated_at
before update on public.technician_profiles
for each row
execute function public.set_updated_at();

alter table public.technician_profiles enable row level security;
alter table public.technician_services enable row level security;
alter table public.technician_qr_codes enable row level security;

create policy "technician_profiles_select_own"
on public.technician_profiles
for select
using (auth.uid() = user_id);

create policy "technician_profiles_insert_own"
on public.technician_profiles
for insert
with check (auth.uid() = user_id);

create policy "technician_profiles_update_own"
on public.technician_profiles
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "technician_services_manage_own"
on public.technician_services
for all
using (
  exists (
    select 1
    from public.technician_profiles profiles
    where profiles.id = technician_services.technician_profile_id
      and profiles.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.technician_profiles profiles
    where profiles.id = technician_services.technician_profile_id
      and profiles.user_id = auth.uid()
  )
);

create policy "technician_qr_codes_manage_own"
on public.technician_qr_codes
for all
using (
  exists (
    select 1
    from public.technician_profiles profiles
    where profiles.id = technician_qr_codes.technician_profile_id
      and profiles.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.technician_profiles profiles
    where profiles.id = technician_qr_codes.technician_profile_id
      and profiles.user_id = auth.uid()
  )
);

create or replace view public.public_technician_profiles as
select
  profiles.id,
  profiles.business_name,
  profiles.full_name,
  profiles.city,
  profiles.state,
  profiles.slug,
  profiles.service_radius_km,
  qr.qr_slug,
  services.service_name,
  services.base_price
from public.technician_profiles profiles
left join public.technician_qr_codes qr
  on qr.technician_profile_id = profiles.id
left join public.technician_services services
  on services.technician_profile_id = profiles.id
  and services.active = true
where profiles.onboarding_completed = true;
