import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Download, Lock } from "lucide-react";
import { getPublicReports, getFeaturedPrograms } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeading, EmptyState } from "@/components/ui/state";
import { formatTanggal } from "@/lib/utils";

export const metadata: Metadata = { title: "Transparansi & Laporan" };

export default async function TransparansiPage() {
  const [reports, programs] = await Promise.all([
    getPublicReports(20),
    getFeaturedPrograms(6),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6">
      <SectionHeading eyebrow="Akuntabilitas" title="Transparansi & Laporan" description="Laporan kegiatan dan ringkasan program yang telah dilaksanakan. Dokumen internal dan data keuangan tidak dipublikasikan tanpa persetujuan resmi." />

      <section className="flex flex-col gap-4">
        <h2 className="flex items-center gap-2 text-lg font-extrabold"><FileText className="h-5 w-5 text-forest-700" /> Laporan Kegiatan</h2>
        {reports.length === 0 ? (
          <EmptyState title="Belum ada laporan yang dipublikasikan" description="Laporan kegiatan yang ditandai publik oleh pengurus akan tampil di sini dan dapat diunduh." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {reports.map((r) => (
              <Card key={r.id}><CardContent className="flex flex-col gap-2 p-5">
                <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                  {r.period && <Badge tone="gray">{r.period}</Badge>}
                  <span>{formatTanggal(r.published_at ?? r.created_at)}</span>
                </div>
                <h3 className="font-bold">{r.title}</h3>
                {r.summary && <p className="text-sm text-stone-600 line-clamp-3">{r.summary}</p>}
                {r.document_url ? (
                  <a href={r.document_url} target="_blank" rel="noopener noreferrer" className="inline-flex w-fit items-center gap-1.5 text-sm font-bold text-forest-700 hover:underline">
                    <Download className="h-4 w-4" /> Unduh dokumen
                  </a>
                ) : (
                  <p className="text-xs text-stone-500">Dokumen lampiran menyusul.</p>
                )}
              </CardContent></Card>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-extrabold">Ringkasan Program Terlaksana</h2>
        {programs.length === 0 ? (
          <EmptyState title="Belum ada ringkasan program" description="Hasil program yang telah selesai akan diringkas di sini." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {programs.map((p) => (
              <Card key={p.id}><CardContent className="flex flex-col gap-2 p-5">
                <Badge className="w-fit">{p.category}</Badge>
                <h3 className="font-bold">{p.title}</h3>
                <p className="text-sm text-stone-600 line-clamp-3">{p.result || p.description || "Hasil program akan dilengkapi pengurus."}</p>
              </CardContent></Card>
            ))}
          </div>
        )}
      </section>

      <Card className="border-gold-500/40 bg-gold-300/15">
        <CardContent className="flex gap-3 p-5">
          <Lock className="h-5 w-5 shrink-0 text-gold-600" />
          <p className="text-sm text-stone-700">
            Informasi anggaran dan dokumen internal hanya dipublikasikan apabila data
            resmi telah diberikan dan disetujui. Untuk kebutuhan audit internal,
            silakan hubungi pengurus melalui <Link href="/kontak" className="font-bold text-forest-800 underline">halaman kontak</Link>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
