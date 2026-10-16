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
 *
 * Catatan teknis: seluruh logika async dibungkus main() agar skrip dapat
 * ditransform ke CommonJS (top-level await tidak didukung format CJS).
 * Berkas .env.local dimuat otomatis bila ada (Node 20.12+, tanpa dependency
 * tambahan); variabel yang sudah ada di shell tidak ditimpa.
 */
import { createClient } from "@supabase/supabase-js";

// Muat .env.local tanpa dependency tambahan. Dibungkus try/catch agar skrip
// tetap jalan bila file tidak ada atau Node terlalu lama (pakai env shell).
try {
  const proc = process as unknown as { loadEnvFile?: (path: string) => void };
  if (typeof proc.loadEnvFile === "function") proc.loadEnvFile(".env.local");
} catch {
  // Abaikan — gunakan environment variables dari shell.
}

async function main(): Promise<void> {
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
}

main().catch((err: unknown) => {
  // Hanya cetak pesan error — tidak pernah mencetak credential.
  console.error("Provisioning gagal:", err instanceof Error ? err.message : err);
  process.exit(1);
});
