"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function DeleteButton({
  id,
  onDelete,
  label = "Hapus",
}: {
  id: string;
  onDelete: (id: string) => Promise<{ ok: boolean; message: string }>;
  label?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        disabled={pending}
        aria-label={`${label} data`}
        className="inline-flex h-8 items-center gap-1 rounded-lg bg-red-50 px-2.5 text-xs font-bold text-red-700 hover:bg-red-100 disabled:opacity-50"
        onClick={() => {
          if (!window.confirm("Hapus data ini? Tindakan ini tidak dapat dibatalkan.")) return;
          startTransition(async () => {
            const res = await onDelete(id);
            setMsg(res.message);
            if (res.ok) router.refresh();
          });
        }}
      >
        <Trash2 className="h-3.5 w-3.5" /> {pending ? "…" : label}
      </button>
      {msg && <span role="status" className="text-xs text-stone-500">{msg}</span>}
    </span>
  );
}
