"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Newspaper, CalendarDays, Briefcase, Images,
  FolderOpen, Users, FileText, Megaphone, Settings, LogOut, Inbox, ShieldCheck, Menu, X,
} from "lucide-react";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { signOutAction } from "@/app/actions/admin";
import type { UserRole } from "@/types/database";

const MENU: { href: string; label: string; icon: React.ReactNode; roles: UserRole[] }[] = [
  { href: "/", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" />, roles: ["super_admin", "admin", "editor"] },
  { href: "/anggota", label: "Anggota", icon: <Inbox className="h-4 w-4" />, roles: ["super_admin", "admin"] },
  { href: "/kegiatan", label: "Kegiatan", icon: <CalendarDays className="h-4 w-4" />, roles: ["super_admin", "admin", "editor"] },
  { href: "/laporan", label: "Laporan", icon: <FileText className="h-4 w-4" />, roles: ["super_admin", "admin", "editor"] },
  { href: "/program", label: "Program Kerja", icon: <Briefcase className="h-4 w-4" />, roles: ["super_admin", "admin", "editor"] },
  { href: "/berita", label: "Berita", icon: <Newspaper className="h-4 w-4" />, roles: ["super_admin", "admin", "editor"] },
  { href: "/agenda", label: "Agenda", icon: <CalendarDays className="h-4 w-4" />, roles: ["super_admin", "admin", "editor"] },
  { href: "/galeri", label: "Galeri", icon: <Images className="h-4 w-4" />, roles: ["super_admin", "admin", "editor"] },
  { href: "/media", label: "Media Upload", icon: <FolderOpen className="h-4 w-4" />, roles: ["super_admin", "admin", "editor"] },
  { href: "/pengurus", label: "Pengurus", icon: <Users className="h-4 w-4" />, roles: ["super_admin", "admin"] },
  { href: "/pengguna", label: "Pengguna", icon: <ShieldCheck className="h-4 w-4" />, roles: ["super_admin"] },
  { href: "/pengumuman", label: "Pengumuman", icon: <Megaphone className="h-4 w-4" />, roles: ["super_admin", "admin", "editor"] },
  { href: "/pesan", label: "Pesan Masuk", icon: <Inbox className="h-4 w-4" />, roles: ["super_admin", "admin"] },
  { href: "/pengaturan", label: "Pengaturan", icon: <Settings className="h-4 w-4" />, roles: ["super_admin"] },
];

// URL situs publik (aplikasi terpisah). Bisa dioverride via env, default domain produksi.
const PUBLIC_SITE_URL =
  process.env.NEXT_PUBLIC_PUBLIC_SITE_URL ?? "https://webkarangtaruna.vercel.app";

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
      router.push("/login");
      router.refresh();
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 sm:px-6 lg:flex-row">
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
            <a href={PUBLIC_SITE_URL} target="_blank" rel="noopener noreferrer" className="mt-1 block rounded-lg px-3 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-100">
              ← Lihat situs publik
            </a>
          </div>
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
