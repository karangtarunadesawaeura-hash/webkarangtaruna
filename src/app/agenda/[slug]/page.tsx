import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, ArrowLeft, UserCheck } from "lucide-react";
import { createClientSafe } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatTanggal } from "@/lib/utils";
import { EVENT_STATUS_LABEL } from "@/lib/constants";
import { EventRegistrationForm } from "@/components/forms/event-registration-form";

export const metadata: Metadata = { title: "Detail Kegiatan" };

export default async function AgendaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClientSafe();
  if (!supabase) notFound();
  const { data } = await supabase.from("events").select("*").eq("slug", slug).maybeSingle();
  if (!data) notFound();
  const event = data as {
    id: string; title: string; category: string; description: string | null;
    location: string | null; starts_at: string; ends_at: string | null;
    status: string; registration_open: boolean;
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-12 sm:px-6">
      <Link href="/agenda" className="inline-flex w-fit items-center gap-1 text-sm font-bold text-forest-700 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Kembali ke agenda
      </Link>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <Badge>{event.category}</Badge>
          <Badge tone="gold">{EVENT_STATUS_LABEL[event.status] ?? event.status}</Badge>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{event.title}</h1>
        <p className="flex items-center gap-1.5 text-sm text-stone-600"><CalendarDays className="h-4 w-4" /> {formatTanggal(event.starts_at)}{event.ends_at ? ` — ${formatTanggal(event.ends_at)}` : ""}</p>
        {event.location && <p className="flex items-center gap-1.5 text-sm text-stone-600"><MapPin className="h-4 w-4" /> {event.location}</p>}
      </div>
      {event.description && <p className="whitespace-pre-line text-[15px] leading-relaxed text-stone-800">{event.description}</p>}

      <Card>
        <CardContent className="flex flex-col gap-4 p-6">
          <h2 className="flex items-center gap-2 font-extrabold"><UserCheck className="h-5 w-5 text-forest-700" /> Pendaftaran Peserta</h2>
          {event.registration_open ? (
            <>
              <p className="text-sm text-stone-600">Pendaftaran untuk kegiatan ini sedang dibuka. Isi formulir berikut untuk mendaftar.</p>
              <EventRegistrationForm eventId={event.id} />
            </>
          ) : (
            <p className="text-sm text-stone-600">Pendaftaran untuk kegiatan ini saat ini {event.status === "selesai" ? "sudah ditutup karena kegiatan telah selesai" : "belum dibuka / sudah ditutup"}. Pantau pengumuman terbaru untuk informasi pendaftaran.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
