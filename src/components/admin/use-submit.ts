"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function useSubmit(
  fn: (id: string | null, fd: FormData) => Promise<{ ok: boolean; message: string }>,
  id: string | null,
  redirectTo: string,
  onSuccess?: () => void
) {
  const router = useRouter();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        const res = await fn(id, fd);
        setMsg({ ok: res.ok, text: res.message });
        if (res.ok) {
          onSuccess?.();
          router.push(redirectTo);
          router.refresh();
        }
      } catch {
        setMsg({ ok: false, text: "Gagal menyimpan — muat ulang halaman (Ctrl+Shift+R) lalu coba lagi." });
      }
    });
  };

  return { msg, pending, submit };
}
