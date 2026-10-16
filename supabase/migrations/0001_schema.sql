-- Migrasi 0001: skema inti Karang Taruna Desa Waeura
-- Jalankan via: supabase db push  /  supabase migration up  /  SQL Editor
-- Primary key UUID, FK aman (restrict/cascade sesuai kebutuhan), timestamp, indeks.

create extension if not exists "pgcrypto";

-- ============ profiles (terhubung ke auth.users) ============
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'editor' check (role in ('super_admin','admin','editor')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_profiles_role on public.profiles(role);

-- Otomatis buat profil saat user auth baru (role default editor paling terbatas;
-- naikkan menjadi admin/super_admin HANYA via SQL service role / dashboard super admin)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', null), 'editor')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper: peran user saat ini (dipakai RLS)
create or replace function public.user_role()
returns text language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ============ organization_settings (satu baris aktif) ============
create table if not exists public.organization_settings (
  id uuid primary key default gen_random_uuid(),
  org_name text not null default 'Karang Taruna Desa Waeura',
  tagline text default 'Bersatu, Berkarya, Mengabdi untuk Desa.',
  description text,
  history text,
  vision text,
  mission text,
  objectives text,
  logo_url text,
  hero_image_url text,
  address text,
  phone text,
  email text,
  whatsapp text,
  facebook text,
  instagram text,
  youtube text,
  tiktok text,
  leadership_period text,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null
);

-- ============ board_members ============
create table if not exists public.board_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  position text not null,
  division text,
  duties text,
  photo_url text,
  period text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_board_members_active_order on public.board_members(is_active, sort_order);

-- ============ programs ============
create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text not null default 'Lainnya',
  description text,
  target text,
  status text not null default 'rencana' check (status in ('rencana','berjalan','selesai','ditunda')),
  schedule text,
  start_date date,
  end_date date,
  image_url text,
  result text,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null
);
create index if not exists idx_programs_status on public.programs(status);
create index if not exists idx_programs_category on public.programs(category);
create index if not exists idx_programs_featured on public.programs(is_featured);
create index if not exists idx_programs_slug on public.programs(slug);

-- ============ news ============
create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text not null default 'Kegiatan',
  summary text,
  content text,
  cover_image_url text,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null
);
create index if not exists idx_news_status_published on public.news(status, published_at desc);
create index if not exists idx_news_slug on public.news(slug);
create index if not exists idx_news_category on public.news(category);

-- ============ events ============
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text not null default 'Kegiatan',
  description text,
  location text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  status text not null default 'mendatang' check (status in ('mendatang','berlangsung','selesai','dibatalkan')),
  image_url text,
  registration_open boolean not null default false,
  registration_quota integer check (registration_quota is null or registration_quota > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null
);
create index if not exists idx_events_starts on public.events(starts_at);
create index if not exists idx_events_status on public.events(status);
create index if not exists idx_events_slug on public.events(slug);

-- ============ event_registrations (privat) ============
create table if not exists public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  notes text,
  status text not null default 'terdaftar',
  created_at timestamptz not null default now()
);
create index if not exists idx_event_registrations_event on public.event_registrations(event_id);

-- ============ membership_applications (privat) ============
create table if not exists public.membership_applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  address text,
  phone text,
  email text,
  birth_date date,
  interests text,
  desired_field text,
  consent_data_usage boolean not null default false,
  status text not null default 'menunggu' check (status in ('menunggu','diterima','ditolak')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_membership_status on public.membership_applications(status);
create index if not exists idx_membership_created on public.membership_applications(created_at desc);

-- ============ gallery_albums & gallery_photos ============
create table if not exists public.gallery_albums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  cover_image_url text,
  event_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.gallery_photos (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.gallery_albums(id) on delete cascade,
  image_url text not null,
  caption text,
  taken_at date,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_gallery_photos_album on public.gallery_photos(album_id, sort_order);

-- ============ reports ============
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  period text,
  summary text,
  document_url text,
  is_public boolean not null default true,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null
);
create index if not exists idx_reports_public on public.reports(is_public, published_at desc);

-- ============ announcements ============
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text,
  is_pinned boolean not null default false,
  is_public boolean not null default true,
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null
);
create index if not exists idx_announcements_public on public.announcements(is_public, is_pinned desc, published_at desc);

-- ============ contact_messages (privat) ============
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  subject text,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_contact_messages_created on public.contact_messages(created_at desc);

-- ============ activity_logs (privat, audit admin) ============
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity text,
  entity_id text,
  metadata jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_activity_logs_actor on public.activity_logs(actor_id);
create index if not exists idx_activity_logs_created on public.activity_logs(created_at desc);

-- Trigger updated_at otomatis
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated before update on public.profiles for each row execute function public.touch_updated_at();
drop trigger if exists trg_board_members_updated on public.board_members;
create trigger trg_board_members_updated before update on public.board_members for each row execute function public.touch_updated_at();
drop trigger if exists trg_programs_updated on public.programs;
create trigger trg_programs_updated before update on public.programs for each row execute function public.touch_updated_at();
drop trigger if exists trg_news_updated on public.news;
create trigger trg_news_updated before update on public.news for each row execute function public.touch_updated_at();
drop trigger if exists trg_events_updated on public.events;
create trigger trg_events_updated before update on public.events for each row execute function public.touch_updated_at();
drop trigger if exists trg_membership_updated on public.membership_applications;
create trigger trg_membership_updated before update on public.membership_applications for each row execute function public.touch_updated_at();
drop trigger if exists trg_reports_updated on public.reports;
create trigger trg_reports_updated before update on public.reports for each row execute function public.touch_updated_at();
