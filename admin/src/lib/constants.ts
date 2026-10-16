export const SITE_DEFAULTS = {
  name: "Karang Taruna Desa Waeura",
  tagline: "Bersatu, Berkarya, Mengabdi untuk Desa.",
  description:
    "Website resmi Karang Taruna Desa Waeura — pusat informasi kegiatan, program kerja, berita, dan keanggotaan pemuda desa.",
} as const;

export const NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/profil", label: "Profil" },
  { href: "/program", label: "Program Kerja" },
  { href: "/berita", label: "Berita" },
  { href: "/agenda", label: "Agenda" },
  { href: "/galeri", label: "Galeri" },
  { href: "/transparansi", label: "Transparansi" },
  { href: "/kontak", label: "Kontak" },
] as const;

export const PROGRAM_CATEGORIES = [
  "Pendidikan & Pelatihan",
  "Olahraga & Seni",
  "Lingkungan Hidup",
  "Kewirausahaan",
  "Sosial & Kemanusiaan",
  "Keagamaan",
  "Teknologi & Informasi",
  "Lainnya",
] as const;

export const PROGRAM_STATUS_LABEL: Record<string, string> = {
  rencana: "Rencana",
  berjalan: "Berjalan",
  selesai: "Selesai",
  ditunda: "Ditunda",
};

export const EVENT_STATUS_LABEL: Record<string, string> = {
  mendatang: "Mendatang",
  berlangsung: "Berlangsung",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

export const MEMBERSHIP_STATUS_LABEL: Record<string, string> = {
  menunggu: "Menunggu",
  diterima: "Diterima",
  ditolak: "Ditolak",
};

export const NEWS_CATEGORIES = [
  "Kegiatan",
  "Pengumuman",
  "Prestasi",
  "Pelatihan",
  "Bakti Sosial",
  "Lainnya",
] as const;

export const MAX_UPLOAD_MB = 5;
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export const ALLOWED_DOC_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;
