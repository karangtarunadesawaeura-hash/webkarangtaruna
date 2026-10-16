import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({
  logoUrl,
  orgName,
  compact = false,
  className,
}: {
  logoUrl?: string | null;
  orgName: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-forest-900 text-gold-400">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={`Logo ${orgName}`}
            fill
            sizes="40px"
            className="object-cover"
          />
        ) : (
          <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden fill="currentColor">
            <path d="M16 2 20.5 10l9 1.5-6.5 6.5 1.5 9L16 22.5 7.5 27l1.5-9L2.5 11.5l9-1.5L16 2Z" />
          </svg>
        )}
      </span>
      {!compact && (
        <span className="flex flex-col leading-tight">
          <span className="text-sm font-extrabold tracking-tight text-forest-950 sm:text-base">
            Karang Taruna
          </span>
          <span className="text-xs font-semibold text-forest-700">
            Desa Waeura
          </span>
        </span>
      )}
    </span>
  );
}
