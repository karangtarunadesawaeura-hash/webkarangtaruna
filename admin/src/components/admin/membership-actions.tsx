"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateMembershipStatusAction, deleteMembershipAction } from "@/app/actions/admin";

export function MembershipRowActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const act = (fn: () => Promise<{ ok: boolean; message: string }>) => {
    startTransition(async () => { const r = await fn(); setMsg(r.message); if (r.ok) router.refresh(); });
  };
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {(["menunggu", "diterima", "ditolak"] as const).filter((s) => s !== status).map((s) => (
        <button key={s} type="button" disabled={pending} onClick={() => act(() => updateMembershipStatusAction(id, s))}
          className="rounded-lg bg-forest-50 px-2.5 py-1.5 text-xs font-bold text-forest-900 hover:bg-forest-100 disabled:opacity-50">
          {s === "diterima" ? "Terima" : s === "ditolak" ? "Tolak" : "Menunggu"}
        </button>
      ))}
      <button type="button" disabled={pending}
        onClick={() => { if (window.confirm("Hapus data pendaftaran ini?")) act(() => deleteMembershipAction(id)); }}
        className="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100">Hapus</button>
      {msg && <span role="status" className="text-xs text-stone-500">{msg}</span>}
    </span>
  );
}
