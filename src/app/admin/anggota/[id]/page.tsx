import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/admin-shell";
import { MembershipRowActions } from "@/components/admin/membership-actions";
import { MemberEditor } from "@/components/admin/editors";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatTanggal, formatTanggalWaktu } from "@/lib/utils";

export const metadata = { title: "Detail Pendaftar Anggota" };

export default async function AdminAnggotaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(["super_admin", "admin"]);
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("membership_applications").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const m = data as {
    id: string; full_name: string; address: string | null; phone: string | null;
    email: string | null; birth_date: string | null; interests: string | null;
    desired_field: string | null; consent_data_usage: boolean; status: string;
    notes: string | null; created_at: string; updated_at: string;
  };
  return (
    <AdminShell role={user.role!} email={user.email}>
      <div className="flex flex-col gap-4">
        <Link href="/admin/anggota" className="w-fit text-sm font-bold text-forest-700 hover:underline">← Kembali ke daftar</Link>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-extrabold">{m.full_name}</h1>
            <p className="text-sm text-stone-600">Waktu pendaftaran: {formatTanggalWaktu(m.created_at)} • Diperbarui: {formatTanggalWaktu(m.updated_at)}</p>
          </div>
          <Badge tone={m.status === "diterima" ? "green" : m.status === "ditolak" ? "red" : "gold"}>Status: {m.status}</Badge>
        </div>
        <Card>
          <CardContent className="grid gap-3 p-5 text-sm sm:grid-cols-2">
            <div><p className="text-xs font-bold uppercase text-stone-500">Nama Lengkap</p><p className="font-semibold">{m.full_name}</p></div>
            <div><p className="text-xs font-bold uppercase text-stone-500">Tanggal Lahir</p><p className="font-semibold">{m.birth_date ? formatTanggal(m.birth_date) : "—"}</p></div>
            <div><p className="text-xs font-bold uppercase text-stone-500">Telepon</p><p className="font-semibold">{m.phone ?? "—"}</p></div>
            <div><p className="text-xs font-bold uppercase text-stone-500">Email</p><p className="font-semibold">{m.email ?? "—"}</p></div>
            <div className="sm:col-span-2"><p className="text-xs font-bold uppercase text-stone-500">Alamat</p><p className="font-semibold">{m.address ?? "—"}</p></div>
            <div><p className="text-xs font-bold uppercase text-stone-500">Bidang Diminati</p><p className="font-semibold">{m.desired_field ?? "—"}</p></div>
            <div><p className="text-xs font-bold uppercase text-stone-500">Minat / Keahlian</p><p className="font-semibold">{m.interests ?? "—"}</p></div>
            <div className="sm:col-span-2"><p className="text-xs font-bold uppercase text-stone-500">Persetujuan Data</p><p className="font-semibold">{m.consent_data_usage ? "Ya — bersedia data digunakan untuk keanggotaan" : "Tidak"}</p></div>
            {m.notes ? <div className="sm:col-span-2"><p className="text-xs font-bold uppercase text-stone-500">Catatan Internal</p><p className="font-semibold">{m.notes}</p></div> : null}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-2 p-5">
            <h2 className="font-bold">Verifikasi Pendaftaran</h2>
            <p className="text-xs text-stone-500">Menyetujui berarti mencatat sebagai anggota aktif (sumber statistik anggota). Penolakan tetap menyimpan riwayat.</p>
            <MembershipRowActions id={m.id} status={m.status} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-3 p-5">
            <h2 className="font-bold">Edit Data</h2>
            <MemberEditor id={m.id} initial={data as unknown as Record<string, unknown>} />
          </CardContent>
        </Card>
        <p className="text-xs text-stone-500">Data privat — hanya pengurus berwenang. Jangan menampilkan nomor telepon/alamat di halaman publik.</p>
      </div>
    </AdminShell>
  );
}
