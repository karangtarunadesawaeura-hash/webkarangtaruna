export type UserRole = "super_admin" | "admin" | "editor";

export interface Profile {
  id: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrganizationSettings {
  id: string;
  org_name: string;
  tagline: string | null;
  description: string | null;
  history: string | null;
  vision: string | null;
  mission: string | null;
  objectives: string | null;
  logo_url: string | null;
  hero_image_url: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  facebook: string | null;
  instagram: string | null;
  youtube: string | null;
  tiktok: string | null;
  leadership_period: string | null;
  updated_at: string;
  updated_by: string | null;
}

export interface BoardMember {
  id: string;
  name: string;
  position: string;
  division: string | null;
  duties: string | null;
  photo_url: string | null;
  period: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type ProgramStatus = "rencana" | "berjalan" | "selesai" | "ditunda";

export interface Program {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string | null;
  target: string | null;
  status: ProgramStatus;
  schedule: string | null;
  start_date: string | null;
  end_date: string | null;
  image_url: string | null;
  result: string | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export type NewsStatus = "draft" | "published" | "archived";

export interface News {
  id: string;
  title: string;
  slug: string;
  category: string;
  summary: string | null;
  content: string | null;
  cover_image_url: string | null;
  status: NewsStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export type EventStatus = "mendatang" | "berlangsung" | "selesai" | "dibatalkan";

export interface Event {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string | null;
  location: string | null;
  starts_at: string;
  ends_at: string | null;
  status: EventStatus;
  image_url: string | null;
  registration_open: boolean;
  registration_quota: number | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  status: string;
  created_at: string;
}

export type MembershipStatus = "menunggu" | "diterima" | "ditolak";

export interface MembershipApplication {
  id: string;
  full_name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  birth_date: string | null;
  interests: string | null;
  desired_field: string | null;
  consent_data_usage: boolean;
  status: MembershipStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface GalleryAlbum {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  event_date: string | null;
  created_at: string;
}

export interface GalleryPhoto {
  id: string;
  album_id: string;
  image_url: string;
  caption: string | null;
  taken_at: string | null;
  sort_order: number;
  created_at: string;
}

export interface Report {
  id: string;
  title: string;
  period: string | null;
  summary: string | null;
  document_url: string | null;
  is_public: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface Announcement {
  id: string;
  title: string;
  content: string | null;
  is_pinned: boolean;
  is_public: boolean;
  published_at: string | null;
  expires_at: string | null;
  created_at: string;
  created_by: string | null;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  actor_id: string | null;
  action: string;
  entity: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}
