import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Admin — Karang Taruna Desa Waeura",
    template: "%s | Admin Karang Taruna Waeura",
  },
  description: "Dashboard pengurus Karang Taruna Desa Waeura. Khusus pengurus berwenang.",
  // Admin tidak boleh terindeks mesin pencari.
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-white text-forest-950">
        {children}
      </body>
    </html>
  );
}
