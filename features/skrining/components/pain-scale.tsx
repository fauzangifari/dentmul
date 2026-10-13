"use client";

import { cn } from "@/lib/utils";
import { tingkatNyeri, type TingkatNyeri } from "@/features/skrining/anamnesa";

interface PainScaleProps {
  /** `undefined` = belum dipilih pasien. */
  value: number | undefined;
  onChange: (value: number) => void;
  id?: string;
  invalid?: boolean;
}

// Ambang diambil dari `tingkatNyeri` (sama dengan PainPill koas).
const LEVEL: Record<TingkatNyeri, { label: string; circle: string; text: string }> = {
  BERAT: { label: "Berat", circle: "bg-destructive", text: "text-destructive" },
  SEDANG: { label: "Sedang", circle: "bg-amber-600", text: "text-amber-700 dark:text-amber-400" },
  RINGAN: { label: "Ringan", circle: "bg-emerald-600", text: "text-emerald-700 dark:text-emerald-400" },
  TIDAK_SAKIT: { label: "Tidak sakit", circle: "bg-emerald-600", text: "text-emerald-700 dark:text-emerald-400" },
};

// Tombol yang benar-benar mengubah/menetapkan nilai slider. Tab dkk. diabaikan:
// keyup Tab mendarat di slider saat fokus berpindah dan bukan berarti memilih.
const KEY_PILIH = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"];

export function PainScale({ value, onChange, id, invalid }: PainScaleProps) {
  const chosen = value != null && !Number.isNaN(value);
  const safeValue = chosen ? Math.min(10, Math.max(0, value)) : 0;
  const level = LEVEL[tingkatNyeri(safeValue)];
  const percent = (safeValue / 10) * 100;

  return (
    <div
      className={cn(
        "space-y-3.5 rounded-2xl border bg-background p-5",
        invalid ? "border-destructive/60" : "border-border"
      )}
    >
      <div className="flex items-center justify-center gap-3.5" aria-live="polite">
        <span
          className={cn(
            "flex size-14 items-center justify-center rounded-full font-mono text-2xl font-bold text-white",
            chosen ? level.circle : "bg-muted-foreground/40"
          )}
        >
          {chosen ? safeValue : "?"}
        </span>
        <div className="flex flex-col">
          <span className={cn("text-base font-bold", chosen ? level.text : "text-muted-foreground")}>
            {chosen ? level.label : "Belum dipilih"}
          </span>
          <span className="text-[13px] text-muted-foreground">
            {chosen ? `Skala ${safeValue} dari 10` : "Geser atau ketuk garis di bawah"}
          </span>
        </div>
      </div>

      <input
        id={id}
        type="range"
        min={0}
        max={10}
        step={1}
        value={safeValue}
        onChange={(e) => onChange(Number(e.target.value))}
        // Klik tanpa menggeser / tombol panah di ujung skala tetap dihitung
        // sebagai memilih (nilai 0) walau tidak memicu onChange.
        onPointerUp={(e) => !chosen && onChange(Number(e.currentTarget.value))}
        onKeyUp={(e) =>
          !chosen && KEY_PILIH.includes(e.key) && onChange(Number(e.currentTarget.value))
        }
        aria-label="Skala nyeri, 0 tidak sakit sampai 10 sangat sakit"
        aria-invalid={invalid}
        className={cn(
          "pain-range h-3 w-full cursor-pointer appearance-none rounded-full bg-muted",
          !chosen && "opacity-60"
        )}
        style={{
          background: `linear-gradient(to right, var(--primary) ${percent}%, var(--muted) ${percent}%)`,
        }}
      />

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0 · Tidak sakit</span>
        <span>5 · Sedang</span>
        <span>10 · Sangat sakit</span>
      </div>

      <style>{`
        .pain-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 28px;
          height: 28px;
          border-radius: 9999px;
          background: var(--primary);
          border: 3px solid var(--background);
          box-shadow: 0 1px 4px rgba(0,0,0,0.25);
          cursor: pointer;
        }
        .pain-range::-moz-range-thumb {
          width: 28px;
          height: 28px;
          border-radius: 9999px;
          background: var(--primary);
          border: 3px solid var(--background);
          box-shadow: 0 1px 4px rgba(0,0,0,0.25);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
