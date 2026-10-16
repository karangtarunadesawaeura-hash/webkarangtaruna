"use client";

import { useState, useTransition } from "react";
import { uploadFileAction } from "@/app/actions/admin";

export function UploadBox({ onUploaded }: { onUploaded: (url: string) => void }) {
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-dashed border-forest-200 bg-forest-50/50 p-4">
      <label htmlFor="admin-file" className="text-xs font-bold uppercase text-stone-500">
        Upload gambar (JPG/PNG/WebP, maks 5 MB) ke Storage publik
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="admin-file"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="text-sm"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setMsg(null);
            const fd = new FormData();
            fd.append("file", file);
            fd.append("bucket", "public-assets");
            startTransition(async () => {
              const res = await uploadFileAction(fd);
              setMsg(res.message);
              if (res.ok && res.url) onUploaded(res.url);
            });
          }}
        />
        {pending && <span className="text-xs text-stone-500">Mengunggah…</span>}
      </div>
      {msg && <p role="status" className="break-all text-xs text-stone-600">{msg}</p>}
    </div>
  );
}
