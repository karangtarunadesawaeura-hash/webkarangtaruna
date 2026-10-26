"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Newspaper, CalendarDays, Briefcase, Images,
  FolderOpen, Users, FileText, Megaphone, Settings, LogOut, Inbox, ShieldCheck, UserCog, Menu, X,
} from "lucide-react";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { signOutAction } from "@/app/actions/admin";
import type { UserRole } from "@/types/database";

const MENU: { href: string; label: string; icon: React.ReactNode; roles: UserRole[] }[] = [
  { href: "/admin", label: "Ringkasan", icon: <LayoutDashboard className="h-4 w-4" />, roles: ["super_admin", "admin", "editor"] },
  { href: "/admin/berita", label: "Berita", icon: <Newspaper className="h-4 w-4" />, roles: ["super_admin", "admin", "editor"] },
  { href: "/admin/kegiatan", label: "Kegiatan", icon: <CalendarDays className="h-4 w-4" />, roles: ["super_admin", "admin", "editor"] },
  { href: "/admin/program", label: "Program Kerja", icon: <Briefcase className="h-4 w-4" />, roles: ["super_admin", "admin", "editor"] },
  { href: "/admin/galeri", label: "Galeri", icon: <Images className="h-4 w-4" />, roles: ["super_admin", "admin", "editor"] },
  { href: "/admin/media", label: "Media Upload", icon: <FolderOpen className="h-4 w-4" />, roles: ["super_admin", "admin", "editor"] },
  { href: "/admin/laporan", label: "Laporan", icon: <FileText className="h-4 w-4" />, roles: ["super_admin", "admin", "editor"] },
  { href: "/admin/pengumuman", label: "Pengumuman", icon: <Megaphone className="h-4 w-4" />, roles: ["super_admin", "admin", "editor"] },
  { href: "/admin/pengurus", label: "Pengurus", icon: <Users className="h-4 w-4" />, roles: ["super_admin", "admin"] },
  { href: "/admin/anggota", label: "Pendaftar Anggota", icon: <Inbox className="h-4 w-4" />, roles: ["super_admin", "admin"] },
  { href: "/admin/pesan", label: "Pesan Masuk", icon: <Inbox className="h-4 w-4" />, roles: ["super_admin", "admin"] },
  { href: "/admin/anggota-admin", label: "Anggota Admin", icon: <UserCog className="h-4 w-4" />, roles: ["super_admin"] },
  { href: "/admin/pengguna", label: "Pengguna & Peran", icon: <ShieldCheck className="h-4 w-4" />, roles: ["super_admin"] },
  { href: "/admin/pengaturan", label: "Pengaturan", icon: <Settings className="h-4 w-4" />, roles: ["super_admin"] },
];

export function AdminShell({
  role,
  email,
  children,
}: {
  role: UserRole;
  email?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const visible = MENU.filter((m) => m.roles.includes(role));

  const logout = () => {
    startTransition(async () => {
      await signOutAction();
      router.push("/admin/login");
      router.refresh();
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6 lg:flex-row">
      <button
        type="button"
        className="inline-flex w-fit items-center gap-2 rounded-lg border border-forest-100 bg-white px-3 py-2 text-sm font-bold lg:hidden"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />} Menu admin
      </button>
      <aside className={cn("w-full shrink-0 lg:w-60", open ? "block" : "hidden lg:block")}>
        <nav aria-label="Menu admin" className="flex flex-col gap-1 rounded-2xl border border-forest-100 bg-white p-3">
          <p className="px-2 pb-2 text-xs font-bold uppercase text-stone-500">Dashboard Admin</p>
          {visible.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              onClick={() => setOpen(false)}
              aria-current={pathname === m.href ? "page" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold",
                pathname === m.href ? "bg-forest-900 text-white" : "text-forest-900 hover:bg-forest-50"
              )}
            >
              {m.icon} {m.label}
            </Link>
          ))}
          <div className="mt-2 border-t border-forest-100 pt-3">
            <p className="px-2 text-xs text-stone-500">{email} • {role.replace("_", " ")}</p>
            <button type="button" onClick={logout} disabled={pending} className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-50">
              <LogOut className="h-4 w-4" /> {pending ? "Keluar…" : "Keluar"}
            </button>
            <Link href="/" className="mt-1 block rounded-lg px-3 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-100">
              ← Kembali ke situs
            </Link>
          </div>
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
