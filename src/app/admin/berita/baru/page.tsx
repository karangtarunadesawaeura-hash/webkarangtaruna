import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { NewsEditor } from "@/components/admin/editors";

export const metadata = { title: "Berita Baru" };

export default async function BeritaBaruPage() {
  const user = await requireRole(["super_admin", "admin", "editor"]);
  return (
    <AdminShell role={user.role!} email={user.email}>
      <div className="flex flex-col gap-5">
        <div>
          <Link href="/admin/berita" className="text-xs font-bold text-forest-700 hover:underline">← Kembali ke daftar berita</Link>
          <h1 className="mt-1 text-2xl font-extrabold">Berita Baru</h1>
          <p className="mt-0.5 text-sm text-stone-600">Tulis judul, isi artikel, dan gambar sampul. Simpan sebagai draft bila belum siap terbit.</p>
        </div>
        <NewsEditor id={null} />
      </div>
    </AdminShell>
  );
}
