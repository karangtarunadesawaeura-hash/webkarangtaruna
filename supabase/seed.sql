-- Seed DEMO — hanya untuk development lokal. JANGAN jalankan di production
-- dengan menganggap data ini asli. Semua nilai bertanda [DEMO]/placeholder
-- dan wajib diganti pengurus melalui dashboard admin.
--
-- Cara pakai (dev saja):
--   supabase db reset   (dengan seed)  ATAU salin isi file ini ke SQL Editor proyek DEV.

-- Baris pengaturan awal (placeholder, bukan data resmi)
insert into public.organization_settings (org_name, tagline, description, leadership_period)
values (
  'Karang Taruna Desa Waeura',
  'Bersatu, Berkarya, Mengabdi untuk Desa.',
  '[DEMO] Website resmi Karang Taruna Desa Waeura — pusat informasi kegiatan, program kerja, berita, dan keanggotaan. Ganti deskripsi ini melalui dashboard admin.',
  '[DEMO] Periode 20xx–20xx — ganti via dashboard'
)
on conflict do nothing;
