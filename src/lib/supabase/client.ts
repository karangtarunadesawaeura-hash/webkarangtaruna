import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Kanonis baru: PUBLISHABLE_KEY. ANON_KEY sebagai fallback deployment lama.
  // JANGAN pernah pakai SUPABASE_SECRET_KEY / SERVICE_ROLE di browser.
  const publicKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !publicKey) {
    throw new Error(
      "Supabase belum dikonfigurasi. Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
    );
  }
  return createBrowserClient(url, publicKey);
}
