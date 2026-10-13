"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  JENIS_GIGI_OPTIONS,
  REGIO_RAHANG_OPTIONS,
  REGIO_SEGMEN_OPTIONS,
  REGIO_SISI_OPTIONS,
} from "@/features/skrining/constants";
import {
  ODONTOGRAM,
  gigiDalamRegio,
  namaGigi,
  regioGigi,
  regioPasienText,
  type KeluhanData,
} from "@/features/skrining/anamnesa";
import { ChipGroup, useRadioGroup } from "@/features/skrining/components/chip-group";

type JenisGigi = "DEWASA" | "SUSU";
type Regio = Pick<KeluhanData, "regioRahang" | "regioSisi" | "regioSegmen">;
type Sisi = "KANAN" | "KIRI";

/** Ukuran gigi (px) mengikuti bentuk: geraham lebih lebar & pendek. */
function ukuranGigi(code: number) {
  const p = code % 10;
  const susu = code >= 50;
  const w = susu
    ? p >= 4 ? 40 : p === 3 ? 30 : 28
    : p >= 6 ? 44 : p >= 4 ? 34 : p === 3 ? 30 : 28;
  return { width: w, height: p >= 4 ? 46 : 56 };
}

/**
 * Lebar gigi ikut menyusut sebanding ukuran aslinya bila ruang sempit
 * (flex-grow = lebar asli, basis 0), tetapi tidak pernah melebihi ukuran asli.
 */
function gayaGigi(code: number): React.CSSProperties {
  const { width, height } = ukuranGigi(code);
  return { flex: `${width} 1 0px`, minWidth: 0, maxWidth: width, height };
}

/** Lebar asli satu baris gigi + jarak antar-gigi (gap-1) + garis tengah. */
function lebarBaris(codes: readonly number[]) {
  return codes.reduce((total, c) => total + ukuranGigi(c).width, 0) + codes.length * 4 + 18;
}

/** Sisi yang semua giginya berada di satu sisi pasien; null bila campuran/kosong. */
function sisiTunggal(codes: readonly number[] | undefined): Sisi | null {
  if (!codes?.length) return null;
  const sisi = regioGigi(codes[0]).sisi;
  return codes.every((c) => regioGigi(c).sisi === sisi) ? sisi : null;
}

type OdontogramProps = {
  jenisGigi: JenisGigi;
  selected: readonly number[];
  /** Gigi yang ditandai sebagai regio (mode "tidak yakin"). */
  highlighted?: readonly number[];
  onToggle?: (code: number) => void;
  variant?: "picker" | "chart";
  /** Label sisi pada variant "chart": sudut pandang klinisi atau pasien. */
  pov?: "klinisi" | "pasien";
};

/**
 * Gambar odontogram FDI tampak depan (dicerminkan: kiri gambar = kanan pasien).
 * - variant "picker": gigi berbentuk mahkota, bisa diketuk pasien.
 * - variant "chart": kotak kecil bernomor FDI, read-only (koas/dosen).
 */
export function Odontogram({ variant = "picker", ...props }: OdontogramProps) {
  return variant === "chart" ? (
    <OdontogramChart {...props} />
  ) : (
    <OdontogramGambar {...props} />
  );
}

