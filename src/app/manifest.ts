import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Karang Taruna Desa Waeura",
    short_name: "KT Waeura",
    description: "Bersatu, Berkarya, Mengabdi untuk Desa.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#123524",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
