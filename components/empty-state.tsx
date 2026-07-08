import { FileText, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  icon?: LucideIcon;
}

export function EmptyState({ title, description, actionHref, actionLabel, icon: Icon = FileText }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-card rounded-2xl border border-border border-dashed text-center">
      <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center text-primary mb-6">
        <Icon size={32} />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-6">{description}</p>
      
      {actionHref && actionLabel && (
        <Link href={actionHref} className="inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
