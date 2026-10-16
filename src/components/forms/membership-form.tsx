"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { membershipSchema, type MembershipInput } from "@/lib/validations";
import { submitMembershipApplication } from "@/app/actions/public";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function MembershipForm() {
  const [serverMsg, setServerMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MembershipInput>({
    resolver: zodResolver(membershipSchema),
    defaultValues: { consent_data_usage: undefined as unknown as true },
  });

  const onSubmit = (values: MembershipInput) => {
    setServerMsg(null);
    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      fd.append(k, typeof v === "boolean" ? (v ? "on" : "") : String(v));
    });
    startTransition(async () => {
      const res = await submitMembershipApplication(fd);
      setServerMsg({ ok: res.ok, text: res.message });
      if (res.ok) reset();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      {/* Honeypot — disembunyikan dari pengguna */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="hidden"
        {...register("website")}
      />
      <Input label="Nama Lengkap *" placeholder="Contoh: [Nama Anda]" error={errors.full_name?.message} {...register("full_name")} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Nomor HP / WhatsApp *" placeholder="08xx-xxxx-xxxx" error={errors.phone?.message} {...register("phone")} />
        <Input label="Email (opsional)" type="email" placeholder="nama@email.com" error={errors.email?.message} {...register("email")} />
      </div>
      <Input label="Alamat / Dusun (opsional)" placeholder="Contoh: Dusun ..., Desa Waeura" error={errors.address?.message} {...register("address")} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Tanggal Lahir (opsional)" type="date" error={errors.birth_date?.message} {...register("birth_date")} />
        <Select label="Bidang yang Diminati" error={errors.desired_field?.message} {...register("desired_field")} defaultValue="">
          <option value="">— Pilih bidang —</option>
          <option>Pendidikan & Pelatihan</option>
          <option>Olahraga & Seni</option>
          <option>Lingkungan Hidup</option>
          <option>Kewirausahaan</option>
          <option>Sosial & Kemanusiaan</option>
          <option>Keagamaan</option>
          <option>Teknologi & Informasi</option>
        </Select>
      </div>
      <Textarea label="Minat & Pengalaman (opsional)" placeholder="Ceritakan minat, keahlian, atau pengalaman organisasi Anda…" error={errors.interests?.message} {...register("interests")} />
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" className="mt-1 h-4 w-4 accent-green-900" {...register("consent_data_usage")} />
        <span>
          Saya menyetujui penggunaan data pribadi di atas hanya untuk keperluan
          pendataan anggota Karang Taruna Desa Waeura. Baca{" "}
          <a href="/kebijakan-privasi" className="font-bold text-forest-700 underline">
            Kebijakan Privasi
          </a>
          . *
        </span>
      </label>
      {errors.consent_data_usage && (
        <p role="alert" className="text-xs text-red-700">{errors.consent_data_usage.message}</p>
      )}
      {serverMsg && (
        <p role={serverMsg.ok ? "status" : "alert"} className={`rounded-lg p-3 text-sm font-semibold ${serverMsg.ok ? "bg-forest-100 text-forest-800" : "bg-red-50 text-red-700"}`}>
          {serverMsg.text}
        </p>
      )}
      <Button type="submit" disabled={pending} size="lg">
        {pending ? "Mengirim…" : "Kirim Pendaftaran"}
      </Button>
      <p className="text-xs text-stone-500">
        Data pendaftar bersifat privat dan tidak ditampilkan kepada publik. Hanya
        pengurus berwenang yang dapat mengaksesnya.
      </p>
    </form>
  );
}
