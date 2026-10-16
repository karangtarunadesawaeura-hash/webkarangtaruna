"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { markContactReadAction, deleteContactAction } from "@/app/actions/admin";

export function ContactRowActions({ id, isRead }: { id: string; isRead: boolean }) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      <button type="button" disabled={pending}
        onClick={() => startTransition(async () => { const r = await markContactReadAction(id, !isRead); setMsg(r.message); if (r.ok) router.refresh(); })}
        className="rounded-lg bg-forest-50 px-2.5 py-1.5 text-xs font-bold text-forest-900 hover:bg-forest-100">
        {isRead ? "Tandai belum dibaca" : "Tandai dibaca"}
      </button>
      <button type="button" disabled={pending}
        onClick={() => { if (window.confirm("Hapus pesan ini?")) startTransition(async () => { const r = await deleteContactAction(id); setMsg(r.message); if (r.ok) router.refresh(); }); }}
        className="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100">Hapus</button>
      {msg && <span role="status" className="text-xs text-stone-500">{msg}</span>}
    </span>
  );
}
