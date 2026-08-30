create table if not exists notification_events (
  id text primary key,
  type text not null,
  audience text not null,
  technician_slug text not null default '',
  title text not null,
  message text not null,
  related_id text not null default '',
  status text not null default 'unread',
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  check (audience in ('technician', 'customer', 'system')),
  check (status in ('unread', 'read', 'archived'))
);

create index if not exists idx_notification_events_audience_slug
  on notification_events(audience, technician_slug, created_at);
