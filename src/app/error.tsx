"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 px-4 py-20 text-center">
      <h1 className="text-xl font-bold">Terjadi kendala teknis</h1>
      <p className="text-sm text-stone-600">
        Maaf, halaman tidak dapat dimuat saat ini. Silakan coba lagi. Jika berlanjut,
        hubungi pengurus. (Detail teknis tidak ditampilkan demi keamanan.)
      </p>
      <button
        type="button"
        onClick={reset}
        className="inline-flex h-10 items-center rounded-lg bg-forest-900 px-4 text-sm font-bold text-white hover:bg-forest-800"
      >
        Coba Lagi
      </button>
    </div>
  );
}
