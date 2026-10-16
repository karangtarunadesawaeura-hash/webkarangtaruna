import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Megaphone,
  Newspaper,
  Sprout,
  Users,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState, SectionHeading } from "@/components/ui/state";
import {
  getFeaturedPrograms,
  getGalleryAlbums,
  getPublicAnnouncements,
  getPublishedNews,
  getSiteInfo,
  getStats,
  getUpcomingEvents,
} from "@/lib/data";
import { formatTanggal, truncate } from "@/lib/utils";
import { EVENT_STATUS_LABEL, PROGRAM_STATUS_LABEL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Beranda",
};

export default async function HomePage() {
  const [site, news, programs, events, albums, stats, announcements] =
    await Promise.all([
      getSiteInfo(),
      getPublishedNews(3),
      getFeaturedPrograms(3),
      getUpcomingEvents(3),
      getGalleryAlbums(6),
      getStats(),
      getPublicAnnouncements(),
    ]);

  const hasStats = stats.members !== null || stats.programs !== null || stats.events !== null;

  return (
    <div className="flex flex-col">
      {/* HERO */}
      <section className="relative overflow-hidden bg-forest-950 text-white">
        {site.heroImageUrl ? (
          <Image
            src={site.heroImageUrl}
            alt="Kegiatan Karang Taruna Desa Waeura"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-40"
          />
        ) : (
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#1d5c3a_0%,#0a2417_60%)]"
          />
        )}
        <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-4 py-20 sm:px-6 sm:py-28">
          <Badge tone="gold" className="w-fit">
            Organisasi Kepemudaan Desa Waeura
          </Badge>
          <h1 className="max-w-3xl text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Karang Taruna Desa Waeura
          </h1>
          <p className="max-w-2xl text-base italic text-gold-300 sm:text-xl">
            {site.tagline}
          </p>
          <p className="max-w-2xl text-sm leading-relaxed text-forest-100 sm:text-base">
            {site.description}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/agenda">
              <Button variant="gold" size="lg" className="w-full sm:w-auto">
                <CalendarDays aria-hidden /> Lihat Kegiatan
              </Button>
            </Link>
            <Link href="/keanggotaan">
              <Button
                variant="outline"
                size="lg"
                className="w-full border-white/30 bg-white/10 text-white hover:bg-white/20 sm:w-auto"
              >
                <Users aria-hidden /> Gabung Bersama Kami <ArrowRight aria-hidden />
              </Button>
            </Link>
          </div>
          {announcements.length > 0 && (
            <div
              role="status"
              className="mt-4 flex max-w-3xl items-start gap-3 rounded-xl bg-white/10 p-4 backdrop-blur"
            >
              <Megaphone className="mt-0.5 h-5 w-5 shrink-0 text-gold-300" aria-hidden />
              <div>
                <p className="text-sm font-bold text-gold-300">Pengumuman</p>
                <p className="text-sm text-white">{announcements[0].title}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* STATISTIK */}
      <section aria-label="Statistik organisasi" className="border-b border-forest-100 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 py-10 sm:grid-cols-3 sm:px-6">
          {hasStats ? (
            <>
              <StatCard
                icon={<Users className="h-5 w-5" />}
                label="Anggota & Pengurus"
                value={stats.members}
              />
              <StatCard
                icon={<Briefcase className="h-5 w-5" />}
                label="Program Kerja"
                value={stats.programs}
              />
              <StatCard
                icon={<CalendarDays className="h-5 w-5" />}
                label="Kegiatan"
                value={stats.events}
              />
            </>
          ) : (
            <div className="sm:col-span-3">
              <EmptyState
                title="Data statistik belum tersedia"
                description="Statistik anggota, program, dan kegiatan akan tampil otomatis setelah pengurus mengisi data melalui dashboard admin."
              />
            </div>
          )}
        </div>
      </section>

      {/* PROFIL SINGKAT */}
      <section className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-14 sm:px-6">
        <SectionHeading
          eyebrow="Profil"
          title="Pemuda Aktif, Kreatif, dan Terpercaya"
          description="Karang Taruna Desa Waeura mewadahi pemuda untuk berkarya, mengabdi, dan membangun desa melalui program sosial, pendidikan, lingkungan, dan kewirausahaan."
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <Card><CardContent className="flex flex-col gap-2 p-6"><Sprout className="h-6 w-6 text-forest-700" /><h3 className="font-bold">Mengabdi untuk Desa</h3><p className="text-sm text-stone-600">Bakti sosial, lingkungan, dan kegiatan kemasyarakatan yang berdampak langsung.</p></CardContent></Card>
          <Card><CardContent className="flex flex-col gap-2 p-6"><Users className="h-6 w-6 text-forest-700" /><h3 className="font-bold">Berkarya Bersama</h3><p className="text-sm text-stone-600">Pelatihan, olahraga, seni, dan kewirausahaan untuk mengembangkan potensi pemuda.</p></CardContent></Card>
          <Card><CardContent className="flex flex-col gap-2 p-6"><Newspaper className="h-6 w-6 text-forest-700" /><h3 className="font-bold">Transparan & Terbuka</h3><p className="text-sm text-stone-600">Laporan kegiatan dan program dipublikasikan agar dapat dipertanggungjawabkan.</p></CardContent></Card>
        </div>
        <div className="flex justify-center">
          <Link href="/profil"><Button variant="secondary">Pelajari Profil Organisasi <ArrowRight aria-hidden /></Button></Link>
        </div>
      </section>

      {/* PROGRAM UNGGULAN */}
      <section className="bg-forest-50/60 py-14">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:px-6">
          <SectionHeading eyebrow="Program Kerja" title="Program Kerja Unggulan" description="Program prioritas yang dijalankan pengurus bersama anggota dan masyarakat." />
          {programs.length === 0 ? (
            <EmptyState title="Belum ada program unggulan" description="Program kerja akan ditampilkan di sini setelah ditambahkan oleh pengurus." />
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
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
                    <h3 className="font-bold leading-snug">{p.title}</h3>
                    <p className="text-sm text-stone-600 line-clamp-2">{truncate(p.description, 120) || "Deskripsi program akan segera dilengkapi."}</p>
                    <Link href="/program" className="mt-1 text-sm font-bold text-forest-700 hover:underline">Lihat semua program →</Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* AGENDA */}
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-14 sm:px-6">
        <SectionHeading eyebrow="Agenda" title="Kegiatan Mendatang" description="Jadwal kegiatan terdekat yang dapat diikuti anggota dan masyarakat." />
        {events.length === 0 ? (
          <EmptyState title="Belum ada kegiatan terjadwal" description="Agenda kegiatan mendatang akan muncul di sini. Pantau halaman Agenda untuk informasi terbaru." />
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {events.map((e) => (
              <Card key={e.id} className="p-5">
                <CardContent className="flex flex-col gap-2 p-0">
                  <Badge tone="gold" className="w-fit">{EVENT_STATUS_LABEL[e.status] ?? e.status}</Badge>
                  <h3 className="font-bold">{e.title}</h3>
                  <p className="flex items-center gap-1.5 text-sm text-stone-600"><CalendarDays className="h-4 w-4" /> {formatTanggal(e.starts_at)}</p>
                  {e.location && <p className="flex items-center gap-1.5 text-sm text-stone-600"><MapPin className="h-4 w-4" /> {e.location}</p>}
                  <Link href={`/agenda/${e.slug}`} className="text-sm font-bold text-forest-700 hover:underline">Detail kegiatan →</Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* BERITA */}
      <section className="bg-forest-950 py-14 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:px-6">
          <SectionHeading eyebrow="Kabar Desa" title="Berita Terbaru" description="Liputan kegiatan, pengumuman, dan prestasi Karang Taruna Desa Waeura." />
          {news.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/20 p-10 text-center">
              <p className="font-bold">Belum ada berita yang dipublikasikan</p>
              <p className="mt-1 text-sm text-forest-200">Berita terbaru akan tampil di sini setelah diterbitkan pengurus.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {news.map((n) => (
                <Link key={n.id} href={`/berita/${n.slug}`} className="group overflow-hidden rounded-2xl bg-white text-forest-950 transition-shadow hover:shadow-xl">
                  {n.cover_image_url ? (
                    <div className="relative h-44 w-full overflow-hidden bg-stone-100">
                      <Image src={n.cover_image_url} alt={n.title} fill sizes="(max-width:768px) 100vw, 33vw" className="object-contain" />
                    </div>
                  ) : (
                    <div className="flex h-44 items-center justify-center bg-forest-100 text-forest-400"><Newspaper className="h-8 w-8" /></div>
                  )}
                  <div className="flex flex-col gap-2 p-5">
                    <div className="flex items-center gap-2 text-xs text-stone-500">
                      <Badge tone="gray">{n.category}</Badge>
                      <span>{formatTanggal(n.published_at ?? n.created_at)}</span>
                    </div>
                    <h3 className="font-bold leading-snug group-hover:underline">{n.title}</h3>
                    <p className="text-sm text-stone-600 line-clamp-2">{n.summary || truncate(n.content, 120)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <div className="flex justify-center">
            <Link href="/berita"><Button variant="gold">Semua Berita <ArrowRight aria-hidden /></Button></Link>
          </div>
        </div>
      </section>

      {/* GALERI */}
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-14 sm:px-6">
        <SectionHeading eyebrow="Dokumentasi" title="Galeri Kegiatan" description="Momen kebersamaan dan karya pemuda Desa Waeura." />
        {albums.length === 0 ? (
          <EmptyState title="Galeri masih kosong" description="Dokumentasi foto kegiatan akan ditampilkan di sini." />
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {albums.slice(0, 6).map((a) => (
              <Link key={a.id} href="/galeri" className="group relative h-48 overflow-hidden rounded-2xl bg-forest-100">
                {a.cover_image_url ? (
                  <Image src={a.cover_image_url} alt={a.title} fill sizes="(max-width:768px) 50vw, 33vw" className="object-cover transition-transform group-hover:scale-105" />
                ) : null}
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-sm font-bold text-white">{a.title}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-forest-900 px-6 py-12 text-center text-white">
          <h2 className="max-w-xl text-2xl font-extrabold sm:text-3xl">Ayo Berkarya dan Mengabdi Bersama Karang Taruna Desa Waeura</h2>
          <p className="max-w-xl text-sm text-forest-100">Terbuka bagi seluruh pemuda Desa Waeura. Daftarkan diri Anda dan ikut berkontribusi untuk desa.</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/keanggotaan"><Button variant="gold" size="lg">Gabung Bersama Kami</Button></Link>
            <Link href="/kontak"><Button variant="outline" size="lg" className="border-white/30 bg-white/10 text-white hover:bg-white/20">Hubungi Pengurus</Button></Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | null;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-forest-100 bg-forest-50/50 p-5">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-900 text-gold-400">
        {icon}
      </span>
      <span className="flex flex-col">
        <span className="text-2xl font-extrabold text-forest-950">
          {value ?? "—"}
        </span>
        <span className="text-sm font-semibold text-stone-600">{label}</span>
      </span>
    </div>
  );
}
