"use server";

import { createClientSafe } from "@/lib/supabase/server";
import {
  contactSchema,
  eventRegistrationSchema,
  membershipSchema,
} from "@/lib/validations";

/** Rate-limit sederhana berbasis memori (per proses). Untuk produksi gunakan Redis/Upstash. */
const buckets = new Map<string, { count: number; resetAt: number }>();
function rateLimit(key: string, limit = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || now > entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  entry.count += 1;
  return entry.count <= limit;
}

export type FormResult = { ok: boolean; message: string };

export async function submitMembershipApplication(
  formData: FormData
): Promise<FormResult> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = membershipSchema.safeParse({
    ...raw,
    consent_data_usage: raw.consent_data_usage === "on" || raw.consent_data_usage === "true",
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }
  if (parsed.data.website) return { ok: false, message: "Spam terdeteksi." };
  if (!rateLimit(`member:${parsed.data.phone}`, 3)) {
    return { ok: false, message: "Terlalu banyak percobaan. Coba lagi beberapa saat." };
  }

  const supabase = await createClientSafe();
  if (!supabase) {
    return {
      ok: false,
      message:
        "Layanan pendaftaran belum terhubung ke database. Hubungi pengurus secara langsung.",
    };
  }

  const { error } = await supabase.from("membership_applications").insert({
    full_name: parsed.data.full_name,
    address: parsed.data.address || null,
    phone: parsed.data.phone,
    email: parsed.data.email || null,
    birth_date: parsed.data.birth_date || null,
    interests: parsed.data.interests || null,
    desired_field: parsed.data.desired_field || null,
    consent_data_usage: true,
    status: "menunggu",
  });

  if (error) {
    // Jangan bocorkan detail DB ke publik.
    return { ok: false, message: "Pendaftaran gagal disimpan. Silakan coba lagi." };
  }
  return {
    ok: true,
    message:
      "Pendaftaran berhasil dikirim. Pengurus akan menghubungi Anda setelah verifikasi. Status awal: Menunggu.",
  };
}

export async function submitContactMessage(formData: FormData): Promise<FormResult> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }
  if (parsed.data.website) return { ok: false, message: "Spam terdeteksi." };
  if (!rateLimit(`contact:${parsed.data.name}`, 5)) {
    return { ok: false, message: "Terlalu banyak pesan. Coba lagi nanti." };
  }

  const supabase = await createClientSafe();
  if (!supabase) {
    return { ok: false, message: "Layanan pesan belum terhubung. Silakan hubungi pengurus langsung." };
  }
  const { error } = await supabase.from("contact_messages").insert({
    name: parsed.data.name,
    email: parsed.data.email || null,
    phone: parsed.data.phone || null,
    subject: parsed.data.subject || null,
    message: parsed.data.message,
  });
  if (error) return { ok: false, message: "Pesan gagal dikirim. Silakan coba lagi." };
  return { ok: true, message: "Pesan berhasil dikirim. Terima kasih atas partisipasi Anda." };
}

export async function submitEventRegistration(
  formData: FormData
): Promise<FormResult> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = eventRegistrationSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }
  if (parsed.data.website) return { ok: false, message: "Spam terdeteksi." };

  const supabase = await createClientSafe();
  if (!supabase) return { ok: false, message: "Layanan pendaftaran belum terhubung." };

  // Pastikan pendaftaran masih dibuka.
  const { data: event } = await supabase
    .from("events")
    .select("registration_open, registration_quota")
    .eq("id", parsed.data.event_id)
    .single();
  if (!event || !(event as { registration_open: boolean }).registration_open) {
    return { ok: false, message: "Pendaftaran untuk kegiatan ini sudah ditutup." };
  }

  const { error } = await supabase.from("event_registrations").insert({
    event_id: parsed.data.event_id,
    name: parsed.data.name,
    phone: parsed.data.phone || null,
    email: parsed.data.email || null,
    notes: parsed.data.notes || null,
    status: "terdaftar",
  });
  if (error) return { ok: false, message: "Pendaftaran gagal. Silakan coba lagi." };
  return { ok: true, message: "Anda berhasil terdaftar pada kegiatan ini." };
}
