import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/admin-shell";
import { BoardEditor } from "@/components/admin/editors";
import { Card, CardContent } from "@/components/ui/card";
export const metadata = { title: "Edit Pengurus" };
export default async function EditPengurusPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(["super_admin", "admin"]);
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("board_members").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return (
    <AdminShell role={user.role!} email={user.email}>
      <div className="flex flex-col gap-4"><h1 className="text-2xl font-extrabold">Edit Pengurus</h1>
      <Card><CardContent className="p-6"><BoardEditor id={id} initial={data as unknown as Record<string, unknown>} /></CardContent></Card></div>
    </AdminShell>
  );
}
