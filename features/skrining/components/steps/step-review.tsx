"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ONSET_OPTIONS,
  PENGISI_OPTIONS,
  PERKEMBANGAN_OPTIONS,
  SEBARAN_OPTIONS,
  labelOf,
} from "@/features/skrining/constants";
import {
  dampakText,
  formatDurasi,
  formatLokasi,
  gejalaLainLabels,
  jenisKeluhanLabels,
  karakterNyeri,
  riwayatPerawatanText,
  tandaBahayaLabels,
  upayaText,
} from "@/features/skrining/anamnesa";
import {
  SkriningSchema,
  normalisasiSkrining,
  type SkriningFormInput,
} from "@/features/skrining/schema";
import { TandaBahayaAlert } from "@/features/skrining/components/steps/red-flag-checklist";

/** Langkah 5 — Review dan Kirim. */
export function StepReview({
  fotoCount,
  goToStep,
  terkunci = false,
}: {
  fotoCount: number;
  goToStep: (step: number) => void;
  /** Skrining sudah tersimpan: jawaban tak bisa diubah, hanya foto yang bisa diganti. */
  terkunci?: boolean;
}) {
  const ubah = (step: number) => (terkunci ? undefined : () => goToStep(step));
  const { control } = useFormContext<SkriningFormInput>();
  const values = useWatch({ control });
  const parsed = SkriningSchema.safeParse(values);

  if (!parsed.success) {
    return (
      <p className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
        Masih ada isian yang belum lengkap. Silakan periksa kembali langkah
        sebelumnya.
      </p>
    );
  }

  const v = parsed.data;
  const a = normalisasiSkrining(v);
  const bahaya = tandaBahayaLabels(a);
  const mulai = [
    labelOf(ONSET_OPTIONS, a.onset),
    labelOf(PERKEMBANGAN_OPTIONS, a.perkembangan).toLowerCase(),
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-7">
      <div className="space-y-2 border-b border-border pb-5">
        <h2 className="text-xl font-bold text-foreground">Review dan Kirim</h2>
        <p className="text-sm text-muted-foreground">
          Periksa kembali data Anda. Ketuk &ldquo;Ubah&rdquo; bila ada yang perlu
          diperbaiki.
        </p>
      </div>

      {bahaya.length > 0 && <TandaBahayaAlert />}

      <div className="space-y-5">
        <ReviewSection title="Jenis dan Lokasi Keluhan" onEdit={ubah(0)}>
          <ReviewRow label="Diisi oleh" value={labelOf(PENGISI_OPTIONS, v.pengisi)} />
          {a.keluhan.map((k, i) => (
            <div key={i} className="space-y-2 border-t border-border/60 pt-3 first:border-t-0 first:pt-0">
              <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                {i === 0 ? "Keluhan utama" : `Keluhan lain #${i + 1}`}
              </p>
              <ReviewRow label="Jenis" value={jenisKeluhanLabels(k).join(", ")} />
              <ReviewRow label="Lokasi" value={formatLokasi(k)} />
              <ReviewRow label="Sebaran" value={labelOf(SEBARAN_OPTIONS, k.sebaran)} />
              <ReviewRow label="Cerita" value={k.cerita} />
            </div>
          ))}
        </ReviewSection>

        <ReviewSection title="Detail Keluhan" onEdit={ubah(1)}>
          <ReviewRow label="Lama keluhan" value={formatDurasi(a.durasiAngka, a.durasiSatuan)} />
          <ReviewRow label="Mulai & perkembangan" value={mulai} />
          <ReviewRow
            label="Riwayat perawatan"
            value={a.riwayatPerawatan.length ? riwayatPerawatanText(a) : ""}
          />
          <ReviewRow label="Skala nyeri" value={`${a.skalaNyeri} dari 10`} />
          {a.skalaNyeri ? <ReviewRow label="Rasa sakit" value={karakterNyeri(a)} /> : null}
          <ReviewRow label="Dampak" value={a.dampak.length ? dampakText(a) : ""} />
          <ReviewRow label="Upaya" value={a.upaya.length ? upayaText(a) : ""} />
          <ReviewRow
            label="Gejala lain"
            value={
              a.gejalaLain.includes("TIDAK_ADA")
                ? "Tidak ada"
                : gejalaLainLabels(a).join(", ")
            }
          />
          <ReviewRow
            label="Tanda bahaya"
            value={bahaya.length ? `Ya: ${bahaya.join(", ")}` : "Semua dijawab tidak"}
            danger={bahaya.length > 0}
          />
        </ReviewSection>

        <ReviewSection title="Riwayat Medis" onEdit={ubah(2)}>
          <ReviewRow label="Riwayat penyakit" value={v.riwayatPenyakit} />
          <ReviewRow label="Alergi" value={v.alergiObat} />
          <ReviewRow label="Obat rutin" value={v.obatRutin} />
          <ReviewRow label="Kebiasaan" value={v.kebiasaanBuruk} />
        </ReviewSection>

        <ReviewSection title="Foto" onEdit={() => goToStep(3)}>
          <ReviewRow
            label="Foto dilampirkan"
            value={fotoCount > 0 ? `${fotoCount} foto` : ""}
          />
        </ReviewSection>
      </div>

      <div className="rounded-xl bg-accent/50 p-4 text-sm text-foreground">
        <p>
          Dengan mengirimkan form ini, saya menyatakan data yang diisi adalah
          benar dan bersedia data ini digunakan untuk keperluan skrining awal
          teledentistry di RSGM Universitas Mulawarman.
        </p>
      </div>
    </div>
  );
}

function ReviewSection({
  title,
  onEdit,
  children,
}: {
  title: string;
  /** Tanpa `onEdit`, tombol "Ubah" disembunyikan. */
  onEdit?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="mb-3 flex min-h-7 items-center justify-between">
        <h3 className="font-semibold text-primary">{title}</h3>
        {onEdit && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="text-primary"
          >
            <Pencil size={14} className="mr-1" /> Ubah
          </Button>
        )}
      </div>
      <dl className="space-y-2 text-sm">{children}</dl>
    </div>
  );
}

function ReviewRow({
  label,
  value,
  danger,
}: {
  label: string;
  value?: string | null;
  danger?: boolean;
}) {
  const filled = value != null && String(value).trim() !== "";
  return (
    <div className="grid grid-cols-3 gap-2">
      <dt className="font-medium text-muted-foreground">{label}</dt>
      <dd
        className={`col-span-2 ${
          !filled
            ? "text-muted-foreground italic"
            : danger
              ? "font-semibold text-destructive"
              : "font-medium text-foreground"
        }`}
      >
        {filled ? value : "Tidak diisi"}
      </dd>
    </div>
  );
}
