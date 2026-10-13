"use client";

import { useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  DAMPAK_EKSKLUSIF,
  DAMPAK_OPTIONS,
  DURASI_SATUAN_OPTIONS,
  GEJALA_LAIN_EKSKLUSIF,
  GEJALA_LAIN_OPTIONS,
  JENIS_NYERI_OPTIONS,
  LAMA_NYERI_PEMICU_OPTIONS,
  ONSET_OPTIONS,
  PEMICU_NYERI_OPTIONS,
  PERKEMBANGAN_OPTIONS,
  POLA_NYERI_OPTIONS,
  RIWAYAT_PERAWATAN_EKSKLUSIF,
  RIWAYAT_PERAWATAN_OPTIONS,
  SEBARAN_OPTIONS,
  UPAYA_EKSKLUSIF,
  UPAYA_OPTIONS,
  WAKTU_NYERI_EKSKLUSIF,
  WAKTU_NYERI_OPTIONS,
  YA_TIDAK_OPTIONS,
} from "@/features/skrining/constants";
import {
  jenisKeluhanLabels,
  lokasiSingkat,
  namaGigi,
} from "@/features/skrining/anamnesa";
import {
  BATAS_KETERANGAN_OBAT,
  KeluhanSchema,
  normalisasiKeluhan,
  type SkriningFormInput,
} from "@/features/skrining/schema";
import {
  ChipGroup,
  ChipMultiGroup,
  Question,
  useQuestionId,
} from "@/features/skrining/components/chip-group";
import { PainScale } from "@/features/skrining/components/pain-scale";
import { RedFlagChecklist } from "@/features/skrining/components/steps/red-flag-checklist";
import {
  useFieldRegister,
  useFieldUpdate,
} from "@/features/skrining/components/steps/use-field-update";

/** Ringkasan keluhan utama, mis. "Gigi sakit atau ngilu · geraham besar pertama bawah kanan · menjalar". */
function useKeluhanUtamaText() {
  const { control } = useFormContext<SkriningFormInput>();
  const keluhan = useWatch({ control, name: "keluhan.0" });
  // Keluhan utama tidak berubah selama di Langkah 2 — cukup dihitung sekali.
  return useMemo(() => {
    const parsed = KeluhanSchema.safeParse(keluhan);
    if (!parsed.success) return "";
    const k = normalisasiKeluhan(parsed.data);
    const lokasi =
      k.gigi.length > 0 ? k.gigi.map(namaGigi).join(", ") : lokasiSingkat(k);
    const sebaran = SEBARAN_OPTIONS.find((o) => o.value === k.sebaran)?.singkat;
    return [jenisKeluhanLabels(k).join(", "), lokasi, sebaran]
      .filter(Boolean)
      .join(" · ");
  }, [keluhan]);
}

/**
 * Field chip/slider yang nilainya dibaca saat render. Field teks (durasi,
 * keterangan obat) memakai `register` sehingga mengetik di sana tidak
 * me-render ulang seluruh langkah.
 */
const WATCHED = [
  "durasiSatuan",
  "onset",
  "perkembangan",
  "riwayatPerawatan",
  "skalaNyeri",
  "jenisNyeri",
  "polaNyeri",
  "pemicuNyeri",
  "lamaNyeriPemicu",
  "waktuNyeri",
  "nyeriBangunTidur",
  "dampak",
  "upaya",
  "gejalaLain",
] as const satisfies readonly (keyof SkriningFormInput)[];

type Watched = Partial<Pick<SkriningFormInput, (typeof WATCHED)[number]>>;

