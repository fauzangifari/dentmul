"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  RUJUKAN_DARURAT,
  TANDA_BAHAYA,
  YA_TIDAK_OPTIONS,
} from "@/features/skrining/constants";
import type { SkriningFormInput } from "@/features/skrining/schema";
import { useFieldUpdate } from "@/features/skrining/components/steps/use-field-update";
import { useRadioGroup } from "@/features/skrining/components/chip-group";

/** Peringatan untuk pasien bila ada tanda bahaya yang dijawab "Ya". */
export function TandaBahayaAlert({ className }: { className?: string }) {
  return (
    <div
      role="alert"
      className={cn(
        "flex gap-3 rounded-xl bg-destructive px-4 py-3.5 text-white",
        className
      )}
    >
      <AlertTriangle size={22} className="mt-0.5 shrink-0" />
      <div className="space-y-1">
        <p className="text-[15px] font-bold">
          Segera periksakan diri, jangan menunggu hasil skrining
        </p>
        <p className="text-sm leading-relaxed">
          Kondisi yang Anda centang dapat memburuk dengan cepat. Datanglah ke{" "}
          {RUJUKAN_DARURAT}. Anda tetap dapat melanjutkan formulir ini.
        </p>
      </div>
    </div>
  );
}

/** Pemeriksaan tanda bahaya: 7 pertanyaan Ya/Tidak, semuanya wajib. */
export function RedFlagChecklist() {
  const { control, formState } = useFormContext<SkriningFormInput>();
  const update = useFieldUpdate();
  const jawaban = (useWatch({ control, name: "tandaBahaya" }) ?? {}) as Partial<
    Record<string, "YA" | "TIDAK">
  >;
  const errors = formState.errors.tandaBahaya as
    | Partial<Record<string, { message?: string }>>
    | undefined;
  const adaYa = TANDA_BAHAYA.some((t) => jawaban[t.value] === "YA");
  const adaKosong = Boolean(errors) && TANDA_BAHAYA.some((t) => !jawaban[t.value]);

  return (
    <div className="space-y-3.5 rounded-2xl border-[1.5px] border-destructive/30 bg-destructive/[0.03] p-4 sm:p-5">
      <div className="space-y-1">
        <p className="text-[15px] font-bold text-destructive">
          Pemeriksaan tanda bahaya <span>*</span>
        </p>
        <p className="text-[13px] text-muted-foreground">
          Jawab semua pertanyaan berikut. Ini membantu kami mengenali kondisi
          yang perlu ditangani segera.
        </p>
      </div>

      <div>
        {TANDA_BAHAYA.map((t) => (
          <PertanyaanTandaBahaya
            key={t.value}
            label={t.label}
            value={jawaban[t.value]}
            kosong={Boolean(errors?.[t.value]) && !jawaban[t.value]}
            onChange={(v) => update(`tandaBahaya.${t.value}`, v)}
          />
        ))}
      </div>

      {adaKosong && (
        <p role="alert" className="text-sm font-medium text-destructive">
          Jawab semua pertanyaan tanda bahaya.
        </p>
      )}
      {adaYa && <TandaBahayaAlert />}
    </div>
  );
}

const YA_TIDAK = YA_TIDAK_OPTIONS.map((o) => o.value);

/** Satu pertanyaan tanda bahaya dengan pilihan Ya/Tidak (semantik radio). */
function PertanyaanTandaBahaya({
  label,
  value,
  kosong,
  onChange,
}: {
  label: string;
  value: "YA" | "TIDAK" | undefined;
  /** Belum dijawab padahal validasi sudah berjalan. */
  kosong: boolean;
  onChange: (value: "YA" | "TIDAK") => void;
}) {
  const radio = useRadioGroup(YA_TIDAK, value, onChange);
  return (
    <div
      role="radiogroup"
      aria-label={label}
      aria-invalid={kosong || undefined}
      className="flex flex-wrap items-center justify-between gap-2.5 border-t border-destructive/15 py-2.5"
    >
      <span
        className={cn(
          "min-w-0 flex-[1_1_320px] text-sm leading-snug text-foreground",
          kosong && "font-semibold text-destructive"
        )}
      >
        {label}
      </span>
      <div className="flex gap-1.5">
        {YA_TIDAK_OPTIONS.map((o, i) => {
          const active = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              {...radio(i)}
              onClick={() => onChange(o.value)}
              className={cn(
                "min-h-11 min-w-16 rounded-xl border-[1.5px] px-3.5 text-sm font-semibold transition-colors",
                active && o.value === "YA" && "border-destructive bg-destructive text-white",
                active && o.value === "TIDAK" && "border-primary bg-accent text-accent-foreground",
                !active &&
                  cn(
                    "bg-card text-foreground/80 hover:bg-accent/50",
                    kosong ? "border-destructive/60" : "border-input"
                  )
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