function OdontogramChart({
  jenisGigi,
  selected,
  highlighted,
  pov = "klinisi",
}: Omit<OdontogramProps, "variant">) {
  const map = ODONTOGRAM[jenisGigi];

  const kotak = (code: number) => {
    const isSelected = selected.includes(code);
    const isRegio = !isSelected && Boolean(highlighted?.includes(code));
    return (
      <span
        key={code}
        title={`Gigi ${code}, ${namaGigi(code)}`}
        className={cn(
          "flex h-[26px] w-[22px] items-center justify-center rounded-[5px] border font-mono text-[10.5px]",
          isSelected
            ? "border-primary bg-primary font-bold text-primary-foreground"
            : isRegio
              ? "border-primary bg-primary/15 font-semibold text-primary"
              : "border-input bg-card text-muted-foreground"
        )}
      >
        {code}
      </span>
    );
  };
  const garisTengah = <div aria-hidden className="mx-1 w-0.5 shrink-0 self-stretch bg-input" />;

  return (
    <div className="overflow-x-auto">
      <div className="mx-auto flex w-max flex-col items-center gap-1.5">
        <div className="flex gap-[3px]">
          {map.atasKanan.map(kotak)}
          {garisTengah}
          {map.atasKiri.map(kotak)}
        </div>
        <div aria-hidden className="h-px w-full bg-input" />
        <div className="flex gap-[3px]">
          {map.bawahKanan.map(kotak)}
          {garisTengah}
          {map.bawahKiri.map(kotak)}
        </div>
        <div className="flex w-full justify-between text-[11px] text-muted-foreground">
          <span>{pov === "pasien" ? "Kanan Anda" : "Kanan pasien"}</span>
          <span>{pov === "pasien" ? "Kiri Anda" : "Kiri pasien"}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Odontogram yang bisa diketuk. Di ruang lebar tampil satu lengkung penuh; di
 * ruang sempit (HP) tampil setengah lengkung per sisi dengan tombol pindah
 * sisi, supaya gigi tetap cukup besar untuk diketuk tanpa geser ke samping.
 */
function OdontogramGambar({
  jenisGigi,
  selected,
  highlighted,
  onToggle,
}: Omit<OdontogramProps, "variant" | "pov">) {
  const map = ODONTOGRAM[jenisGigi];
  const [sisiTampil, setSisiTampil] = useState<Sisi>(
    () => sisiTunggal(selected.length ? selected.slice(0, 1) : highlighted) ?? "KANAN"
  );
  // Mode "tidak yakin": pindah ke sisi yang dipilih pasien agar tandanya terlihat.
  const sisiRegio = sisiTunggal(highlighted);
  const [sisiRegioLalu, setSisiRegioLalu] = useState(sisiRegio);
  if (sisiRegio !== sisiRegioLalu) {
    setSisiRegioLalu(sisiRegio);
    if (sisiRegio) setSisiTampil(sisiRegio);
  }
  const kanan = sisiTampil === "KANAN";

  const gigi = (code: number, rahang: "atas" | "bawah") => {
    const isSelected = selected.includes(code);
    const isRegio = !isSelected && Boolean(highlighted?.includes(code));
    const label = `Gigi ${code}, ${namaGigi(code)}`;
    return (
      <button
        key={code}
        type="button"
        title={label}
        aria-label={label}
        aria-pressed={isSelected}
        disabled={!onToggle}
        onClick={() => onToggle?.(code)}
        style={gayaGigi(code)}
        className={cn(
          "border-[1.5px] transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          rahang === "atas"
            ? "rounded-[8px_8px_16px_16px]"
            : "rounded-[16px_16px_8px_8px]",
          isSelected
            ? "border-primary bg-primary"
            : isRegio
              ? "border-primary bg-primary/20"
              : "border-[#b9c3d9] bg-card hover:border-primary/60 hover:bg-accent dark:border-input",
          onToggle ? "cursor-pointer" : "cursor-default"
        )}
      />
    );
  };
  const baris = (codes: readonly number[], rahang: "atas" | "bawah") =>
    codes.map((c) => gigi(c, rahang));
  const garisTengah = <div aria-hidden className="mx-1 h-[60px] w-0.5 shrink-0 bg-input sm:mx-2" />;
  const garisGigitan = (
    <div
      aria-hidden
      className="my-1 h-px w-full bg-[repeating-linear-gradient(90deg,var(--input)_0_6px,transparent_6px_12px)]"
    />
  );

  return (
    <div className="@container">
      {/* Ruang lebar: satu lengkung penuh. */}
      <div
        className="mx-auto hidden flex-col gap-2 py-1 @min-[34rem]:flex"
        style={{ maxWidth: lebarBaris([...map.atasKanan, ...map.atasKiri]) }}
      >
        <div className="flex justify-between text-xs font-semibold text-primary">
          <span>Kanan Anda</span>
          <span className="font-medium text-muted-foreground">Rahang atas</span>
          <span>Kiri Anda</span>
        </div>
        <div className="flex items-end justify-center gap-1">
          {baris(map.atasKanan, "atas")}
          {garisTengah}
          {baris(map.atasKiri, "atas")}
        </div>
        {garisGigitan}
        <div className="flex items-start justify-center gap-1">
          {baris(map.bawahKanan, "bawah")}
          {garisTengah}
          {baris(map.bawahKiri, "bawah")}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Geraham</span>
          <span>Rahang bawah · gigi depan di tengah</span>
          <span>Geraham</span>
        </div>
      </div>

      {/* Ruang sempit (HP): setengah lengkung, satu sisi per tampilan. */}
      <div className="space-y-3 @min-[34rem]:hidden">
        <PilihSisi
          value={sisiTampil}
          onChange={setSisiTampil}
          selected={selected}
          highlighted={highlighted}
        />
        <div
          className="mx-auto flex flex-col gap-2 py-1"
          style={{ maxWidth: lebarBaris(map.atasKanan) }}
        >
          <p className="text-center text-xs text-muted-foreground">Rahang atas</p>
          <div className="flex items-end justify-center gap-1">
            {kanan ? baris(map.atasKanan, "atas") : garisTengah}
            {kanan ? garisTengah : baris(map.atasKiri, "atas")}
          </div>
          {garisGigitan}
          <div className="flex items-start justify-center gap-1">
            {kanan ? baris(map.bawahKanan, "bawah") : garisTengah}
            {kanan ? garisTengah : baris(map.bawahKiri, "bawah")}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{kanan ? "Geraham" : "Gigi depan"}</span>
            <span>Rahang bawah</span>
            <span>{kanan ? "Gigi depan" : "Geraham"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const SISI: readonly Sisi[] = ["KANAN", "KIRI"];

/** Tombol pindah sisi pada odontogram HP, dengan jumlah gigi terpilih per sisi. */
function PilihSisi({
  value,
  onChange,
  selected,
  highlighted,
}: {
  value: Sisi;
  onChange: (v: Sisi) => void;
  selected: readonly number[];
  highlighted?: readonly number[];
}) {
  const radio = useRadioGroup(SISI, value, onChange);
  return (
    <div
      role="radiogroup"
      aria-label="Sisi mulut yang ditampilkan"
      className="grid grid-cols-2 rounded-full bg-muted p-[3px]"
    >
      {SISI.map((s, i) => {
        const active = value === s;
        const jumlah = selected.filter((c) => regioGigi(c).sisi === s).length;
        const ditandai =
          jumlah === 0 && Boolean(highlighted?.some((c) => regioGigi(c).sisi === s));
        return (
          <button
            key={s}
            type="button"
            {...radio(i)}
            onClick={() => onChange(s)}
            className={cn(
              "flex min-h-11 items-center justify-center gap-1.5 rounded-full px-3 text-[13px] font-semibold text-foreground transition-colors",
              active ? "bg-card shadow-sm" : "hover:bg-card/60"
            )}
          >
            {s === "KANAN" ? "Kanan Anda" : "Kiri Anda"}
            {jumlah > 0 && (
              <span className="rounded-full bg-primary px-1.5 text-[11px] leading-[18px] text-primary-foreground">
                {jumlah}
                <span className="sr-only"> gigi dipilih</span>
              </span>
            )}
            {ditandai && (
              <span className="size-2 rounded-full bg-primary">
                <span className="sr-only">(bagian ditandai)</span>
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

const JENIS_GIGI = JENIS_GIGI_OPTIONS.map((o) => o.value);

/** Odontogram interaktif untuk pasien + mode "tidak yakin" (pilih regio). */
export function OdontogramPicker({
  jenisGigi,
  onJenisGigiChange,
  gigi,
  onGigiChange,
  tidakYakin,
  onTidakYakinChange,
  regio,
  onRegioChange,
  error,
}: {
  jenisGigi: JenisGigi;
  onJenisGigiChange: (v: JenisGigi) => void;
  gigi: readonly number[];
  onGigiChange: (v: number[]) => void;
  tidakYakin: boolean;
  onTidakYakinChange: (v: boolean) => void;
  regio: Regio;
  onRegioChange: (v: Partial<Regio>) => void;
  error?: string;
}) {
  const gantiJenisGigi = (v: JenisGigi) => {
    if (v === jenisGigi) return;
    onJenisGigiChange(v);
    onGigiChange([]);
  };
  const radioJenis = useRadioGroup(JENIS_GIGI, jenisGigi, gantiJenisGigi);

  const toggleGigi = (code: number) => {
    if (tidakYakin) {
      // Pilihan gigi lama tersembunyi selama mode "tidak yakin"; ketukan baru
      // memulai pilihan dari gigi ini (bukan men-toggle pilihan tersembunyi).
      onGigiChange([code]);
      onTidakYakinChange(false);
      return;
    }
    onGigiChange(
      gigi.includes(code) ? gigi.filter((c) => c !== code) : [...gigi, code]
    );
  };

  let pickedText: string;
  if (tidakYakin) {
    const regioText = regioPasienText(regio);
    pickedText = regioText
      ? `Bagian dipilih: ${regioText}.`
      : "Pilih minimal satu bagian di bawah ini.";
  } else if (gigi.length) {
    pickedText = `Dipilih: ${gigi.map(namaGigi).join(", ")}.`;
  } else {
    pickedText = "Belum ada gigi yang dipilih. Ketuk gigi pada gambar.";
  }
  const hasPick = tidakYakin || gigi.length > 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <span className="text-[15px] font-semibold text-foreground">
          Ketuk gigi yang dikeluhkan
          <span className="ml-1 text-destructive">*</span>
        </span>
        <div
          role="radiogroup"
          aria-label="Jenis gigi"
          className="flex rounded-full bg-muted p-[3px]"
        >
          {JENIS_GIGI_OPTIONS.map((o, i) => {
            const active = jenisGigi === o.value;
            return (
              <button
                key={o.value}
                type="button"
                {...radioJenis(i)}
                onClick={() => gantiJenisGigi(o.value)}
                className={cn(
                  "min-h-11 rounded-full px-3.5 text-[13px] font-semibold text-foreground transition-colors",
                  active ? "bg-card shadow-sm" : "hover:bg-card/60"
                )}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      </div>

      <div
        className={cn(
          "space-y-3.5 rounded-2xl border bg-background p-4 sm:p-5",
          error ? "border-destructive/60" : "border-border"
        )}
      >
        <p className="rounded-xl bg-amber-50 px-3 py-2.5 text-[13px] leading-relaxed text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
          <strong>Perhatikan sisi kanan dan kiri.</strong> Gambar ini seperti
          melihat mulut orang yang berhadapan dengan Anda, jadi sisi kiri gambar
          adalah sisi kanan Anda.
        </p>

        <Odontogram
          jenisGigi={jenisGigi}
          selected={tidakYakin ? [] : gigi}
          highlighted={tidakYakin ? gigiDalamRegio(jenisGigi, regio) : undefined}
          onToggle={toggleGigi}
        />

        <div
          aria-live="polite"
          className={cn(
            "flex items-start gap-2.5 rounded-xl border bg-card px-3.5 py-3",
            hasPick ? "border-primary/40" : "border-border"
          )}
        >
          <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-primary" />
          <span className="text-sm leading-relaxed text-foreground">{pickedText}</span>
        </div>

        <button
          type="button"
          aria-pressed={tidakYakin}
          onClick={() => onTidakYakinChange(!tidakYakin)}
          className={cn(
            "min-h-11 rounded-xl border-[1.5px] border-dashed px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors",
            tidakYakin
              ? "border-primary bg-accent"
              : "border-primary/40 bg-card hover:bg-accent/50"
          )}
        >
          {tidakYakin
            ? "Kembali memilih gigi pada gambar"
            : "Saya tidak yakin giginya yang mana"}
        </button>

        {tidakYakin && (
          <div className="space-y-3.5 rounded-xl border border-border bg-card p-4">
            <p className="text-sm font-semibold text-foreground">
              Pilih bagian mulutnya saja. Bagian yang cocok akan ditandai pada
              gambar.
            </p>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
              <RegioColumn title="Rahang">
                <ChipGroup
                  ariaLabel="Rahang"
                  options={REGIO_RAHANG_OPTIONS}
                  value={regio.regioRahang}
                  onChange={(v) => onRegioChange({ regioRahang: v ?? null })}
                  layout="stack"
                  shape="tile"
                />
              </RegioColumn>
              <RegioColumn title="Sisi (dari diri Anda)">
                <ChipGroup
                  ariaLabel="Sisi"
                  options={REGIO_SISI_OPTIONS}
                  value={regio.regioSisi}
                  onChange={(v) => onRegioChange({ regioSisi: v ?? null })}
                  layout="stack"
                  shape="tile"
                />
              </RegioColumn>
              <RegioColumn title="Bagian">
                <ChipGroup
                  ariaLabel="Bagian"
                  options={REGIO_SEGMEN_OPTIONS}
                  value={regio.regioSegmen}
                  onChange={(v) => onRegioChange({ regioSegmen: v ?? null })}
                  layout="stack"
                  shape="tile"
                />
              </RegioColumn>
            </div>
          </div>
        )}
      </div>
      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function RegioColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <span className="text-xs text-muted-foreground">{title}</span>
      {children}
    </div>
  );
}
