import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";

const STATIC_ROUTES = [
  "",
  "/profil",
  "/program",
  "/berita",
  "/agenda",
  "/galeri",
  "/keanggotaan",
  "/transparansi",
  "/kontak",
  "/kebijakan-privasi",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const now = new Date();
  return STATIC_ROUTES.map((r) => ({
    url: `${base}${r || "/"}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: r === "" ? 1 : 0.7,
  }));
}
