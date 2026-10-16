import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/admin-shell";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteAnnouncementAction } from "@/app/actions/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/state";
export const metadata = { title: "Kelola Pengumuman" };
export default async function AdminPengumumanPage() {
  const user = await requireRole(["super_admin", "admin", "editor"]);
  const supabase = await createClient();
  const { data } = await supabase.from("announcements").select("id,title,is_pinned,is_public").order("created_at", { ascending: false }).limit(50);
  const items = (data as { id: string; title: string; is_pinned: boolean; is_public: boolean }[] | null) ?? [];
  return (
    <AdminShell role={user.role!} email={user.email}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h1 className="text-2xl font-extrabold">Pengumuman</h1><p className="text-sm text-stone-600">Pengumuman publik tampil di beranda.</p></div>
          <Link href="/admin/pengumuman/baru"><Button>＋ Pengumuman Baru</Button></Link>
        </div>
        {items.length === 0 ? <EmptyState title="Belum ada pengumuman" description="Buat pengumuman pertama." /> : (
          <Card><CardContent className="flex flex-col gap-2 p-3">
            {items.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-forest-50 p-3">
                <div><p className="font-bold">{a.title}</p><p className="flex gap-2 text-xs text-stone-500">{a.is_pinned && <Badge tone="gold">Disematkan</Badge>}<Badge tone={a.is_public ? "green" : "gray"}>{a.is_public ? "Publik" : "Privat"}</Badge></p></div>
                <div className="flex items-center gap-2"><Link href={`/admin/pengumuman/${a.id}`} className="rounded-lg bg-forest-50 px-2.5 py-1.5 text-xs font-bold text-forest-900 hover:bg-forest-100">Edit</Link><DeleteButton id={a.id} onDelete={deleteAnnouncementAction} /></div>
              </div>
            ))}
          </CardContent></Card>
        )}
      </div>
    </AdminShell>
  );
}
