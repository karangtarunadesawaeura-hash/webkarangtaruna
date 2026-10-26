"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UploadBox } from "./upload-box";
import { useSubmit } from "./use-submit";
import {
  upsertProgramAction, upsertEventAction,
  upsertBoardMemberAction, upsertReportAction, upsertAnnouncementAction,
  upsertAlbumAction, updateSettingsAction, upsertMembershipAction,
} from "@/app/actions/admin";
import { PROGRAM_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

function ImageUrlField({ name, defaultValue, label = "URL Gambar", onValueChange }: { name: string; defaultValue?: string | null; label?: string; onValueChange?: (v: string) => void }) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const update = (v: string) => {
    setUrl(v);
    onValueChange?.(v);
  };
  return (
    <div className="flex flex-col gap-2">
      <Input label={label} name={name} value={url} onChange={(e) => update(e.target.value)} placeholder="https://… atau unggah di bawah" />
      <UploadBox onUploaded={update} value={url} />
    </div>
  );
}

// ---------- PROGRAM ----------
export function ProgramEditor({ initial, id }: { initial?: Record<string, unknown> | null; id: string | null }) {
  const { msg, pending, submit } = useSubmit(upsertProgramAction, id, "/admin/program");
  const g = (k: string) => (initial?.[k] as string) ?? "";
  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Input label="Judul Program *" name="title" required defaultValue={g("title")} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Kategori *" name="category" defaultValue={g("category") || "Lainnya"}>
          {PROGRAM_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </Select>
        <Select label="Status *" name="status" defaultValue={g("status") || "rencana"}>
          <option value="rencana">Rencana</option>
          <option value="berjalan">Berjalan</option>
          <option value="selesai">Selesai</option>
          <option value="ditunda">Ditunda</option>
        </Select>
      </div>
      <Textarea label="Deskripsi" name="description" rows={5} defaultValue={g("description")} />
      <Textarea label="Target / Sasaran" name="target" rows={3} defaultValue={g("target")} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Input label="Jadwal (teks bebas)" name="schedule" defaultValue={g("schedule")} placeholder="Contoh: Setiap Sabtu" />
        <Input label="Tanggal mulai" name="start_date" type="date" defaultValue={g("start_date")?.slice(0, 10)} />
        <Input label="Tanggal selesai" name="end_date" type="date" defaultValue={g("end_date")?.slice(0, 10)} />
      </div>
      <ImageUrlField name="image_url" defaultValue={g("image_url")} />
      <Textarea label="Hasil / Capaian" name="result" rows={4} defaultValue={g("result")} />
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input type="checkbox" name="is_featured" defaultChecked={Boolean(initial?.is_featured)} className="h-4 w-4 accent-green-900" /> Tampilkan sebagai program unggulan
      </label>
      {msg && <p role={msg.ok ? "status" : "alert"} className={cn("rounded-lg p-3 text-sm font-semibold", msg.ok ? "bg-forest-100 text-forest-800" : "bg-red-50 text-red-700")}>{msg.text}</p>}
      <Button type="submit" disabled={pending}>{pending ? "Menyimpan…" : "Simpan Program"}</Button>
    </form>
  );
}

