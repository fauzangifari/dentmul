import { Clock, Eye, Hourglass, CheckCircle2, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type SkriningStatus = "MENUNGGU" | "DITINJAU" | "MENUNGGU_ACC" | "SELESAI";

interface StatusBadgeProps {
  status: SkriningStatus | string;
  className?: string;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: typeof Clock; bgClass: string; textClass: string }
> = {
  MENUNGGU: {
    label: "Menunggu",
    icon: Clock,
    bgClass: "bg-amber-100 dark:bg-amber-500/10",
    textClass: "text-amber-700 dark:text-amber-500",
  },
  DITINJAU: {
    label: "Ditinjau",
    icon: Eye,
    bgClass: "bg-blue-100 dark:bg-blue-500/10",
    textClass: "text-blue-700 dark:text-blue-500",
  },
  MENUNGGU_ACC: {
    label: "Menunggu ACC",
    icon: Hourglass,
    bgClass: "bg-violet-100 dark:bg-violet-500/10",
    textClass: "text-violet-700 dark:text-violet-400",
  },
  SELESAI: {
    label: "Selesai",
    icon: CheckCircle2,
    bgClass: "bg-emerald-100 dark:bg-emerald-500/10",
    textClass: "text-emerald-700 dark:text-emerald-500",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    icon: HelpCircle,
    bgClass: "bg-muted",
    textClass: "text-muted-foreground",
  };
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        config.bgClass,
        config.textClass,
        className
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden />
      {config.label}
    </span>
  );
}
