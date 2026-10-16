import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 px-4 py-20 text-center">
      <p className="text-6xl font-extrabold text-forest-900">404</p>
      <h1 className="text-xl font-bold">Halaman tidak ditemukan</h1>
      <p className="text-sm text-stone-600">
        Alamat yang Anda tuju tidak tersedia atau telah dipindahkan. Silakan kembali
        ke beranda atau gunakan menu navigasi.
      </p>
      <Link
        href="/"
        className="inline-flex h-10 items-center rounded-lg bg-forest-900 px-4 text-sm font-bold text-white hover:bg-forest-800"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
