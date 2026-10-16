import { cn } from "@/lib/utils";

const tones: Record<string, string> = {
  green: "bg-forest-100 text-forest-800",
  gold: "bg-gold-300/60 text-forest-950",
  gray: "bg-stone-100 text-stone-700",
  blue: "bg-sky-100 text-sky-800",
  red: "bg-red-100 text-red-800",
};

export function Badge({
  tone = "green",
  className,
  children,
}: {
  tone?: keyof typeof tones;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        tones[tone] ?? tones.green,
        className
      )}
    >
      {children}
    </span>
  );
}
