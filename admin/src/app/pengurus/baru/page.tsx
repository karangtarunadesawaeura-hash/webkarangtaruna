import { requireRole } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { BoardEditor } from "@/components/admin/editors";
import { Card, CardContent } from "@/components/ui/card";
export const metadata = { title: "Pengurus Baru" };
export default async function PengurusBaruPage() {
  const user = await requireRole(["super_admin", "admin"]);
  return (
    <AdminShell role={user.role!} email={user.email}>
      <div className="flex flex-col gap-4"><h1 className="text-2xl font-extrabold">Pengurus Baru</h1>
      <Card><CardContent className="p-6"><BoardEditor id={null} /></CardContent></Card></div>
    </AdminShell>
  );
}
