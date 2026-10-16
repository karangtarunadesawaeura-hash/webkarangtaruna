import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getSiteInfo } from "@/lib/data";
import { getSiteUrl } from "@/lib/env";

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getSiteUrl();
  const { name, tagline, description } = await getSiteInfo();
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${name} — ${tagline}`,
      template: `%s | ${name}`,
    },
    description,
    keywords: [
      "Karang Taruna",
      "Desa Waeura",
      "pemuda desa",
      "kegiatan pemuda",
      "program kerja",
      "organisasi kepemudaan",
    ],
    authors: [{ name }],
    icons: {
      icon: "/logo.svg",
      apple: "/logo.svg",
    },
    openGraph: {
      type: "website",
      locale: "id_ID",
      siteName: name,
      title: name,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description,
    },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#123524",
};

// Situs digerakkan database + sesi cookie: render dinamis per-request
// agar data & tahun footer selalu segar.
export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { name, tagline, settings } = await getSiteInfo();

  return (
    <html lang="id" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-white text-forest-950">
        <a
          href="#konten"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-gold-500 focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-forest-950"
        >
          Lewati ke konten utama
        </a>
        <Header orgName={name} logoUrl={settings?.logo_url} />
        <main id="konten" className="flex flex-1 flex-col">
          {children}
        </main>
        <Footer
          orgName={name}
          tagline={tagline}
          logoUrl={settings?.logo_url}
          address={settings?.address}
          phone={settings?.phone}
          email={settings?.email}
          facebook={settings?.facebook}
          instagram={settings?.instagram}
          youtube={settings?.youtube}
        />
      </body>
    </html>
  );
}
