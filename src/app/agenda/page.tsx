import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, MapPin, Archive } from "lucide-react";
import { createClientSafe } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeading, EmptyState } from "@/components/ui/state";
import { formatTanggal } from "@/lib/utils";
import { EVENT_STATUS_LABEL } from "@/lib/constants";

export const metadata: Metadata = { title: "Agenda Kegiatan" };

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClientSafe();
  let upcoming: { id: string; title: string; slug: string; category: string; location: string | null; starts_at: string; status: string }[] = [];
  let past: typeof upcoming = [];

  if (supabase) {
    const base = supabase.from("events").select("id,title,slug,category,location,starts_at,status").order("starts_at", { ascending: false });
    const { data } = status ? await base.eq("status", status) : await base;
    const all = (data as typeof upcoming) ?? [];
    upcoming = all.filter((e) => e.status === "mendatang" || e.status === "berlangsung").sort((a, b) => +new Date(a.starts_at) - +new Date(b.starts_at));
    past = all.filter((e) => e.status === "selesai" || e.status === "dibatalkan");
    if (status) {
      upcoming = status === "mendatang" || status === "berlangsung" ? all : [];
      past = status === "selesai" || status === "dibatalkan" ? all : [];
    }
  }

  const showUpcoming = !status || status === "mendatang" || status === "berlangsung";
  const showPast = !status || status === "selesai" || status === "dibatalkan";

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6">
      <SectionHeading eyebrow="Agenda" title="Agenda Kegiatan" description="Jadwal kegiatan mendatang dan arsip kegiatan yang telah dilaksanakan." />

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter status kegiatan">
        {[
          { v: "", l: "Semua" },
          { v: "mendatang", l: "Mendatang" },
          { v: "selesai", l: "Selesai" },
        ].map((o) => (
          <Link key={o.v || "all"} href={o.v ? `/agenda?status=${o.v}` : "/agenda"} className={`rounded-full px-4 py-2 text-xs font-bold ${ (status ?? "") === o.v ? "bg-forest-900 text-white" : "bg-forest-50 text-forest-900 hover:bg-forest-100"}`}>
            {o.l}
          </Link>
        ))}
      </div>

      {showUpcoming && (
      <section className="flex flex-col gap-4">
        <h2 className="flex items-center gap-2 text-lg font-extrabold"><CalendarDays className="h-5 w-5 text-forest-700" /> Kegiatan Mendatang</h2>
        {upcoming.length === 0 ? (
          <EmptyState title="Belum ada kegiatan mendatang" description="Kegiatan yang membuka pendaftaran maupun yang terjadwal akan muncul di sini." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((e) => (
              <Card key={e.id}><CardContent className="flex flex-col gap-2 p-5">
                <Badge tone="gold" className="w-fit">{EVENT_STATUS_LABEL[e.status] ?? e.status}</Badge>
                <h3 className="font-bold">{e.title}</h3>
                <p className="flex items-center gap-1.5 text-sm text-stone-600"><CalendarDays className="h-4 w-4" /> {formatTanggal(e.starts_at)}</p>
                {e.location && <p className="flex items-center gap-1.5 text-sm text-stone-600"><MapPin className="h-4 w-4" /> {e.location}</p>}
                <Link href={`/agenda/${e.slug}`} className="text-sm font-bold text-forest-700 hover:underline">Detail & pendaftaran →</Link>
              </CardContent></Card>
            ))}
          </div>
        )}
      </section>
      )}

      {showPast && (
      <section className="flex flex-col gap-4">
        <h2 className="flex items-center gap-2 text-lg font-extrabold"><Archive className="h-5 w-5 text-forest-700" /> Kegiatan yang Telah Selesai</h2>
        {past.length === 0 ? (
          <EmptyState title="Belum ada arsip kegiatan" description="Kegiatan yang telah selesai akan diarsipkan di sini beserta dokumentasinya." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {past.map((e) => (
              <Card key={e.id}><CardContent className="flex flex-col gap-2 p-5">
                <Badge tone="gray" className="w-fit">{EVENT_STATUS_LABEL[e.status] ?? e.status}</Badge>
                <h3 className="font-bold">{e.title}</h3>
                <p className="text-sm text-stone-600">{formatTanggal(e.starts_at)}{e.location ? ` • ${e.location}` : ""}</p>
                <Link href={`/agenda/${e.slug}`} className="text-sm font-bold text-forest-700 hover:underline">Lihat dokumentasi →</Link>
              </CardContent></Card>
            ))}
          </div>
        )}
      </section>
      )}
    </div>
  );
}
