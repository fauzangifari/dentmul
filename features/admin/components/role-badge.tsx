import { cn } from "@/lib/utils";
import { ShieldCheck, Stethoscope, User } from "lucide-react";

type RoleConfig = {
  label: string;
  icon: typeof User;
  bgClass: string;
  textClass: string;
};

const ROLE_CONFIG: Record<string, RoleConfig> = {
  ADMIN: {
    label: "Admin",
    icon: ShieldCheck,
    bgClass: "bg-primary/10",
    textClass: "text-primary",
  },
  KOAS: {
    label: "Koas",
    icon: Stethoscope,
    bgClass: "bg-blue-100 dark:bg-blue-500/10",
    textClass: "text-blue-700 dark:text-blue-400",
  },
  PASIEN: {
    label: "Pasien",
    icon: User,
    bgClass: "bg-muted",
    textClass: "text-muted-foreground",
  },
};

export function RoleBadge({ role, className }: { role: string; className?: string }) {
  const config = ROLE_CONFIG[role] ?? {
    label: role,
    icon: User,
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
