import { z } from "zod";

export const membershipSchema = z.object({
  full_name: z
    .string()
    .min(3, "Nama lengkap minimal 3 karakter")
    .max(100, "Nama terlalu panjang"),
  address: z.string().max(255).optional().or(z.literal("")),
  phone: z
    .string()
    .min(9, "Nomor kontak tidak valid")
    .max(20, "Nomor kontak terlalu panjang")
    .regex(/^[+0-9\s-]+$/, "Nomor kontak hanya boleh angka, +, spasi, -"),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  birth_date: z.string().optional().or(z.literal("")),
  interests: z.string().max(500, "Terlalu panjang").optional().or(z.literal("")),
  desired_field: z.string().max(100).optional().or(z.literal("")),
  consent_data_usage: z.literal(true, {
    message: "Anda harus menyetujui penggunaan data pribadi",
  }),
  // Honeypot anti-spam: harus kosong
  website: z.string().max(0, "Spam terdeteksi").optional().or(z.literal("")),
});

export type MembershipInput = z.infer<typeof membershipSchema>;

export const contactSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter").max(100),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
  subject: z.string().max(150).optional().or(z.literal("")),
  message: z
    .string()
    .min(10, "Pesan minimal 10 karakter")
    .max(2000, "Pesan maksimal 2000 karakter"),
  website: z.string().max(0, "Spam terdeteksi").optional().or(z.literal("")),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const eventRegistrationSchema = z.object({
  event_id: z.string().uuid("Kegiatan tidak valid"),
  name: z.string().min(3, "Nama minimal 3 karakter").max(100),
  phone: z.string().min(9, "Nomor kontak tidak valid").max(20).optional().or(z.literal("")),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
  website: z.string().max(0, "Spam terdeteksi").optional().or(z.literal("")),
});

export const newsSchema = z.object({
  title: z.string().min(5, "Judul minimal 5 karakter").max(200),
  slug: z.string().min(3).max(220).optional().or(z.literal("")),
  category: z.string().min(2, "Kategori wajib diisi").max(60),
  summary: z.string().max(500).optional().or(z.literal("")),
  content: z.string().min(20, "Isi artikel minimal 20 karakter"),
  cover_image_url: z.string().url().optional().or(z.literal("")),
  status: z.enum(["draft", "published", "archived"]),
});

export const programSchema = z.object({
  title: z.string().min(5).max(200),
  category: z.string().min(2).max(60),
  description: z.string().max(5000).optional().or(z.literal("")),
  target: z.string().max(1000).optional().or(z.literal("")),
  status: z.enum(["rencana", "berjalan", "selesai", "ditunda"]),
  schedule: z.string().max(255).optional().or(z.literal("")),
  start_date: z.string().optional().or(z.literal("")),
  end_date: z.string().optional().or(z.literal("")),
  image_url: z.string().url().optional().or(z.literal("")),
  result: z.string().max(5000).optional().or(z.literal("")),
  is_featured: z.boolean().default(false),
});

export const eventSchema = z.object({
  title: z.string().min(5).max(200),
  category: z.string().min(2).max(60),
  description: z.string().max(5000).optional().or(z.literal("")),
  location: z.string().max(255).optional().or(z.literal("")),
  starts_at: z.string().min(1, "Waktu mulai wajib diisi"),
  ends_at: z.string().optional().or(z.literal("")),
  status: z.enum(["mendatang", "berlangsung", "selesai", "dibatalkan"]),
  image_url: z.string().url().optional().or(z.literal("")),
  registration_open: z.boolean().default(false),
  registration_quota: z.coerce.number().int().positive().optional().nullable(),
});

export const boardMemberSchema = z.object({
  name: z.string().min(3).max(100),
  position: z.string().min(2).max(100),
  division: z.string().max(100).optional().or(z.literal("")),
  duties: z.string().max(2000).optional().or(z.literal("")),
  photo_url: z.string().url().optional().or(z.literal("")),
  period: z.string().max(50).optional().or(z.literal("")),
  sort_order: z.coerce.number().int().default(0),
  is_active: z.boolean().default(true),
});

export const reportSchema = z.object({
  title: z.string().min(5).max(200),
  period: z.string().max(100).optional().or(z.literal("")),
  summary: z.string().max(5000).optional().or(z.literal("")),
  document_url: z.string().url().optional().or(z.literal("")),
  is_public: z.boolean().default(true),
});

export const announcementSchema = z.object({
  title: z.string().min(5).max(200),
  content: z.string().min(10, "Isi pengumuman minimal 10 karakter"),
  is_pinned: z.boolean().default(false),
  is_public: z.boolean().default(true),
  expires_at: z.string().optional().or(z.literal("")),
});

export const organizationSettingsSchema = z.object({
  org_name: z.string().min(3).max(150),
  tagline: z.string().max(255).optional().or(z.literal("")),
  description: z.string().max(5000).optional().or(z.literal("")),
  history: z.string().max(10000).optional().or(z.literal("")),
  vision: z.string().max(5000).optional().or(z.literal("")),
  mission: z.string().max(10000).optional().or(z.literal("")),
  objectives: z.string().max(10000).optional().or(z.literal("")),
  logo_url: z.string().url().optional().or(z.literal("")),
  hero_image_url: z.string().url().optional().or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  whatsapp: z.string().max(30).optional().or(z.literal("")),
  facebook: z.string().url().optional().or(z.literal("")),
  instagram: z.string().url().optional().or(z.literal("")),
  youtube: z.string().url().optional().or(z.literal("")),
  tiktok: z.string().url().optional().or(z.literal("")),
  leadership_period: z.string().max(50).optional().or(z.literal("")),
});

// Admin menambah/mengedit pendaftar secara manual (tanpa honeypot, status bisa dipilih).
export const adminMembershipSchema = z.object({
  full_name: z.string().min(3, "Nama lengkap minimal 3 karakter").max(100),
  phone: z.string().min(9, "Nomor kontak tidak valid").max(20).regex(/^[+0-9\s-]+$/, "Nomor kontak hanya boleh angka, +, spasi, -"),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  address: z.string().max(255).optional().or(z.literal("")),
  birth_date: z.string().optional().or(z.literal("")),
  interests: z.string().max(500).optional().or(z.literal("")),
  desired_field: z.string().max(100).optional().or(z.literal("")),
  status: z.enum(["menunggu", "diterima", "ditolak"]),
  notes: z.string().max(1000).optional().or(z.literal("")),
});
