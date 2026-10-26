"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Bold,
  Check,
  CircleAlert,
  ExternalLink,
  Eye,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  PenLine,
  Quote,
  Save,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArticleContent } from "@/components/news/article-content";
import { ARTICLE_ICONS, ARTICLE_ICON_GROUPS } from "@/lib/article-icons";
import { NEWS_CATEGORIES } from "@/lib/constants";
import { cn, formatTanggal, formatTanggalWaktu, slugify } from "@/lib/utils";
import { upsertNewsAction } from "@/app/actions/admin";
import { UploadBox } from "./upload-box";
import { useSubmit } from "./use-submit";

type NewsPreview = {
  title: string;
  summary: string;
  content: string;
  cover: string;
  category: string;
};

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

const toolbarButton =
  "inline-flex h-8 items-center justify-center gap-1 rounded-md px-2 text-xs font-semibold text-stone-600 transition-colors hover:bg-forest-100 hover:text-forest-900";

function ToolButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={toolbarButton}
    >
      {children}
    </button>
  );
}

function IconPicker({ onPick }: { onPick: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const needle = query.trim().toLowerCase();
  const filtered = ARTICLE_ICONS.filter(
    (icon) =>
      !needle ||
      icon.id.includes(needle) ||
      icon.label.toLowerCase().includes(needle)
  );
  const groups = ARTICLE_ICON_GROUPS.map((group) => ({
    group,
    icons: filtered.filter((icon) => icon.group === group),
  })).filter((item) => item.icons.length > 0);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        title="Sisipkan ikon ke artikel"
        aria-label="Sisipkan ikon ke artikel"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          setOpen((value) => !value);
          setQuery("");
        }}
        className={cn(toolbarButton, open && "bg-forest-100 text-forest-900")}
      >
        <Sparkles className="h-4 w-4" />
        <span className="hidden sm:inline">Ikon</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Pilih ikon"
          className="absolute left-0 top-full z-50 mt-2 w-[19rem] max-w-[calc(100vw-2rem)] rounded-xl border border-forest-100 bg-white p-3 shadow-xl shadow-forest-950/10"
        >
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari ikon…"
              aria-label="Cari ikon"
              className="h-9 w-full rounded-lg border border-stone-200 bg-stone-50 pl-8 pr-8 text-sm text-forest-950 placeholder:text-stone-400 focus:border-forest-500 focus:bg-white focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Hapus pencarian"
                className="absolute right-2 top-1/2 grid h-5 w-5 -translate-y-1/2 place-items-center rounded text-stone-400 hover:bg-stone-200 hover:text-stone-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="mt-2 max-h-64 overflow-y-auto pr-1">
            {groups.length === 0 ? (
              <p className="px-2 py-6 text-center text-xs text-stone-500">
                Ikon tidak ditemukan.
              </p>
            ) : (
              groups.map(({ group, icons }) => (
                <div key={group} className="mb-2 last:mb-0">
                  <p className="px-1 pb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-stone-400">
                    {group}
                  </p>
                  <div className="grid grid-cols-7 gap-1">
                    {icons.map(({ id, label, Icon }) => (
                      <button
                        key={id}
                        type="button"
                        title={label}
                        aria-label={label}
                        onClick={() => {
                          onPick(id);
                          setOpen(false);
                          setQuery("");
                        }}
                        className="grid h-8 w-8 place-items-center rounded-lg text-stone-600 transition-colors hover:bg-forest-100 hover:text-forest-900"
                      >
                        <Icon className="h-4 w-4" />
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          <p className="mt-1 border-t border-stone-100 pt-2 text-[11px] leading-snug text-stone-500">
            Ikon tampil otomatis di pratinjau dan artikel publik.
          </p>
        </div>
      )}
    </div>
  );
}

function ArticlePreview({ preview }: { preview: NewsPreview }) {
  return (
    <article className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
        <Badge tone="gray">{preview.category || "Kategori"}</Badge>
        <span>{formatTanggal(new Date())}</span>
      </div>
      <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-forest-950">
        {preview.title || "Judul berita akan tampil di sini"}
      </h2>
      {preview.summary && (
        <p className="text-[15px] leading-relaxed text-stone-600">{preview.summary}</p>
      )}
      {preview.cover && (
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-stone-100">
          <Image
            src={preview.cover}
            alt="Pratinjau gambar sampul"
            fill
            sizes="(max-width: 768px) 100vw, 720px"
            className="object-contain"
            unoptimized
          />
        </div>
      )}
      {preview.content.trim() ? (
        <ArticleContent content={preview.content} />
      ) : (
        <p className="text-sm italic text-stone-400">Isi artikel belum ditulis.</p>
      )}
    </article>
  );
}

function CoverField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <UploadBox onUploaded={onChange} value={value || null} />
      <div className="flex items-center gap-2">
        <input
          type="url"
          name="cover_image_url"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="https://… (atau unggah di atas)"
          aria-label="URL gambar sampul"
          className="h-9 min-w-0 flex-1 rounded-lg border border-stone-300 bg-white px-2.5 text-xs text-forest-950 placeholder:text-stone-400 focus:border-forest-600 focus:outline-none"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="inline-flex h-9 shrink-0 items-center gap-1 rounded-lg px-2 text-xs font-bold text-red-700 hover:bg-red-50"
          >
            <X className="h-3.5 w-3.5" /> Hapus
          </button>
        )}
      </div>
    </div>
  );
}

