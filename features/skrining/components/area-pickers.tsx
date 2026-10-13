"use client";

import { cn } from "@/lib/utils";
import {
  SISI_WAJAH_OPTIONS,
  TITIK_JARINGAN_LUNAK_OPTIONS,
} from "@/features/skrining/constants";

const titikClass = (selected: boolean, invalid?: boolean) =>
  cn(
    "min-h-11 rounded-xl border-[1.5px] px-2.5 py-2 text-[13px] transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
    selected
      ? "border-primary bg-accent font-semibold text-accent-foreground"
      : cn(
          "bg-card font-medium text-foreground/80 hover:border-primary/50",
          invalid ? "border-destructive/60" : "border-input"
        )
  );

/**
 * Gambar rongga mulut tampak depan dengan 7 titik jaringan lunak yang bisa
 * diketuk. Dicerminkan seperti odontogram: kiri gambar = kanan pasien.
 */
export function SoftTissuePicker({
  value,
  onChange,
  error,
}: {
  value: string | undefined | null;
  onChange: (v: (typeof TITIK_JARINGAN_LUNAK_OPTIONS)[number]["value"]) => void;
  error?: string;
}) {
  return (
    <div className="space-y-3">
      <span className="block text-[15px] font-semibold text-foreground">
        Ketuk area yang dikeluhkan
        <span className="ml-1 text-destructive">*</span>
      </span>
      <div
        className={cn(
          "flex justify-center rounded-2xl border bg-background p-4 sm:p-6",
          error ? "border-destructive/60" : "border-border"
        )}
      >
        <div
          role="group"
          aria-label="Area rongga mulut"
          className="grid w-full max-w-[460px] grid-cols-3 grid-rows-5 gap-2 rounded-[48%_48%_44%_44%/40%_40%_52%_52%] border-2 border-rose-200 bg-rose-50 p-4 sm:p-5 dark:border-rose-400/30 dark:bg-rose-500/10"
        >
          {TITIK_JARINGAN_LUNAK_OPTIONS.map((t) => (
            <button
              key={t.value}
              type="button"
              aria-pressed={value === t.value}
              onClick={() => onChange(t.value)}
              className={cn(t.grid, titikClass(value === t.value, Boolean(error)))}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Sisi kiri gambar adalah sisi kanan Anda.
      </p>
      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Wajah tampak depan dengan sisi kanan/kiri yang bisa diketuk — untuk keluhan
 * sendi rahang atau wajah/leher.
 */
export function FaceSidePicker({
  area,
  value,
  onChange,
  error,
}: {
  area: "SENDI_RAHANG" | "WAJAH_LEHER";
  value: string | undefined | null;
  onChange: (v: (typeof SISI_WAJAH_OPTIONS)[number]["value"]) => void;
  error?: string;
}) {
  const kanan = value === "KANAN" || value === "KEDUA";
  const kiri = value === "KIRI" || value === "KEDUA";
  const half = (selected: boolean) =>
    cn(
      "relative flex min-h-11 flex-1 flex-col items-center justify-center pt-6 text-xs transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
      selected
        ? "bg-primary/15 font-semibold text-accent-foreground"
        : "font-medium text-foreground/70 hover:bg-accent/60"
    );

  return (
    <div className="space-y-3">
      <span className="block text-[15px] font-semibold text-foreground">
        Ketuk sisi yang dikeluhkan
        <span className="ml-1 text-destructive">*</span>
      </span>
      <div
        className={cn(
          "flex flex-col items-center gap-4 rounded-2xl border bg-background p-4 sm:p-6",
          error ? "border-destructive/60" : "border-border"
        )}
      >
        <div className="relative h-56 w-44">
          {/* Telinga */}
          <span aria-hidden className="absolute top-20 -left-3 h-12 w-5 rounded-l-full border-2 border-r-0 border-input bg-card" />
          <span aria-hidden className="absolute top-20 -right-3 h-12 w-5 rounded-r-full border-2 border-l-0 border-input bg-card" />
          <div className="absolute inset-0 flex overflow-hidden rounded-[50%_50%_46%_46%/42%_42%_58%_58%] border-2 border-input bg-card">
            <button
              type="button"
              aria-pressed={kanan}
              aria-label="Sisi kanan Anda"
              onClick={() => onChange("KANAN")}
              className={cn(half(kanan), "border-r border-dashed border-input")}
            >
              Kanan Anda
            </button>
            <button
              type="button"
              aria-pressed={kiri}
              aria-label="Sisi kiri Anda"
              onClick={() => onChange("KIRI")}
              className={half(kiri)}
            >
              Kiri Anda
            </button>
          </div>
          {/* Penanda sendi rahang di depan telinga */}
          {area === "SENDI_RAHANG" && (
            <>
              <span aria-hidden className={cn("pointer-events-none absolute top-[88px] left-2 size-3 rounded-full", kanan ? "bg-primary" : "bg-input")} />
              <span aria-hidden className={cn("pointer-events-none absolute top-[88px] right-2 size-3 rounded-full", kiri ? "bg-primary" : "bg-input")} />
            </>
          )}
          {/* Mata & mulut sebagai penanda orientasi */}
          <span aria-hidden className="pointer-events-none absolute top-16 left-11 h-1.5 w-5 rounded-full bg-input" />
          <span aria-hidden className="pointer-events-none absolute top-16 right-11 h-1.5 w-5 rounded-full bg-input" />
          <span aria-hidden className="pointer-events-none absolute bottom-14 left-1/2 h-2 w-12 -translate-x-1/2 rounded-full bg-rose-200 dark:bg-rose-400/40" />
        </div>
        <p className="text-center text-xs text-muted-foreground">
          Gambar ini menghadap Anda: sisi kiri gambar adalah sisi kanan Anda.
        </p>
        <button
          type="button"
          aria-pressed={value === "KEDUA"}
          onClick={() => onChange("KEDUA")}
          className={titikClass(value === "KEDUA")}
        >
          Kedua sisi
        </button>
      </div>
      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
