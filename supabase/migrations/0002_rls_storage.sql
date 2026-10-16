-- Migrasi 0002: Row Level Security (least privilege) + Storage buckets
-- Prinsip: publik hanya membaca konten yang diterbitkan; data privat hanya admin.

-- Aktifkan RLS di semua tabel
alter table public.profiles enable row level security;
alter table public.organization_settings enable row level security;
alter table public.board_members enable row level security;
alter table public.programs enable row level security;
alter table public.news enable row level security;
alter table public.events enable row level security;
alter table public.event_registrations enable row level security;
alter table public.membership_applications enable row level security;
alter table public.gallery_albums enable row level security;
alter table public.gallery_photos enable row level security;
alter table public.reports enable row level security;
alter table public.announcements enable row level security;
alter table public.contact_messages enable row level security;
alter table public.activity_logs enable row level security;

-- ===== profiles =====
-- User membaca profilnya sendiri; admin membaca semua.
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id or public.user_role() in ('super_admin','admin','editor'));
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);
-- Peran hanya boleh diubah super_admin (ditegakkan juga di server).
drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles
  for all using (public.user_role() = 'super_admin')
  with check (public.user_role() = 'super_admin');

-- ===== organization_settings: publik baca, hanya super_admin tulis =====
drop policy if exists org_public_read on public.organization_settings;
create policy org_public_read on public.organization_settings
  for select using (true);
drop policy if exists org_admin_write on public.organization_settings;
create policy org_admin_write on public.organization_settings
  for all using (public.user_role() = 'super_admin')
  with check (public.user_role() = 'super_admin');

-- ===== board_members: publik baca yang aktif; tulis admin =====
drop policy if exists board_public_read on public.board_members;
create policy board_public_read on public.board_members
  for select using (is_active = true or public.user_role() in ('super_admin','admin','editor'));
drop policy if exists board_admin_write on public.board_members;
create policy board_admin_write on public.board_members
  for all using (public.user_role() in ('super_admin','admin'))
  with check (public.user_role() in ('super_admin','admin'));

-- ===== programs: publik baca semua (tidak ada konsep draft); tulis sesuai peran =====
drop policy if exists programs_public_read on public.programs;
create policy programs_public_read on public.programs for select using (true);
drop policy if exists programs_editor_write on public.programs;
create policy programs_editor_write on public.programs
  for all using (public.user_role() in ('super_admin','admin','editor'))
  with check (public.user_role() in ('super_admin','admin','editor'));

-- ===== news: publik hanya yang published; draf hanya editor+ =====
drop policy if exists news_public_read on public.news;
create policy news_public_read on public.news
  for select using (status = 'published' or public.user_role() in ('super_admin','admin','editor'));
drop policy if exists news_editor_write on public.news;
create policy news_editor_write on public.news
  for all using (public.user_role() in ('super_admin','admin','editor'))
  with check (public.user_role() in ('super_admin','admin','editor'));

-- ===== events: publik baca; tulis editor+ =====
drop policy if exists events_public_read on public.events;
create policy events_public_read on public.events for select using (true);
drop policy if exists events_editor_write on public.events;
create policy events_editor_write on public.events
  for all using (public.user_role() in ('super_admin','admin','editor'))
  with check (public.user_role() in ('super_admin','admin','editor'));

-- ===== gallery: publik baca; tulis editor+ =====
drop policy if exists albums_public_read on public.gallery_albums;
create policy albums_public_read on public.gallery_albums for select using (true);
drop policy if exists albums_editor_write on public.gallery_albums;
create policy albums_editor_write on public.gallery_albums
  for all using (public.user_role() in ('super_admin','admin','editor'))
  with check (public.user_role() in ('super_admin','admin','editor'));
drop policy if exists photos_public_read on public.gallery_photos;
create policy photos_public_read on public.gallery_photos for select using (true);
drop policy if exists photos_editor_write on public.gallery_photos;
create policy photos_editor_write on public.gallery_photos
  for all using (public.user_role() in ('super_admin','admin','editor'))
  with check (public.user_role() in ('super_admin','admin','editor'));

