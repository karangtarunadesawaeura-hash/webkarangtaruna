import type { Metadata } from "next";
import Link from "next/link";
import { Newspaper, CalendarDays, Briefcase, Users, Inbox, Mail } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent } from "@/components/ui/card";

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
  const [news, events, programs, members, pendingMembers, messages] = await Promise.all([
    countOf("news"),
    countOf("events"),
    countOf("programs"),
    countOf("membership_applications", { col: "status", val: "diterima" }),
    countOf("membership_applications", { col: "status", val: "menunggu" }),
    countOf("contact_messages"),
  ]);

  const cards = [
    { label: "Berita", value: news, href: "/admin/berita", icon: <Newspaper className="h-5 w-5" /> },
    { label: "Kegiatan", value: events, href: "/admin/kegiatan", icon: <CalendarDays className="h-5 w-5" /> },
    { label: "Program Kerja", value: programs, href: "/admin/program", icon: <Briefcase className="h-5 w-5" /> },
    { label: "Anggota Diterima", value: members, href: "/admin/anggota", icon: <Users className="h-5 w-5" /> },
    { label: "Pendaftar Menunggu", value: pendingMembers, href: "/admin/anggota", icon: <Inbox className="h-5 w-5" /> },
    { label: "Pesan Masuk", value: messages, href: "/admin/pesan", icon: <Mail className="h-5 w-5" /> },
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
