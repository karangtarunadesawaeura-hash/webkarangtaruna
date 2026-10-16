"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactInput } from "@/lib/validations";
import { submitContactMessage } from "@/app/actions/public";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ContactForm() {
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = (values: ContactInput) => {
    setMsg(null);
    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => v != null && fd.append(k, String(v)));
    startTransition(async () => {
      const res = await submitContactMessage(fd);
      setMsg({ ok: res.ok, text: res.message });
      if (res.ok) reset();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" {...register("website")} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Nama *" {...register("name")} error={errors.name?.message} placeholder="Nama Anda" />
        <Input label="Email (opsional)" type="email" {...register("email")} error={errors.email?.message} placeholder="nama@email.com" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Nomor HP (opsional)" {...register("phone")} error={errors.phone?.message} placeholder="08xx-xxxx-xxxx" />
        <Input label="Subjek (opsional)" {...register("subject")} error={errors.subject?.message} placeholder="Contoh: Kerja sama kegiatan" />
      </div>
      <Textarea label="Pesan *" rows={5} {...register("message")} error={errors.message?.message} placeholder="Tulis pesan Anda minimal 10 karakter…" />
      {msg && (
        <p role={msg.ok ? "status" : "alert"} className={`rounded-lg p-3 text-sm font-semibold ${msg.ok ? "bg-forest-100 text-forest-800" : "bg-red-50 text-red-700"}`}>
          {msg.text}
        </p>
      )}
      <Button type="submit" disabled={pending}>{pending ? "Mengirim…" : "Kirim Pesan"}</Button>
    </form>
  );
}
