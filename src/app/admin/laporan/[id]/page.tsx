import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/admin-shell";
import { ReportEditor } from "@/components/admin/editors";
import { Card, CardContent } from "@/components/ui/card";
export const metadata = { title: "Edit Laporan" };
export default async function EditLaporanPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(["super_admin", "admin", "editor"]);
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("reports").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return (
    <AdminShell role={user.role!} email={user.email}>
      <div className="flex flex-col gap-4"><h1 className="text-2xl font-extrabold">Edit Laporan</h1>
      <Card><CardContent className="p-6"><ReportEditor id={id} initial={data as unknown as Record<string, unknown>} /></CardContent></Card></div>
    </AdminShell>
  );
}
