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
const PAGE_SIZE = 20;
export default async function AdminAnggotaPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; page?: string }> }) {
  const user = await requireRole(["super_admin", "admin"]);
  const { status, q: query, page: pageRaw } = await searchParams;
  const page = Math.max(1, Number(pageRaw ?? "1") || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const supabase = await createClient();
  let q = supabase.from("membership_applications").select("*", { count: "exact" }).order("created_at", { ascending: false }).range(from, to);
  if (status) q = q.eq("status", status);
  const search = (query ?? "").trim();
  if (search) q = q.ilike("full_name", `%${search}%`);
  const { data, count } = await q;
  const items = (data as { id: string; full_name: string; phone: string | null; email: string | null; address: string | null; desired_field: string | null; interests: string | null; status: string; created_at: string }[] | null) ?? [];
  const totalPages = Math.max(1, Math.ceil((count ?? items.length) / PAGE_SIZE));
  const buildHref = (over: { status?: string; q?: string; page?: number }) => {
    const p = new URLSearchParams();
    const s = over.status !== undefined ? over.status : (status ?? "");
    const qq = over.q !== undefined ? over.q : search;
    const pp = over.page ?? page;
    if (s) p.set("status", s);
    if (qq) p.set("q", qq);
    if (pp > 1) p.set("page", String(pp));
    const str = p.toString();
    return `/admin/anggota${str ? `?${str}` : ""}`;
  };
  return (
    <AdminShell role={user.role!} email={user.email}>
      <div className="flex flex-col gap-4">
        <div><h1 className="text-2xl font-extrabold">Pendaftar Anggota</h1><p className="text-sm text-stone-600">Data privat — hanya pengurus berwenang. Jangan membagikan ke publik.</p></div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter status">
          {[["", "Semua"], ["menunggu", "Menunggu"], ["diterima", "Diterima"], ["ditolak", "Ditolak"]].map(([v, l]) => (
            <Link key={v || "all"} href={buildHref({ status: v, page: 1 })}
              className={`rounded-full px-4 py-2 text-xs font-bold ${(status ?? "") === v ? "bg-forest-900 text-white" : "bg-forest-50 text-forest-900 hover:bg-forest-100"}`}>{l}</Link>
          ))}
        </div>
        <form method="get" action="/admin/anggota" className="flex flex-col gap-2 sm:flex-row" role="search">
          {status ? <input type="hidden" name="status" value={status} /> : null}
          <input type="search" name="q" defaultValue={search} placeholder="Cari nama pendaftar…" aria-label="Cari nama pendaftar"
            className="w-full rounded-xl border border-forest-100 bg-white px-4 py-2.5 text-sm outline-none placeholder:text-stone-400 focus:border-forest-700" />
          <button type="submit" className="rounded-xl bg-forest-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-forest-800">Cari</button>
        </form>
        <p className="text-xs text-stone-500">{count ?? items.length} data{totalPages > 1 ? ` • halaman ${page} dari ${totalPages}` : ""}{search ? ` • pencarian: “${search}”` : ""}</p>
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
                <div className="mt-2 flex flex-wrap items-center gap-2"><MembershipRowActions id={m.id} status={m.status} /><Link href={`/admin/anggota/${m.id}`} className="rounded-lg bg-forest-900 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-forest-800">Detail</Link></div>
              </div>
            ))}
          </CardContent></Card>
        )}
        {totalPages > 1 && (
          <nav aria-label="Pagination" className="flex flex-wrap items-center gap-2 text-sm">
            {page > 1 && <Link href={buildHref({ page: page - 1 })} className="rounded-lg bg-white px-3 py-1.5 font-bold text-forest-900 shadow-sm hover:bg-forest-50">← Sebelumnya</Link>}
            {page < totalPages && <Link href={buildHref({ page: page + 1 })} className="rounded-lg bg-white px-3 py-1.5 font-bold text-forest-900 shadow-sm hover:bg-forest-50">Berikutnya →</Link>}
          </nav>
        )}
        <p className="text-xs text-stone-500">Catatan: data pendaftar bersifat privat. Contoh data tidak digunakan sebagai data asli.</p>
      </div>
    </AdminShell>
  );
}
