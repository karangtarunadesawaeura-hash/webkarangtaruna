import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/admin-shell";
import { NewsEditor } from "@/components/admin/news-editor";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getSiteUrl } from "@/lib/env";

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
  const publicHref = article.status === "published" ? `${getSiteUrl()}/berita/${article.slug}` : null;

  return (
    <AdminShell role={user.role!} email={user.email}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Link
              href="/admin/berita"
              className="inline-flex items-center gap-1 text-xs font-bold text-forest-700 hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke daftar berita
            </Link>
            {publicHref && (
              <Link
                href={publicHref}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <ExternalLink className="h-3.5 w-3.5" /> Lihat publik
              </Link>
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-forest-950">
                Edit Berita
              </h1>
              <Badge tone={article.status === "published" ? "green" : "gray"}>
                {STATUS_LABEL[article.status] ?? article.status}
              </Badge>
            </div>
            <p className="mt-1 line-clamp-2 max-w-3xl text-sm text-stone-600">
              {article.title}
            </p>
          </div>
        </div>
        <NewsEditor
          id={id}
          initial={data as unknown as Record<string, unknown>}
          publicHref={publicHref}
          siteUrl={getSiteUrl()}
        />
      </div>
    </AdminShell>
  );
}
