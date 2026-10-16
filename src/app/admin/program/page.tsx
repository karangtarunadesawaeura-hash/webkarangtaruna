import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/admin-shell";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteProgramAction } from "@/app/actions/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/state";
export const metadata = { title: "Kelola Program Kerja" };
export default async function AdminProgramPage() {
  const user = await requireRole(["super_admin", "admin", "editor"]);
  const supabase = await createClient();
  const { data } = await supabase.from("programs").select("id,title,category,status,is_featured").order("created_at", { ascending: false }).limit(50);
  const items = (data as { id: string; title: string; category: string; status: string; is_featured: boolean }[] | null) ?? [];
  return (
    <AdminShell role={user.role!} email={user.email}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h1 className="text-2xl font-extrabold">Program Kerja</h1><p className="text-sm text-stone-600">Tandai unggulan untuk tampil di beranda.</p></div>
          <Link href="/admin/program/baru"><Button>＋ Program Baru</Button></Link>
        </div>
        {items.length === 0 ? <EmptyState title="Belum ada program" description="Buat program kerja pertama." /> : (
          <Card><CardContent className="flex flex-col gap-2 p-3">
            {items.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-forest-50 p-3">
                <div><p className="font-bold">{p.title}</p><p className="flex flex-wrap gap-2 text-xs text-stone-500"><Badge>{p.category}</Badge><Badge tone="gold">{p.status}</Badge>{p.is_featured && <Badge tone="gray">Unggulan</Badge>}</p></div>
                <div className="flex items-center gap-2"><Link href={`/admin/program/${p.id}`} className="rounded-lg bg-forest-50 px-2.5 py-1.5 text-xs font-bold text-forest-900 hover:bg-forest-100">Edit</Link><DeleteButton id={p.id} onDelete={deleteProgramAction} /></div>
              </div>
            ))}
          </CardContent></Card>
        )}
      </div>
    </AdminShell>
  );
}
