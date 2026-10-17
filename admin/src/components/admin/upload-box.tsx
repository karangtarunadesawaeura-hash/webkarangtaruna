"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Loader2, Pencil, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadFileAction } from "@/app/actions/admin";
import { MediaDialog } from "./media-dialog";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function UploadBox({
  onUploaded,
  value,
  picker = true,
}: {
  onUploaded: (url: string) => void;
  value?: string | null;
  picker?: boolean;
}) {
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickUpload = (file: File | null | undefined) => {
    if (!file) return;
    if (!ALLOWED.includes(file.type)) {
      setMsg(`Tipe berkas tidak diizinkan: ${file.type || "tak dikenal"}.`);
      return;
    }
    if (file.size > MAX_BYTES) {
      setMsg("Ukuran berkas maksimal 5 MB.");
      return;
    }
    setMsg(null);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("bucket", "public-assets");
    startTransition(async () => {
      try {
        const res = await uploadFileAction(fd);
        setMsg(res.message);
        if (res.ok && res.url) onUploaded(res.url);
      } catch {
        setMsg("Unggah gagal — muat ulang halaman (Ctrl+Shift+R) lalu coba lagi.");
      }
    });
  };

  const openChooser = () => {
    if (pending) return;
    setMsg(null);
    if (picker) setDialogOpen(true);
    else inputRef.current?.click();
  };

  const fileName = value ? value.split("/").pop()?.split("?")[0] ?? value : "";

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          quickUpload(f);
        }}
      />
      {value ? (
        <div className="flex items-center gap-3 rounded-xl border border-forest-100 bg-white p-3">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-stone-100">
            <Image src={value} alt="Gambar terpasang" fill sizes="64px" className="object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase text-stone-500">Gambar terpasang</p>
            <p className="truncate text-sm font-semibold text-forest-950" title={fileName}>
              {fileName}
            </p>
          </div>
          <button
            type="button"
            onClick={openChooser}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-forest-200 bg-white px-3 text-xs font-bold text-forest-900 hover:bg-forest-50"
          >
            <Pencil className="h-3.5 w-3.5" /> Ganti
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={openChooser}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            quickUpload(e.dataTransfer.files?.[0]);
          }}
          className={cn(
            "flex w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors",
            dragOver ? "border-gold-500 bg-white" : "border-forest-200 bg-forest-50/50 hover:border-forest-300"
          )}
        >
          {pending ? (
            <Loader2 className="h-6 w-6 animate-spin text-forest-600" />
          ) : (
            <UploadCloud className={cn("h-6 w-6", dragOver ? "text-gold-600" : "text-forest-400")} />
          )}
          <span className="text-sm font-bold text-forest-950">{pending ? "Mengunggah…" : "Upload Gambar"}</span>
          <span className="text-xs text-stone-500">
            {picker
              ? "Klik untuk unggah baru atau pilih foto tersimpan — atau seret berkas ke sini"
              : "Klik atau seret berkas ke sini"}
          </span>
          <span className="text-[11px] text-stone-400">JPG, PNG, WebP, GIF — maks 5 MB</span>
        </button>
      )}
      {msg && <p role="status" className="break-all text-xs font-semibold text-stone-600">{msg}</p>}
      {picker && dialogOpen && (
        <MediaDialog
          onClose={() => setDialogOpen(false)}
          onSelect={(url) => {
            setDialogOpen(false);
            setMsg("Foto dipakai — URL terisi otomatis.");
            onUploaded(url);
          }}
        />
      )}
    </div>
  );
}
