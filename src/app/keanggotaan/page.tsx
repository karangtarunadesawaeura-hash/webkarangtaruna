import type { Metadata } from "next";
import { ShieldCheck, ClipboardList, UserCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/state";
import { MembershipForm } from "@/components/forms/membership-form";

export const metadata: Metadata = { title: "Pendaftaran Anggota" };

export default function KeanggotaanPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6">
      <SectionHeading eyebrow="Keanggotaan" title="Gabung Bersama Kami" description="Isi formulir pendaftaran anggota baru Karang Taruna Desa Waeura. Data Anda bersifat privat dan hanya diakses pengurus berwenang." />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card><CardContent className="flex gap-3 p-5">
            <ClipboardList className="h-6 w-6 shrink-0 text-forest-700" />
            <div><h2 className="font-bold">Alur Pendaftaran</h2><p className="text-sm text-stone-600">1. Isi formulir dengan data yang benar. 2. Status awal: <strong>Menunggu</strong>. 3. Pengurus memverifikasi dan menghubungi Anda. 4. Status menjadi <strong>Diterima</strong> atau <strong>Ditolak</strong>.</p></div>
          </CardContent></Card>
          <Card><CardContent className="flex gap-3 p-5">
            <ShieldCheck className="h-6 w-6 shrink-0 text-forest-700" />
            <div><h2 className="font-bold">Privasi Data</h2><p className="text-sm text-stone-600">Kami meminimalkan pengumpulan data pribadi. Data pendaftar tidak ditampilkan ke publik dan hanya digunakan untuk pendataan anggota.</p></div>
          </CardContent></Card>
          <Card><CardContent className="flex gap-3 p-5">
            <UserCheck className="h-6 w-6 shrink-0 text-forest-700" />
            <div><h2 className="font-bold">Syarat Umum</h2><p className="text-sm text-stone-600">Pemuda Desa Waeura yang bersedia aktif, berkarya, dan mengabdi untuk desa. Ketentuan rinci mengikuti aturan organisasi yang ditetapkan pengurus.</p></div>
          </CardContent></Card>
        </div>
        <Card className="lg:col-span-3">
          <CardContent className="p-6">
            <MembershipForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
