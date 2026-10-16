# Karang Taruna Desa Waeura — Website Resmi

Website resmi **Karang Taruna Desa Waeura** — *Bersatu, Berkarya, Mengabdi untuk Desa.*
Pusat informasi kegiatan, program kerja, berita, agenda, galeri, keanggotaan, transparansi,
dan kontak — lengkap dengan **dashboard admin** (`/admin`) tanpa perlu mengedit kode.

> Status: implementasi fungsional penuh. Backend membutuhkan kredensial Supabase milik
> organisasi (lihat “Menghubungkan Supabase”). Tanpa kredensial, situs tetap bisa di-build
> dan menampilkan *empty state* yang informatif (tidak ada angka/data palsu).

## Teknologi


- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- Komponen UI konsisten gaya shadcn + ikon Lucide
- Supabase (PostgreSQL, Auth, Storage) via `@supabase/ssr`
- Validasi Zod + React Hook Form
- Deploy: Vercel • Source: GitHub • Branch produksi: `main`

## Struktur Folder

```
src/
  app/
    page.tsx  profil/  program/  berita/  berita/[slug]/
    agenda/   agenda/[slug]/  galeri/  keanggotaan/
    transparansi/  kontak/  kebijakan-privasi/
    actions/ (public.ts, admin.ts — server actions)
    admin/ (login + dashboard + CRUD per entitas)
  components/ (ui, layout, forms, admin, gallery)
  lib/ (supabase, auth, data, validations, constants, utils, env)
  types/database.ts
  middleware.ts
supabase/
  migrations/0001_schema.sql  0002_rls_storage.sql
  seed.sql (DEMO, dev saja)
scripts/provision-admin.ts
```

## Instalasi Lokal

```powershell
git clone <URL-REPO> webkarangtaruna
Set-Location webkarangtaruna
npm install
Copy-Item .env.example .env.local
# isi .env.local (lihat bawah)
npm run dev   # http://localhost:3000
```

### Environment variables

| Variabel | Wajib | Keterangan |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Ya (untuk fitur dinamis) | URL proyek Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Ya | Publishable key (aman untuk browser; `ANON_KEY` lama tetap didukung sebagai fallback) |
| `SUPABASE_SERVICE_ROLE_KEY` | Hanya server/provisioning | **Jangan** expose ke browser (proyek baru: `SUPABASE_SECRET_KEY`, server-only) |
| `NEXT_PUBLIC_SITE_URL` | Anjuran | Mis. `https://karangtaruna-waeura.vercel.app` |

Tanpa dua variabel `NEXT_PUBLIC_*`, aplikasi berjalan dalam **mode demo**: semua halaman
publik render dengan empty state, login admin menampilkan peringatan konfigurasi.

## Menghubungkan Supabase

