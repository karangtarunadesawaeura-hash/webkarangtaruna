import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/admin-shell";
import { AddAdminForm } from "@/components/admin/add-admin-form";
import { RoleSelect } from "@/components/admin/role-select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/state";
import { formatTanggal } from "@/lib/utils";

export const metadata = { title: "Anggota Admin" };

const ROLE_TONE = { super_admin: "gold", admin: "green", editor: "gray" } as const;
const ROLE_DESC = {
  super_admin: "Akses penuh: pengaturan, peran, dan seluruh konten.",
  admin: "Kelola konten, pengurus, pendaftar, dan pesan.",
  editor: "Buat & edit konten (berita, kegiatan, galeri, laporan).",
} as const;

type AdminProfile = {
  id: string;
  full_name: string | null;
  role: keyof typeof ROLE_TONE;
  created_at: string;
};

export default async function AdminAnggotaAdminPage() {
  const user = await requireRole(["super_admin"]);
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id,full_name,role,created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  const items = ((data as AdminProfile[] | null) ?? []).filter((p) =>
    (["super_admin", "admin", "editor"] as string[]).includes(p.role)
  );
  const count = (role: keyof typeof ROLE_TONE) => items.filter((p) => p.role === role).length;

  return (
    <AdminShell role={user.role!} email={user.email}>
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">Anggota Admin</h1>
          <p className="text-sm text-stone-600">
            Daftar akun pengelola situs. Hanya Super Admin yang dapat melihat dan mengubah peran di sini.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {(Object.keys(ROLE_TONE) as (keyof typeof ROLE_TONE)[]).map((role) => (
            <Card key={role}>
              <CardContent className="flex items-center justify-between gap-2 p-4">
                <div>
                  <Badge tone={ROLE_TONE[role]}>{role.replace("_", " ")}</Badge>
                  <p className="mt-1.5 text-xs text-stone-500">{ROLE_DESC[role]}</p>
                </div>
                <span className="text-3xl font-extrabold text-forest-950">{count(role)}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        <AddAdminForm />

        {items.length === 0 ? (
          <EmptyState
            title="Belum ada anggota admin"
            description="Buat akun admin awal via skrip provisioning (lihat panduan di atas)."
          />
        ) : (
          <Card>
            <CardContent className="flex flex-col gap-2 p-3">
              {items.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-forest-50 p-3"
                >
                  <div className="flex min-w-0 flex-col gap-1">
                    <p className="truncate font-bold">{p.full_name ?? "(tanpa nama)"}</p>
                    <p className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                      <Badge tone={ROLE_TONE[p.role]}>{p.role.replace("_", " ")}</Badge>
                      <span className="font-mono">{p.id.slice(0, 8)}…</span>
                      <span>• sejak {formatTanggal(p.created_at)}</span>
                      {p.id === user.id && <span className="font-bold text-forest-700">(Anda)</span>}
                    </p>
                  </div>
                  <RoleSelect userId={p.id} current={p.role} />
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </AdminShell>
  );
}
