import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/admin-shell";
import { BoardEditor } from "@/components/admin/editors";
import { Card, CardContent } from "@/components/ui/card";
export const metadata = { title: "Pengurus Baru" };
export default async function PengurusBaruPage() {
  const user = await requireRole(["super_admin", "admin"]);
  const supabase = await createClient();
  const { data: divRows } = await supabase.from("board_members").select("division").not("division", "is", null);
  const divisions = [...new Set(((divRows as { division: string }[] | null) ?? []).map((r) => r.division.trim()).filter(Boolean))].sort();
  return (
    <AdminShell role={user.role!} email={user.email}>
      <div className="flex flex-col gap-4"><h1 className="text-2xl font-extrabold">Pengurus Baru</h1>
      <Card><CardContent className="p-6"><BoardEditor id={null} divisions={divisions} /></CardContent></Card></div>
    </AdminShell>
  );
}
