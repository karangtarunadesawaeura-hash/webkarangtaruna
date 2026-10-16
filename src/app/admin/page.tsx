import type { Metadata } from "next";
import Link from "next/link";
import { Newspaper, CalendarDays, Briefcase, Users, Inbox, FileText, CheckCircle2, Activity } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/state";
import { formatTanggalWaktu } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard Admin" };

async function countOf(table: string, filter?: { col: string; val: string }): Promise<number | null> {
  try {
    const supabase = await createClient();
    let q = supabase.from(table).select("id", { count: "exact", head: true });
    if (filter) q = q.eq(filter.col, filter.val);
    const { count } = await q;
    return count;
  } catch {
    return null;
  }
}

export default async function AdminDashboardPage() {
  const user = await requireRole(["super_admin", "admin", "editor"]);
  const [totalAnggota, anggotaAktif, programs, kegiatanSelesai, laporan, pendingMembers, recentEvents, recentReports, recentActivity] = await Promise.all([
    countOf("membership_applications"),
    countOf("membership_applications", { col: "status", val: "diterima" }),
    countOf("programs"),
    countOf("events", { col: "status", val: "selesai" }),
    countOf("reports"),
    countOf("membership_applications", { col: "status", val: "menunggu" }),
    (async () => {
      try {
        const supabase = await createClient();
        const { data } = await supabase.from("events").select("id,title,status,starts_at").order("starts_at", { ascending: false }).limit(5);
        return (data as { id: string; title: string; status: string; starts_at: string }[] | null) ?? [];
      } catch {
        return [];
      }
    })(),
    (async () => {
      try {
        const supabase = await createClient();
        const { data } = await supabase.from("reports").select("id,title,is_public,created_at").order("created_at", { ascending: false }).limit(5);
        return (data as { id: string; title: string; is_public: boolean; created_at: string }[] | null) ?? [];
      } catch {
        return [];
      }
    })(),
    (async () => {
      try {
        const supabase = await createClient();
        const { data } = await supabase.from("activity_logs").select("id,action,entity,entity_id,created_at").order("created_at", { ascending: false }).limit(8);
        return (data as { id: string; action: string; entity: string | null; entity_id: string | null; created_at: string }[] | null) ?? [];
      } catch {
        return [];
      }
    })(),
  ]);

  const cards = [
    { label: "Total Anggota Terdaftar", value: totalAnggota, href: "/admin/anggota", icon: <Users className="h-5 w-5" /> },
    { label: "Anggota Aktif (Diterima)", value: anggotaAktif, href: "/admin/anggota?status=diterima", icon: <CheckCircle2 className="h-5 w-5" /> },
    { label: "Program Kerja", value: programs, href: "/admin/program", icon: <Briefcase className="h-5 w-5" /> },
    { label: "Kegiatan Selesai", value: kegiatanSelesai, href: "/admin/kegiatan", icon: <CalendarDays className="h-5 w-5" /> },
    { label: "Laporan Kegiatan", value: laporan, href: "/admin/laporan", icon: <FileText className="h-5 w-5" /> },
    { label: "Menunggu Verifikasi", value: pendingMembers, href: "/admin/anggota?status=menunggu", icon: <Inbox className="h-5 w-5" /> },
  ];

  return (
    <AdminShell role={user.role!} email={user.email}>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-extrabold">Ringkasan</h1>
          <p className="text-sm text-stone-600">Selamat datang{user.full_name ? `, ${user.full_name}` : ""}. Kelola seluruh konten situs dari sini tanpa mengedit kode.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <Link key={c.label} href={c.href}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-5">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-900 text-gold-400">{c.icon}</span>
                  <span className="flex flex-col">
                    <span className="text-2xl font-extrabold">{c.value ?? "—"}</span>
                    <span className="text-sm font-semibold text-stone-600">{c.label}</span>
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardContent className="flex flex-col gap-2 p-5">
              <h2 className="flex items-center gap-2 font-bold text-forest-950"><CalendarDays className="h-4 w-4" /> Kegiatan Terbaru</h2>
              {recentEvents.length === 0 ? (
                <EmptyState title="Belum ada kegiatan" description="Kegiatan terbaru akan muncul di sini setelah ditambahkan." />
              ) : (
                <ul className="flex flex-col gap-2">
                  {recentEvents.map((e) => (
                    <li key={e.id} className="rounded-xl border border-forest-50 p-3 text-sm">
                      <p className="font-bold">{e.title}</p>
                      <p className="mt-1 flex flex-wrap gap-2 text-xs text-stone-500"><Badge tone="gold">{e.status}</Badge>{formatTanggalWaktu(e.starts_at)}</p>
                    </li>
                  ))}
                </ul>
              )}
              <Link href="/admin/kegiatan" className="text-sm font-bold text-forest-700 hover:underline">Kelola kegiatan →</Link>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col gap-2 p-5">
              <h2 className="flex items-center gap-2 font-bold text-forest-950"><Newspaper className="h-4 w-4" /> Laporan Terbaru</h2>
              {recentReports.length === 0 ? (
                <EmptyState title="Belum ada laporan" description="Laporan terbaru akan muncul di sini." />
              ) : (
                <ul className="flex flex-col gap-2">
                  {recentReports.map((r) => (
                    <li key={r.id} className="rounded-xl border border-forest-50 p-3 text-sm">
                      <p className="font-bold">{r.title}</p>
                      <p className="mt-1 flex flex-wrap gap-2 text-xs text-stone-500"><Badge tone={r.is_public ? "green" : "gray"}>{r.is_public ? "Publik" : "Privat"}</Badge>{formatTanggalWaktu(r.created_at)}</p>
                    </li>
                  ))}
                </ul>
              )}
              <Link href="/admin/laporan" className="text-sm font-bold text-forest-700 hover:underline">Kelola laporan →</Link>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col gap-2 p-5">
              <h2 className="flex items-center gap-2 font-bold text-forest-950"><Activity className="h-4 w-4" /> Aktivitas Admin Terbaru</h2>
              {recentActivity.length === 0 ? (
                <EmptyState title="Belum ada aktivitas tercatat" description="Setiap aksi simpan/hapus/ubah status admin dicatat di sini. Editor tidak memiliki akses ke log ini." />
              ) : (
                <ul className="flex flex-col gap-2">
                  {recentActivity.map((a) => (
                    <li key={a.id} className="rounded-xl border border-forest-50 p-3 text-xs text-stone-600">
                      <p className="font-bold text-forest-950">{a.action}{a.entity ? ` • ${a.entity}` : ""}</p>
                      <p className="mt-0.5">{formatTanggalWaktu(a.created_at)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardContent className="flex flex-col gap-2 p-5 text-sm text-stone-600">
            <h2 className="font-bold text-forest-950">Panduan singkat</h2>
            <ul className="list-disc pl-5">
              <li>Editor: membuat & mengedit konten (publikasi mengikuti izin).</li>
              <li>Admin: mengelola konten, kegiatan, pendaftar, dan pesan.</li>
              <li>Super Admin: seluruh akses termasuk pengaturan & peran pengguna.</li>
              <li>Setiap penghapusan meminta konfirmasi dan dicatat di log aktivitas.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
