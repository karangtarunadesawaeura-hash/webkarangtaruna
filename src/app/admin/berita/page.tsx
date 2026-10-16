import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/admin-shell";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteNewsAction } from "@/app/actions/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/state";
import { formatTanggal } from "@/lib/utils";

export const metadata = { title: "Kelola Berita" };

export default async function AdminBeritaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireRole(["super_admin", "admin", "editor"]);
  const { q } = await searchParams;
  const supabase = await createClient();
  let query = supabase.from("news").select("id,title,slug,category,status,published_at,created_at").order("created_at", { ascending: false }).limit(50);
  if (q) query = query.ilike("title", `%${q}%`);
  const { data } = await query;
  const items = (data as { id: string; title: string; slug: string; category: string; status: string; published_at: string | null; created_at: string }[] | null) ?? [];

  return (
    <AdminShell role={user.role!} email={user.email}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h1 className="text-2xl font-extrabold">Berita</h1><p className="text-sm text-stone-600">Kelola draf & publikasi. Hanya yang Published tampil di publik.</p></div>
          <Link href="/admin/berita/baru"><Button>＋ Berita Baru</Button></Link>
        </div>
        <form method="get" className="flex gap-2" role="search">
          <input type="search" name="q" defaultValue={q ?? ""} placeholder="Cari judul…" aria-label="Cari berita" className="h-10 flex-1 rounded-lg border border-stone-300 px-3 text-sm" />
          <Button type="submit" variant="secondary">Cari</Button>
        </form>
        {items.length === 0 ? (
          <EmptyState title="Belum ada berita" description="Klik Berita Baru untuk membuat artikel pertama." />
        ) : (
          <Card><CardContent className="flex flex-col gap-2 p-3">
            {items.map((n) => (
              <div key={n.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-forest-50 p-3">
                <div className="min-w-0">
                  <p className="truncate font-bold">{n.title}</p>
                  <p className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                    <Badge tone={n.status === "published" ? "green" : "gray"}>{n.status}</Badge>
                    {n.category} • {formatTanggal(n.published_at ?? n.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/berita/${n.id}`} className="rounded-lg bg-forest-50 px-2.5 py-1.5 text-xs font-bold text-forest-900 hover:bg-forest-100">Edit</Link>
                  <DeleteButton id={n.id} onDelete={deleteNewsAction} />
                </div>
              </div>
            ))}
          </CardContent></Card>
        )}
      </div>
    </AdminShell>
  );
}
