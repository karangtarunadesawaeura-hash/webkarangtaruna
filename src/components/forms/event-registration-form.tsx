"use client";

import { useState, useTransition } from "react";
import { submitEventRegistration } from "@/app/actions/public";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function EventRegistrationForm({ eventId }: { eventId: string }) {
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    fd.set("event_id", eventId);
    startTransition(async () => {
      const res = await submitEventRegistration(fd);
      setMsg({ ok: res.ok, text: res.message });
      if (res.ok) (e.target as HTMLFormElement).reset();
    });
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <Input name="name" label="Nama Lengkap *" required minLength={3} maxLength={100} placeholder="Nama Anda" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="phone" label="Nomor HP" placeholder="08xx-xxxx-xxxx" />
        <Input name="email" label="Email (opsional)" type="email" placeholder="nama@email.com" />
      </div>
      <Textarea name="notes" label="Catatan (opsional)" rows={3} maxLength={500} placeholder="Contoh: membawa peralatan sendiri…" />
      {msg && (
        <p role={msg.ok ? "status" : "alert"} className={`rounded-lg p-3 text-sm font-semibold ${msg.ok ? "bg-forest-100 text-forest-800" : "bg-red-50 text-red-700"}`}>
          {msg.text}
        </p>
      )}
      <Button type="submit" disabled={pending}>{pending ? "Mendaftar…" : "Daftar Kegiatan Ini"}</Button>
    </form>
  );
}
