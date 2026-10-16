import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/admin-shell";
import { SettingsEditor } from "@/components/admin/editors";
import { Card, CardContent } from "@/components/ui/card";
export const metadata = { title: "Pengaturan Organisasi" };
export default async function AdminPengaturanPage() {
  const user = await requireRole(["super_admin"]);
  const supabase = await createClient();
  const { data } = await supabase.from("organization_settings").select("*").limit(1).maybeSingle();
  return (
    <AdminShell role={user.role!} email={user.email}>
      <div className="flex flex-col gap-4">
        <div><h1 className="text-2xl font-extrabold">Pengaturan Organisasi</h1><p className="text-sm text-stone-600">Identitas, logo, kontak, media sosial, visi-misi — hanya Super Admin.</p></div>
        <Card><CardContent className="p-6"><SettingsEditor initial={(data as unknown as Record<string, unknown>) ?? null} /></CardContent></Card>
      </div>
    </AdminShell>
  );
}