export function NewsEditor({
  initial,
  id,
  publicHref,
  siteUrl,
}: {
  initial?: Record<string, unknown> | null;
  id: string | null;
  publicHref?: string | null;
  siteUrl?: string;
}) {
  const g = (key: string) => (initial?.[key] as string) ?? "";
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
  const { msg, pending, submit } = useSubmit(upsertNewsAction, id, "/admin/berita", () =>
    setDirty(false)
  );

  const patch =
    (key: keyof NewsPreview) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setPreview((current) => ({ ...current, [key]: event.target.value }));

  const words = preview.content.trim()
    ? preview.content.trim().split(/\s+/).length
    : 0;
  const minutes = Math.max(1, Math.round(words / 200));
  const updatedAt = g("updated_at");
  const siteHost =
    (siteUrl ?? "")
      .replace(/^https?:\/\//i, "")
      .replace(/\/+$/, "") || "webkarangtaruna.vercel.app";
  const slugPreview = slug || slugify(preview.title) || "judul-berita";

  const restoreSelection = (start: number, end = start) => {
    requestAnimationFrame(() => {
      const textarea = contentRef.current;
      if (!textarea) return;
      textarea.focus();
      textarea.setSelectionRange(start, end);
    });
  };

  const insertText = (before: string, after = "", placeholder = "") => {
    const textarea = contentRef.current;
    const value = preview.content;
    const start = textarea?.selectionStart ?? value.length;
    const end = textarea?.selectionEnd ?? value.length;
    const selected = value.slice(start, end);
    const text = selected || placeholder;
    const next = value.slice(0, start) + before + text + after + value.slice(end);

    setPreview((current) => ({ ...current, content: next }));
    setDirty(true);
    restoreSelection(start + before.length, start + before.length + text.length);
  };

  const insertToken = (token: string) => {
    const textarea = contentRef.current;
    const value = preview.content;
    const start = textarea?.selectionStart ?? value.length;
    const end = textarea?.selectionEnd ?? value.length;
    const spacer = start > 0 && !/\s/.test(value.charAt(start - 1)) ? " " : "";
    const insertion = `${spacer}${token}`;
    const next = value.slice(0, start) + insertion + value.slice(end);

    setPreview((current) => ({ ...current, content: next }));
    setDirty(true);
    restoreSelection(start + insertion.length);
  };

  const toggleLinePrefix = (prefix: string) => {
    const textarea = contentRef.current;
    const value = preview.content;
    const start = textarea?.selectionStart ?? value.length;
    const end = textarea?.selectionEnd ?? value.length;
    const lineStart = value.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
    const nextBreak = value.indexOf("\n", lineStart);
    const lineEnd = nextBreak === -1 ? value.length : nextBreak;
    const line = value.slice(lineStart, lineEnd);
    const existing = line.match(/^(#{2,3}\s+|[-*]\s+|\d+[.)]\s+|>\s+)/);
    const content = existing ? line.slice(existing[0].length) : line;
    const nextLine =
      existing && existing[0].trim() === prefix.trim()
        ? content
        : prefix + content;
    const next = value.slice(0, lineStart) + nextLine + value.slice(lineEnd);
    const delta = nextLine.length - line.length;

    setPreview((current) => ({ ...current, content: next }));
    setDirty(true);
    restoreSelection(start + delta, end + delta);
  };

  const onContentKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!(event.ctrlKey || event.metaKey)) return;
    const key = event.key.toLowerCase();

    if (key === "b") {
      event.preventDefault();
      insertText("**", "**", "teks tebal");
    } else if (key === "i") {
      event.preventDefault();
      insertText("*", "*", "teks miring");
    } else if (key === "k") {
      event.preventDefault();
      insertText("[", "](https://)", "teks tautan");
    }
  };

  const updateCover = (url: string) => {
    setPreview((current) => ({ ...current, cover: url }));
    setDirty(true);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        formRef.current?.requestSubmit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  return (
    <form
      ref={formRef}
      onSubmit={submit}
      onChange={() => setDirty(true)}
      className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_330px]"
    >
      <div className="flex min-w-0 flex-col gap-5">
        <Card className="shadow-sm hover:shadow-sm">
          <div className="flex flex-col gap-1 border-b border-forest-100 px-5 py-4 sm:px-6">
            <h2 className="text-sm font-extrabold text-forest-950">Konten berita</h2>
            <p className="text-xs text-stone-500">
              Judul, isi artikel, dan ringkasan yang tampil di situs publik.
            </p>
          </div>
          <CardContent className="flex flex-col gap-6 p-5 sm:p-6">
            <Input
              label="Judul Berita *"
              name="title"
              required
              maxLength={200}
              value={preview.title}
              onChange={patch("title")}
              placeholder="Contoh: Kerja Bakti Bersih Desa Menyambut HUT RI"
              className="h-12 text-base font-bold"
              hint="5–200 karakter, tampil sebagai judul utama artikel."
            />

            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <label
                    htmlFor="content"
                    className="text-sm font-semibold text-forest-950"
                  >
                    Isi Artikel *
                  </label>
                  <p className="text-xs text-stone-500">
                    Format ringan: paragraf, sub-judul, daftar, dan ikon.
                  </p>
                </div>
                <div
                  role="tablist"
                  aria-label="Mode editor"
                  className="inline-flex rounded-lg border border-stone-200 bg-stone-100 p-0.5"
                >
                  {(["tulis", "pratinjau"] as const).map((item) => (
                    <button
                      key={item}
                      type="button"
                      role="tab"
                      aria-selected={tab === item}
                      onClick={() => setTab(item)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-bold capitalize transition-colors",
                        tab === item
                          ? "bg-white text-forest-900 shadow-sm"
                          : "text-stone-500 hover:text-forest-900"
                      )}
                    >
                      {item === "tulis" ? (
                        <PenLine className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div
                className={cn(
                  "rounded-xl border border-stone-300 bg-white shadow-sm transition-colors focus-within:border-forest-500 focus-within:ring-2 focus-within:ring-forest-100",
                  tab === "pratinjau" && "border-forest-100"
                )}
              >
                {tab === "tulis" && (
                  <div
                    role="toolbar"
                    aria-label="Pemformatan teks"
                    className="flex flex-wrap items-center gap-0.5 rounded-t-xl border-b border-stone-200 bg-stone-50/80 px-2 py-1.5"
                  >
                    <ToolButton
                      label="Tebal (Ctrl+B)"
                      onClick={() => insertText("**", "**", "teks tebal")}
                    >
                      <Bold className="h-4 w-4" />
                    </ToolButton>
                    <ToolButton
                      label="Miring (Ctrl+I)"
                      onClick={() => insertText("*", "*", "teks miring")}
                    >
                      <Italic className="h-4 w-4" />
                    </ToolButton>
                    <ToolButton
                      label="Sub-judul H2"
                      onClick={() => toggleLinePrefix("## ")}
                    >
                      <Heading2 className="h-4 w-4" />
                    </ToolButton>
                    <ToolButton
                      label="Sub-judul H3"
                      onClick={() => toggleLinePrefix("### ")}
                    >
                      <Heading3 className="h-4 w-4" />
                    </ToolButton>
                    <span className="mx-1 h-4 w-px bg-stone-300" aria-hidden="true" />
                    <ToolButton
                      label="Daftar butir"
                      onClick={() => toggleLinePrefix("- ")}
                    >
                      <List className="h-4 w-4" />
                    </ToolButton>
                    <ToolButton
                      label="Daftar bernomor"
                      onClick={() => toggleLinePrefix("1. ")}
                    >
                      <ListOrdered className="h-4 w-4" />
                    </ToolButton>
                    <ToolButton
                      label="Kutipan"
                      onClick={() => toggleLinePrefix("> ")}
                    >
                      <Quote className="h-4 w-4" />
                    </ToolButton>
                    <span className="mx-1 h-4 w-px bg-stone-300" aria-hidden="true" />
                    <ToolButton
                      label="Tautan (Ctrl+K)"
                      onClick={() => insertText("[", "](https://)", "teks tautan")}
                    >
                      <Link2 className="h-4 w-4" />
                    </ToolButton>
                    <ToolButton
                      label="Garis pemisah"
                      onClick={() => insertToken("\n---\n")}
                    >
                      <Minus className="h-4 w-4" />
                    </ToolButton>
                    <span className="mx-1 h-4 w-px bg-stone-300" aria-hidden="true" />
                    <IconPicker onPick={(iconId) => insertToken(`:icon[${iconId}]`)} />
                  </div>
                )}

                <textarea
                  ref={contentRef}
                  id="content"
                  name="content"
                  required
                  rows={16}
                  value={preview.content}
                  onChange={patch("content")}
                  onKeyDown={onContentKeyDown}
                  placeholder="Tulis isi artikel di sini… Gunakan tombol Ikon untuk menyisipkan simbol ke dalam teks."
                  className={cn(
                    "block min-h-[360px] w-full resize-y rounded-b-xl bg-white px-4 py-3 text-[15px] leading-relaxed text-forest-950 placeholder:text-stone-400 focus:outline-none",
                    tab === "pratinjau" && "hidden"
                  )}
                />

                {tab === "pratinjau" && (
                  <div className="p-5 sm:p-6">
                    <ArticlePreview preview={preview} />
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
                <span>
                  Pisahkan paragraf dengan satu baris kosong. Ikon dirender otomatis
                  di artikel publik.
                </span>
                <span className="font-semibold text-stone-600">
                  {words} kata · ±{minutes} menit baca
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Textarea
                label="Ringkasan"
                name="summary"
                rows={3}
                maxLength={500}
                value={preview.summary}
                onChange={patch("summary")}
                placeholder="1–2 kalimat ringkas yang tampil di kartu berita dan hasil pencarian…"
              />
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
                <span>Tampil di kartu berita dan deskripsi hasil pencarian.</span>
                <span>{preview.summary.length}/500 karakter</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-sm">
          <CardContent className="flex flex-col gap-3 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-extrabold text-forest-950">
                  Pratinjau pencarian
                </h2>
                <p className="text-xs text-stone-500">
                  Meta title dan description dibuat otomatis dari konten.
                </p>
              </div>
              <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-bold text-stone-500">
                Otomatis
              </span>
            </div>
            <div className="rounded-xl border border-stone-200 bg-white p-4">
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-forest-100 text-[9px] font-black text-forest-800">
                  KT
                </span>
                <span className="truncate">
                  {siteHost} <span className="text-stone-400">› berita</span>
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-[17px] font-medium leading-snug text-[#1a0dab]">
                {preview.title || "Judul berita akan tampil di sini"}
              </p>
              <p className="mt-0.5 truncate text-xs text-forest-700">
                {siteHost}/berita/{slugPreview}
              </p>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-stone-600">
                {preview.summary ||
                  "Tambahkan ringkasan agar deskripsi hasil pencarian lebih menarik dan informatif."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <aside className="flex flex-col gap-4 xl:sticky xl:top-6">
        <Card className="border-forest-950 bg-forest-950 text-white shadow-lg shadow-forest-950/15 hover:shadow-lg">
          <CardContent className="flex flex-col gap-4 p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-white/60">
                Penerbitan
              </h2>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-gold-300">
                {STATUS_LABEL[status] ?? status}
              </span>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-white/60">Status</span>
              <select
                name="status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="h-10 rounded-lg border border-white/15 bg-white/10 px-3 text-sm font-semibold text-white outline-none transition-colors focus:border-gold-400 [&>option]:text-forest-950"
              >
                <option value="draft">Draft — belum tampil</option>
                <option value="published">Published — tampil publik</option>
                <option value="archived">Archived — disembunyikan</option>
              </select>
            </label>

            <div className="flex items-start gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-xs">
              {dirty ? (
                <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-300" />
              ) : (
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-forest-300" />
              )}
              <span className={dirty ? "text-white/80" : "text-white/55"}>
                {dirty
                  ? "Ada perubahan yang belum disimpan."
                  : id
                    ? "Semua perubahan sudah tersimpan."
                    : "Artikel baru belum disimpan."}
              </span>
            </div>

            {updatedAt && (
              <p className="text-[11px] text-white/45">
                Terakhir diperbarui {formatTanggalWaktu(updatedAt)}
              </p>
            )}

            {msg && (
              <p
                role={msg.ok ? "status" : "alert"}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-xs font-semibold",
                  msg.ok
                    ? "bg-forest-800 text-forest-50"
                    : "bg-red-950/70 text-red-200"
                )}
              >
                {msg.text}
              </p>
            )}

            <Button
              type="submit"
              variant="gold"
              size="lg"
              disabled={pending}
              className="w-full"
            >
              <Save />
              {pending ? "Menyimpan…" : id ? "Simpan Perubahan" : "Simpan Berita"}
            </Button>

            <button
              type="button"
              onClick={() => setTab((current) => (current === "tulis" ? "pratinjau" : "tulis"))}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-white/15 text-xs font-bold text-white/80 transition-colors hover:bg-white/10"
            >
              <Eye className="h-3.5 w-3.5" />
              {tab === "tulis" ? "Lihat pratinjau" : "Kembali menulis"}
            </button>

            {publicHref && status === "published" && (
              <a
                href={publicHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-gold-300 hover:underline"
              >
                Buka artikel di publik <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}

            <p className="text-[11px] text-white/40">
              Tip: tekan Ctrl/⌘ + S untuk menyimpan.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-sm">
          <CardContent className="flex flex-col gap-4 p-5">
            <div>
              <h2 className="text-sm font-extrabold text-forest-950">Detail</h2>
              <p className="text-xs text-stone-500">
                Kategori dan alamat publik artikel.
              </p>
            </div>

            <Select
              label="Kategori *"
              name="category"
              value={preview.category}
              onChange={patch("category")}
            >
              {NEWS_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="slug" className="text-sm font-semibold text-forest-950">
                Alamat publik
              </label>
              <div className="flex items-center overflow-hidden rounded-lg border border-stone-300 bg-white focus-within:border-forest-600 focus-within:ring-2 focus-within:ring-forest-100">
                <span className="shrink-0 pl-3 text-xs font-semibold text-stone-400">
                  /berita/
                </span>
                <input
                  id="slug"
                  name="slug"
                  value={slug}
                  onChange={(event) => setSlug(slugify(event.target.value))}
                  placeholder={slugify(preview.title) || "judul-berita"}
                  className="h-10 min-w-0 flex-1 bg-transparent px-1.5 text-sm text-forest-950 placeholder:text-stone-400 focus:outline-none"
                />
              </div>
              <p className="break-all text-xs text-stone-500">
                {siteHost}/berita/{slugPreview}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-sm">
          <CardContent className="flex flex-col gap-3 p-5">
            <div>
              <h2 className="text-sm font-extrabold text-forest-950">Gambar sampul</h2>
              <p className="text-xs text-stone-500">
                Rasio ideal 16:9, maksimal 5 MB.
              </p>
            </div>
            <CoverField value={preview.cover} onChange={updateCover} />
          </CardContent>
        </Card>

        <Card className="border-forest-100 bg-forest-50/70 shadow-sm hover:shadow-sm">
          <CardContent className="flex flex-col gap-2 p-5 text-xs text-stone-600">
            <h2 className="text-sm font-extrabold text-forest-950">Panduan singkat</h2>
            <ul className="flex list-disc flex-col gap-1.5 pl-4">
              <li>Judul spesifik dan informatif (5–200 karakter).</li>
              <li>Ringkasan maksimal 500 karakter untuk kartu berita.</li>
              <li>Pisahkan paragraf dengan satu baris kosong.</li>
              <li>Gunakan tombol Ikon untuk menyisipkan simbol di tengah teks.</li>
              <li>Periksa Pratinjau sebelum menerbitkan.</li>
            </ul>
          </CardContent>
        </Card>
      </aside>
    </form>
  );
}
