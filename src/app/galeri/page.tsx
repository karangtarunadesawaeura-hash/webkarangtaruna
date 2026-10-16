import type { Metadata } from "next";
import { createClientSafe } from "@/lib/supabase/server";
import { SectionHeading, EmptyState } from "@/components/ui/state";
import { GalleryClient } from "@/components/gallery/gallery-client";

export const metadata: Metadata = { title: "Galeri" };

export default async function GaleriPage() {
  const supabase = await createClientSafe();
  let albums: {
    id: string; title: string; description: string | null; event_date: string | null;
    cover_image_url: string | null;
    gallery_photos: { id: string; image_url: string; caption: string | null; taken_at: string | null }[];
  }[] = [];

  if (supabase) {
    const { data } = await supabase
      .from("gallery_albums")
      .select("id,title,description,event_date,cover_image_url,gallery_photos(id,image_url,caption,taken_at)")
      .order("created_at", { ascending: false });
    albums = (data as typeof albums) ?? [];
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6">
      <SectionHeading eyebrow="Dokumentasi" title="Galeri Kegiatan" description="Kumpulan foto dokumentasi kegiatan Karang Taruna Desa Waeura. Klik foto untuk memperbesar." />
      {albums.length === 0 ? (
        <EmptyState title="Galeri masih kosong" description="Album dan foto dokumentasi akan ditampilkan di sini setelah diunggah oleh pengurus." />
      ) : (
        <GalleryClient albums={albums} />
      )}
    </div>
  );
}
