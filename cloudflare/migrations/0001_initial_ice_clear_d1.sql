create table if not exists technician_profiles (
  id text primary key,
  full_name text not null,
  business_name text,
  whatsapp text not null,
  city text not null,
  state text not null,
  slug text not null unique,
  service_radius_km integer not null default 15,
  onboarding_completed integer not null default 1,
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  check (slug glob '[a-z0-9]*')
);

create table if not exists technician_services (
  id text primary key,
  technician_profile_id text not null references technician_profiles(id) on delete cascade,
  service_name text not null,
  base_price real,
  active integer not null default 1,
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

create table if not exists technician_qr_codes (
  id text primary key,
  technician_profile_id text not null unique references technician_profiles(id) on delete cascade,
  qr_slug text not null unique,
  status text not null default 'active',
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  check (status in ('active', 'inactive'))
);

create table if not exists service_requests (
  id text primary key,
  technician_profile_id text not null references technician_profiles(id) on delete cascade,
  technician_slug text not null,
  customer_name text not null,
  customer_phone text not null,
  service_name text not null,
  preferred_date text not null,
  preferred_window text not null,
  address_line text not null,
  neighborhood text,
  city text not null,
  state text not null,
  notes text,
  status text not null default 'pending',
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  check (status in ('pending', 'confirmed', 'cancelled')),
  check (preferred_window in ('manha', 'tarde', 'noite'))
);

create table if not exists consultation_threads (
  id text primary key,
  technician_profile_id text not null references technician_profiles(id) on delete cascade,
  technician_slug text not null,
  customer_access_token text not null,
  customer_name text not null,
  customer_phone text not null,
  issue_summary text not null,
  preferred_reply_channel text not null,
  attachments text not null default '[]',
  status text not null default 'open',
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  check (status in ('open', 'answered', 'closed')),
  check (preferred_reply_channel in ('whatsapp', 'platform'))
);

create table if not exists consultation_messages (
  id text primary key,
  thread_id text not null references consultation_threads(id) on delete cascade,
  sender text not null,
  kind text not null default 'text',
  body text not null,
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  check (sender in ('technician')),
  check (kind in ('text'))
);

create index if not exists idx_technician_services_profile
  on technician_services(technician_profile_id);

create index if not exists idx_service_requests_slug
  on service_requests(technician_slug, created_at);

create index if not exists idx_consultation_threads_slug
  on consultation_threads(technician_slug, created_at);

create index if not exists idx_consultation_messages_thread
  on consultation_messages(thread_id, created_at);
