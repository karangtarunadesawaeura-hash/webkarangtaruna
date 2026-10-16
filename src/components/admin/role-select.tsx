"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateUserRoleAction } from "@/app/actions/admin";
import type { UserRole } from "@/types/database";

export function RoleSelect({ userId, current }: { userId: string; current: string }) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  return (
    <span className="inline-flex items-center gap-2">
      <select aria-label="Ubah peran pengguna" defaultValue={current} disabled={pending}
        onChange={(e) => {
          const role = e.target.value as UserRole;
          if (!window.confirm(`Ubah peran menjadi ${role}?`)) { e.target.value = current; return; }
          startTransition(async () => { const r = await updateUserRoleAction(userId, role); setMsg(r.message); if (r.ok) router.refresh(); });
        }}
        className="h-8 rounded-lg border border-stone-300 bg-white px-2 text-xs font-bold">
        <option value="editor">editor</option>
        <option value="admin">admin</option>
        <option value="super_admin">super_admin</option>
      </select>
      {msg && <span role="status" className="text-xs text-stone-500">{msg}</span>}
    </span>
  );
}
