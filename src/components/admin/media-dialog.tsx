"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { AlertCircle, Images, Loader2, Search, UploadCloud, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { listMediaAction, uploadFileAction, type MediaItem } from "@/app/actions/admin";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function formatBytes(n: number): string {
  if (!n || n <= 0) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaDialog({
  initialTab = "upload",
  onClose,
  onSelect,
}: {
  initialTab?: "upload" | "library";
  onClose: () => void;
  onSelect: (url: string) => void;
}) {
  const [tab, setTab] = useState<"upload" | "library">(initialTab);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
  const [uploading, startUpload] = useTransition();
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await listMediaAction();
        if (cancelled) return;
        if (res.ok) setItems(res.items);
        else setListError(res.message);
      } catch {
        if (!cancelled) setListError("Gagal memuat daftar foto — muat ulang halaman lalu coba lagi.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const chooseFile = (f: File | null | undefined) => {
    if (!f) return;
    if (!ALLOWED.includes(f.type)) {
      setUploadMsg(`Tipe berkas tidak diizinkan (${f.type || "tak dikenal"}). Gunakan JPG, PNG, WebP, atau GIF.`);
      return;
    }
    if (f.size > MAX_BYTES) {
      setUploadMsg("Ukuran berkas maksimal 5 MB.");
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setUploadMsg(null);
  };

  const doUpload = () => {
    if (!file) {
      setUploadMsg("Pilih atau seret berkas terlebih dahulu.");
      return;
    }
    const fd = new FormData();
    fd.append("file", file);
    fd.append("bucket", "public-assets");
    setUploadMsg(null);
    startUpload(async () => {
      try {
        const res = await uploadFileAction(fd);
        if (res.ok && res.url) onSelect(res.url);
        else setUploadMsg(res.message);
      } catch {
        setUploadMsg("Unggah gagal — muat ulang halaman lalu coba lagi.");
      }
    });
  };

  const trimmed = query.trim().toLowerCase();
  const filtered = trimmed ? (items ?? []).filter((i) => i.name.toLowerCase().includes(trimmed)) : items ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-forest-950/60 p-0 sm:items-center sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Unggah atau pilih foto"
    >
      <div
        className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-forest-100 px-4 py-3">
          <div>
            <h2 className="text-sm font-extrabold text-forest-950">Gambar</h2>
            <p className="text-xs text-stone-500">Unggah berkas baru, atau pakai foto yang pernah diunggah.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="rounded-lg p-2 text-stone-500 hover:bg-forest-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="border-b border-forest-100 px-4 py-3">
          <div className="inline-flex gap-1 rounded-xl bg-forest-50 p-1">
            <button
              type="button"
              onClick={() => setTab("upload")}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-bold transition-colors",
                tab === "upload" ? "bg-white text-forest-950 shadow-sm" : "text-stone-500 hover:text-forest-900"
              )}
            >
              <UploadCloud className="h-4 w-4" /> Unggah Baru
            </button>
            <button
              type="button"
              onClick={() => setTab("library")}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-bold transition-colors",
                tab === "library" ? "bg-white text-forest-950 shadow-sm" : "text-stone-500 hover:text-forest-900"
              )}
            >
              <Images className="h-4 w-4" /> Foto Tersimpan{items ? ` (${items.length})` : ""}
            </button>
          </div>
        </div>

        {tab === "upload" ? (
          <div className="flex flex-col gap-3 overflow-y-auto p-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                chooseFile(f);
              }}
            />
            {file && preview ? (
              <div className="flex flex-col gap-3 rounded-xl border border-forest-100 p-3 sm:flex-row sm:items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt={file.name} className="h-24 w-24 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-forest-950" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-stone-500">{formatBytes(file.size)}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      if (preview) URL.revokeObjectURL(preview);
                      setPreview(null);
                      setUploadMsg(null);
                    }}
                    className="inline-flex h-9 items-center rounded-lg border border-forest-100 px-3 text-xs font-bold text-stone-600 hover:bg-forest-50"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex h-9 items-center rounded-lg border border-forest-200 px-3 text-xs font-bold text-forest-900 hover:bg-forest-50"
                  >
                    Ganti Berkas
                  </button>
                </div>
              </div>
            ) : (
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  chooseFile(e.dataTransfer.files?.[0]);
                }}
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors",
                  dragOver ? "border-gold-500 bg-white" : "border-forest-200 bg-forest-50/50 hover:border-forest-300"
                )}
              >
                <UploadCloud className={cn("h-8 w-8", dragOver ? "text-gold-600" : "text-forest-400")} />
                <p className="text-sm font-bold text-forest-950">Seret gambar ke sini atau klik untuk memilih</p>
                <p className="text-xs text-stone-500">JPG, PNG, WebP, atau GIF — maksimal 5 MB</p>
              </div>
            )}

            {uploadMsg && (
              <p role="status" className="flex items-start gap-1.5 text-xs font-semibold text-red-700">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {uploadMsg}
              </p>
            )}

            <div className="flex items-center justify-end gap-2 border-t border-forest-100 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 items-center rounded-lg border border-forest-100 px-4 text-sm font-bold text-stone-600 hover:bg-forest-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={doUpload}
                disabled={uploading || !file}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-forest-900 px-4 text-sm font-bold text-white hover:bg-forest-800 disabled:opacity-50"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                {uploading ? "Mengunggah…" : "Unggah & Pakai"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="border-b border-forest-100 px-4 py-3">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari nama file…"
                  className="h-10 w-full rounded-lg border border-forest-100 bg-white pl-9 pr-3 text-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
                />
              </label>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {items === null && !listError ? (
                <div className="flex items-center justify-center gap-2 py-16 text-sm text-stone-500">
                  <Loader2 className="h-4 w-4 animate-spin" /> Memuat foto…
                </div>
              ) : listError ? (
                <p className="py-16 text-center text-sm font-semibold text-red-700">{listError}</p>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-16 text-center">
                  <Images className="h-8 w-8 text-stone-300" />
                  <p className="text-sm font-semibold text-forest-950">
                    {items && items.length === 0 ? "Belum ada foto terunggah" : "Tidak ada file yang cocok"}
                  </p>
                  <p className="text-xs text-stone-500">Beralih ke tab &quot;Unggah Baru&quot; untuk mengunggah berkas.</p>
                </div>
              ) : (
                <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {filtered.map((item) => (
                    <li key={item.path}>
                      <button
                        type="button"
                        onClick={() => onSelect(item.url)}
                        title={item.name}
                        className="group relative block aspect-square w-full overflow-hidden rounded-xl border border-forest-100 bg-stone-100 hover:border-gold-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
                      >
                        <Image
                          src={item.url}
                          alt={item.name}
                          fill
                          sizes="(max-width: 640px) 33vw, 160px"
                          className="object-cover"
                        />
                        <span className="absolute inset-x-0 bottom-0 truncate bg-forest-950/70 px-2 py-1 text-left text-[10px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                          {item.name}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
