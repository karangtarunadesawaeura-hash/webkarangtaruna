import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/admin-shell";
import { ContactRowActions } from "@/components/admin/contact-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/state";
import { formatTanggalWaktu } from "@/lib/utils";
export const metadata = { title: "Pesan Masuk" };
export default async function AdminPesanPage() {
  const user = await requireRole(["super_admin", "admin"]);
  const supabase = await createClient();
  const { data } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(100);
  const items = (data as { id: string; name: string; email: string | null; phone: string | null; subject: string | null; message: string; is_read: boolean; created_at: string }[] | null) ?? [];
  return (
    <AdminShell role={user.role!} email={user.email}>
      <div className="flex flex-col gap-4">
        <div><h1 className="text-2xl font-extrabold">Pesan Masuk</h1><p className="text-sm text-stone-600">Pesan dari formulir kontak — privat, hanya pengurus.</p></div>
        {items.length === 0 ? <EmptyState title="Belum ada pesan" description="Pesan dari halaman kontak akan muncul di sini." /> : (
          <Card><CardContent className="flex flex-col gap-2 p-3">
            {items.map((m) => (
              <div key={m.id} className="rounded-xl border border-forest-50 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold">{m.name} {m.subject && <span className="font-normal text-stone-500">— {m.subject}</span>}</p>
                  <Badge tone={m.is_read ? "gray" : "gold"}>{m.is_read ? "Dibaca" : "Baru"}</Badge>
                </div>
                <p className="mt-1 whitespace-pre-line text-sm text-stone-700">{m.message}</p>
                <p className="mt-1 text-xs text-stone-500">{formatTanggalWaktu(m.created_at)}{m.email ? ` • ${m.email}` : ""}{m.phone ? ` • ${m.phone}` : ""}</p>
                <div className="mt-2"><ContactRowActions id={m.id} isRead={m.is_read} /></div>
              </div>
            ))}
          </CardContent></Card>
        )}
      </div>
    </AdminShell>
  );
}
