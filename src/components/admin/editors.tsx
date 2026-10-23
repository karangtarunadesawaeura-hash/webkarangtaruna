"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { UploadBox } from "./upload-box";
import { BoldIcon, ItalicIcon, ExternalLink } from "lucide-react";
import {
  upsertNewsAction, upsertProgramAction, upsertEventAction,
  upsertBoardMemberAction, upsertReportAction, upsertAnnouncementAction,
  upsertAlbumAction, updateSettingsAction, upsertMembershipAction,
} from "@/app/actions/admin";
import { NEWS_CATEGORIES, PROGRAM_CATEGORIES } from "@/lib/constants";
import { cn, formatTanggal, slugify } from "@/lib/utils";

function useSubmit(
  fn: (id: string | null, fd: FormData) => Promise<{ ok: boolean; message: string }>,
  id: string | null,
  redirectTo: string,
  onSuccess?: () => void
) {
  const router = useRouter();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        const res = await fn(id, fd);
        setMsg({ ok: res.ok, text: res.message });
        if (res.ok) {
          onSuccess?.();
          router.push(redirectTo);
          router.refresh();
        }
      } catch {
        setMsg({ ok: false, text: "Gagal menyimpan — muat ulang halaman (Ctrl+Shift+R) lalu coba lagi." });
      }
    });
  };
  return { msg, pending, submit };
}

const [activeFormat, setActiveFormat] = useState<string | null>(null);

function applyFormatToSelection(format: string) {
  return () => {
    const textarea = document.activeElement as HTMLTextAreaElement;
    if (!textarea || !textarea.value) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let insertText = "";
    
    switch (format) {
      case "bold":
        insertText = selectedText ? `**${selectedText}**` : "**";
        break;
      case "italic":
        insertText = selectedText ? `*${selectedText}*` : "*";
        break;
      case "justify":
        textarea.focus();
        return;
      case "numbered_list":
        insertText = selectedText ? `\n1. ${selectedText}` : "\n1. ";
        break;
      case "icon":
        insertText = selectedText ? `📝 ${selectedText}` : "📝 ";
        break;
      case "header_h2":
        insertText = selectedText ? `**${selectedText}**` : "**Header**";
        break;
      case "header_h3":
        insertText = selectedText ? `*${selectedText}*` : "*Sub-heading*";
        break;
      case "blockquote":
        insertText = selectedText ? `> ${selectedText}` : "> ";
        break;
      case "link":
        insertText = selectedText ? `[${selectedText}](url)` : `[text](url)`;
        break;
      case "hr":
        insertText = "---\n";
        break;
      default:
        insertText = selectedText;
    }
    
    if (insertText !== "") {
      textarea.value = textarea.value.substring(0, start) + insertText + textarea.value.substring(end);
      textarea.selectionStart = start + insertText.length;
      textarea.selectionEnd = start + insertText.length;
    }
    textarea.focus();
  };
}

function handleContentFocus(e: React.FocusEvent<HTMLTextAreaElement>) {
  const textarea = e.target;
  // Reset active format when clicking into the textarea
  setActiveFormat(null);
}

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

// ---------- NEWS ----------
type NewsPreview = {
  title: string;
  summary: string;
  content: string;
  cover: string;
  category: string;
};

function renderContentText(content: string) {
  // Convert formatting markers to HTML
  let html = content
    // Bold: **text** -> <strong className="font-bold">text</strong>
    .replace(/\*\*(.+?)\*\*/g, '<strong className="font-bold">$1</strong>')
    // Italic: *text* -> <em className="italic">text</em>
    .replace(/\*(.+?)\*/g, '<em className="italic">$1</em>')
    // Numbered list items: 1. text -> <li>text</li> (handled by prose or manual)
    .replace(/^(\d+\. )/gm, '<li>$1</li>')
    // Wrap list items in ol if present
    .replace(/<li>/g, '<ol><li>')
    .replace(/<\/li>$/g, '</li></ol>');

  return html;
}

function ArticlePreview({ preview }: { preview: NewsPreview }) {
  const paragraphs = preview.content.split(/\n\n+/).filter((p) => p.trim());
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-forest-100 bg-forest-50/50 p-5 sm:p-7">
      <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Pratinjau tampilan publik</p>
      <article className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
          <Badge tone="gray">{preview.category || "Kategori"}</Badge>
          <span>{formatTanggal(new Date())}</span>
        </div>
        <h2 className="text-xl font-extrabold leading-tight tracking-tight text-forest-950 sm:text-2xl">
          {preview.title || "Judul berita akan tampil di sini"}
        </h2>
        {preview.summary && <p className="text-sm leading-relaxed text-stone-600">{preview.summary}</p>}
        {preview.cover && (
          <div className="relative h-56 w-full overflow-hidden rounded-xl bg-stone-100 sm:h-72">
            <Image src={preview.cover} alt="Pratinjau gambar sampul" fill sizes="(max-width:768px) 100vw, 640px" className="object-contain" unoptimized />
          </div>
        )}
        {paragraphs.length > 0 ? (
          <div className="text-[15px] leading-relaxed text-stone-800">
            {paragraphs.map((p, i) => (
              <p key={i} className="mb-4 whitespace-pre-line" dangerouslySetInnerHTML={{ __html: renderContentText(p) }} />
            ))}
          </div>
        ) : (
          <p className="text-sm italic text-stone-400">Isi artikel belum ditulis.</p>
        )}
      </article>
    </div>
  );
}

