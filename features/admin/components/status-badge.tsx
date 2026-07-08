import { cn } from "@/lib/utils";
import { CheckCircle2, Ban } from "lucide-react";

export function UserStatusBadge({
  isActive,
  className,
}: {
  isActive: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        isActive
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
          : "bg-muted text-muted-foreground",
        className
      )}
    >
      {isActive ? (
        <CheckCircle2 className="size-3.5 shrink-0" aria-hidden />
      ) : (
        <Ban className="size-3.5 shrink-0" aria-hidden />
      )}
      {isActive ? "Aktif" : "Nonaktif"}
    </span>
  );
}
