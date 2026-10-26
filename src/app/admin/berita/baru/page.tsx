import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { NewsEditor } from "@/components/admin/news-editor";
import { getSiteUrl } from "@/lib/env";

export const metadata = { title: "Berita Baru" };

export default async function BeritaBaruPage() {
  const user = await requireRole(["super_admin", "admin", "editor"]);
  return (
    <AdminShell role={user.role!} email={user.email}>
      <div className="flex flex-col gap-6">
        <div>
          <Link
            href="/admin/berita"
            className="inline-flex items-center gap-1 text-xs font-bold text-forest-700 hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke daftar berita
          </Link>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-forest-950">
            Berita Baru
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-stone-600">
            Tulis judul, isi artikel, dan gambar sampul. Simpan sebagai draft bila belum
            siap terbit.
          </p>
        </div>
        <NewsEditor id={null} siteUrl={getSiteUrl()} />
      </div>
    </AdminShell>
  );
}
