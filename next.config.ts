import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Situs ini digerakkan database + sesi cookie: gunakan render dinamis klasik.
  // (cacheComponents dimatikan agar `cookies()`/auth selalu render per-request.)
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  experimental: {
    // Upload gambar (Pengaturan/Galeri) divalidasi maks 5 MB di server action.
    // Default Next hanya 1 MB, sehingga berkas di atas itu ditolak framework
    // sebelum action berjalan. Naikkan agar 5 MB + overhead multipart muat.
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  images: {
    // Izinkan gambar dari Supabase Storage (URL proyek dinamis) + placeholder legal.
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
