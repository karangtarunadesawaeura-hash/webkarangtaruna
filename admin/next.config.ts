import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Aplikasi ADMIN — dashboard pengurus, render dinamis per-request (sesi cookie).
  turbopack: {
    // Monorepo: kunci root ke folder admin/ agar Turbopack tidak menarik
    // file milik aplikasi public (mis. src/middleware.ts di root).
    root: __dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  experimental: {
    // Upload gambar divalidasi maks 5 MB di server action; default Next 1 MB.
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  images: {
    // Sama seperti public: izinkan gambar dari Supabase Storage.
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
