import { requireRole } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { MemberEditor } from "@/components/admin/editors";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Tambah Anggota" };

export default async function TambahAnggotaPage() {
  const user = await requireRole(["super_admin", "admin"]);
  return (
    <AdminShell role={user.role!} email={user.email}>
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">Tambah Anggota Manual</h1>
          <p className="text-sm text-stone-600">Untuk mencatat anggota yang mendaftar offline. Data tersimpan di tabel yang sama dengan formulir publik.</p>
        </div>
        <Card><CardContent className="p-6"><MemberEditor id={null} initial={null} /></CardContent></Card>
      </div>
    </AdminShell>
  );
}
