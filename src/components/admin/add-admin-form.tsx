"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upsertAdminProfileAction } from "@/app/actions/admin";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function AddAdminForm() {
  const router = useRouter();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMsg(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const r = await upsertAdminProfileAction(formData);
      setMsg({ ok: r.ok, text: r.message });
      if (r.ok) {
        e.currentTarget.reset();
        router.refresh();
      }
    });
  };

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-5">
        <div>
          <h2 className="font-bold text-forest-950">Tambah anggota admin</h2>
          <p className="text-sm text-stone-600">
            UID didapat dari Supabase Dashboard → Authentication → Add user → salin UID.
            Akun tersebut lalu bisa login di <span className="font-mono text-xs">/admin/login</span>.
          </p>
        </div>
        <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              label="UID pengguna *"
              name="user_id"
              required
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              hint="ID dari Authentication → Users (klik user → Copy UID)."
              className="font-mono"
            />
          </div>
          <Input label="Nama resmi *" name="full_name" required minLength={3} maxLength={100} placeholder="Nama pengurus" />
          <Select label="Peran *" name="role" defaultValue="editor">
            <option value="editor">Editor — buat & edit konten</option>
            <option value="admin">Admin — konten + anggota + pesan</option>
            <option value="super_admin">Super Admin — semua akses</option>
          </Select>
          <div className="flex flex-col gap-2 sm:col-span-2">
            {msg && (
              <p role="status" className={`rounded-lg p-3 text-sm font-semibold ${msg.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"}`}>
                {msg.text}
              </p>
            )}
            <Button type="submit" disabled={pending}>
              {pending ? "Menyimpan…" : "Tambah anggota admin"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
