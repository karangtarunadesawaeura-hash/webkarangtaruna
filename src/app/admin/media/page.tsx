import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/admin-shell";
import { MediaLibrary, type MediaItem } from "@/components/admin/media-library";

export const metadata = { title: "Media Upload" };

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|avif)$/i;

export default async function AdminMediaPage() {
  const user = await requireRole(["super_admin", "admin", "editor"]);
  const supabase = await createClient();
  const bucket = supabase.storage.from("public-assets");
  const items: MediaItem[] = [];

  try {
    const { data: root } = await bucket.list("", { limit: 200, sortBy: { column: "name", order: "desc" } });
    const entries = root ?? [];
    const folders = entries.filter((e) => e.id === null || e.metadata === null).map((e) => e.name);
    const rootFiles = entries.filter((e) => e.id !== null && e.metadata !== null);

    const pushFile = (prefix: string, file: (typeof entries)[number]) => {
      const mime = (file.metadata?.mimetype as string | undefined) ?? "";
      if (!mime.startsWith("image/") && !IMAGE_EXT.test(file.name)) return;
      const path = prefix ? `${prefix}/${file.name}` : file.name;
      items.push({
        path,
        url: bucket.getPublicUrl(path).data.publicUrl,
        name: file.name,
        size: Number(file.metadata?.size ?? 0),
        createdAt: file.created_at ?? "",
      });
    };

    rootFiles.forEach((f) => pushFile("", f));
    for (const folder of folders.slice(0, 30)) {
      const { data: files } = await bucket.list(folder, { limit: 1000, sortBy: { column: "created_at", order: "desc" } });
      (files ?? []).forEach((f) => pushFile(folder, f));
    }
  } catch {
    // Tampilkan daftar kosong bila storage tidak dapat dibaca.
  }

  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <AdminShell role={user.role!} email={user.email}>
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">Media Upload</h1>
          <p className="text-sm text-stone-600">
            Semua foto yang pernah diunggah ke penyimpanan. Salin URL untuk dipakai di konten, atau hapus file yang tidak
            terpakai.
          </p>
        </div>
        <MediaLibrary items={items} />
      </div>
    </AdminShell>
  );
}
