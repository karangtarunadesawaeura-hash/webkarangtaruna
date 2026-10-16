import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Search, Newspaper } from "lucide-react";
import { createClientSafe } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { SectionHeading, EmptyState } from "@/components/ui/state";
import { Button } from "@/components/ui/button";
import { formatTanggal, truncate } from "@/lib/utils";
import { NEWS_CATEGORIES } from "@/lib/constants";

export const metadata: Metadata = { title: "Berita & Pengumuman" };

const PER_PAGE = 9;

export default async function BeritaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; kategori?: string; page?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const kategori = params.kategori ?? "";
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const supabase = await createClientSafe();
  let items: {
    id: string; title: string; slug: string; category: string; summary: string | null;
    content: string | null; cover_image_url: string | null; published_at: string | null; created_at: string;
  }[] = [];
  let total = 0;

  if (supabase) {
    let query = supabase.from("news").select("*", { count: "exact" }).eq("status", "published").order("published_at", { ascending: false, nullsFirst: false });
    if (kategori) query = query.eq("category", kategori);
    if (q) query = query.or(`title.ilike.%${q}%,summary.ilike.%${q}%`);
    const from = (page - 1) * PER_PAGE;
    const { data, count } = await query.range(from, from + PER_PAGE - 1);
    items = (data as typeof items) ?? [];
    total = count ?? 0;
  }

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const pageHref = (p: number) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (kategori) sp.set("kategori", kategori);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return `/berita${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6">
      <SectionHeading eyebrow="Kabar" title="Berita & Pengumuman" description="Ikuti kabar terbaru kegiatan dan pengumuman resmi Karang Taruna Desa Waeura." />

      <form method="get" action="/berita" className="flex flex-col gap-3 rounded-2xl border border-forest-100 bg-white p-4 sm:flex-row" role="search">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" aria-hidden />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Cari berita…"
            aria-label="Cari berita"
            className="h-10 w-full rounded-lg border border-stone-300 bg-white pl-9 pr-3 text-sm focus:border-forest-600 focus:outline-none"
          />
        </div>
        <select name="kategori" defaultValue={kategori} aria-label="Filter kategori" className="h-10 rounded-lg border border-stone-300 bg-white px-3 text-sm">
          <option value="">Semua kategori</option>
          {NEWS_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <Button type="submit">Cari</Button>
      </form>

      {items.length === 0 ? (
        <EmptyState title={q || kategori ? "Tidak ditemukan" : "Belum ada berita"} description={q || kategori ? "Coba kata kunci atau kategori lain." : "Berita yang sudah dipublikasikan akan tampil di sini. Draf tidak terlihat oleh publik."} />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((n) => (
              <Link key={n.id} href={`/berita/${n.slug}`} className="group overflow-hidden rounded-2xl border border-forest-100 bg-white shadow-sm transition-shadow hover:shadow-md">
                {n.cover_image_url ? (
                  <div className="relative h-44 w-full overflow-hidden bg-stone-100">
                    <Image src={n.cover_image_url} alt={n.title} fill sizes="(max-width:768px) 100vw, 33vw" className="object-contain" />
                  </div>
                ) : (
                  <div className="flex h-44 items-center justify-center bg-forest-50 text-forest-300"><Newspaper className="h-8 w-8" /></div>
                )}
                <div className="flex flex-col gap-2 p-5">
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <Badge tone="gray">{n.category}</Badge>
                    <span>{formatTanggal(n.published_at ?? n.created_at)}</span>
                  </div>
                  <h2 className="font-bold leading-snug group-hover:underline">{n.title}</h2>
                  <p className="text-sm text-stone-600 line-clamp-2">{n.summary || truncate(n.content, 120)}</p>
                </div>
              </Link>
            ))}
          </div>
          {totalPages > 1 && (
            <nav aria-label="Pagination berita" className="flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 7).map((p) => (
                <Link key={p} href={pageHref(p)} aria-current={p === page ? "page" : undefined} className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold ${p === page ? "bg-forest-900 text-white" : "bg-white text-forest-900 ring-1 ring-forest-100 hover:bg-forest-50"}`}>{p}</Link>
              ))}
            </nav>
          )}
          <p className="text-center text-xs text-stone-500">Menampilkan {items.length} dari {total} berita.</p>
        </>
      )}
    </div>
  );
}
