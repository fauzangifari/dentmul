import { format, formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/features/skrining/components/status-badge";
import { PhotoLightbox } from "@/features/skrining/components/photo-lightbox";
import { PainPill, PainBar } from "@/features/koas/components/pain-indicator";
import { calculateAge } from "@/lib/utils";
import {
  User,
  MessageCircle,
  ClipboardList,
  Images,
  AlertTriangle,
  Phone,
} from "lucide-react";

/**
 * Data pasien read-only yang ditampilkan di halaman detail kasus.
 * Dipakai bersama oleh area koas (`app/koas/kasus/[id]`) dan dosen
 * (`app/dosen/kasus/[id]`) — keduanya menampilkan informasi pasien yang sama,
 * hanya kolom aksinya yang berbeda (form tinjauan vs panel ACC).
 */
export type KasusPatientData = {
  status: string;
  createdAt: Date;
  keluhanUtama: string;
  keluhanTambahan: string | null;
  durasiKeluhan: string;
  lokasiSakit: string | null;
  skalaNyeri: number | null;
  riwayatPenyakit: string | null;
  alergiObat: string | null;
  obatRutin: string | null;
  kebiasaanBuruk: string | null;
  user: {
    name: string;
    tanggalLahir: Date | null;
    jenisKelamin: "LAKI_LAKI" | "PEREMPUAN" | null;
    noTelepon: string | null;
  };
  foto: { id: string; url: string }[];
};

function genderLabel(g: KasusPatientData["user"]["jenisKelamin"]) {
  if (g === "LAKI_LAKI") return "Laki-laki";
  if (g === "PEREMPUAN") return "Perempuan";
  return "-";
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function hasAlergiObat(alergiObat: string | null) {
  return Boolean(alergiObat && alergiObat.trim().toLowerCase() !== "tidak ada");
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <span className="mb-1 block text-xs font-medium text-muted-foreground">
        {label}
      </span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: typeof User;
  title: string;
}) {
  return (
    <CardTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
      <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-primary">
        <Icon size={18} />
      </span>
      {title}
    </CardTitle>
  );
}

/** Strip ringkasan identitas + urgensi di atas grid detail. */
export function KasusSummaryStrip({ skrining }: { skrining: KasusPatientData }) {
  const alergi = hasAlergiObat(skrining.alergiObat);
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/50 bg-card p-4 shadow-sm">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
        {initials(skrining.user.name)}
      </div>
      <div className="mr-2">
        <p className="font-semibold text-foreground">{skrining.user.name}</p>
        <p className="text-xs text-muted-foreground">
          {calculateAge(skrining.user.tanggalLahir)} Thn •{" "}
          {genderLabel(skrining.user.jenisKelamin)}
        </p>
      </div>
      <Badge variant="outline">
        Menunggu {formatDistanceToNow(skrining.createdAt, { locale: localeId })}
      </Badge>
      <PainPill skalaNyeri={skrining.skalaNyeri} />
      {alergi && (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle size={12} /> Alergi Obat
        </Badge>
      )}
    </div>
  );
}

/** Kolom kiri: Informasi Pasien, Anamnesa, Riwayat Medis, Galeri Foto. */
export function KasusPatientInfo({ skrining }: { skrining: KasusPatientData }) {
  const alergi = hasAlergiObat(skrining.alergiObat);

  return (
    <div className="space-y-6 lg:col-span-2">
      {/* Informasi Pasien */}
      <Card className="rounded-2xl border border-border/50 shadow-sm">
        <CardHeader className="flex-row items-center justify-between">
          <SectionHeader icon={User} title="Informasi Pasien" />
          <StatusBadge status={skrining.status} />
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <Field label="Nama Lengkap" value={skrining.user.name} />
          <Field
            label="Usia / Kelamin"
            value={`${calculateAge(skrining.user.tanggalLahir)} Tahun / ${genderLabel(
              skrining.user.jenisKelamin
            )}`}
          />
          <Field
            label="Tgl. Lahir"
            value={
              skrining.user.tanggalLahir
                ? format(skrining.user.tanggalLahir, "dd MMMM yyyy", {
                    locale: localeId,
                  })
                : "-"
            }
          />
          <Field
            label="Tgl. Skrining"
            value={format(skrining.createdAt, "dd MMMM yyyy, HH:mm", {
              locale: localeId,
            })}
          />
          <Field
            label="No. Telepon"
            value={
              skrining.user.noTelepon ? (
                <a
                  href={`tel:${skrining.user.noTelepon}`}
                  className="inline-flex items-center gap-1.5 text-primary hover:underline"
                >
                  <Phone size={14} />
                  {skrining.user.noTelepon}
                </a>
              ) : (
                "-"
              )
            }
          />
        </CardContent>
      </Card>

      {/* Anamnesa */}
      <Card className="rounded-2xl border border-border/50 shadow-sm">
        <CardHeader>
          <SectionHeader icon={MessageCircle} title="Anamnesa (Keluhan)" />
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <span className="mb-1 block text-xs font-medium text-muted-foreground">
              Keluhan Utama
            </span>
            <p className="rounded-lg border border-border bg-background p-3 font-medium text-foreground">
              {skrining.keluhanUtama}
            </p>
          </div>
          {skrining.keluhanTambahan && (
            <Field label="Keluhan Tambahan" value={skrining.keluhanTambahan} />
          )}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Field label="Durasi" value={skrining.durasiKeluhan} />
            <Field label="Lokasi Sakit" value={skrining.lokasiSakit || "-"} />
            <div>
              <span className="mb-1 block text-xs font-medium text-muted-foreground">
                Skala Nyeri (1-10)
              </span>
              <PainBar skalaNyeri={skrining.skalaNyeri} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Riwayat Medis */}
      <Card className="rounded-2xl border border-border/50 shadow-sm">
        <CardHeader>
          <SectionHeader icon={ClipboardList} title="Riwayat Medis" />
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <Field
            label="Riwayat Penyakit"
            value={skrining.riwayatPenyakit || "Tidak ada"}
          />
          <Field label="Obat Rutin" value={skrining.obatRutin || "Tidak ada"} />
          <Field
            label="Kebiasaan Buruk"
            value={skrining.kebiasaanBuruk || "Tidak ada"}
          />

          {alergi ? (
            <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
              <AlertTriangle
                size={20}
                className="mt-0.5 shrink-0 text-destructive"
              />
              <div>
                <p className="text-xs font-bold tracking-wide text-destructive uppercase">
                  Perhatian: Alergi Obat
                </p>
                <p className="mt-1 font-semibold text-destructive">
                  {skrining.alergiObat}
                </p>
              </div>
            </div>
          ) : (
            <Field label="Alergi Obat" value="Tidak ada" />
          )}
        </CardContent>
      </Card>

      {/* Galeri Foto */}
      <Card className="rounded-2xl border border-border/50 shadow-sm">
        <CardHeader>
          <SectionHeader icon={Images} title="Galeri Foto" />
        </CardHeader>
        <CardContent>
          {skrining.foto.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Pasien tidak melampirkan foto.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {skrining.foto.map((f, i) => (
                <PhotoLightbox
                  key={f.id}
                  src={f.url}
                  alt={`Foto rongga mulut pasien ${i + 1}`}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