// ---------- EVENT ----------
export function EventEditor({ initial, id }: { initial?: Record<string, unknown> | null; id: string | null }) {
  const { msg, pending, submit } = useSubmit(upsertEventAction, id, "/admin/kegiatan");
  const g = (k: string) => (initial?.[k] as string) ?? "";
  const dt = (v: string) => (v ? new Date(v).toISOString().slice(0, 16) : "");
  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Input label="Judul Kegiatan *" name="title" required defaultValue={g("title")} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Kategori *" name="category" defaultValue={g("category") || "Kegiatan"} />
        <Input label="Lokasi" name="location" defaultValue={g("location")} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Mulai *" name="starts_at" type="datetime-local" required defaultValue={dt(g("starts_at"))} />
        <Input label="Selesai" name="ends_at" type="datetime-local" defaultValue={dt(g("ends_at"))} />
      </div>
      <Textarea label="Deskripsi" name="description" rows={5} defaultValue={g("description")} />
      <ImageUrlField name="image_url" defaultValue={g("image_url")} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Select label="Status" name="status" defaultValue={g("status") || "mendatang"}>
          <option value="mendatang">Mendatang</option>
          <option value="berlangsung">Berlangsung</option>
          <option value="selesai">Selesai</option>
          <option value="dibatalkan">Dibatalkan</option>
        </Select>
        <Input label="Kuota (opsional)" name="registration_quota" type="number" min={1} defaultValue={g("registration_quota")} />
        <label className="flex items-end gap-2 pb-2 text-sm font-semibold">
          <input type="checkbox" name="registration_open" defaultChecked={Boolean(initial?.registration_open)} className="h-4 w-4 accent-green-900" /> Buka pendaftaran
        </label>
      </div>
      {msg && <p role={msg.ok ? "status" : "alert"} className={cn("rounded-lg p-3 text-sm font-semibold", msg.ok ? "bg-forest-100 text-forest-800" : "bg-red-50 text-red-700")}>{msg.text}</p>}
      <Button type="submit" disabled={pending}>{pending ? "Menyimpan…" : "Simpan Kegiatan"}</Button>
    </form>
  );
}

// ---------- BOARD ----------
// Form: Nama, Jabatan, Urutan, Bidang (pilih dari daftar / tambah baru), Foto (URL + unggah),
// status Aktif. Kolom duties & period tidak dikelola di sini (dipertahankan apa adanya di DB).
export function BoardEditor({ initial, id, divisions }: { initial?: Record<string, unknown> | null; id: string | null; divisions?: string[] }) {
  const { msg, pending, submit } = useSubmit(upsertBoardMemberAction, id, "/admin/pengurus");
  const g = (k: string) => (initial?.[k] as string) ?? "";
  const options = divisions ?? [];
  const currentDivision = g("division");
  const [isNewDivision, setIsNewDivision] = useState(() => Boolean(currentDivision && !options.includes(currentDivision)));
  const [pickedDivision, setPickedDivision] = useState(() => (options.includes(currentDivision) ? currentDivision : ""));
  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Nama *" name="name" required defaultValue={g("name")} placeholder="Nama resmi pengurus" />
        <Input label="Jabatan *" name="position" required defaultValue={g("position")} placeholder="Contoh: Ketua" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Urutan" name="sort_order" type="number" defaultValue={g("sort_order") || "0"} hint="1 = puncak bagan, 2–4 = pengurus inti" />
        {isNewDivision ? (
          <div className="flex flex-col gap-1.5">
            <Input label="Bidang baru *" name="division" required defaultValue={currentDivision} placeholder="Contoh: Humas" />
            <button type="button" onClick={() => setIsNewDivision(false)} className="w-fit text-xs font-bold text-forest-700 hover:underline">
              ← Pilih dari daftar bidang
            </button>
          </div>
        ) : (
          <Select
            label="Bidang"
            name="division"
            value={pickedDivision}
            onChange={(e) => {
              if (e.target.value === "__new__") setIsNewDivision(true);
              else setPickedDivision(e.target.value);
            }}
          >
            <option value="">— Tanpa bidang —</option>
            {options.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
            <option value="__new__">＋ Bidang baru…</option>
          </Select>
        )}
      </div>
      <ImageUrlField name="photo_url" defaultValue={g("photo_url")} />
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input type="checkbox" name="is_active" defaultChecked={initial?.is_active !== false} className="h-4 w-4 accent-green-900" /> Aktif (tampil di publik)
      </label>
      {msg && <p role={msg.ok ? "status" : "alert"} className={cn("rounded-lg p-3 text-sm font-semibold", msg.ok ? "bg-forest-100 text-forest-800" : "bg-red-50 text-red-700")}>{msg.text}</p>}
      <Button type="submit" disabled={pending}>{pending ? "Menyimpan…" : "Simpan Pengurus"}</Button>
    </form>
  );
}

