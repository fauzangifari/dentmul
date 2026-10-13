"use client";

import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Plus } from "lucide-react";
import { MAX_KELUHAN, PENGISI_OPTIONS } from "@/features/skrining/constants";
import { keluhanKosong, type SkriningFormInput } from "@/features/skrining/schema";
import {
  ChipGroup,
  Question,
  useQuestionId,
} from "@/features/skrining/components/chip-group";
import { KeluhanBlock } from "@/features/skrining/components/steps/keluhan-block";
import { useFieldUpdate } from "@/features/skrining/components/steps/use-field-update";

/** Langkah 1 — Jenis dan Lokasi Keluhan. */
export function StepLokasi() {
  const { control, formState } = useFormContext<SkriningFormInput>();
  const update = useFieldUpdate();
  const pengisi = useWatch({ control, name: "pengisi" });
  const { fields, append, remove } = useFieldArray({ control, name: "keluhan" });
  const pengisiId = useQuestionId("pengisi");

  return (
    <div className="space-y-7">
      <div className="space-y-3.5 border-b border-border pb-5">
        <h2 className="text-xl font-bold text-foreground">Jenis dan Lokasi Keluhan</h2>
        <p className="rounded-xl bg-accent/60 px-3.5 py-3 text-[13px] leading-relaxed text-accent-foreground">
          Pilih jenis keluhan, lalu tunjukkan letaknya pada gambar. Jika ragu,
          gunakan pilihan &ldquo;Saya tidak yakin&rdquo; dan cukup pilih bagian
          mulutnya.
        </p>
      </div>

      <Question
        label="Siapa yang mengisi formulir ini?"
        required
        labelId={pengisiId}
        error={formState.errors.pengisi?.message}
      >
        <ChipGroup
          labelledBy={pengisiId}
          options={PENGISI_OPTIONS}
          value={pengisi}
          onChange={(v) => update("pengisi", v)}
          allowDeselect={false}
          invalid={Boolean(formState.errors.pengisi)}
        />
      </Question>

      {fields.map((field, index) => (
        <KeluhanBlock
          key={field.id}
          index={index}
          onRemove={index > 0 ? () => remove(index) : undefined}
        />
      ))}

      {fields.length < MAX_KELUHAN && (
        <button
          type="button"
          onClick={() => append(keluhanKosong(), { shouldFocus: false })}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed border-primary/40 bg-card px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-accent/50"
        >
          <Plus size={16} /> Tambah keluhan lain (misalnya sariawan di tempat berbeda)
        </button>
      )}
    </div>
  );
}
