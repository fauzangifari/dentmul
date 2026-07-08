import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { StatusBadge, type SkriningStatus } from "./status-badge";

interface SkriningCardProps {
  id: string;
  keluhanUtama: string;
  createdAt: Date;
  status: SkriningStatus | string;
}

export function SkriningCard({ id, keluhanUtama, createdAt, status }: SkriningCardProps) {
  const dateFormatted = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(createdAt));

  return (
    <Link
      href={`/pasien/riwayat/${id}`}
      className="group block bg-card rounded-2xl border border-border/50 p-5 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <StatusBadge status={status} />
          <h3 className="font-bold text-lg text-foreground line-clamp-2">
            {keluhanUtama}
          </h3>
          <p className="text-sm text-muted-foreground">{dateFormatted}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-accent text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
          <ChevronRight size={20} />
        </div>
      </div>
    </Link>
  );
}
