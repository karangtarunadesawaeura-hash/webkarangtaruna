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
    icons: [{ src: "/logo.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
