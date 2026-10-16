import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/state";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Kebijakan Privasi" };

export default function KebijakanPrivasiPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-12 sm:px-6">
      <SectionHeading align="left" eyebrow="Privasi" title="Kebijakan Privasi" description="Terakhir diperbarui: 2026. Dokumen ini dapat disesuaikan pengurus melalui dashboard." />
      <Card><CardContent className="flex flex-col gap-4 p-6 text-sm leading-relaxed text-stone-700">
        <section><h2 className="font-bold text-forest-950">1. Data yang kami kumpulkan</h2><p>Kami meminimalkan pengumpulan data pribadi: nama, alamat/dusun, kontak (HP/email), tanggal lahir (opsional), minat dan bidang yang diminati, serta pesan yang Anda kirim. Kami tidak mengumpulkan data sensitif yang tidak diperlukan.</p></section>
        <section><h2 className="font-bold text-forest-950">2. Tujuan penggunaan</h2><p>Data pendaftaran anggota hanya untuk pendataan dan verifikasi keanggotaan. Pesan kontak hanya untuk menindaklanjuti pertanyaan Anda. Data pendaftar tidak ditampilkan kepada publik.</p></section>
        <section><h2 className="font-bold text-forest-950">3. Akses dan penyimpanan</h2><p>Hanya pengurus berwenang (Super Admin/Admin sesuai kewenangan) yang dapat mengakses data pendaftar dan pesan. Akses dilindungi autentikasi, otorisasi peran, dan Row Level Security pada database.</p></section>
        <section><h2 className="font-bold text-forest-950">4. Persetujuan</h2><p>Dengan mencentang persetujuan pada formulir, Anda menyetujui penggunaan data sebagaimana dijelaskan di sini. Anda dapat meminta perbaikan atau penghapusan data dengan menghubungi pengurus.</p></section>
        <section><h2 className="font-bold text-forest-950">5. Keamanan</h2><p>Kami menerapkan validasi input, pembatasan upload, perlindungan spam, dan tidak mencatat kata sandi/token dalam log. Tidak ada kredensial yang ditanam di kode sumber.</p></section>
        <section><h2 className="font-bold text-forest-950">6. Kontak</h2><p>Untuk permintaan akses, perbaikan, atau penghapusan data pribadi, hubungi pengurus melalui halaman Kontak.</p></section>
      </CardContent></Card>
    </div>
  );
}
