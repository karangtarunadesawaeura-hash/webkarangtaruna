"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/layout/logo";
import { isSupabaseConfigured } from "@/lib/env-client";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    params.get("error") === "forbidden" ? "Akun Anda tidak memiliki akses admin." : null
  );
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) {
        setError("Email atau kata sandi salah.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Supabase belum dikonfigurasi. Isi environment variables terlebih dahulu (lihat README).");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card><CardContent className="flex flex-col gap-4 p-6">
      {!isSupabaseConfigured() && (
        <p role="alert" className="rounded-lg bg-gold-300/30 p-3 text-xs font-semibold text-forest-900">
          Supabase belum terhubung. Login membutuhkan NEXT_PUBLIC_SUPABASE_URL dan
          NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Lihat README bagian Instalasi & Pembuatan Admin Awal.
        </p>
      )}
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Input label="Email" type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@contoh.id" />
        <Input label="Kata Sandi" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
        <Button type="submit" disabled={loading}>{loading ? "Memeriksa…" : "Masuk"}</Button>
      </form>
      <p className="text-xs text-stone-500">Pendaftaran akun admin tidak terbuka untuk publik. Akun awal dibuat via provisioning aman (lihat README).</p>
    </CardContent></Card>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-14">
      <div className="flex flex-col items-center gap-3 text-center">
        <Logo orgName="Karang Taruna Desa Waeura" />
        <Badge tone="gold">Area Khusus Pengurus</Badge>
        <h1 className="text-2xl font-extrabold">Login Dashboard Admin</h1>
        <p className="mt-1 text-sm text-stone-600">Karang Taruna Desa Waeura — khusus pengurus berwenang. Tidak ada pendaftaran publik.</p>
      </div>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
