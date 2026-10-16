"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import {
  adminMembershipSchema,
  announcementSchema,
  boardMemberSchema,
  eventSchema,
  newsSchema,
  organizationSettingsSchema,
  programSchema,
  reportSchema,
} from "@/lib/validations";
import { slugify } from "@/lib/utils";
import type { UserRole } from "@/types/database";

export type ActionResult = { ok: boolean; message: string };

async function requireAdmin(allowed: UserRole[] = ["super_admin", "admin", "editor"]) {
  const user = await getSessionUser();
  if (!user) throw new Error("Anda harus login.");
  if (!user.role || !allowed.includes(user.role)) {
    throw new Error("Anda tidak memiliki izin untuk tindakan ini.");
  }
  return user;
}

async function logActivity(
  supabase: Awaited<ReturnType<typeof createClient>>,
  actorId: string,
  action: string,
  entity: string | null,
  entityId: string | null
) {
  try {
    await supabase.from("activity_logs").insert({ actor_id: actorId, action, entity, entity_id: entityId });
  } catch {
    // Audit tidak boleh menggagalkan operasi utama.
  }
}

function nullIfEmpty(v: FormDataEntryValue | null): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

function boolVal(v: FormDataEntryValue | null): boolean {
  return v === "on" || v === "true" || v === "1";
}

// ---------- AUTH ----------
export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// ---------- NEWS ----------
export async function upsertNewsAction(id: string | null, formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireAdmin();
    const raw = {
      title: String(formData.get("title") ?? ""),
      slug: String(formData.get("slug") ?? ""),
      category: String(formData.get("category") ?? ""),
      summary: nullIfEmpty(formData.get("summary")) ?? "",
      content: String(formData.get("content") ?? ""),
      cover_image_url: nullIfEmpty(formData.get("cover_image_url")) ?? "",
      status: String(formData.get("status") ?? "draft"),
    };
    const parsed = newsSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Data tidak valid." };
    const supabase = await createClient();
    const slug = parsed.data.slug || slugify(parsed.data.title);
    const payload = {
      title: parsed.data.title,
      slug,
      category: parsed.data.category,
      summary: parsed.data.summary || null,
      content: parsed.data.content,
      cover_image_url: parsed.data.cover_image_url || null,
      status: parsed.data.status,
      published_at: parsed.data.status === "published" ? new Date().toISOString() : null,
      created_by: user.id,
    };
    if (id) {
      const { error } = await supabase.from("news").update(payload).eq("id", id);
      if (error) throw error;
      await logActivity(supabase, user.id, "update", "news", id);
    } else {
      const { data, error } = await supabase.from("news").insert(payload).select("id").single();
      if (error) throw error;
      await logActivity(supabase, user.id, "create", "news", (data as { id: string }).id);
    }
    revalidatePath("/berita");
    revalidatePath("/");
    return { ok: true, message: "Berita berhasil disimpan." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Gagal menyimpan berita." };
  }
}

