import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  className,
  action,
}: {
  title: string;
  description?: string;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-forest-200 bg-forest-50/60 px-6 py-12 text-center",
        className
      )}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-forest-100 text-forest-700">
        <Inbox className="h-6 w-6" aria-hidden />
      </span>
      <h3 className="text-base font-bold text-forest-950">{title}</h3>
      {description && (
        <p className="max-w-md text-sm text-stone-600">{description}</p>
      )}
      {action}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded-lg bg-forest-100", className)}
    />
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        align === "center" ? "items-center text-center" : "items-start text-left"
      )}
    >
      {eyebrow && (
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">
          {eyebrow}
        </span>
      )}
      <h2 className="max-w-2xl text-2xl font-extrabold tracking-tight text-forest-950 sm:text-3xl">
        {title}
      </h2>
      {description && (
        <p className="max-w-2xl text-sm leading-relaxed text-stone-600 sm:text-base">
          {description}
        </p>
      )}
    </div>
  );
}
