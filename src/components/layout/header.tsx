"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";

export function Header({
  orgName,
  logoUrl,
}: {
  orgName: string;
  logoUrl?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-forest-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label={`${orgName} — Beranda`}>
          <Logo logoUrl={logoUrl} orgName={orgName} />
        </Link>

        <nav aria-label="Navigasi utama" className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                isActive(link.href)
                  ? "bg-forest-900 text-white"
                  : "text-forest-900 hover:bg-forest-50"
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/keanggotaan"
            className="ml-2 inline-flex h-10 items-center rounded-lg bg-gold-500 px-4 text-sm font-bold text-forest-950 hover:bg-gold-400"
          >
            Gabung Kami
          </Link>
        </nav>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-forest-900 hover:bg-forest-50 lg:hidden"
          aria-expanded={open}
          aria-label={open ? "Tutup menu" : "Buka menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav
          aria-label="Navigasi seluler"
          className="border-t border-forest-100 bg-white px-4 py-3 lg:hidden"
        >
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={cn(
                    "block rounded-lg px-3 py-2.5 text-sm font-semibold",
                    isActive(link.href)
                      ? "bg-forest-900 text-white"
                      : "text-forest-900 hover:bg-forest-50"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Link href="/keanggotaan" onClick={() => setOpen(false)} className="block">
                <Button variant="gold" className="w-full">
                  Gabung Bersama Kami
                </Button>
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
