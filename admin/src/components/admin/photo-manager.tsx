"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addPhotoAction, deletePhotoAction } from "@/app/actions/admin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UploadBox } from "@/components/admin/upload-box";

export function PhotoManager({ albumId, photos }: { albumId: string; photos: { id: string; image_url: string; caption: string | null }[] }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("image_url", url);
    fd.append("caption", caption);
    startTransition(async () => {
      const res = await addPhotoAction(albumId, fd);
      setMsg(res.message);
      if (res.ok) { setUrl(""); setCaption(""); router.refresh(); }
    });
  };

  const remove = (id: string) => {
    if (!window.confirm("Hapus foto ini?")) return;
    startTransition(async () => {
      const res = await deletePhotoAction(id);
      setMsg(res.message);
      if (res.ok) router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={add} className="flex flex-col gap-3 rounded-2xl border border-forest-100 p-4">
        <h2 className="font-bold">Tambah Foto</h2>
        <UploadBox onUploaded={setUrl} />
        <Input label="URL Gambar *" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://… (otomatis terisi setelah upload)" required />
        <Input label="Caption" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Contoh: Gotong royong, Juni 2026" />
        <Button type="submit" disabled={pending || !url}>{pending ? "Menyimpan…" : "Tambah Foto"}</Button>
        {msg && <p role="status" className="text-sm font-semibold">{msg}</p>}
      </form>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {photos.map((p) => (
          <div key={p.id} className="overflow-hidden rounded-xl border border-forest-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.image_url} alt={p.caption ?? "Foto kegiatan"} className="h-36 w-full object-cover" loading="lazy" />
            <div className="flex items-center justify-between gap-2 p-2">
              <p className="truncate text-xs text-stone-600">{p.caption ?? "—"}</p>
              <button type="button" onClick={() => remove(p.id)} disabled={pending} className="rounded-lg bg-red-50 px-2 py-1 text-xs font-bold text-red-700 hover:bg-red-100">Hapus</button>
            </div>
          </div>
        ))}
        {photos.length === 0 && <p className="col-span-full rounded-xl bg-forest-50 p-6 text-center text-sm text-stone-500">Belum ada foto di album ini.</p>}
      </div>
    </div>
  );
}
