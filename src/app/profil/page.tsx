import type { Metadata } from "next";
import { Users, Target, Eye, History } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading, EmptyState } from "@/components/ui/state";
import { getBoardMembers, getSiteInfo } from "@/lib/data";
import Image from "next/image";

export const metadata: Metadata = { title: "Profil Organisasi" };

export default async function ProfilPage() {
  const [{ settings }, members] = await Promise.all([getSiteInfo(), getBoardMembers()]);
  const missions: string[] = (settings?.mission ?? "")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-12 sm:px-6">
      <SectionHeading
        eyebrow="Profil"
        title="Profil Karang Taruna Desa Waeura"
        description="Mengenal sejarah, visi, misi, tujuan, dan kepengurusan organisasi."
      />

      <section className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="flex flex-col gap-3 p-6">
            <h2 className="flex items-center gap-2 text-lg font-extrabold"><History className="h-5 w-5 text-forest-700" /> Sejarah Organisasi</h2>
            {settings?.history ? (
              <p className="whitespace-pre-line text-sm leading-relaxed text-stone-700">{settings.history}</p>
            ) : (
              <p className="text-sm text-stone-500">Sejarah organisasi akan dilengkapi oleh pengurus melalui dashboard admin. Bagian ini menggunakan placeholder yang dapat diedit.</p>
            )}
            {settings?.leadership_period && (
              <p className="text-sm font-semibold text-forest-800">Periode kepengurusan: {settings.leadership_period}</p>
            )}
          </CardContent>
        </Card>
        <div className="flex flex-col gap-6">
          <Card>
            <CardContent className="flex flex-col gap-2 p-6">
              <h2 className="flex items-center gap-2 text-lg font-extrabold"><Eye className="h-5 w-5 text-forest-700" /> Visi</h2>
              <p className="text-sm leading-relaxed text-stone-700">{settings?.vision || "Visi organisasi akan ditetapkan dan dipublikasikan oleh pengurus."}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col gap-2 p-6">
              <h2 className="flex items-center gap-2 text-lg font-extrabold"><Target className="h-5 w-5 text-forest-700" /> Misi</h2>
              {missions.length > 0 ? (
                <ol className="flex list-decimal flex-col gap-1 pl-5 text-sm text-stone-700">
                  {missions.map((m, i) => <li key={i}>{m.replace(/^\d+[.)]\s*/, "")}</li>)}
                </ol>
              ) : (
                <p className="text-sm text-stone-500">Misi organisasi akan dilengkapi oleh pengurus. Tulis setiap misi pada baris baru di dashboard.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {settings?.objectives && (
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-2 text-lg font-extrabold">Tujuan Organisasi</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-stone-700">{settings.objectives}</p>
          </CardContent>
        </Card>
      )}

      <section className="flex flex-col gap-6">
        <SectionHeading align="left" eyebrow="Kepengurusan" title="Struktur Kepengurusan" description="Susunan pengurus aktif Karang Taruna Desa Waeura beserta bidang dan tugasnya." />
        {members.length === 0 ? (
          <EmptyState title="Data pengurus belum tersedia" description="Struktur kepengurusan akan ditampilkan di sini setelah diisi oleh admin. Nama pengurus tidak dikarang — seluruhnya bersumber dari data resmi." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((m) => (
              <Card key={m.id} className="overflow-hidden">
                <CardContent className="flex flex-col gap-2 p-5">
                  <div className="flex items-center gap-3">
                    <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-forest-100">
                      {m.photo_url ? (
                        <Image src={m.photo_url} alt={`Foto ${m.name}`} fill sizes="48px" className="object-cover" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-forest-700"><Users className="h-5 w-5" /></span>
                      )}
                    </span>
                    <div>
                      <h3 className="font-bold leading-tight">{m.name}</h3>
                      <p className="text-sm font-semibold text-forest-700">{m.position}</p>
                      {m.division && <p className="text-xs text-stone-500">{m.division}</p>}
                    </div>
                  </div>
                  {m.duties && <p className="text-sm text-stone-600">{m.duties}</p>}
                  {m.period && <p className="text-xs text-stone-500">Periode: {m.period}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        <p className="text-xs text-stone-500">Catatan: nama pengurus di atas berasal dari database resmi dan dapat dikelola melalui dashboard admin.</p>
      </section>
    </div>
  );
}
