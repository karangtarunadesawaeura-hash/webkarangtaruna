import {
  Award,
  Bike,
  Bird,
  BookOpen,
  Briefcase,
  Building2,
  Bus,
  CalendarDays,
  Camera,
  CircleCheck,
  Clock,
  Cloud,
  Coffee,
  Droplets,
  Fish,
  Flag,
  Flame,
  Flower2,
  Footprints,
  Gift,
  Globe,
  GraduationCap,
  Hammer,
  HandCoins,
  HandHeart,
  Handshake,
  HeartHandshake,
  Home,
  Info,
  Leaf,
  Library,
  Lightbulb,
  Mail,
  Map,
  MapPin,
  Medal,
  Megaphone,
  MessageCircle,
  Microscope,
  Moon,
  Music,
  Navigation,
  Paintbrush,
  Palette,
  PartyPopper,
  Phone,
  Quote,
  Recycle,
  School,
  ShieldCheck,
  Shirt,
  Smile,
  Sparkles,
  Sprout,
  Star,
  Stethoscope,
  Store,
  Sun,
  Target,
  Tractor,
  TreePine,
  TriangleAlert,
  Trophy,
  Truck,
  Users,
  Utensils,
  Wallet,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type ArticleIconGroup =
  | "Kegiatan"
  | "Lokasi"
  | "Sosial"
  | "Alam"
  | "Simbol";

export type ArticleIcon = {
  id: string;
  label: string;
  group: ArticleIconGroup;
  Icon: LucideIcon;
};

export const ARTICLE_ICON_GROUPS: ArticleIconGroup[] = [
  "Kegiatan",
  "Lokasi",
  "Sosial",
  "Alam",
  "Simbol",
];

/**
 * Daftar ikon yang boleh dipakai di isi berita. Token yang disimpan di database
 * berbentuk `:icon[map-pin]`, sehingga aman, ringan, dan bisa dirender konsisten
 * di editor maupun halaman publik.
 */
export const ARTICLE_ICONS: ArticleIcon[] = [
  { id: "megaphone", label: "Pengumuman", group: "Kegiatan", Icon: Megaphone },
  { id: "calendar", label: "Agenda", group: "Kegiatan", Icon: CalendarDays },
  { id: "clock", label: "Waktu", group: "Kegiatan", Icon: Clock },
  { id: "trophy", label: "Prestasi", group: "Kegiatan", Icon: Trophy },
  { id: "award", label: "Penghargaan", group: "Kegiatan", Icon: Award },
  { id: "medal", label: "Medali", group: "Kegiatan", Icon: Medal },
  { id: "target", label: "Target", group: "Kegiatan", Icon: Target },
  { id: "lightbulb", label: "Ide", group: "Kegiatan", Icon: Lightbulb },
  { id: "book-open", label: "Edukasi", group: "Kegiatan", Icon: BookOpen },
  { id: "graduation-cap", label: "Pelatihan", group: "Kegiatan", Icon: GraduationCap },
  { id: "school", label: "Sekolah", group: "Kegiatan", Icon: School },
  { id: "library", label: "Perpustakaan", group: "Kegiatan", Icon: Library },
  { id: "palette", label: "Seni", group: "Kegiatan", Icon: Palette },
  { id: "music", label: "Musik", group: "Kegiatan", Icon: Music },
  { id: "camera", label: "Dokumentasi", group: "Kegiatan", Icon: Camera },
  { id: "microscope", label: "Riset", group: "Kegiatan", Icon: Microscope },
  { id: "party-popper", label: "Perayaan", group: "Kegiatan", Icon: PartyPopper },

  { id: "map-pin", label: "Lokasi", group: "Lokasi", Icon: MapPin },
  { id: "map", label: "Peta", group: "Lokasi", Icon: Map },
  { id: "navigation", label: "Arah", group: "Lokasi", Icon: Navigation },
  { id: "building", label: "Kantor Desa", group: "Lokasi", Icon: Building2 },
  { id: "home", label: "Rumah", group: "Lokasi", Icon: Home },
  { id: "store", label: "UMKM", group: "Lokasi", Icon: Store },
  { id: "bus", label: "Transportasi", group: "Lokasi", Icon: Bus },
  { id: "truck", label: "Logistik", group: "Lokasi", Icon: Truck },
  { id: "tractor", label: "Pertanian", group: "Lokasi", Icon: Tractor },

  { id: "users", label: "Masyarakat", group: "Sosial", Icon: Users },
  { id: "heart-handshake", label: "Kolaborasi", group: "Sosial", Icon: HeartHandshake },
  { id: "hand-heart", label: "Relawan", group: "Sosial", Icon: HandHeart },
  { id: "handshake", label: "Kerja Sama", group: "Sosial", Icon: Handshake },
  { id: "message-circle", label: "Diskusi", group: "Sosial", Icon: MessageCircle },
  { id: "phone", label: "Telepon", group: "Sosial", Icon: Phone },
  { id: "mail", label: "Email", group: "Sosial", Icon: Mail },
  { id: "gift", label: "Donasi", group: "Sosial", Icon: Gift },
  { id: "shirt", label: "Seragam", group: "Sosial", Icon: Shirt },
  { id: "utensils", label: "Konsumsi", group: "Sosial", Icon: Utensils },
  { id: "coffee", label: "Santai", group: "Sosial", Icon: Coffee },
  { id: "stethoscope", label: "Kesehatan", group: "Sosial", Icon: Stethoscope },
  { id: "briefcase", label: "Program", group: "Sosial", Icon: Briefcase },

  { id: "leaf", label: "Lingkungan", group: "Alam", Icon: Leaf },
  { id: "sprout", label: "Pertumbuhan", group: "Alam", Icon: Sprout },
  { id: "tree-pine", label: "Penghijauan", group: "Alam", Icon: TreePine },
  { id: "flower", label: "Keindahan", group: "Alam", Icon: Flower2 },
  { id: "droplets", label: "Kebersihan", group: "Alam", Icon: Droplets },
  { id: "recycle", label: "Daur Ulang", group: "Alam", Icon: Recycle },
  { id: "sun", label: "Pagi", group: "Alam", Icon: Sun },
  { id: "moon", label: "Malam", group: "Alam", Icon: Moon },
  { id: "cloud", label: "Cuaca", group: "Alam", Icon: Cloud },
  { id: "flame", label: "Semangat", group: "Alam", Icon: Flame },
  { id: "bird", label: "Alam Liar", group: "Alam", Icon: Bird },
  { id: "fish", label: "Perikanan", group: "Alam", Icon: Fish },

  { id: "star", label: "Unggulan", group: "Simbol", Icon: Star },
  { id: "sparkles", label: "Baru", group: "Simbol", Icon: Sparkles },
  { id: "check", label: "Selesai", group: "Simbol", Icon: CircleCheck },
  { id: "info", label: "Informasi", group: "Simbol", Icon: Info },
  { id: "alert", label: "Penting", group: "Simbol", Icon: TriangleAlert },
  { id: "flag", label: "Bendera", group: "Simbol", Icon: Flag },
  { id: "shield-check", label: "Aman", group: "Simbol", Icon: ShieldCheck },
  { id: "zap", label: "Cepat", group: "Simbol", Icon: Zap },
  { id: "quote", label: "Kutipan", group: "Simbol", Icon: Quote },
  { id: "wallet", label: "Anggaran", group: "Simbol", Icon: Wallet },
  { id: "hand-coins", label: "Bantuan", group: "Simbol", Icon: HandCoins },
  { id: "wrench", label: "Perbaikan", group: "Simbol", Icon: Wrench },
  { id: "hammer", label: "Kerja Bakti", group: "Simbol", Icon: Hammer },
  { id: "paintbrush", label: "Kreativitas", group: "Simbol", Icon: Paintbrush },
  { id: "smile", label: "Ramah", group: "Simbol", Icon: Smile },
  { id: "globe", label: "Publikasi", group: "Simbol", Icon: Globe },
  { id: "footprints", label: "Kegiatan", group: "Simbol", Icon: Footprints },
  { id: "bike", label: "Olahraga", group: "Simbol", Icon: Bike },
];

export const ARTICLE_ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
  ARTICLE_ICONS.map((item) => [item.id, item.Icon])
);