// ---------- REPORT ----------
export function ReportEditor({ initial, id }: { initial?: Record<string, unknown> | null; id: string | null }) {
  const { msg, pending, submit } = useSubmit(upsertReportAction, id, "/admin/laporan");
  const g = (k: string) => (initial?.[k] as string) ?? "";
  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Input label="Judul Laporan *" name="title" required defaultValue={g("title")} />
      <Input label="Periode" name="period" defaultValue={g("period")} placeholder="Contoh: Triwulan I 2026" />
      <Textarea label="Ringkasan" name="summary" rows={5} defaultValue={g("summary")} />
      <Input label="URL Dokumen (PDF)" name="document_url" defaultValue={g("document_url")} placeholder="https://… (unggah via Storage lalu tempel URL/signed URL)" />
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input type="checkbox" name="is_public" defaultChecked={initial?.is_public !== false} className="h-4 w-4 accent-green-900" /> Publikasikan ke publik
      </label>
      {msg && <p role={msg.ok ? "status" : "alert"} className={cn("rounded-lg p-3 text-sm font-semibold", msg.ok ? "bg-forest-100 text-forest-800" : "bg-red-50 text-red-700")}>{msg.text}</p>}
      <Button type="submit" disabled={pending}>{pending ? "Menyimpan…" : "Simpan Laporan"}</Button>
    </form>
  );
}

// ---------- ANNOUNCEMENT ----------
export function AnnouncementEditor({ initial, id }: { initial?: Record<string, unknown> | null; id: string | null }) {
  const { msg, pending, submit } = useSubmit(upsertAnnouncementAction, id, "/admin/pengumuman");
  const g = (k: string) => (initial?.[k] as string) ?? "";
  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Input label="Judul *" name="title" required defaultValue={g("title")} />
      <Textarea label="Isi Pengumuman *" name="content" required rows={6} defaultValue={g("content")} />
      <Input label="Berlaku sampai (opsional)" name="expires_at" type="date" defaultValue={g("expires_at")?.slice(0, 10)} />
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name="is_pinned" defaultChecked={Boolean(initial?.is_pinned)} className="h-4 w-4 accent-green-900" /> Sematkan</label>
        <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name="is_public" defaultChecked={initial?.is_public !== false} className="h-4 w-4 accent-green-900" /> Publik</label>
      </div>
      {msg && <p role={msg.ok ? "status" : "alert"} className={cn("rounded-lg p-3 text-sm font-semibold", msg.ok ? "bg-forest-100 text-forest-800" : "bg-red-50 text-red-700")}>{msg.text}</p>}
      <Button type="submit" disabled={pending}>{pending ? "Menyimpan…" : "Simpan Pengumuman"}</Button>
    </form>
  );
}

// ---------- ALBUM ----------
export function AlbumEditor({ initial, id }: { initial?: Record<string, unknown> | null; id: string | null }) {
  const { msg, pending, submit } = useSubmit(upsertAlbumAction, id, "/admin/galeri");
  const g = (k: string) => (initial?.[k] as string) ?? "";
  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Input label="Judul Album *" name="title" required defaultValue={g("title")} />
      <Textarea label="Deskripsi" name="description" rows={3} defaultValue={g("description")} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Tanggal kegiatan" name="event_date" type="date" defaultValue={g("event_date")?.slice(0, 10)} />
        <ImageUrlField label="URL Sampul" name="cover_image_url" defaultValue={g("cover_image_url")} />
      </div>
      {msg && <p role={msg.ok ? "status" : "alert"} className={cn("rounded-lg p-3 text-sm font-semibold", msg.ok ? "bg-forest-100 text-forest-800" : "bg-red-50 text-red-700")}>{msg.text}</p>}
      <Button type="submit" disabled={pending}>{pending ? "Menyimpan…" : "Simpan Album"}</Button>
    </form>
  );
}

