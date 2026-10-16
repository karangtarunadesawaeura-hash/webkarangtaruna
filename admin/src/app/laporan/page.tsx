import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/admin-shell";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteReportAction } from "@/app/actions/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/state";
export const metadata = { title: "Kelola Laporan" };
export default async function AdminLaporanPage() {
  const user = await requireRole(["super_admin", "admin", "editor"]);
  const supabase = await createClient();
  const { data } = await supabase.from("reports").select("id,title,period,is_public").order("created_at", { ascending: false }).limit(50);
  const items = (data as { id: string; title: string; period: string | null; is_public: boolean }[] | null) ?? [];
  return (
    <AdminShell role={user.role!} email={user.email}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h1 className="text-2xl font-extrabold">Laporan</h1><p className="text-sm text-stone-600">Hanya yang publik tampil di halaman Transparansi.</p></div>
          <Link href="/laporan/baru"><Button>＋ Laporan Baru</Button></Link>
        </div>
        {items.length === 0 ? <EmptyState title="Belum ada laporan" description="Buat laporan kegiatan pertama." /> : (
          <Card><CardContent className="flex flex-col gap-2 p-3">
            {items.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-forest-50 p-3">
                <div><p className="font-bold">{r.title}</p><p className="flex gap-2 text-xs text-stone-500">{r.period && <span>{r.period}</span>}<Badge tone={r.is_public ? "green" : "gray"}>{r.is_public ? "Publik" : "Privat"}</Badge></p></div>
                <div className="flex items-center gap-2"><Link href={`/laporan/${r.id}`} className="rounded-lg bg-forest-50 px-2.5 py-1.5 text-xs font-bold text-forest-900 hover:bg-forest-100">Edit</Link><DeleteButton id={r.id} onDelete={deleteReportAction} /></div>
              </div>
            ))}
          </CardContent></Card>
        )}
      </div>
    </AdminShell>
  );
}