export async function deleteNewsAction(id: string): Promise<ActionResult> {
  try {
    const user = await requireAdmin();
    const supabase = await createClient();
    const { error } = await supabase.from("news").delete().eq("id", id);
    if (error) throw error;
    await logActivity(supabase, user.id, "delete", "news", id);
    revalidatePath("/berita");
    revalidatePath("/");
    return { ok: true, message: "Berita dihapus." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Gagal menghapus." };
  }
}

// ---------- PROGRAMS ----------
export async function upsertProgramAction(id: string | null, formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireAdmin();
    const parsed = programSchema.safeParse({
      title: String(formData.get("title") ?? ""),
      category: String(formData.get("category") ?? ""),
      description: nullIfEmpty(formData.get("description")) ?? "",
      target: nullIfEmpty(formData.get("target")) ?? "",
      status: String(formData.get("status") ?? "rencana"),
      schedule: nullIfEmpty(formData.get("schedule")) ?? "",
      start_date: nullIfEmpty(formData.get("start_date")) ?? "",
      end_date: nullIfEmpty(formData.get("end_date")) ?? "",
      image_url: nullIfEmpty(formData.get("image_url")) ?? "",
      result: nullIfEmpty(formData.get("result")) ?? "",
      is_featured: boolVal(formData.get("is_featured")),
    });
    if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Data tidak valid." };
    const supabase = await createClient();
    const payload = {
      title: parsed.data.title,
      slug: slugify(parsed.data.title) + "-" + Date.now().toString(36),
      category: parsed.data.category,
      description: parsed.data.description || null,
      target: parsed.data.target || null,
      status: parsed.data.status,
      schedule: parsed.data.schedule || null,
      start_date: parsed.data.start_date || null,
      end_date: parsed.data.end_date || null,
      image_url: parsed.data.image_url || null,
      result: parsed.data.result || null,
      is_featured: parsed.data.is_featured,
      created_by: user.id,
    };
    if (id) {
      // Slug & created_by tidak diubah saat update; judul tetap bisa diubah.
      const { error } = await supabase.from("programs").update({
        title: parsed.data.title,
        category: parsed.data.category,
        description: parsed.data.description || null,
        target: parsed.data.target || null,
        status: parsed.data.status,
        schedule: parsed.data.schedule || null,
        start_date: parsed.data.start_date || null,
        end_date: parsed.data.end_date || null,
        image_url: parsed.data.image_url || null,
        result: parsed.data.result || null,
        is_featured: parsed.data.is_featured,
      }).eq("id", id);
      if (error) throw error;
      await logActivity(supabase, user.id, "update", "programs", id);
    } else {
      const { data, error } = await supabase.from("programs").insert(payload).select("id").single();
      if (error) throw error;
      await logActivity(supabase, user.id, "create", "programs", (data as { id: string }).id);
    }
    revalidatePath("/program");
    revalidatePath("/");
    return { ok: true, message: "Program kerja berhasil disimpan." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Gagal menyimpan program." };
  }
}

export async function deleteProgramAction(id: string): Promise<ActionResult> {
  try {
    const user = await requireAdmin();
    const supabase = await createClient();
    const { error } = await supabase.from("programs").delete().eq("id", id);
    if (error) throw error;
    await logActivity(supabase, user.id, "delete", "programs", id);
    revalidatePath("/program");
    return { ok: true, message: "Program dihapus." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Gagal menghapus." };
  }
}

// ---------- EVENTS ----------
export async function upsertEventAction(id: string | null, formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireAdmin();
    const quotaRaw = nullIfEmpty(formData.get("registration_quota"));
    const parsed = eventSchema.safeParse({
      title: String(formData.get("title") ?? ""),
      category: String(formData.get("category") ?? ""),
      description: nullIfEmpty(formData.get("description")) ?? "",
      location: nullIfEmpty(formData.get("location")) ?? "",
      starts_at: String(formData.get("starts_at") ?? ""),
      ends_at: nullIfEmpty(formData.get("ends_at")) ?? "",
      status: String(formData.get("status") ?? "mendatang"),
      image_url: nullIfEmpty(formData.get("image_url")) ?? "",
      registration_open: boolVal(formData.get("registration_open")),
      registration_quota: quotaRaw ? Number(quotaRaw) : null,
    });
    if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Data tidak valid." };
    const supabase = await createClient();
    const base = {
      title: parsed.data.title,
      category: parsed.data.category,
      description: parsed.data.description || null,
      location: parsed.data.location || null,
      starts_at: new Date(parsed.data.starts_at).toISOString(),
      ends_at: parsed.data.ends_at ? new Date(parsed.data.ends_at).toISOString() : null,
      status: parsed.data.status,
      image_url: parsed.data.image_url || null,
      registration_open: parsed.data.registration_open,
      registration_quota: parsed.data.registration_quota ?? null,
      created_by: user.id,
    };
    if (id) {
      const { error } = await supabase.from("events").update(base).eq("id", id);
      if (error) throw error;
      await logActivity(supabase, user.id, "update", "events", id);
    } else {
      const { data, error } = await supabase.from("events").insert({ ...base, slug: slugify(parsed.data.title) + "-" + Date.now().toString(36) }).select("id").single();
      if (error) throw error;
      await logActivity(supabase, user.id, "create", "events", (data as { id: string }).id);
    }
    revalidatePath("/agenda");
    return { ok: true, message: "Kegiatan berhasil disimpan." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Gagal menyimpan kegiatan." };
  }
}

export async function deleteEventAction(id: string): Promise<ActionResult> {
  try {
    const user = await requireAdmin();
    const supabase = await createClient();
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) throw error;
    await logActivity(supabase, user.id, "delete", "events", id);
    revalidatePath("/agenda");
    return { ok: true, message: "Kegiatan dihapus." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Gagal menghapus." };
  }
}

// ---------- BOARD MEMBERS ----------
export async function upsertBoardMemberAction(id: string | null, formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireAdmin(["super_admin", "admin"]);
    const parsed = boardMemberSchema.safeParse({
      name: String(formData.get("name") ?? ""),
      position: String(formData.get("position") ?? ""),
      division: nullIfEmpty(formData.get("division")) ?? "",
      duties: nullIfEmpty(formData.get("duties")) ?? "",
      photo_url: nullIfEmpty(formData.get("photo_url")) ?? "",
      period: nullIfEmpty(formData.get("period")) ?? "",
      sort_order: Number(formData.get("sort_order") ?? 0),
      is_active: boolVal(formData.get("is_active") ?? "on"),
    });
    if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Data tidak valid." };
    const supabase = await createClient();
    const payload = {
      name: parsed.data.name,
      position: parsed.data.position,
      division: parsed.data.division || null,
      duties: parsed.data.duties || null,
      photo_url: parsed.data.photo_url || null,
      period: parsed.data.period || null,
      sort_order: parsed.data.sort_order,
      is_active: parsed.data.is_active,
    };
    if (id) {
      const { error } = await supabase.from("board_members").update(payload).eq("id", id);
      if (error) throw error;
      await logActivity(supabase, user.id, "update", "board_members", id);
    } else {
      const { data, error } = await supabase.from("board_members").insert(payload).select("id").single();
      if (error) throw error;
      await logActivity(supabase, user.id, "create", "board_members", (data as { id: string }).id);
    }
    revalidatePath("/profil");
    return { ok: true, message: "Data pengurus berhasil disimpan." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Gagal menyimpan pengurus." };
  }
}

export async function deleteBoardMemberAction(id: string): Promise<ActionResult> {
  try {
    const user = await requireAdmin(["super_admin", "admin"]);
    const supabase = await createClient();
    const { error } = await supabase.from("board_members").delete().eq("id", id);
    if (error) throw error;
    await logActivity(supabase, user.id, "delete", "board_members", id);
    revalidatePath("/profil");
    return { ok: true, message: "Data pengurus dihapus." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Gagal menghapus." };
  }
}

// ---------- MEMBERSHIP STATUS ----------
export async function updateMembershipStatusAction(id: string, status: "menunggu" | "diterima" | "ditolak"): Promise<ActionResult> {
  try {
    const user = await requireAdmin(["super_admin", "admin"]);
    const supabase = await createClient();
    const { error } = await supabase.from("membership_applications").update({ status }).eq("id", id);
    if (error) throw error;
    await logActivity(supabase, user.id, `membership:${status}`, "membership_applications", id);
    revalidatePath("/");
    return { ok: true, message: `Status pendaftaran diubah menjadi ${status}.` };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Gagal memperbarui status." };
  }
}

export async function deleteMembershipAction(id: string): Promise<ActionResult> {
  try {
    const user = await requireAdmin(["super_admin", "admin"]);
    const supabase = await createClient();
    const { error } = await supabase.from("membership_applications").delete().eq("id", id);
    if (error) throw error;
    await logActivity(supabase, user.id, "delete", "membership_applications", id);
    return { ok: true, message: "Data pendaftaran dihapus." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Gagal menghapus." };
  }
}

// ---------- MEMBERSHIP UPSERT (tambah manual / edit oleh admin) ----------
export async function upsertMembershipAction(id: string | null, formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireAdmin(["super_admin", "admin"]);
    const parsed = adminMembershipSchema.safeParse({
      full_name: String(formData.get("full_name") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      email: nullIfEmpty(formData.get("email")) ?? "",
      address: nullIfEmpty(formData.get("address")) ?? "",
      birth_date: nullIfEmpty(formData.get("birth_date")) ?? "",
      interests: nullIfEmpty(formData.get("interests")) ?? "",
      desired_field: nullIfEmpty(formData.get("desired_field")) ?? "",
      status: String(formData.get("status") ?? "menunggu"),
      notes: nullIfEmpty(formData.get("notes")) ?? "",
    });
    if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Data tidak valid." };
    const supabase = await createClient();
    const payload = {
      full_name: parsed.data.full_name,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      address: parsed.data.address || null,
      birth_date: parsed.data.birth_date || null,
      interests: parsed.data.interests || null,
      desired_field: parsed.data.desired_field || null,
      status: parsed.data.status,
      notes: parsed.data.notes || null,
      consent_data_usage: true,
    };
    if (id) {
      const { error } = await supabase.from("membership_applications").update(payload).eq("id", id);
      if (error) throw error;
      await logActivity(supabase, user.id, "update", "membership_applications", id);
    } else {
      const { data, error } = await supabase.from("membership_applications").insert(payload).select("id").single();
      if (error) throw error;
      await logActivity(supabase, user.id, "create", "membership_applications", (data as { id: string }).id);
    }
    revalidatePath("/anggota");
    revalidatePath("/");
    return { ok: true, message: "Data anggota berhasil disimpan." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Gagal menyimpan data." };
  }
}

// ---------- CONTACT ----------
export async function markContactReadAction(id: string, isRead: boolean): Promise<ActionResult> {
  try {
    await requireAdmin(["super_admin", "admin"]);
    const supabase = await createClient();
    const { error } = await supabase.from("contact_messages").update({ is_read: isRead }).eq("id", id);
    if (error) throw error;
    return { ok: true, message: "Status pesan diperbarui." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Gagal memperbarui." };
  }
}

export async function deleteContactAction(id: string): Promise<ActionResult> {
  try {
    const user = await requireAdmin(["super_admin", "admin"]);
    const supabase = await createClient();
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) throw error;
    await logActivity(supabase, user.id, "delete", "contact_messages", id);
    return { ok: true, message: "Pesan dihapus." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Gagal menghapus." };
  }
}

// ---------- REPORTS ----------
export async function upsertReportAction(id: string | null, formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireAdmin();
    const parsed = reportSchema.safeParse({
      title: String(formData.get("title") ?? ""),
      period: nullIfEmpty(formData.get("period")) ?? "",
      summary: nullIfEmpty(formData.get("summary")) ?? "",
      document_url: nullIfEmpty(formData.get("document_url")) ?? "",
      is_public: boolVal(formData.get("is_public") ?? "on"),
    });
    if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Data tidak valid." };
    const supabase = await createClient();
    const payload = {
      title: parsed.data.title,
      period: parsed.data.period || null,
      summary: parsed.data.summary || null,
      document_url: parsed.data.document_url || null,
      is_public: parsed.data.is_public,
      published_at: parsed.data.is_public ? new Date().toISOString() : null,
      created_by: user.id,
    };
    if (id) {
      const { error } = await supabase.from("reports").update(payload).eq("id", id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("reports").insert(payload);
      if (error) throw error;
    }
    revalidatePath("/transparansi");
    return { ok: true, message: "Laporan berhasil disimpan." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Gagal menyimpan laporan." };
  }
}

export async function deleteReportAction(id: string): Promise<ActionResult> {
  try {
    const user = await requireAdmin();
    const supabase = await createClient();
    const { error } = await supabase.from("reports").delete().eq("id", id);
    if (error) throw error;
    await logActivity(supabase, user.id, "delete", "reports", id);
    revalidatePath("/transparansi");
    return { ok: true, message: "Laporan dihapus." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Gagal menghapus." };
  }
}

// ---------- ANNOUNCEMENTS ----------
export async function upsertAnnouncementAction(id: string | null, formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireAdmin();
    const parsed = announcementSchema.safeParse({
      title: String(formData.get("title") ?? ""),
      content: String(formData.get("content") ?? ""),
      is_pinned: boolVal(formData.get("is_pinned")),
      is_public: boolVal(formData.get("is_public") ?? "on"),
      expires_at: nullIfEmpty(formData.get("expires_at")) ?? "",
    });
    if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Data tidak valid." };
    const supabase = await createClient();
    const payload = {
      title: parsed.data.title,
      content: parsed.data.content,
      is_pinned: parsed.data.is_pinned,
      is_public: parsed.data.is_public,
      published_at: new Date().toISOString(),
      expires_at: parsed.data.expires_at ? new Date(parsed.data.expires_at).toISOString() : null,
      created_by: user.id,
    };
    if (id) {
      const { error } = await supabase.from("announcements").update(payload).eq("id", id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("announcements").insert(payload);
      if (error) throw error;
    }
    revalidatePath("/");
    return { ok: true, message: "Pengumuman berhasil disimpan." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Gagal menyimpan pengumuman." };
  }
}

export async function deleteAnnouncementAction(id: string): Promise<ActionResult> {
  try {
    const user = await requireAdmin();
    const supabase = await createClient();
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) throw error;
    await logActivity(supabase, user.id, "delete", "announcements", id);
    return { ok: true, message: "Pengumuman dihapus." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Gagal menghapus." };
  }
}

// ---------- GALLERY ----------
export async function upsertAlbumAction(id: string | null, formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireAdmin();
    const title = String(formData.get("title") ?? "").trim();
    if (title.length < 3) return { ok: false, message: "Judul album minimal 3 karakter." };
    const supabase = await createClient();
    const payload = {
      title,
      slug: slugify(title) + "-" + Date.now().toString(36),
      description: nullIfEmpty(formData.get("description")),
      cover_image_url: nullIfEmpty(formData.get("cover_image_url")),
      event_date: nullIfEmpty(formData.get("event_date")),
    };
    if (id) {
      const { error } = await supabase.from("gallery_albums").update({ title, description: payload.description, cover_image_url: payload.cover_image_url, event_date: payload.event_date }).eq("id", id);
      if (error) throw error;
    } else {
      const { data, error } = await supabase.from("gallery_albums").insert(payload).select("id").single();
      if (error) throw error;
      await logActivity(supabase, user.id, "create", "gallery_albums", (data as { id: string }).id);
    }
    revalidatePath("/galeri");
    return { ok: true, message: "Album berhasil disimpan." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Gagal menyimpan album." };
  }
}

export async function deleteAlbumAction(id: string): Promise<ActionResult> {
  try {
    const user = await requireAdmin();
    const supabase = await createClient();
    const { error } = await supabase.from("gallery_albums").delete().eq("id", id);
    if (error) throw error;
    await logActivity(supabase, user.id, "delete", "gallery_albums", id);
    revalidatePath("/galeri");
    return { ok: true, message: "Album beserta fotonya dihapus." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Gagal menghapus." };
  }
}

export async function addPhotoAction(albumId: string, formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    const imageUrl = nullIfEmpty(formData.get("image_url"));
    if (!imageUrl) return { ok: false, message: "URL gambar wajib diisi (gunakan fitur upload terlebih dahulu)." };
    const supabase = await createClient();
    const { error } = await supabase.from("gallery_photos").insert({
      album_id: albumId,
      image_url: imageUrl,
      caption: nullIfEmpty(formData.get("caption")),
      taken_at: nullIfEmpty(formData.get("taken_at")),
    });
    if (error) throw error;
    revalidatePath("/galeri");
    return { ok: true, message: "Foto ditambahkan ke album." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Gagal menambah foto." };
  }
}

export async function deletePhotoAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const supabase = await createClient();
    const { error } = await supabase.from("gallery_photos").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/galeri");
    return { ok: true, message: "Foto dihapus." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Gagal menghapus foto." };
  }
}

// ---------- SETTINGS (super_admin) ----------
export async function updateSettingsAction(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireAdmin(["super_admin"]);
    const parsed = organizationSettingsSchema.safeParse({
      org_name: String(formData.get("org_name") ?? ""),
      tagline: nullIfEmpty(formData.get("tagline")) ?? "",
      description: nullIfEmpty(formData.get("description")) ?? "",
      history: nullIfEmpty(formData.get("history")) ?? "",
      vision: nullIfEmpty(formData.get("vision")) ?? "",
      mission: nullIfEmpty(formData.get("mission")) ?? "",
      objectives: nullIfEmpty(formData.get("objectives")) ?? "",
      logo_url: nullIfEmpty(formData.get("logo_url")) ?? "",
      hero_image_url: nullIfEmpty(formData.get("hero_image_url")) ?? "",
      address: nullIfEmpty(formData.get("address")) ?? "",
      phone: nullIfEmpty(formData.get("phone")) ?? "",
      email: nullIfEmpty(formData.get("email")) ?? "",
      whatsapp: nullIfEmpty(formData.get("whatsapp")) ?? "",
      facebook: nullIfEmpty(formData.get("facebook")) ?? "",
      instagram: nullIfEmpty(formData.get("instagram")) ?? "",
      youtube: nullIfEmpty(formData.get("youtube")) ?? "",
      tiktok: nullIfEmpty(formData.get("tiktok")) ?? "",
      leadership_period: nullIfEmpty(formData.get("leadership_period")) ?? "",
    });
    if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Data tidak valid." };
    const supabase = await createClient();
    const { data: existing } = await supabase.from("organization_settings").select("id").limit(1).maybeSingle();
    const payload = {
      org_name: parsed.data.org_name,
      tagline: parsed.data.tagline || null,
      description: parsed.data.description || null,
      history: parsed.data.history || null,
      vision: parsed.data.vision || null,
      mission: parsed.data.mission || null,
      objectives: parsed.data.objectives || null,
      logo_url: parsed.data.logo_url || null,
      hero_image_url: parsed.data.hero_image_url || null,
      address: parsed.data.address || null,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      whatsapp: parsed.data.whatsapp || null,
      facebook: parsed.data.facebook || null,
      instagram: parsed.data.instagram || null,
      youtube: parsed.data.youtube || null,
      tiktok: parsed.data.tiktok || null,
      leadership_period: parsed.data.leadership_period || null,
      updated_by: user.id,
    };
    if (existing && (existing as { id: string }).id) {
      const { error } = await supabase.from("organization_settings").update(payload).eq("id", (existing as { id: string }).id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("organization_settings").insert(payload);
      if (error) throw error;
    }
    await logActivity(supabase, user.id, "update", "organization_settings", null);
    revalidatePath("/");
    return { ok: true, message: "Pengaturan organisasi berhasil disimpan." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Gagal menyimpan pengaturan." };
  }
}

// ---------- USER ROLES (super_admin) ----------
export async function updateUserRoleAction(userId: string, role: UserRole): Promise<ActionResult> {
  try {
    const me = await requireAdmin(["super_admin"]);
    if (me.id === userId && role !== "super_admin") {
      return { ok: false, message: "Anda tidak dapat menurunkan peran diri sendiri." };
    }
    const supabase = await createClient();
    const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
    if (error) throw error;
    await logActivity(supabase, me.id, `role:${role}`, "profiles", userId);
    return { ok: true, message: "Peran pengguna diperbarui." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Gagal memperbarui peran." };
  }
}

// ---------- UPLOAD ke Storage (validasi tipe & ukuran) ----------
const ALLOWED_UPLOAD = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_BYTES = 5 * 1024 * 1024;

export async function uploadFileAction(formData: FormData): Promise<{ ok: boolean; message: string; url?: string }> {
  try {
    await requireAdmin();
    const file = formData.get("file");
    const bucket = String(formData.get("bucket") ?? "public-assets");
    if (!(file instanceof File) || file.size === 0) return { ok: false, message: "Pilih berkas terlebih dahulu." };
    if (!ALLOWED_UPLOAD.includes(file.type)) return { ok: false, message: `Tipe berkas tidak diizinkan: ${file.type || "tak dikenal"}.` };
    if (file.size > MAX_BYTES) return { ok: false, message: "Ukuran berkas maksimal 5 MB." };
    if (bucket !== "public-assets" && bucket !== "private-docs") return { ok: false, message: "Bucket tidak valid." };

    const supabase = await createClient();
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
    const path = `${new Date().getFullYear()}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw error;
    if (bucket === "public-assets") {
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      return { ok: true, message: "Berkas berhasil diunggah.", url: data.publicUrl };
    }
    return { ok: true, message: `Berkas privat tersimpan di ${path}. Gunakan signed URL untuk mengakses.` };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Upload gagal." };
  }
}
