import { AlertTriangle, Microscope } from "lucide-react";
import { cn } from "@/lib/utils";

export type PrioritasSkrining = "SEGERA" | "EVALUASI_LESI" | "RUTIN";

const STYLE = {
  SEGERA: {
    label: "Segera",
    long: "Perlu perhatian segera",
    icon: AlertTriangle,
    className: "bg-destructive/10 text-destructive",
  },
  EVALUASI_LESI: {
    label: "Evaluasi lesi",
    long: "Perlu evaluasi lesi",
    icon: Microscope,
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
} as const;

/**
 * Badge prioritas triase skrining. Tidak tampil untuk RUTIN.
 * - size "sm": chip ringkas untuk tabel ("Segera").
 * - size "lg": badge panjang beserta alasan untuk detail kasus.
 */
export function PrioritasBadge({
  prioritas,
  alasan = [],
  size = "sm",
  className,
}: {
  prioritas: PrioritasSkrining | string;
  alasan?: string[];
  size?: "sm" | "lg";
  className?: string;
}) {
  if (prioritas !== "SEGERA" && prioritas !== "EVALUASI_LESI") return null;
  const s = STYLE[prioritas];
  const Icon = s.icon;

  if (size === "sm") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
          s.className,
          className
        )}
      >
        <Icon size={12} /> {s.label}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-start gap-2 rounded-2xl px-3.5 py-2 text-[13px] font-semibold",
        s.className,
        className
      )}
    >
      <Icon size={16} className="mt-px shrink-0" />
      <span>
        {s.long}
        {alasan.length > 0 && ` · ${alasan.join(", ")}`}
      </span>
    </span>
  );
}
