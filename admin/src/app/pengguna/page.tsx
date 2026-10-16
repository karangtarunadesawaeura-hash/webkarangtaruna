import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/admin-shell";
import { RoleSelect } from "@/components/admin/role-select";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/state";
export const metadata = { title: "Pengguna & Peran" };
export default async function AdminPenggunaPage() {
  const user = await requireRole(["super_admin"]);
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("id,full_name,role,created_at").order("created_at", { ascending: false }).limit(100);
  const items = (data as { id: string; full_name: string | null; role: string; created_at: string }[] | null) ?? [];
  return (
    <AdminShell role={user.role!} email={user.email}>
      <div className="flex flex-col gap-4">
        <div><h1 className="text-2xl font-extrabold">Pengguna & Peran</h1><p className="text-sm text-stone-600">Hanya Super Admin. Akun baru dibuat via provisioning (bukan pendaftaran publik). Peran diverifikasi di server & database.</p></div>
        {items.length === 0 ? <EmptyState title="Belum ada pengguna" description="Buat akun admin awal via skrip provisioning (lihat README)." /> : (
          <Card><CardContent className="flex flex-col gap-2 p-3">
            {items.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-forest-50 p-3">
                <div><p className="font-bold">{p.full_name ?? "(tanpa nama)"}</p><p className="font-mono text-xs text-stone-500">{p.id.slice(0, 8)}…</p></div>
                <RoleSelect userId={p.id} current={p.role} />
              </div>
            ))}
          </CardContent></Card>
        )}
      </div>
    </AdminShell>
  );
}