-- ===== reports: publik hanya is_public; tulis editor+ =====
drop policy if exists reports_public_read on public.reports;
create policy reports_public_read on public.reports
  for select using (is_public = true or public.user_role() in ('super_admin','admin','editor'));
drop policy if exists reports_editor_write on public.reports;
create policy reports_editor_write on public.reports
  for all using (public.user_role() in ('super_admin','admin','editor'))
  with check (public.user_role() in ('super_admin','admin','editor'));

-- ===== announcements: publik hanya is_public; tulis editor+ =====
drop policy if exists announcements_public_read on public.announcements;
create policy announcements_public_read on public.announcements
  for select using (is_public = true or public.user_role() in ('super_admin','admin','editor'));
drop policy if exists announcements_editor_write on public.announcements;
create policy announcements_editor_write on public.announcements
  for all using (public.user_role() in ('super_admin','admin','editor'))
  with check (public.user_role() in ('super_admin','admin','editor'));

-- ===== Data privat: publik hanya INSERT, baca/tulis hanya admin =====
-- membership_applications
drop policy if exists membership_public_insert on public.membership_applications;
create policy membership_public_insert on public.membership_applications
  for insert with check (true);
drop policy if exists membership_admin_all on public.membership_applications;
create policy membership_admin_all on public.membership_applications
  for all using (public.user_role() in ('super_admin','admin'))
  with check (public.user_role() in ('super_admin','admin'));

-- contact_messages
drop policy if exists contact_public_insert on public.contact_messages;
create policy contact_public_insert on public.contact_messages
  for insert with check (true);
drop policy if exists contact_admin_all on public.contact_messages;
create policy contact_admin_all on public.contact_messages
  for all using (public.user_role() in ('super_admin','admin'))
  with check (public.user_role() in ('super_admin','admin'));

-- event_registrations
drop policy if exists eventreg_public_insert on public.event_registrations;
create policy eventreg_public_insert on public.event_registrations
  for insert with check (true);
drop policy if exists eventreg_admin_all on public.event_registrations;
create policy eventreg_admin_all on public.event_registrations
  for all using (public.user_role() in ('super_admin','admin','editor'))
  with check (public.user_role() in ('super_admin','admin','editor'));

-- activity_logs: hanya admin
drop policy if exists logs_admin_all on public.activity_logs;
create policy logs_admin_all on public.activity_logs
  for all using (public.user_role() in ('super_admin','admin'))
  with check (public.user_role() in ('super_admin','admin'));

-- ===== Storage =====
-- Bucket publik untuk foto/galeri/berita (baca bebas, tulis hanya login).
-- Bucket privat untuk dokumen laporan (akses via signed URL, hanya admin).
insert into storage.buckets (id, name, public)
values ('public-assets', 'public-assets', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('private-docs', 'private-docs', false)
on conflict (id) do nothing;

-- Kebijakan storage.objects
drop policy if exists storage_public_read on storage.objects;
create policy storage_public_read on storage.objects
  for select using (bucket_id = 'public-assets');

drop policy if exists storage_auth_upload_public on storage.objects;
create policy storage_auth_upload_public on storage.objects
  for insert with check (
    bucket_id = 'public-assets' and auth.role() = 'authenticated'
  );

drop policy if exists storage_auth_update_public on storage.objects;
create policy storage_auth_update_public on storage.objects
  for update using (
    bucket_id = 'public-assets' and auth.role() = 'authenticated'
  );

drop policy if exists storage_auth_delete_public on storage.objects;
create policy storage_auth_delete_public on storage.objects
  for delete using (
    bucket_id = 'public-assets' and auth.role() = 'authenticated'
  );

drop policy if exists storage_private_admin on storage.objects;
create policy storage_private_admin on storage.objects
  for all using (
    bucket_id = 'private-docs'
    and auth.role() = 'authenticated'
    and public.user_role() in ('super_admin','admin','editor')
  )
  with check (
    bucket_id = 'private-docs'
    and auth.role() = 'authenticated'
  );
