import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { isSupabaseConfigured } from "@/lib/env";

/** Supabase client untuk Server Components / Server Actions (cookies aman). */
export async function createClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  // Kanonis baru: PUBLISHABLE_KEY (aman untuk browser/server anon).
  // ANON_KEY sebagai fallback. SECRET/SERVICE_ROLE tidak dipakai di sini.
  const publicKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    "";
  return createServerClient(url, publicKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Dipanggil dari Server Component read-only — abaikan.
        }
      },
    },
  });
}

/** Mengembalikan null bila Supabase belum dikonfigurasi (mode demo/empty-state). */
export async function createClientSafe() {
  if (!isSupabaseConfigured()) return null;
  return createClient();
}
