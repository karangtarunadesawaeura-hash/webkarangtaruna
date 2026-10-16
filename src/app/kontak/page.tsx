import type { Metadata } from "next";
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import { getSiteInfo } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/state";
import { ContactForm } from "@/components/forms/contact-form";

export const metadata: Metadata = { title: "Kontak" };

export default async function KontakPage() {
  const { name, settings } = await getSiteInfo();
  const wa = settings?.whatsapp?.replace(/[^0-9]/g, "");
  const waLink = wa ? `https://wa.me/${wa}?text=${encodeURIComponent(`Halo ${name}, saya ingin bertanya.`)}` : null;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6">
      <SectionHeading eyebrow="Kontak" title="Hubungi Pengurus" description="Sampaikan pertanyaan, usulan kegiatan, atau kerja sama melalui informasi kontak resmi berikut." />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card><CardContent className="flex flex-col gap-3 p-6">
            <h2 className="font-extrabold">Informasi Kontak Resmi</h2>
            {settings?.address ? (
              <p className="flex gap-2 text-sm text-stone-700"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-forest-700" /> {settings.address}</p>
            ) : (
              <p className="text-sm text-stone-500">Alamat sekretariat akan diumumkan oleh pengurus setelah ditetapkan.</p>
            )}
            {settings?.phone && <p className="flex gap-2 text-sm text-stone-700"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-forest-700" /> {settings.phone}</p>}
            {settings?.email && <p className="flex gap-2 text-sm text-stone-700"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-forest-700" /> {settings.email}</p>}
            {waLink ? (
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 w-fit items-center gap-2 rounded-lg bg-[#25D366] px-4 text-sm font-bold text-white hover:brightness-95">
                <MessageCircle className="h-4 w-4" /> Chat WhatsApp
              </a>
            ) : (
              <p className="text-xs text-stone-500">Tautan WhatsApp akan tersedia setelah nomor resmi ditetapkan pengurus.</p>
            )}
            <p className="text-xs text-stone-500">Alamat dan nomor pribadi tidak ditampilkan tanpa persetujuan pemiliknya.</p>
          </CardContent></Card>
        </div>
        <Card className="lg:col-span-3">
          <CardContent className="flex flex-col gap-4 p-6">
            <h2 className="font-extrabold">Formulir Pesan</h2>
            <ContactForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
