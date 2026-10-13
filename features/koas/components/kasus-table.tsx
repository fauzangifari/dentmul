"use client";

import { useRouter } from "next/navigation";
import { formatDistanceToNowStrict } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { StatusBadge } from "@/features/skrining/components/status-badge";
import { PrioritasBadge } from "@/features/skrining/components/prioritas-badge";
import { PainPill } from "@/features/koas/components/pain-indicator";
import { Badge } from "@/components/ui/badge";
import { calculateAge } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

export type KasusItem = {
  id: string;
  name: string;
  tanggalLahir: Date | null;
  jenisKelamin: "LAKI_LAKI" | "PEREMPUAN" | null;
  keluhanUtama: string;
  createdAt: Date;
  status: string;
  kategori: string | null;
  skalaNyeri: number | null;
  prioritas: "SEGERA" | "EVALUASI_LESI" | "RUTIN";
};

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function genderLabel(g: KasusItem["jenisKelamin"]) {
  if (g === "LAKI_LAKI") return "Laki-laki";
  if (g === "PEREMPUAN") return "Perempuan";
  return "-";
}

// Versi "strict" lebih ringkas ("3 jam yang lalu", tanpa "sekitar").
function timeAgo(date: Date) {
  return formatDistanceToNowStrict(new Date(date), {
    addSuffix: true,
    locale: localeId,
  });
}

function isUrgent(s: KasusItem) {
  return s.status === "MENUNGGU" && s.prioritas === "SEGERA";
}

/** Prioritas triase hanya relevan selama kasus belum selesai. */
function prioritasAktif(s: KasusItem) {
  return s.status === "SELESAI" ? "RUTIN" : s.prioritas;
}

function Identity({ s }: { s: KasusItem }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold",
          isUrgent(s)
            ? "bg-destructive/10 text-destructive"
            : "bg-primary/10 text-primary"
        )}
      >
        {initials(s.name)}
      </div>
      <div className="min-w-0 max-w-[200px]">
        <div className="truncate font-semibold text-foreground">{s.name}</div>
        <div className="text-xs text-muted-foreground">
          {calculateAge(s.tanggalLahir)} thn · {genderLabel(s.jenisKelamin)}
        </div>
      </div>
    </div>
  );
}

/** Chip prioritas triase + kategori (bila koas sudah mengisinya). */
function KeluhanChips({ s, className }: { s: KasusItem; className?: string }) {
  const prioritas = prioritasAktif(s);
  if (prioritas === "RUTIN" && !s.kategori) return null;
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      <PrioritasBadge prioritas={prioritas} />
      {s.kategori && (
        <Badge variant="outline" className="text-[11px]">
          {s.kategori}
        </Badge>
      )}
    </div>
  );
}

export function KasusTable({
  items,
  basePath = "/koas/kasus",
}: {
  items: KasusItem[];
  /** Prefix rute detail kasus. Dosen memakai "/dosen/kasus". */
  basePath?: string;
}) {
  const router = useRouter();

  return (
    <>
      {/* ===== Layar lebar (≥1280px): tabel =====
          Area konten dashboard sempit (sidebar + max-w-5xl), jadi tabel baru
          dipakai di xl. Container overflow-x-auto agar kolom tidak pernah
          terpotong; kolom Keluhan menyerap sisa lebar & memotong teks. */}
      <div className="hidden overflow-x-auto rounded-2xl border border-border bg-card shadow-sm xl:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left">
              <th className="py-3 pr-4 pl-5 text-[11px] font-semibold tracking-wider whitespace-nowrap text-muted-foreground uppercase">
                Pasien
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold tracking-wider whitespace-nowrap text-muted-foreground uppercase">
                Keluhan Utama
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold tracking-wider whitespace-nowrap text-muted-foreground uppercase">
                Nyeri
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold tracking-wider whitespace-nowrap text-muted-foreground uppercase">
                Masuk
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold tracking-wider whitespace-nowrap text-muted-foreground uppercase">
                Status
              </th>
              <th className="w-10 py-3 pr-4" />
            </tr>
          </thead>
          <tbody>
            {items.map((s) => {
              const urgent = isUrgent(s);
              return (
                <tr
                  key={s.id}
                  onClick={() => router.push(`${basePath}/${s.id}`)}
                  className="group cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-accent/50"
                >
                  <td className="relative py-3.5 pr-4 pl-5 whitespace-nowrap">
                    {urgent && (
                      <span className="absolute inset-y-2 left-0 w-1 rounded-full bg-destructive" />
                    )}
                    <Identity s={s} />
                  </td>
                  {/* w-full + max-w-0: kolom mengambil sisa lebar dan teks dipotong (…) */}
                  <td className="w-full max-w-0 px-4 py-3.5">
                    <p className="truncate text-foreground" title={s.keluhanUtama}>
                      {s.keluhanUtama}
                    </p>
                    <KeluhanChips s={s} className="mt-1" />
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <PainPill skalaNyeri={s.skalaNyeri} />
                  </td>
                  <td
                    className={cn(
                      "px-4 py-3.5 whitespace-nowrap",
                      s.status === "MENUNGGU"
                        ? "font-medium text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {timeAgo(s.createdAt)}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="py-3.5 pr-4 text-muted-foreground">
                    <ChevronRight
                      size={18}
                      className="transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ===== Mobile & tablet: kartu (2 kolom di tablet) ===== */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:hidden">
        {items.map((s) => {
          const urgent = isUrgent(s);
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => router.push(`${basePath}/${s.id}`)}
              className={cn(
                "relative block w-full overflow-hidden rounded-2xl border bg-card p-4 text-left shadow-sm transition-all active:scale-[0.99]",
                urgent ? "border-destructive/30" : "border-border"
              )}
            >
              {urgent && (
                <span className="absolute inset-y-0 left-0 w-1 bg-destructive" />
              )}
              <div className="flex items-start justify-between gap-3">
                <Identity s={s} />
                <span className="shrink-0">
                  <StatusBadge status={s.status} />
                </span>
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-foreground">
                {s.keluhanUtama}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <PainPill skalaNyeri={s.skalaNyeri} />
                <KeluhanChips s={s} />
                <span className="ml-auto text-xs text-muted-foreground">
                  {timeAgo(s.createdAt)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}