1. Buat proyek di [supabase.com](https://supabase.com) → catat URL + publishable key + secret/service role key (server-only).
2. Jalankan migrasi (pilih salah satu):
   - **SQL Editor**: tempel isi `supabase/migrations/0001_schema.sql` lalu `0002_rls_storage.sql` lalu `0003_role_guard.sql`, Run.
   - **Supabase CLI**: `supabase link --project-ref <ref>` lalu `supabase db push`.
3. Verifikasi: tabel `profiles`, `organization_settings`, `board_members`, `programs`,
   `news`, `events`, `event_registrations`, `membership_applications`, `gallery_albums`,
   `gallery_photos`, `reports`, `announcements`, `contact_messages`, `activity_logs`
   + bucket `public-assets` (publik) & `private-docs` (privat).
4. (Dev saja, opsional) jalankan `supabase/seed.sql` — data bertanda `[DEMO]`, wajib diganti
   via dashboard. **Jangan** jalankan seed di production sebagai data asli.
5. Isi `.env.local` / environment Vercel.
6. **Auth redirect**: Supabase Dashboard → Authentication → URL Configuration:
   - Site URL = domain produksi (mis. `https://karangtaruna-waeura.vercel.app`)
   - Redirect URLs: `http://localhost:3000/**`, `https://<preview>.vercel.app/**`,
     `https://<domain-produksi>/**`.
7. **Kunci pendaftaran publik** (wajib, spec Pengguna & Peran): Authentication →
   Sign In / Providers → Email → matikan **Allow new users to sign up**.
   Akun admin hanya via provisioning (`npm run provision:admin`); trigger
   `trg_profiles_role_guard` (migrasi 0003) menolak eskalasi `role` oleh non-super_admin.

### Skema & keamanan data

- UUID PK, FK (`on delete cascade` untuk foto/pendaftaran dalam album/kegiatan;
  `set null` untuk `created_by`), `created_at/updated_at`, indeks pencarian & relasi.
- **RLS aktif di semua tabel** (prinsip least privilege):
  - Publik `SELECT` hanya: pengaturan org, pengurus aktif, program, `news` berstatus
    `published`, event, album/foto, `reports`/`announcements` yang `is_public`.
  - Publik `INSERT` hanya: `membership_applications`, `contact_messages`,
    `event_registrations` (tidak bisa membaca data orang lain).
  - Tulis/baca privat: peran `super_admin`/`admin`/`editor` sesuai matriks di
    `0002_rls_storage.sql`; peran dicek **di server (`requireRole`) dan database (RLS)**.
- Storage: `public-assets` (baca publik, tulis login, maks 5 MB, hanya
  JPG/PNG/WebP/PDF) + `private-docs` (hanya admin, akses via signed URL).
- Form publik: validasi Zod client+server, honeypot anti-spam, rate-limit dasar,
  tanpa log kredensial/token.

### Skenario uji RLS (wajib sebelum go-live)

1. **Publik (tanpa login)**: buka `/berita` (draf tidak muncul), coba akses langsung
   `/api` data privat → harus 403/empty; daftar anggota via `/keanggotaan` → tersimpan,
   tapi tidak terlihat di halaman mana pun.
2. **Editor**: login → bisa CRUD berita/kegiatan/program/galeri/laporan/pengumuman;
   **tidak** bisa buka `/admin/pengaturan`, `/admin/pengguna`, `/admin/anggota`.
3. **Admin**: + kelola pengurus, pendaftar, pesan; **tidak** bisa ubah pengaturan/peran.
4. **Super Admin**: semua menu; ubah peran di `/admin/pengguna`.
5. Coba upload `.exe` / >5 MB → ditolak. Coba hapus → selalu ada konfirmasi.

## Pembuatan Admin Awal (provisioning aman)

Pendaftaran admin **tidak** terbuka ke publik. Langkahnya:

```powershell
# 1. Buat user di Supabase Dashboard → Authentication → Add user → catat USER_ID
# 2. Isi .env.local (URL + SERVICE_ROLE_KEY)
npm run provision:admin -- <USER_ID> super_admin "Nama Resmi"
# 3. Login di /admin/login dengan email + kata sandi user tersebut
# 4. Hapus/rotasi service role key dari shell setelah selesai; jangan commit .env.local
```

Peran: `super_admin` (semua) • `admin` (konten + anggota + pesan) • `editor`
(buat/edit konten; publikasi mengikuti izin). Penegakan di `src/lib/auth.ts` (server)
+ RLS (database) — bukan sekadar sembunyi menu.

## Perintah

```powershell
npm run dev        # development
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npm run build      # build produksi (harus hijau)
npm start          # jalankan hasil build
```


## Deploy ke Vercel

1. Push repo ke GitHub (`main` = produksi).
2. Vercel → New Project → import repo → framework Next.js (default).
3. Environment Variables (Production + Preview): `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL` (= domain produksi).
   Secret/service role key **tidak** dipasang di Vercel.
4. Deploy → uji `/`, `/berita`, `/admin/login`.
5. Tambahkan domain kustom: Vercel → Settings → Domains → Add → ikuti verifikasi DNS;
   lalu update Site URL + Redirect URLs Supabase ke domain tersebut.
6. Environment terpisah: gunakan Preview untuk PR, Production untuk `main`.

## SEO & Performa


Metadata dinamis (termasuk detail berita), sitemap (`/sitemap.xml`), robots
(memblokir `/admin`), manifest, OG/Twitter, favicon `logo.svg`, halaman 404 informatif,
error boundary tanpa bocor detail sensitif, `next/image` + remote pattern Supabase,
pagination, skeleton/empty state, aksesibilitas (skip-link, fokus keyboard, label/ARIA).


## Data & Placeholder

Seluruh nama pengurus, sejarah, alamat, kontak, dan foto **bersumber dari database**
dan dikelola via dashboard. Sebelum diisi, tampil placeholder/empty state yang jujur —
tidak ada fakta yang dikarang sebagai data resmi. Logo & hero dapat diganti di
**Admin → Pengaturan** tanpa mengedit kode. Gambar default: CSS/SVG lokal
(tidak ada hotlink ilegal).

## Batasan yang masih perlu pemilik akun

- [ ] Buat proyek Supabase + jalankan migrasi + isi env (lihat atas).
- [ ] Provisioning akun super admin pertama.
- [ ] Ganti placeholder (logo, sejarah, visi-misi, kontak, medsos) via dashboard.
- [ ] Hubungkan GitHub → Vercel + domain khusus bila tersedia.
- [ ] Uji RLS per peran sebelum publikasi.

## Lisensi

Hak cipta Karang Taruna Desa Waeura. Penggunaan internal organisasi.
