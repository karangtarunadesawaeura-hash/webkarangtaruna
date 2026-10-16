import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/admin-shell";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteBoardMemberAction } from "@/app/actions/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/state";
export const metadata = { title: "Kelola Pengurus" };
export default async function AdminPengurusPage() {
  const user = await requireRole(["super_admin", "admin"]);
  const supabase = await createClient();
  const { data } = await supabase.from("board_members").select("id,name,position,division,is_active,sort_order").order("sort_order").limit(100);
  const items = (data as { id: string; name: string; position: string; division: string | null; is_active: boolean; sort_order: number }[] | null) ?? [];
  return (
    <AdminShell role={user.role!} email={user.email}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h1 className="text-2xl font-extrabold">Pengurus</h1><p className="text-sm text-stone-600">Isi nama resmi — jangan mengarang. Hanya yang aktif tampil di publik.</p></div>
          <Link href="/admin/pengurus/baru"><Button>＋ Pengurus Baru</Button></Link>
        </div>
        {items.length === 0 ? <EmptyState title="Belum ada data pengurus" description="Tambahkan pengurus resmi via tombol di atas." /> : (
          <Card><CardContent className="flex flex-col gap-2 p-3">
            {items.map((m) => (
              <div key={m.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-forest-50 p-3">
                <div><p className="font-bold">{m.name}</p><p className="flex flex-wrap gap-2 text-xs text-stone-500"><Badge>{m.position}</Badge>{m.division && <span>{m.division}</span>}<Badge tone={m.is_active ? "green" : "gray"}>{m.is_active ? "Aktif" : "Nonaktif"}</Badge></p></div>
                <div className="flex items-center gap-2"><Link href={`/admin/pengurus/${m.id}`} className="rounded-lg bg-forest-50 px-2.5 py-1.5 text-xs font-bold text-forest-900 hover:bg-forest-100">Edit</Link><DeleteButton id={m.id} onDelete={deleteBoardMemberAction} /></div>
              </div>
            ))}
          </CardContent></Card>
        )}
      </div>
    </AdminShell>
  );
}
