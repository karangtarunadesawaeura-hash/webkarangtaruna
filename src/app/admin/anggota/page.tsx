import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/admin-shell";
import { MembershipRowActions } from "@/components/admin/membership-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/state";
import { formatTanggal } from "@/lib/utils";
export const metadata = { title: "Pendaftar Anggota" };
export default async function AdminAnggotaPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const user = await requireRole(["super_admin", "admin"]);
  const { status } = await searchParams;
  const supabase = await createClient();
  let q = supabase.from("membership_applications").select("*").order("created_at", { ascending: false }).limit(100);
  if (status) q = q.eq("status", status);
  const { data } = await q;
  const items = (data as { id: string; full_name: string; phone: string | null; email: string | null; address: string | null; desired_field: string | null; interests: string | null; status: string; created_at: string }[] | null) ?? [];
  return (
    <AdminShell role={user.role!} email={user.email}>
      <div className="flex flex-col gap-4">
        <div><h1 className="text-2xl font-extrabold">Pendaftar Anggota</h1><p className="text-sm text-stone-600">Data privat — hanya pengurus berwenang. Jangan membagikan ke publik.</p></div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter status">
          {[["", "Semua"], ["menunggu", "Menunggu"], ["diterima", "Diterima"], ["ditolak", "Ditolak"]].map(([v, l]) => (
            <Link key={v || "all"} href={v ? `/admin/anggota?status=${v}` : "/admin/anggota"}
              className={`rounded-full px-4 py-2 text-xs font-bold ${(status ?? "") === v ? "bg-forest-900 text-white" : "bg-forest-50 text-forest-900 hover:bg-forest-100"}`}>{l}</Link>
          ))}
        </div>
        {items.length === 0 ? <EmptyState title="Belum ada pendaftar" description="Pendaftar baru dari formulir keanggotaan akan muncul di sini." /> : (
          <Card><CardContent className="flex flex-col gap-2 p-3">
            {items.map((m) => (
              <div key={m.id} className="rounded-xl border border-forest-50 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div><p className="font-bold">{m.full_name}</p>
                    <p className="text-xs text-stone-500">{formatTanggal(m.created_at)}{m.phone ? ` • ${m.phone}` : ""}{m.email ? ` • ${m.email}` : ""}</p></div>
                  <Badge tone={m.status === "diterima" ? "green" : m.status === "ditolak" ? "red" : "gold"}>{m.status}</Badge>
                </div>
                {(m.address || m.desired_field || m.interests) && (
                  <p className="mt-1 text-xs text-stone-600">{[m.address, m.desired_field, m.interests].filter(Boolean).join(" • ")}</p>
                )}
                <div className="mt-2"><MembershipRowActions id={m.id} status={m.status} /></div>
              </div>
            ))}
          </CardContent></Card>
        )}
        <p className="text-xs text-stone-500">Catatan: data pendaftar bersifat privat. Contoh data tidak digunakan sebagai data asli.</p>
      </div>
    </AdminShell>
  );
}
