import { requireRole } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { AlbumEditor } from "@/components/admin/editors";
import { Card, CardContent } from "@/components/ui/card";
export const metadata = { title: "Album Baru" };
export default async function AlbumBaruPage() {
  const user = await requireRole(["super_admin", "admin", "editor"]);
  return (
    <AdminShell role={user.role!} email={user.email}>
      <div className="flex flex-col gap-4"><h1 className="text-2xl font-extrabold">Album Baru</h1>
      <Card><CardContent className="p-6"><AlbumEditor id={null} /></CardContent></Card></div>
    </AdminShell>
  );
}
