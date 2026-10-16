"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Images } from "lucide-react";
import { formatTanggal } from "@/lib/utils";

export interface AlbumWithPhotos {
  id: string;
  title: string;
  description: string | null;
  event_date: string | null;
  cover_image_url: string | null;
  gallery_photos: { id: string; image_url: string; caption: string | null; taken_at: string | null }[];
}

export function GalleryClient({ albums }: { albums: AlbumWithPhotos[] }) {
  const [activeAlbum, setActiveAlbum] = useState<AlbumWithPhotos | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-8">
      {albums.length === 0 ? null : (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Pilih album">
          <button
            type="button"
            onClick={() => setActiveAlbum(null)}
            className={`rounded-full px-4 py-2 text-xs font-bold ${!activeAlbum ? "bg-forest-900 text-white" : "bg-forest-50 text-forest-900 hover:bg-forest-100"}`}
          >
            Semua
          </button>
          {albums.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setActiveAlbum(a)}
              aria-pressed={activeAlbum?.id === a.id}
              className={`rounded-full px-4 py-2 text-xs font-bold ${activeAlbum?.id === a.id ? "bg-forest-900 text-white" : "bg-forest-50 text-forest-900 hover:bg-forest-100"}`}
            >
              {a.title}
            </button>
          ))}
        </div>
      )}

      {(activeAlbum ? [activeAlbum] : albums).map((album) => {
        const list = album.gallery_photos;
        const cover = album.cover_image_url ?? list[0]?.image_url ?? null;
        return (
          <section key={album.id} aria-label={`Album ${album.title}`} className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <h2 className="flex items-center gap-2 text-lg font-extrabold">
                <Images className="h-5 w-5 text-forest-700" /> {album.title}
              </h2>
              {album.event_date && <span className="text-xs text-stone-500">{formatTanggal(album.event_date)}</span>}
            </div>
            {album.description && <p className="text-sm text-stone-600">{album.description}</p>}
            {list.length === 0 && !cover ? (
              <p className="rounded-xl bg-forest-50 p-6 text-center text-sm text-stone-500">Belum ada foto pada album ini.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                {(list.length > 0 ? list : cover ? [{ id: album.id, image_url: cover, caption: album.title, taken_at: album.event_date }] : []).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setLightbox(p.image_url)}
                    className="group relative h-44 overflow-hidden rounded-xl bg-forest-100 text-left"
                    aria-label={`Perbesar foto: ${p.caption ?? album.title}`}
                  >
                    <Image src={p.image_url} alt={p.caption ?? album.title} fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover transition-transform group-hover:scale-105" loading="lazy" />
                    {p.caption && (
                      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-xs font-semibold text-white line-clamp-2">{p.caption}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </section>
        );
      })}

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Pratinjau gambar"
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4"
          onClick={() => setLightbox(null)}
          onKeyDown={(e) => e.key === "Escape" && setLightbox(null)}
        >
          <button type="button" aria-label="Tutup pratinjau" className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25" onClick={() => setLightbox(null)}>
            <X className="h-5 w-5" />
          </button>
          <div className="relative h-[80vh] w-full max-w-4xl overflow-hidden rounded-2xl">
            <Image src={lightbox} alt="Pratinjau foto kegiatan" fill sizes="100vw" className="object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
