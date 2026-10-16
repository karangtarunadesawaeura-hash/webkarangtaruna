import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/admin-shell";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteEventAction } from "@/app/actions/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/state";
import { formatTanggal } from "@/lib/utils";

export const metadata = { title: "Kelola Kegiatan" };

export default async function AdminKegiatanPage() {
  const user = await requireRole(["super_admin", "admin", "editor"]);
  const supabase = await createClient();
  const { data } = await supabase.from("events").select("id,title,status,starts_at,location,registration_open").order("starts_at", { ascending: false }).limit(50);
  const items = (data as { id: string; title: string; status: string; starts_at: string; location: string | null; registration_open: boolean }[] | null) ?? [];
  return (
    <AdminShell role={user.role!} email={user.email}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h1 className="text-2xl font-extrabold">Kegiatan</h1><p className="text-sm text-stone-600">Kelola agenda mendatang & arsip.</p></div>
          <Link href="/admin/kegiatan/baru"><Button>＋ Kegiatan Baru</Button></Link>
        </div>
        {items.length === 0 ? <EmptyState title="Belum ada kegiatan" description="Buat agenda pertama melalui tombol di atas." /> : (
          <Card><CardContent className="flex flex-col gap-2 p-3">
            {items.map((e) => (
              <div key={e.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-forest-50 p-3">
                <div><p className="font-bold">{e.title}</p><p className="flex flex-wrap gap-2 text-xs text-stone-500"><Badge tone="gold">{e.status}</Badge>{formatTanggal(e.starts_at)}{e.location ? ` • ${e.location}` : ""}{e.registration_open ? " • Pendaftaran dibuka" : ""}</p></div>
                <div className="flex items-center gap-2"><Link href={`/admin/kegiatan/${e.id}`} className="rounded-lg bg-forest-50 px-2.5 py-1.5 text-xs font-bold text-forest-900 hover:bg-forest-100">Edit</Link><DeleteButton id={e.id} onDelete={deleteEventAction} /></div>
              </div>
            ))}
          </CardContent></Card>
        )}
      </div>
    </AdminShell>
  );
}
