/**
 * Provisioning Admin Awal — dijalankan manual oleh pemilik proyek (BUKAN dari browser).
 *
 * Prasyarat:
 *  1. Migrasi 0001 & 0002 sudah dijalankan di proyek Supabase.
 *  2. Buat user terlebih dahulu via Dashboard Supabase → Authentication → Add user
 *     (atau `supabase auth admin create-user`), catat USER_ID (UUID) dan EMAIL.
 *  3. Isi .env.local dengan NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 *     (proyek Supabase baru: SUPABASE_SECRET_KEY — sama-sama server-only).
 *
 * Cara pakai:
 *   npm run provision:admin -- <USER_ID> <ROLE> ["Nama Lengkap"]
 *   Contoh:
 *   npm run provision:admin -- 11111111-2222-3333-4444-555555555555 super_admin "Ketua Karang Taruna"
 *
 * Peran valid: super_admin | admin | editor
 * Catatan: service role key memiliki hak penuh — JANGAN commit, JANGAN expose ke client.
 */
import { createClient } from "@supabase/supabase-js";

const [userId, role = "super_admin", fullName = "Administrator"] = process.argv.slice(2);

if (!userId) {
  console.error("Penggunaan: npm run provision:admin -- <USER_ID> [ROLE] [NAMA]");
  process.exit(1);
}
if (!["super_admin", "admin", "editor"].includes(role)) {
  console.error("Peran tidak valid. Gunakan: super_admin | admin | editor");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Server-only. Dukung penamaan lama (SERVICE_ROLE) dan baru (SECRET).
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
if (!url || !serviceKey) {
  console.error("Isi NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY (atau SUPABASE_SECRET_KEY) di .env.local terlebih dahulu.");
  process.exit(1);
}

const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

const { error } = await admin
  .from("profiles")
  .upsert({ id: userId, role, full_name: fullName }, { onConflict: "id" });

if (error) {
  console.error("Gagal membuat/memperbarui profil admin:", error.message);
  process.exit(1);
}
console.log(`OK: ${userId} → ${role} (${fullName})`);
