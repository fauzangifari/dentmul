"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AREA_KE_TITIK,
  AREA_OPTIONS,
  JENIS_KELUHAN_OPTIONS,
  SEBARAN_OPTIONS,
  areaDariTitik,
} from "@/features/skrining/constants";
import { isAreaOdontogram, isAreaWajah } from "@/features/skrining/anamnesa";
import {
  BATAS_JENIS_LAINNYA,
  type SkriningFormInput,
} from "@/features/skrining/schema";
import {
  ChipGroup,
  ChipMultiGroup,
  Question,
  useQuestionId,
} from "@/features/skrining/components/chip-group";
import { OdontogramPicker } from "@/features/skrining/components/odontogram";
import {
  FaceSidePicker,
  SoftTissuePicker,
} from "@/features/skrining/components/area-pickers";
import {
  useFieldRegister,
  useFieldUpdate,
} from "@/features/skrining/components/steps/use-field-update";

type Keluhan = SkriningFormInput["keluhan"][number];

/** Jenis gambar lokasi untuk sebuah area. */
function pickerOf(area: string | undefined) {
  if (!area) return null;
  if (isAreaOdontogram(area)) return "odontogram";
  if (isAreaWajah(area)) return "wajah";
  return "jaringan-lunak";
}

/** Satu entri keluhan pada Langkah 1: jenis, bagian, lokasi, sebaran, cerita. */
export function KeluhanBlock({
  index,
  onRemove,
}: {
  index: number;
  onRemove?: () => void;
}) {
  const { control, formState } = useFormContext<SkriningFormInput>();
  const update = useFieldUpdate();
  const register = useFieldRegister();
  const k = (useWatch({ control, name: `keluhan.${index}` }) ?? {}) as Partial<Keluhan>;
  const errors = formState.errors.keluhan?.[index];
  const base = `keluhan.${index}` as const;

  const jenisId = useQuestionId("jenis");
  const areaId = useQuestionId("area");
  const sebaranId = useQuestionId("sebaran");
  const ceritaId = useQuestionId("cerita");
  const lainnyaId = useQuestionId("lainnya");

  const set = (field: keyof Keluhan, value: unknown) =>
    update(`${base}.${field}`, value, base);

  const changeArea = (area: Keluhan["area"] | undefined) => {
    if (!area || area === k.area) return;
    // Reset lokasi hanya bila jenis gambarnya berubah (Gigi ↔ Gusi tetap).
    if (pickerOf(area) !== pickerOf(k.area)) {
      update(`${base}.gigi`, []);
      update(`${base}.tidakYakin`, false);
      update(`${base}.regioRahang`, undefined);
      update(`${base}.regioSisi`, undefined);
      update(`${base}.regioSegmen`, undefined);
      update(`${base}.sisiWajah`, undefined);
    }
    // Lidah / langit-langit / dasar mulut langsung menunjuk titiknya.
    update(`${base}.titikJaringanLunak`, AREA_KE_TITIK[area]);
    set("area", area);
  };

  const picker = pickerOf(k.area);

  return (
    <div className="space-y-7">
      {index > 0 && (
        <div className="flex items-center justify-between gap-3 border-t border-border pt-6">
          <h3 className="text-lg font-bold text-foreground">Keluhan lain #{index + 1}</h3>
          {onRemove && (
            <Button type="button" variant="ghost" size="sm" onClick={onRemove} className="text-destructive">
              <Trash2 /> Hapus
            </Button>
          )}
        </div>
      )}

      <Question
        label="Apa yang Anda keluhkan?"
        required
        hint="Boleh pilih lebih dari satu."
        labelId={jenisId}
        error={errors?.jenis?.message}
      >
        <ChipMultiGroup
          labelledBy={jenisId}
          options={JENIS_KELUHAN_OPTIONS}
          value={k.jenis}
          onChange={(v) => set("jenis", v)}
          invalid={Boolean(errors?.jenis)}
        />
        {k.jenis?.includes("LAINNYA") && (
          <div className="space-y-1.5">
            <label htmlFor={lainnyaId} className="text-sm text-muted-foreground">
              Sebutkan keluhan lainnya
            </label>
            <Input
              id={lainnyaId}
              placeholder="Contoh: rahang berbunyi saat membuka mulut"
              {...register(`${base}.jenisLainnya`)}
              // Batasi di input: kolom ini tersembunyi saat "Lainnya" dibatalkan,
              // jadi isian kepanjangan tidak boleh sampai jadi error tak terlihat.
              maxLength={BATAS_JENIS_LAINNYA}
              aria-invalid={Boolean(errors?.jenisLainnya)}
              className="h-11 text-base"
            />
            {errors?.jenisLainnya && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {errors.jenisLainnya.message}
              </p>
            )}
          </div>
        )}
      </Question>

      <Question
        label="Di bagian mana keluhannya?"
        required
        labelId={areaId}
        error={errors?.area?.message}
      >
        <ChipGroup
          labelledBy={areaId}
          options={AREA_OPTIONS}
          value={k.area}
          onChange={changeArea}
          allowDeselect={false}
          layout="grid-3"
          shape="tile"
          invalid={Boolean(errors?.area)}
        />
      </Question>

      {picker === "odontogram" && (
        <OdontogramPicker
          jenisGigi={k.jenisGigi ?? "DEWASA"}
          onJenisGigiChange={(v) => set("jenisGigi", v)}
          gigi={k.gigi ?? []}
          onGigiChange={(v) => set("gigi", v)}
          tidakYakin={Boolean(k.tidakYakin)}
          onTidakYakinChange={(v) => set("tidakYakin", v)}
          regio={{
            regioRahang: k.regioRahang ?? null,
            regioSisi: k.regioSisi ?? null,
            regioSegmen: k.regioSegmen ?? null,
          }}
          onRegioChange={(v) => {
            for (const [field, value] of Object.entries(v)) {
              set(field as keyof Keluhan, value ?? undefined);
            }
          }}
          error={errors?.gigi?.message}
        />
      )}

      {picker === "jaringan-lunak" && (
        <SoftTissuePicker
          value={k.titikJaringanLunak}
          onChange={(v) => {
            // Titik di gambar menentukan bagian mulut (mis. ketuk "Pipi dalam
            // kanan" saat bagian "Lidah" → bagian ikut berganti ke Pipi).
            const area = areaDariTitik(v);
            if (area && area !== k.area) update(`${base}.area`, area);
            set("titikJaringanLunak", v);
          }}
          error={errors?.titikJaringanLunak?.message}
        />
      )}

      {picker === "wajah" && (
        <FaceSidePicker
          area={k.area as "SENDI_RAHANG" | "WAJAH_LEHER"}
          value={k.sisiWajah}
          onChange={(v) => set("sisiWajah", v)}
          error={errors?.sisiWajah?.message}
        />
      )}

      <Question
        label="Apakah keluhan hanya di satu tempat?"
        required
        labelId={sebaranId}
        error={errors?.sebaran?.message}
      >
        <ChipGroup
          labelledBy={sebaranId}
          options={SEBARAN_OPTIONS}
          value={k.sebaran}
          onChange={(v) => set("sebaran", v)}
          allowDeselect={false}
          invalid={Boolean(errors?.sebaran)}
        />
      </Question>

      <Question
        label="Ceritakan keluhan Anda dengan kata-kata sendiri"
        required
        htmlFor={ceritaId}
        error={errors?.cerita?.message}
      >
        <Textarea
          id={ceritaId}
          rows={3}
          placeholder="Contoh: Gigi geraham bawah kanan terasa nyeri berdenyut, terutama pada malam hari, kadang sampai ke telinga."
          {...register(`${base}.cerita`)}
          aria-invalid={Boolean(errors?.cerita)}
          className="min-h-24 text-base"
        />
      </Question>
    </div>
  );
}
