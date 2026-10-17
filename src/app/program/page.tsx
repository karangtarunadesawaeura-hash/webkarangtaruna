import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { CalendarClock } from "lucide-react";
import { createClientSafe } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeading, EmptyState } from "@/components/ui/state";
import { PROGRAM_CATEGORIES, PROGRAM_STATUS_LABEL } from "@/lib/constants";
import { truncate } from "@/lib/utils";

export const metadata: Metadata = { title: "Program Kerja" };

export default async function ProgramPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string; status?: string }>;
}) {
  const params = await searchParams;
  const kategori = params.kategori ?? "";
  const status = params.status ?? "";

  const supabase = await createClientSafe();
  let programs: {
    id: string; title: string; slug: string; category: string; description: string | null;
    status: string; schedule: string | null; image_url: string | null;
  }[] = [];
  if (supabase) {
    let q = supabase.from("programs").select("id,title,slug,category,description,status,schedule,image_url").order("created_at", { ascending: false });
    if (kategori) q = q.eq("category", kategori);
    if (status) q = q.eq("status", status);
    const { data } = await q;
    programs = (data as typeof programs) ?? [];
  }

  const buildHref = (k: string, s: string) => {
    const p = new URLSearchParams();
    if (k) p.set("kategori", k);
    if (s) p.set("status", s);
    const qs = p.toString();
    return `/program${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6">
      <SectionHeading eyebrow="Program" title="Program Kerja" description="Daftar program kerja Karang Taruna Desa Waeura beserta kategori, status, dan jadwalnya." />

      <div className="flex flex-col gap-3 rounded-2xl border border-forest-100 bg-white p-4 sm:flex-row sm:items-center">
        <div className="flex flex-1 flex-wrap items-center gap-2" role="group" aria-label="Filter kategori">
          <span className="text-xs font-bold uppercase text-stone-500">Kategori:</span>
          <Link href={buildHref("", status)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${!kategori ? "bg-forest-900 text-white" : "bg-forest-50 text-forest-900 hover:bg-forest-100"}`}>Semua</Link>
          {PROGRAM_CATEGORIES.map((c) => (
            <Link key={c} href={buildHref(c, status)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${kategori === c ? "bg-forest-900 text-white" : "bg-forest-50 text-forest-900 hover:bg-forest-100"}`}>{c}</Link>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter status">
          <span className="text-xs font-bold uppercase text-stone-500">Status:</span>
          {["", "rencana", "berjalan", "selesai"].map((s) => (
            <Link key={s || "all"} href={buildHref(kategori, s)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${status === s ? "bg-gold-500 text-forest-950" : "bg-stone-100 text-stone-700 hover:bg-stone-200"}`}>
              {s ? PROGRAM_STATUS_LABEL[s] : "Semua"}
            </Link>
          ))}
        </div>
      </div>

      {programs.length === 0 ? (
        <EmptyState title="Belum ada program pada filter ini" description="Program kerja akan ditampilkan setelah ditambahkan pengurus. Coba ubah filter atau kembali lagi nanti." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((p) => (
            <Card key={p.id} className="overflow-hidden">
              {p.image_url && (
                <div className="relative h-40 w-full">
                  <Image src={p.image_url} alt={p.title} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover" />
                </div>
              )}
              <CardContent className="flex flex-col gap-2 p-5">
                <div className="flex flex-wrap gap-2">
                  <Badge>{p.category}</Badge>
                  <Badge tone="gold">{PROGRAM_STATUS_LABEL[p.status] ?? p.status}</Badge>
                </div>
                <h2 className="font-bold leading-snug">{p.title}</h2>
                <p className="text-sm text-stone-600 line-clamp-3">{truncate(p.description, 140) || "Deskripsi menyusul."}</p>
                {p.schedule && <p className="flex items-center gap-1.5 text-xs font-semibold text-stone-500"><CalendarClock className="h-3.5 w-3.5" /> Jadwal: {p.schedule}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
