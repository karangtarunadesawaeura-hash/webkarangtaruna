import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CalendarDays, ArrowLeft } from "lucide-react";
import { createClientSafe } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { formatTanggal } from "@/lib/utils";
import { getSiteUrl } from "@/lib/env";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClientSafe();
  if (!supabase) return { title: "Berita" };
  const { data } = await supabase
    .from("news")
    .select("title, summary")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (!data) return { title: "Berita tidak ditemukan" };
  return {
    title: (data as { title: string }).title,
    description: (data as { summary: string | null }).summary ?? undefined,
    openGraph: {
      title: (data as { title: string }).title,
      description: (data as { summary: string | null }).summary ?? undefined,
      url: `${getSiteUrl()}/berita/${slug}`,
    },
  };
}

export default async function BeritaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClientSafe();
  if (!supabase) notFound();
  const { data } = await supabase
    .from("news")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (!data) notFound();
  const article = data as {
    title: string; category: string; summary: string | null; content: string | null;
    cover_image_url: string | null; published_at: string | null; created_at: string;
  };

  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-12 sm:px-6">
      <Link href="/berita" className="inline-flex w-fit items-center gap-1 text-sm font-bold text-forest-700 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Kembali ke daftar berita
      </Link>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
          <Badge tone="gray">{article.category}</Badge>
          <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {formatTanggal(article.published_at ?? article.created_at)}</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-4xl">{article.title}</h1>
        {article.summary && <p className="text-base leading-relaxed text-stone-600">{article.summary}</p>}
      </div>
      {article.cover_image_url && (
        <div className="relative h-64 w-full overflow-hidden rounded-2xl sm:h-96">
          <Image src={article.cover_image_url} alt={article.title} fill sizes="100vw" className="object-cover" priority />
        </div>
      )}
      <div className="prose max-w-none text-[15px] leading-relaxed text-stone-800">
        {(article.content ?? "").split(/\n\n+/).map((p, i) => (
          <p key={i} className="mb-4 whitespace-pre-line">{p}</p>
        ))}
      </div>
    </article>
  );
}
