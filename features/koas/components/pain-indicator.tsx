import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

function painSeverity(skalaNyeri: number | null) {
  if (skalaNyeri == null) return null;
  if (skalaNyeri >= 7) {
    return {
      bgClass: "bg-destructive/10",
      textClass: "text-destructive",
      barClass: "bg-destructive",
    };
  }
  if (skalaNyeri >= 4) {
    return {
      bgClass: "bg-amber-500/10",
      textClass: "text-amber-600 dark:text-amber-500",
      barClass: "bg-amber-500",
    };
  }
  return {
    bgClass: "bg-emerald-500/10",
    textClass: "text-emerald-600 dark:text-emerald-500",
    barClass: "bg-emerald-500",
  };
}

export function PainPill({
  skalaNyeri,
  className,
}: {
  skalaNyeri: number | null;
  className?: string;
}) {
  const severity = painSeverity(skalaNyeri);
  if (!severity) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground",
          className
        )}
      >
        <Activity size={12} />
        -
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
        severity.bgClass,
        severity.textClass,
        className
      )}
    >
      <Activity size={12} />
      {skalaNyeri}/10
    </span>
  );
}

export function PainBar({ skalaNyeri }: { skalaNyeri: number | null }) {
  const severity = painSeverity(skalaNyeri);
  if (!severity || skalaNyeri == null) {
    return <span className="font-semibold text-foreground">-</span>;
  }

  return (
    <div className="flex items-center gap-3">
      <PainPill skalaNyeri={skalaNyeri} />
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full", severity.barClass)}
          style={{ width: `${(skalaNyeri / 10) * 100}%` }}
        />
      </div>
    </div>
  );
}