// ---------- MEMBER (tambah manual / edit oleh admin) ----------
export function MemberEditor({ initial, id }: { initial?: Record<string, unknown> | null; id: string | null }) {
  const { msg, pending, submit } = useSubmit(upsertMembershipAction, id, "/admin/anggota");
  const g = (k: string) => (initial?.[k] as string) ?? "";
  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Nama Lengkap *" name="full_name" required defaultValue={g("full_name")} />
        <Input label="Nomor Telepon *" name="phone" required defaultValue={g("phone")} placeholder="Contoh: 0812xxxxxxx" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Email" name="email" type="email" defaultValue={g("email")} />
        <Input label="Tanggal Lahir" name="birth_date" type="date" defaultValue={g("birth_date")?.slice(0, 10)} />
      </div>
      <Input label="Alamat" name="address" defaultValue={g("address")} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Bidang Diminati" name="desired_field" defaultValue={g("desired_field")} />
        <Input label="Minat / Keahlian" name="interests" defaultValue={g("interests")} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Status *" name="status" defaultValue={g("status") || "menunggu"}>
          <option value="menunggu">Menunggu</option>
          <option value="diterima">Diterima (aktif)</option>
          <option value="ditolak">Ditolak</option>
        </Select>
        <Input label="Catatan Internal" name="notes" defaultValue={g("notes")} placeholder="Hanya dibaca admin" />
      </div>
      {msg && <p role={msg.ok ? "status" : "alert"} className={cn("rounded-lg p-3 text-sm font-semibold", msg.ok ? "bg-forest-100 text-forest-800" : "bg-red-50 text-red-700")}>{msg.text}</p>}
      <Button type="submit" disabled={pending}>{pending ? "Menyimpan…" : "Simpan Data Anggota"}</Button>
    </form>
  );
}

// ---------- SETTINGS ----------
export function SettingsEditor({ initial }: { initial?: Record<string, unknown> | null }) {
  const router = useRouter();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const g = (k: string) => (initial?.[k] as string) ?? "";
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        const res = await updateSettingsAction(fd);
        setMsg({ ok: res.ok, text: res.message });
        if (res.ok) router.refresh();
      } catch {
        setMsg({ ok: false, text: "Gagal menyimpan — muat ulang halaman (Ctrl+Shift+R) lalu coba lagi." });
      }
    });
  };
  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Nama Organisasi *" name="org_name" required defaultValue={g("org_name") || "Karang Taruna Desa Waeura"} />
        <Input label="Tagline" name="tagline" defaultValue={g("tagline")} />
      </div>
      <Textarea label="Deskripsi Singkat" name="description" rows={3} defaultValue={g("description")} />
      <Textarea label="Sejarah" name="history" rows={6} defaultValue={g("history")} />
      <Textarea label="Visi" name="vision" rows={3} defaultValue={g("vision")} />
      <Textarea label="Misi (satu per baris)" name="mission" rows={5} defaultValue={g("mission")} />
      <Textarea label="Tujuan" name="objectives" rows={4} defaultValue={g("objectives")} />
      <div className="grid gap-4 sm:grid-cols-2">
        <ImageUrlField label="URL Logo" name="logo_url" defaultValue={g("logo_url")} />
        <ImageUrlField label="URL Foto Hero" name="hero_image_url" defaultValue={g("hero_image_url")} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Alamat" name="address" defaultValue={g("address")} />
        <Input label="Periode Kepengurusan" name="leadership_period" defaultValue={g("leadership_period")} />
        <Input label="Telepon" name="phone" defaultValue={g("phone")} />
        <Input label="Email" name="email" defaultValue={g("email")} />
        <Input label="WhatsApp (angka saja)" name="whatsapp" defaultValue={g("whatsapp")} />
        <Input label="Facebook URL" name="facebook" defaultValue={g("facebook")} />
        <Input label="Instagram URL" name="instagram" defaultValue={g("instagram")} />
        <Input label="YouTube URL" name="youtube" defaultValue={g("youtube")} />
        <Input label="TikTok URL" name="tiktok" defaultValue={g("tiktok")} />
      </div>
      {msg && <p role={msg.ok ? "status" : "alert"} className={cn("rounded-lg p-3 text-sm font-semibold", msg.ok ? "bg-forest-100 text-forest-800" : "bg-red-50 text-red-700")}>{msg.text}</p>}
      <Button type="submit" disabled={pending}>{pending ? "Menyimpan…" : "Simpan Pengaturan"}</Button>
    </form>
  );
}
