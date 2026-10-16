import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/admin-shell";
import { AlbumEditor } from "@/components/admin/editors";
import { PhotoManager } from "@/components/admin/photo-manager";
import { Card, CardContent } from "@/components/ui/card";
export const metadata = { title: "Kelola Album" };
export default async function KelolaAlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(["super_admin", "admin", "editor"]);
  const { id } = await params;
  const supabase = await createClient();
  const { data: album } = await supabase.from("gallery_albums").select("*").eq("id", id).maybeSingle();
  if (!album) notFound();
  const { data: photos } = await supabase.from("gallery_photos").select("id,image_url,caption").eq("album_id", id).order("sort_order");
  return (
    <AdminShell role={user.role!} email={user.email}>
      <div className="flex flex-col gap-4"><h1 className="text-2xl font-extrabold">Kelola Album</h1>
        <Card><CardContent className="p-6"><AlbumEditor id={id} initial={album as unknown as Record<string, unknown>} /></CardContent></Card>
        <Card><CardContent className="p-6"><PhotoManager albumId={id} photos={(photos as { id: string; image_url: string; caption: string | null }[] | null) ?? []} /></CardContent></Card>
      </div>
    </AdminShell>
  );
}
