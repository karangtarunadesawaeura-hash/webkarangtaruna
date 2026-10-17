import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/admin-shell";
import { NewsEditor } from "@/components/admin/editors";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Edit Berita" };

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

export default async function EditBeritaPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(["super_admin", "admin", "editor"]);
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("news").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const article = data as { title: string; slug: string; status: string };
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  const publicHref = article.status === "published" && siteUrl ? `${siteUrl}/berita/${article.slug}` : null;
  return (
    <AdminShell role={user.role!} email={user.email}>
      <div className="flex flex-col gap-5">
        <div>
          <Link href="/berita" className="text-xs font-bold text-forest-700 hover:underline">← Kembali ke daftar berita</Link>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-extrabold">Edit Berita</h1>
            <Badge tone={article.status === "published" ? "green" : "gray"}>{STATUS_LABEL[article.status] ?? article.status}</Badge>
          </div>
          <p className="mt-0.5 text-sm text-stone-600">{article.title}</p>
        </div>
        <NewsEditor id={id} initial={data as unknown as Record<string, unknown>} publicHref={publicHref} />
      </div>
    </AdminShell>
  );
}
