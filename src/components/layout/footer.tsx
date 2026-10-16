import Link from "next/link";
import { Globe, Camera, Play, MapPin, Phone, Mail } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import { Logo } from "./logo";

interface FooterProps {
  orgName: string;
  tagline: string;
  logoUrl?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  youtube?: string | null;
}

export function Footer({
  orgName,
  tagline,
  logoUrl,
  address,
  phone,
  email,
  facebook,
  instagram,
  youtube,
}: FooterProps) {
  return (
    <footer className="bg-forest-950 text-forest-100">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="flex flex-col gap-4">
          <span className="[&_span]:!text-white [&_.text-forest-700]:!text-gold-300">
            <Logo logoUrl={logoUrl} orgName={orgName} />
          </span>
          <p className="text-sm italic text-gold-300">{tagline}</p>
          <p className="text-sm leading-relaxed text-forest-200">
            Organisasi kepemudaan Desa Waeura yang aktif, kreatif, dan terpercaya.
          </p>
          <div className="flex gap-2">
            {facebook && (
              <a
                href={facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook Karang Taruna Desa Waeura"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20"
              >
                <Globe className="h-4 w-4" />
              </a>
            )}
            {instagram && (
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Karang Taruna Desa Waeura"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20"
              >
                <Camera className="h-4 w-4" />
              </a>
            )}
            {youtube && (
              <a
                href={youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube Karang Taruna Desa Waeura"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20"
              >
                <Play className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        <nav aria-label="Tautan navigasi">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gold-400">
            Navigasi
          </h3>
          <ul className="flex flex-col gap-2 text-sm">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-gold-300">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Tautan layanan">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gold-400">
            Layanan
          </h3>
          <ul className="flex flex-col gap-2 text-sm">
            <li>
              <Link href="/keanggotaan" className="hover:text-gold-300">
                Pendaftaran Anggota
              </Link>
            </li>
            <li>
              <Link href="/agenda" className="hover:text-gold-300">
                Agenda Kegiatan
              </Link>
            </li>
            <li>
              <Link href="/transparansi" className="hover:text-gold-300">
                Transparansi & Laporan
              </Link>
            </li>
            <li>
              <Link href="/kebijakan-privasi" className="hover:text-gold-300">
                Kebijakan Privasi
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gold-400">
            Kontak
          </h3>
          <ul className="flex flex-col gap-3 text-sm">
            {address ? (
              <li className="flex gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                <span>{address}</span>
              </li>
            ) : (
              <li className="text-forest-300">
                Alamat sekretariat akan diumumkan oleh pengurus.
              </li>
            )}
            {phone && (
              <li className="flex gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                <span>{phone}</span>
              </li>
            )}
            {email && (
              <li className="flex gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                <span>{email}</span>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-forest-300 sm:flex-row sm:px-6">
          <p>
            © {new Date().getFullYear()} {orgName}. Seluruh hak cipta dilindungi.
          </p>
          <p>Bersatu, Berkarya, Mengabdi untuk Desa.</p>
        </div>
      </div>
    </footer>
  );
}