/** Langkah 2 — Detail Keluhan (untuk keluhan utama). */
export function StepDetail({ onEditLokasi }: { onEditLokasi: () => void }) {
  const { control, formState } = useFormContext<SkriningFormInput>();
  const errors = formState.errors;
  const update = useFieldUpdate();
  const register = useFieldRegister();
  const watched = useWatch({ control, name: WATCHED }) as unknown[];
  const v = Object.fromEntries(WATCHED.map((name, i) => [name, watched[i]])) as Watched;
  const keluhanUtama = useKeluhanUtamaText();

  const ids = {
    durasi: useQuestionId("durasi"),
    onset: useQuestionId("onset"),
    perkembangan: useQuestionId("perkembangan"),
    perawatan: useQuestionId("perawatan"),
    nyeri: useQuestionId("nyeri"),
    jenisNyeri: useQuestionId("jenis-nyeri"),
    pola: useQuestionId("pola"),
    pemicu: useQuestionId("pemicu"),
    lama: useQuestionId("lama"),
    waktu: useQuestionId("waktu"),
    bangun: useQuestionId("bangun"),
    dampak: useQuestionId("dampak"),
    upaya: useQuestionId("upaya"),
    obat: useQuestionId("obat"),
    gejala: useQuestionId("gejala"),
  };

  const skalaNyeri = v.skalaNyeri;
  const adaNyeri = typeof skalaNyeri === "number" && skalaNyeri > 0;
  const durasiError = errors.durasiAngka?.message ?? errors.durasiSatuan?.message;

  return (
    <div className="space-y-7">
      <div className="space-y-3.5 border-b border-border pb-5">
        <h2 className="text-xl font-bold text-foreground">Detail Keluhan</h2>
        {keluhanUtama && (
          <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl bg-accent/60 px-3.5 py-3">
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-xs text-accent-foreground">
                Keluhan utama yang sedang Anda jelaskan
              </span>
              <span className="text-sm font-semibold text-foreground">{keluhanUtama}</span>
            </div>
            <button
              type="button"
              onClick={onEditLokasi}
              className="text-[13px] font-semibold text-primary hover:underline"
            >
              Ubah
            </button>
          </div>
        )}
      </div>

      <Question
        label="Sudah berapa lama keluhan ini?"
        required
        htmlFor={ids.durasi}
        error={durasiError}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Input
            id={ids.durasi}
            type="number"
            inputMode="numeric"
            min={1}
            placeholder="0"
            {...register("durasiAngka", { valueAsNumber: true })}
            aria-invalid={Boolean(errors.durasiAngka)}
            className="h-11 w-22 text-base"
          />
          <ChipGroup
            ariaLabel="Satuan waktu"
            options={DURASI_SATUAN_OPTIONS}
            value={v.durasiSatuan}
            onChange={(val) => update("durasiSatuan", val)}
            allowDeselect={false}
            invalid={Boolean(errors.durasiSatuan)}
          />
        </div>
      </Question>

      <div className="grid grid-cols-1 gap-7 md:grid-cols-2 md:gap-6">
        <Question label="Bagaimana keluhan mulai muncul?" labelId={ids.onset}>
          <ChipGroup
            labelledBy={ids.onset}
            options={ONSET_OPTIONS}
            value={v.onset}
            onChange={(val) => update("onset", val)}
          />
        </Question>
        <Question label="Bagaimana perkembangannya?" labelId={ids.perkembangan}>
          <ChipGroup
            labelledBy={ids.perkembangan}
            options={PERKEMBANGAN_OPTIONS}
            value={v.perkembangan}
            onChange={(val) => update("perkembangan", val)}
          />
        </Question>
      </div>

      <Question label="Apakah gigi atau area ini pernah dirawat?" labelId={ids.perawatan}>
        <ChipMultiGroup
          labelledBy={ids.perawatan}
          options={RIWAYAT_PERAWATAN_OPTIONS}
          value={v.riwayatPerawatan}
          onChange={(val) => update("riwayatPerawatan", val)}
          exclusive={RIWAYAT_PERAWATAN_EKSKLUSIF}
        />
      </Question>

      <Question
        label="Seberapa sakit yang Anda rasakan?"
        required
        htmlFor={ids.nyeri}
        error={errors.skalaNyeri?.message}
      >
        <PainScale
          id={ids.nyeri}
          value={skalaNyeri}
          onChange={(val) => update("skalaNyeri", val)}
          invalid={Boolean(errors.skalaNyeri)}
        />
      </Question>

      {adaNyeri && (
        <div className="space-y-6 rounded-2xl border border-border p-4 sm:p-5">
          <span className="text-xs font-semibold tracking-wider text-primary">
            TENTANG RASA SAKITNYA
          </span>
          <Question label="Seperti apa rasa sakitnya?" labelId={ids.jenisNyeri}>
            <ChipGroup
              labelledBy={ids.jenisNyeri}
              options={JENIS_NYERI_OPTIONS}
              value={v.jenisNyeri}
              onChange={(val) => update("jenisNyeri", val)}
            />
          </Question>
          <Question label="Kapan rasa sakit muncul?" labelId={ids.pola}>
            <ChipGroup
              labelledBy={ids.pola}
              options={POLA_NYERI_OPTIONS}
              value={v.polaNyeri}
              onChange={(val) => update("polaNyeri", val)}
            />
          </Question>
          {v.polaNyeri === "DIPICU" && (
            <div className="space-y-5 border-l-[3px] border-primary/20 pl-4">
              <Question label="Apa yang memicu?" labelId={ids.pemicu}>
                <ChipMultiGroup
                  labelledBy={ids.pemicu}
                  options={PEMICU_NYERI_OPTIONS}
                  value={v.pemicuNyeri}
                  onChange={(val) => update("pemicuNyeri", val)}
                />
              </Question>
              <Question
                label="Setelah pemicu hilang, berapa lama sakitnya bertahan?"
                labelId={ids.lama}
              >
                <ChipGroup
                  labelledBy={ids.lama}
                  options={LAMA_NYERI_PEMICU_OPTIONS}
                  value={v.lamaNyeriPemicu}
                  onChange={(val) => update("lamaNyeriPemicu", val)}
                />
              </Question>
            </div>
          )}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Question label="Kapan paling terasa?" labelId={ids.waktu}>
              <ChipMultiGroup
                labelledBy={ids.waktu}
                options={WAKTU_NYERI_OPTIONS}
                value={v.waktuNyeri}
                onChange={(val) => update("waktuNyeri", val)}
                exclusive={WAKTU_NYERI_EKSKLUSIF}
              />
            </Question>
            <Question
              label="Apakah sakitnya membangunkan Anda dari tidur?"
              labelId={ids.bangun}
            >
              <ChipGroup
                labelledBy={ids.bangun}
                options={YA_TIDAK_OPTIONS}
                value={v.nyeriBangunTidur}
                onChange={(val) => update("nyeriBangunTidur", val)}
              />
            </Question>
          </div>
        </div>
      )}

      <Question label="Apakah keluhan mengganggu kegiatan Anda?" labelId={ids.dampak}>
        <ChipMultiGroup
          labelledBy={ids.dampak}
          options={DAMPAK_OPTIONS}
          value={v.dampak}
          onChange={(val) => update("dampak", val)}
          exclusive={DAMPAK_EKSKLUSIF}
        />
      </Question>

      <Question
        label="Apa yang sudah Anda lakukan untuk keluhan ini?"
        labelId={ids.upaya}
        error={errors.keteranganObat?.message}
      >
        <ChipMultiGroup
          labelledBy={ids.upaya}
          options={UPAYA_OPTIONS}
          value={v.upaya}
          onChange={(val) => update("upaya", val)}
          exclusive={UPAYA_EKSKLUSIF}
        />
        {v.upaya?.includes("MINUM_OBAT") && (
          <Input
            id={ids.obat}
            aria-label="Nama obat dan hasilnya"
            placeholder="Nama obat dan hasilnya, mis. Parasetamol 2 kali sehari, sedikit membantu"
            {...register("keteranganObat")}
            // Batasi di input: kolom ini tersembunyi saat "Minum obat" dibatalkan.
            maxLength={BATAS_KETERANGAN_OBAT}
            aria-invalid={Boolean(errors.keteranganObat)}
            className="h-11 text-base"
          />
        )}
      </Question>

      <Question label="Gejala lain yang Anda rasakan" labelId={ids.gejala}>
        <ChipMultiGroup
          labelledBy={ids.gejala}
          options={GEJALA_LAIN_OPTIONS}
          value={v.gejalaLain}
          onChange={(val) => update("gejalaLain", val)}
          exclusive={GEJALA_LAIN_EKSKLUSIF}
        />
      </Question>

      <RedFlagChecklist />
    </div>
  );
}
