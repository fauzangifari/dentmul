import { CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { PainBar } from "@/features/koas/components/pain-indicator";
import {
  buildRingkasan,
  dampakText,
  formatDurasi,
  formatLokasi,
  gejalaLainLabels,
  gigiDalamRegio,
  isAreaOdontogram,
  jenisKeluhanLabels,
  karakterNyeri,
  regioKlinis,
  regioPasienText,
  riwayatPerawatanText,
  tandaBahayaLabels,
  upayaText,
  type AnamnesaData,
  type KeluhanData,
} from "@/features/skrining/anamnesa";
import {
  ONSET_OPTIONS,
  PERKEMBANGAN_OPTIONS,
  SEBARAN_OPTIONS,
  labelOf,
} from "@/features/skrining/constants";
import { Odontogram } from "@/features/skrining/components/odontogram";

type Audience = "klinisi" | "pasien";

function Row({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn("m-0 text-foreground", className)}>{children}</dd>
    </>
  );
}

/** Gambar lokasi keluhan (odontogram) atau teks lokasi untuk area lain. */
function LokasiKeluhan({ k, audience }: { k: KeluhanData; audience: Audience }) {
  if (!isAreaOdontogram(k.area)) {
    return <p className="font-semibold text-foreground">{formatLokasi(k)}</p>;
  }

  const jenisGigi = k.jenisGigi === "SUSU" ? "SUSU" : "DEWASA";
  const regioCodes = k.tidakYakin ? gigiDalamRegio(jenisGigi, k) : undefined;

  let caption: string;
  if (k.tidakYakin) {
    caption = `Pasien tidak yakin giginya; bagian yang dipilih: ${regioPasienText(k)}.`;
  } else if (audience === "klinisi") {
    const regio = regioKlinis(k.gigi);
    caption = `${k.area === "GUSI" ? "Gusi sekitar gigi" : "Gigi"} ${k.gigi.join(", ")}${
      regio ? `, ${regio}` : ""
    }. Dipilih pasien langsung pada gambar.`;
  } else {
    caption = formatLokasi(k);
  }

  return (
    <div className="space-y-2.5">
      <div className="rounded-xl border border-border p-3.5">
        <Odontogram
          jenisGigi={jenisGigi}
          selected={k.tidakYakin ? [] : k.gigi}
          highlighted={regioCodes}
          variant="chart"
          pov={audience}
        />
      </div>
      <p className="text-[13px] text-foreground/80">{caption}</p>
    </div>
  );
}

/**
 * Kartu anamnesa skrining v2. Dipakai koas/dosen (audience "klinisi", dengan
 * ringkasan otomatis & notasi FDI) dan pasien (audience "pasien").
 */
export function KartuAnamnesa({
  data,
  audience = "klinisi",
}: {
  data: AnamnesaData;
  audience?: Audience;
}) {
  const [utama, ...lain] = data.keluhan;
  if (!utama) return null;

  const bahaya = tandaBahayaLabels(data);
  const gejala = gejalaLainLabels(data);
  const durasi = [
    formatDurasi(data.durasiAngka, data.durasiSatuan),
    labelOf(ONSET_OPTIONS, data.onset).toLowerCase(),
    labelOf(PERKEMBANGAN_OPTIONS, data.perkembangan).toLowerCase(),
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-5 text-sm">
      {audience === "klinisi" && (
        <div className="space-y-1.5 rounded-xl bg-muted/60 px-4 py-3.5">
          <span className="text-xs font-semibold tracking-wider text-primary">
            RINGKASAN OTOMATIS
          </span>
          <p className="text-[15px] leading-relaxed text-foreground">
            {buildRingkasan(data)}
          </p>
        </div>
      )}

      {lain.length > 0 && (
        <p className="text-xs font-semibold tracking-wide text-primary uppercase">
          Keluhan utama
        </p>
      )}

      {/* Seperti desain: kolom lokasi & detail bersebelahan, bertumpuk bila sempit. */}
      <div className="flex flex-wrap gap-6">
        <div className="min-w-0 flex-[1_1_380px] space-y-2.5">
          <span className="text-[13px] font-semibold text-foreground/80">
            {audience === "klinisi" && isAreaOdontogram(utama.area)
              ? "Lokasi (notasi FDI)"
              : "Lokasi"}
          </span>
          <LokasiKeluhan k={utama} audience={audience} />
        </div>

        <div className="min-w-0 flex-[1_1_320px] space-y-2.5">
          <span className="text-[13px] font-semibold text-foreground/80">
            Skala nyeri
          </span>
          <PainBar skalaNyeri={data.skalaNyeri} />
          <dl className="mt-2 grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)] gap-x-3.5 gap-y-2.5 text-[13px]">
            <Row label="Jenis keluhan">{jenisKeluhanLabels(utama).join("; ")}</Row>
            <Row label="Sebaran">{labelOf(SEBARAN_OPTIONS, utama.sebaran)}</Row>
            <Row label="Durasi">{durasi || "-"}</Row>
            <Row label="Karakter nyeri">{karakterNyeri(data) || "-"}</Row>
            <Row label="Riwayat perawatan">{riwayatPerawatanText(data)}</Row>
            <Row label="Dampak">{dampakText(data)}</Row>
            <Row label="Upaya">{upayaText(data)}</Row>
            {gejala.length > 0 && <Row label="Gejala lain">{gejala.join("; ")}</Row>}
            <Row
              label="Tanda bahaya"
              className={cn(
                "font-semibold",
                bahaya.length
                  ? "text-destructive"
                  : "text-emerald-700 dark:text-emerald-400"
              )}
            >
              {bahaya.length ? (
                <span className="inline-flex items-start gap-1">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                  {bahaya.join(", ")}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 size={14} /> Semua dijawab tidak
                </span>
              )}
            </Row>
          </dl>
        </div>
      </div>

      <div className="space-y-1.5 border-t border-border pt-4">
        <span className="text-[13px] font-semibold text-foreground/80">
          {audience === "klinisi" ? "Cerita pasien" : "Cerita Anda"}
        </span>
        <p className="leading-relaxed whitespace-pre-wrap text-foreground/80">
          &ldquo;{utama.cerita}&rdquo;
        </p>
      </div>

      {lain.map((k, i) => (
        <div key={i} className="space-y-3 border-t border-border pt-4">
          <p className="text-xs font-semibold tracking-wide text-primary uppercase">
            Keluhan lain #{i + 2}
          </p>
          <div className="flex flex-wrap gap-6">
            <div className="min-w-0 flex-[1_1_380px]">
              <LokasiKeluhan k={k} audience={audience} />
            </div>
            <dl className="grid min-w-0 flex-[1_1_320px] grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)] content-start gap-x-3.5 gap-y-2.5 text-[13px]">
              <Row label="Jenis keluhan">{jenisKeluhanLabels(k).join("; ")}</Row>
              <Row label="Sebaran">{labelOf(SEBARAN_OPTIONS, k.sebaran)}</Row>
              <Row label="Cerita" className="whitespace-pre-wrap">
                &ldquo;{k.cerita}&rdquo;
              </Row>
            </dl>
          </div>
        </div>
      ))}
    </div>
  );
}
