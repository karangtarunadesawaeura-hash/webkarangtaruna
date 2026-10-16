import { createClientSafe } from "@/lib/supabase/server";
import { SITE_DEFAULTS } from "@/lib/constants";
import type {
  Announcement,
  BoardMember,
  Event,
  GalleryAlbum,
  GalleryPhoto,
  News,
  OrganizationSettings,
  Program,
  Report,
} from "@/types/database";

async function safeQuery<T>(
  table: string,
  fn: (supabase: NonNullable<Awaited<ReturnType<typeof createClientSafe>>>) => Promise<{ data: T | null; error?: unknown }>
): Promise<T | null> {
  try {
    const supabase = await createClientSafe();
    if (!supabase) return null;
    const { data } = await fn(supabase);
    return data;
  } catch {
    return null;
  }
}

export async function getOrganizationSettings(): Promise<OrganizationSettings | null> {
  return safeQuery<OrganizationSettings[]>("organization_settings", async (supabase) => {
    const res = await supabase
      .from("organization_settings")
      .select("*")
      .limit(1)
      .maybeSingle();
    return res;
  }).then((d) => (Array.isArray(d) ? d[0] ?? null : (d as unknown as OrganizationSettings | null)));
}

export async function getSiteInfo() {
  const settings = await getOrganizationSettings();
  return {
    name: settings?.org_name ?? SITE_DEFAULTS.name,
    tagline: settings?.tagline ?? SITE_DEFAULTS.tagline,
    description: settings?.description ?? SITE_DEFAULTS.description,
    logoUrl: settings?.logo_url ?? null,
    heroImageUrl: settings?.hero_image_url ?? null,
    settings,
  };
}

export async function getPublishedNews(limit = 6): Promise<News[]> {
  const data = await safeQuery<News[]>("news", async (supabase) => {
    const res = await supabase
      .from("news")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(limit);
    return res;
  });
  return data ?? [];
}

export async function getFeaturedPrograms(limit = 3): Promise<Program[]> {
  const data = await safeQuery<Program[]>("programs", async (supabase) => {
    const res = await supabase
      .from("programs")
      .select("*")
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(limit);
    return res;
  });
  return data ?? [];
}

export async function getUpcomingEvents(limit = 3): Promise<Event[]> {
  const data = await safeQuery<Event[]>("events", async (supabase) => {
    const res = await supabase
      .from("events")
      .select("*")
      .in("status", ["mendatang", "berlangsung"])
      .order("starts_at", { ascending: true })
      .limit(limit);
    return res;
  });
  return data ?? [];
}

export async function getBoardMembers(): Promise<BoardMember[]> {
  const data = await safeQuery<BoardMember[]>("board_members", async (supabase) => {
    const res = await supabase
      .from("board_members")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    return res;
  });
  return data ?? [];
}

export async function getGalleryAlbums(limit = 6): Promise<GalleryAlbum[]> {
  const data = await safeQuery<GalleryAlbum[]>("gallery_albums", async (supabase) => {
    const res = await supabase
      .from("gallery_albums")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    return res;
  });
  return data ?? [];
}

export async function getAlbumPhotos(albumId: string): Promise<GalleryPhoto[]> {
  const data = await safeQuery<GalleryPhoto[]>("gallery_photos", async (supabase) => {
    const res = await supabase
      .from("gallery_photos")
      .select("*")
      .eq("album_id", albumId)
      .order("sort_order", { ascending: true });
    return res;
  });
  return data ?? [];
}

export async function getPublicReports(limit = 10): Promise<Report[]> {
  const data = await safeQuery<Report[]>("reports", async (supabase) => {
    const res = await supabase
      .from("reports")
      .select("*")
      .eq("is_public", true)
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(limit);
    return res;
  });
  return data ?? [];
}

export async function getPublicAnnouncements(): Promise<Announcement[]> {
  const data = await safeQuery<Announcement[]>("announcements", async (supabase) => {
    const res = await supabase
      .from("announcements")
      .select("*")
      .eq("is_public", true)
      .order("is_pinned", { ascending: false })
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(10);
    return res;
  });
  return (data ?? []).filter((a) => {
    if (!a.expires_at) return true;
    return new Date(a.expires_at) >= new Date();
  });
}

export async function getStats(): Promise<{
  members: number | null;
  programs: number | null;
  events: number | null;
}> {
  try {
    const supabase = await createClientSafe();
    if (!supabase) return { members: null, programs: null, events: null };
    const [members, programs, events] = await Promise.all([
      supabase.from("board_members").select("id", { count: "exact", head: true }),
      supabase.from("programs").select("id", { count: "exact", head: true }),
      supabase.from("events").select("id", { count: "exact", head: true }),
    ]);
    // Statistik anggota = pengurus aktif + pendaftar diterima (jika tabel ada)
    const { count: accepted } = await supabase
      .from("membership_applications")
      .select("id", { count: "exact", head: true })
      .eq("status", "diterima");
    const boardCount = members.count ?? 0;
    const memberTotal = boardCount + (accepted ?? 0);
    return {
      members: memberTotal,
      programs: programs.count,
      events: events.count,
    };
  } catch {
    return { members: null, programs: null, events: null };
  }
}
