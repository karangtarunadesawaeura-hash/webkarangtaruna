"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Check, Copy, Search, Trash2 } from "lucide-react";
import { UploadBox } from "./upload-box";
import { checkMediaUsageAction, deleteStorageFileAction, type MediaUsage } from "@/app/actions/admin";

export interface MediaItem {
  path: string;
  url: string;
  name: string;
  size: number;
  createdAt: string;
}

function formatBytes(n: number): string {
  if (!n || n <= 0) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

export function MediaLibrary({ items }: { items: MediaItem[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [checking, setChecking] = useState<string | null>(null);

  const filtered = query.trim()
    ? items.filter((i) => i.name.toLowerCase().includes(query.trim().toLowerCase()))
    : items;

  const copy = async (item: MediaItem) => {
    try {
      await navigator.clipboard.writeText(item.url);
      setCopied(item.path);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setMsg("Gagal menyalin. Salin manual dari tautan gambar.");
    }
  };

  const remove = async (item: MediaItem) => {
    setMsg("Memeriksa pemakaian…");
    setChecking(item.path);
    let usages: MediaUsage[] = [];
    let checked = false;
    try {
      const res = await checkMediaUsageAction(item.url);
      checked = res.ok;
      usages = res.usages ?? [];
    } catch {
      checked = false;
    } finally {
      setChecking(null);
    }

    if (!checked) {
      if (!window.confirm(`Tidak bisa memeriksa pemakaian "${item.name}" sekarang. Tetap hapus?`)) {
        setMsg(null);
        return;
      }
    } else if (usages.length > 0) {
      const lines = usages.map((u) => `• ${u.label} — ${u.field}: ${u.title}`).join("\n");
      if (
        !window.confirm(
          `Foto "${item.name}" masih dipakai di:\n${lines}\n\nYakin hapus? Gambar akan hilang dari bagian tersebut.`
        )
      ) {
        setMsg(`Dibatalkan — foto masih dipakai di ${usages.length} tempat.`);
        return;
      }
    }

    setMsg(null);
    setDeleting(item.path);
    try {
      const res = await deleteStorageFileAction(item.path);
      setMsg(res.message);
      if (res.ok) router.refresh();
    } catch {
      setMsg("Gagal menghapus — muat ulang halaman lalu coba lagi.");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <UploadBox onUploaded={() => router.refresh()} />
      <div className="flex flex-wrap items-center gap-3">
        <label className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama file…"
            className="h-10 w-full rounded-lg border border-forest-100 bg-white pl-9 pr-3 text-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
          />
        </label>
        <span className="text-xs font-semibold text-stone-500">
          {filtered.length} dari {items.length} foto
        </span>
        {msg && <span role="status" className="text-xs font-semibold text-forest-700">{msg}</span>}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-forest-200 bg-forest-50/60 px-6 py-12 text-center">
          <p className="text-base font-bold text-forest-950">Belum ada foto terunggah</p>
          <p className="max-w-md text-sm text-stone-600">
            Gunakan kotak &quot;Upload gambar&quot; di atas, atau unggah lewat halaman Pengaturan / Galeri. Semua file yang
            pernah diunggah akan tampil di sini.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-forest-200 bg-forest-50/60 px-6 py-8 text-center text-sm text-stone-600">
          Tidak ada file yang cocok dengan pencarian.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((item) => (
            <li key={item.path} className="overflow-hidden rounded-2xl border border-forest-100 bg-white">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                title="Buka gambar di tab baru"
                className="relative block aspect-square bg-stone-100"
              >
                <Image src={item.url} alt={item.name} fill sizes="(max-width: 640px) 50vw, 240px" className="object-cover" />
              </a>
              <div className="flex flex-col gap-1 p-3">
                <p className="truncate text-xs font-semibold text-forest-950" title={item.name}>
                  {item.name}
                </p>
                <p className="text-[11px] text-stone-500">
                  {formatDate(item.createdAt)} • {formatBytes(item.size)}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => copy(item)}
                    className="inline-flex h-8 items-center gap-1 rounded-lg bg-forest-50 px-2.5 text-xs font-bold text-forest-900 hover:bg-forest-100"
                  >
                    {copied === item.path ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied === item.path ? "Tersalin" : "Salin URL"}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(item)}
                    disabled={checking === item.path || deleting === item.path}
                    className="inline-flex h-8 items-center gap-1 rounded-lg bg-red-50 px-2.5 text-xs font-bold text-red-700 hover:bg-red-100 disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {checking === item.path || deleting === item.path ? "…" : "Hapus"}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