export function NewsEditor({ initial, id, publicHref }: { initial?: Record<string, unknown> | null; id: string | null; publicHref?: string | null }) {
  const g = (k: string) => (initial?.[k] as string) ?? "";
  const formRef = useRef<HTMLFormElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [tab, setTab] = useState<"tulis" | "pratinjau">("tulis");
  const [dirty, setDirty] = useState(false);
  const [slug, setSlug] = useState(g("slug"));
  const [status, setStatus] = useState(g("status") || "draft");
  const [preview, setPreview] = useState<NewsPreview>({
    title: g("title"),
    summary: g("summary"),
    content: g("content"),
    cover: g("cover_image_url"),
    category: g("category") || "Kegiatan",
  });
  const { msg, pending, submit } = useSubmit(upsertNewsAction, id, "/admin/berita", () => setDirty(false));

  const patch = (k: keyof NewsPreview) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setPreview((p) => ({ ...p, [k]: e.target.value }));

  const words = preview.content.trim() ? preview.content.trim().split(/\s+/).length : 0;
  const minutes = Math.max(1, Math.round(words / 200));
  const publishedAt = g("published_at");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  return (
    <form
      ref={formRef}
      onSubmit={submit}
      onChange={() => setDirty(true)}
      className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"
    >
      <div className="flex flex-col gap-4">
        <Card>
          <CardContent className="flex flex-col gap-5 p-6">
            <Input
              label="Judul Berita *"
              name="title"
              required
              defaultValue={g("title")}
              onChange={patch("title")}
              placeholder="Contoh: Kerja Bakti Bersih Desa Menyambut HUT RI"
              className="h-12 text-base font-bold"
              hint="5–200 karakter, tampil sebagai judul utama artikel."
            />
            <Input
              label="Slug URL (opsional)"
              name="slug"
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              placeholder={slugify(preview.title) || "otomatis-dari-judul"}
              hint={slug ? `Alamat publik: /berita/${slug}` : "Dikosongkan = otomatis dibuat dari judul."}
            />
            <div className="flex flex-col gap-1.5">
              <Textarea
                label="Ringkasan"
                name="summary"
                rows={3}
                defaultValue={g("summary")}
                onChange={patch("summary")}
                placeholder="1–2 kalimat ringkas yang tampil di kartu berita dan hasil pencarian…"
              />
              <p className="text-right text-xs text-stone-500">{preview.summary.length}/500 karakter</p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex flex-col sm:flex-row gap-2 mb-3">
                <button
                  type="button"
                  className="flex-1 rounded-md bg-forest-100 px-2.5 py-1.5 text-xs font-semibold text-forest-800 hover:bg-forest-200 transition-colors"
                  title="Bold (Ctrl+B)"
                  onClick={applyFormatToSelection("bold")}
                >
                  <BoldIcon className="h-3.5 w-3.5 mr-1" /> Bold
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-md bg-forest-100 px-2.5 py-1.5 text-xs font-semibold text-forest-800 hover:bg-forest-200 transition-colors"
                  title="Italic (Ctrl+I)"
                  onClick={applyFormatToSelection("italic")}
                >
                  <ItalicIcon className="h-3.5 w-3.5 mr-1" /> Italic
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-md bg-forest-100 px-2.5 py-1.5 text-xs font-semibold text-forest-800 hover:bg-forest-200 transition-colors"
                  title="Justify"
                  onClick={applyFormatToSelection("justify")}
                >
                  Justify
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-md bg-forest-100 px-2.5 py-1.5 text-xs font-semibold text-forest-800 hover:bg-forest-200 transition-colors"
                  title="Numbered List"
                  onClick={applyFormatToSelection("numbered_list")}
                >
                  Nomor
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-md bg-forest-100 px-2.5 py-1.5 text-xs font-semibold text-forest-800 hover:bg-forest-200 transition-colors"
                  title="Header H2"
                  onClick={applyFormatToSelection("header_h2")}
                >
                  H2
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-md bg-forest-100 px-2.5 py-1.5 text-xs font-semibold text-forest-800 hover:bg-forest-200 transition-colors"
                  title="Header H3"
                  onClick={applyFormatToSelection("header_h3")}
                >
                  H3
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-md bg-forest-100 px-2.5 py-1.5 text-xs font-semibold text-forest-800 hover:bg-forest-200 transition-colors"
                  title="Blockquote"
                  onClick={applyFormatToSelection("blockquote")}
                >
                  Blockquote
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-md bg-forest-100 px-2.5 py-1.5 text-xs font-semibold text-forest-800 hover:bg-forest-200 transition-colors"
                  title="Link"
                  onClick={applyFormatToSelection("link")}
                >
                  Link
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-md bg-forest-100 px-2.5 py-1.5 text-xs font-semibold text-forest-800 hover:bg-forest-200 transition-colors"
                  title="Horizontal Rule"
                  onClick={applyFormatToSelection("hr")}
                >
                  HR
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-semibold text-forest-950">Isi Artikel *</span>
                <div className="flex items-center gap-1 rounded-lg bg-forest-100 p-1" role="tablist" aria-label="Mode editor">
                  {(["tulis", "pratinjau"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      role="tab"
                      aria-selected={tab === t}
                      onClick={() => setTab(t)}
                      className={cn(
                        "rounded-md px-3 py-1.5 text-xs font-bold capitalize transition-colors",
                        tab === t ? "bg-white text-forest-900 shadow-sm" : "text-stone-600 hover:text-forest-900"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <Textarea
                name="content"
                required
                rows={16}
                defaultValue={g("content")}
                onChange={patch("content")}
                placeholder="Tulis isi artikel di sini…"
                className={cn("min-h-[380px] leading-relaxed", tab === "pratinjau" && "hidden")}
                onFocus={handleContentFocus}
              />
              {tab === "pratinjau" && <ArticlePreview preview={preview} />}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
                <span>Pisahkan paragraf dengan satu baris kosong agar rapi di halaman publik.</span>
                <span>{words} kata · ±{minutes} menit baca</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-4">
        <Card>
          <CardContent className="flex flex-col gap-4 p-5">
            <h2 className="font-extrabold">Terbitkan</h2>
            <Select label="Status *" name="status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="draft">Draft — tersimpan, tidak tampil di publik</option>
              <option value="published">Published — tampil di situs publik</option>
              <option value="archived">Archived — disembunyikan dari publik</option>
            </Select>
            {publishedAt && <p className="text-xs text-stone-500">Terakhir diterbitkan: {formatTanggal(publishedAt)}</p>}
            {msg && (
              <p role={msg.ok ? "status" : "alert"} className={cn("rounded-lg p-3 text-sm font-semibold", msg.ok ? "bg-forest-100 text-forest-800" : "bg-red-50 text-red-700")}>
                {msg.text}
              </p>
            )}
            <Button type="submit" disabled={pending} size="lg" className="w-full">
              {pending ? "Menyimpan…" : id ? "Simpan Perubahan" : "Simpan Berita"}
            </Button>
            {publicHref && status === "published" && (
              <a href={publicHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 text-sm font-bold text-forest-700 hover:underline">
                Lihat di Publik <ExternalLink className="h-4 w-4" />
              </a>
            )}
            <p className="text-xs text-stone-500">Tip: tekan Ctrl+S untuk menyimpan.</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-3 p-5">
            <h2 className="font-extrabold">Gambar Sampul</h2>
            <ImageUrlField name="cover_image_url" defaultValue={g("cover_image_url")} label="URL Gambar" onValueChange={(v) => setPreview((p) => ({ ...p, cover: v }))} />
            <p className="text-xs text-stone-500">Rasio ideal 16:9 (mis. 1280×720). Tampil di kartu berita dan bagian atas artikel.</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-2 p-5">
            <h2 className="font-extrabold">Kategori</h2>
            <Select name="category" aria-label="Kategori berita" value={preview.category} onChange={patch("category")}>
              {NEWS_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </CardContent>
        </Card>

        <Card className="bg-forest-50/60">
          <CardContent className="flex flex-col gap-2 p-5 text-xs text-stone-600">
            <h2 className="text-sm font-extrabold text-forest-950">Panduan singkat</h2>
            <ul className="flex list-disc flex-col gap-1 pl-4">
              <li>Judul spesifik dan informatif (min. 5 karakter).</li>
              <li>Ringkasan maks. 500 karakter untuk kartu berita.</li>
              <li>Pisahkan paragraf dengan satu baris kosong.</li>
              <li>Periksa tab Pratinjau sebelum menerbitkan.</li>
            </ul>
          </CardContent>
        </Card>
      </aside>
    </form>
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
