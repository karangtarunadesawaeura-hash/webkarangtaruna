import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/admin-shell";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteAlbumAction } from "@/app/actions/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/state";
export const metadata = { title: "Kelola Galeri" };
export default async function AdminGaleriPage() {
  const user = await requireRole(["super_admin", "admin", "editor"]);
  const supabase = await createClient();
  const { data } = await supabase.from("gallery_albums").select("id,title,event_date").order("created_at", { ascending: false }).limit(50);
  const items = (data as { id: string; title: string; event_date: string | null }[] | null) ?? [];
  return (
    <AdminShell role={user.role!} email={user.email}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h1 className="text-2xl font-extrabold">Galeri</h1><p className="text-sm text-stone-600">Kelola album & foto. Buka album untuk menambah foto.</p></div>
          <Link href="/admin/galeri/baru"><Button>＋ Album Baru</Button></Link>
        </div>
        {items.length === 0 ? <EmptyState title="Belum ada album" description="Buat album pertama, lalu tambahkan foto." /> : (
          <Card><CardContent className="flex flex-col gap-2 p-3">
            {items.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-forest-50 p-3">
                <div><p className="font-bold">{a.title}</p><p className="text-xs text-stone-500">{a.event_date ?? "Tanpa tanggal"}</p></div>
                <div className="flex items-center gap-2"><Link href={`/admin/galeri/${a.id}`} className="rounded-lg bg-forest-50 px-2.5 py-1.5 text-xs font-bold text-forest-900 hover:bg-forest-100">Kelola Foto</Link><DeleteButton id={a.id} onDelete={deleteAlbumAction} /></div>
              </div>
            ))}
          </CardContent></Card>
        )}
      </div>
    </AdminShell>
  );
}
