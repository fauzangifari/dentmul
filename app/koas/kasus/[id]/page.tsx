import { getKasusDetail } from "@/features/koas/actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/features/skrining/components/status-badge";
import { PhotoLightbox } from "@/features/skrining/components/photo-lightbox";
import { KasusActionForm } from "@/features/koas/components/kasus-action-form";
import { PainPill, PainBar } from "@/features/koas/components/pain-indicator";
import { calculateAge } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  User,
  MessageCircle,
  ClipboardList,
  Images,
  Stethoscope,
  AlertTriangle,
  CheckCircle2,
  Star,
} from "lucide-react";

export const metadata = {
  title: "Detail Kasus | DentMul",
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
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

export default async function DetailKasusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const skrining = await getKasusDetail(id);

  if (!skrining) {
    notFound();
  }

  const hasAlergi =
    skrining.alergiObat && skrining.alergiObat.trim().toLowerCase() !== "tidak ada";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/koas/dashboard"
          className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-card"
          aria-label="Kembali ke dashboard"
        >
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Detail Kasus</h1>
          <p className="mt-1 text-muted-foreground">
            Meninjau skrining dan memberikan rekomendasi.
          </p>
        </div>
      </div>

      {/* Strip ringkasan urgensi */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/50 bg-card p-4 shadow-sm">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
          {skrining.user.name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join("")}
        </div>
        <div className="mr-2">
          <p className="font-semibold text-foreground">{skrining.user.name}</p>
          <p className="text-xs text-muted-foreground">
            {calculateAge(skrining.user.tanggalLahir)} Thn •{" "}
            {skrining.user.jenisKelamin === "LAKI_LAKI"
              ? "Laki-laki"
              : skrining.user.jenisKelamin === "PEREMPUAN"
              ? "Perempuan"
              : "-"}
          </p>
        </div>
        <Badge variant="outline">
          Menunggu{" "}
          {formatDistanceToNow(skrining.createdAt, { locale: localeId })}
        </Badge>
        <PainPill skalaNyeri={skrining.skalaNyeri} />
        {hasAlergi && (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle size={12} /> Alergi Obat
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Kolom Kiri */}
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
                value={`${calculateAge(skrining.user.tanggalLahir)} Tahun / ${
                  skrining.user.jenisKelamin === "LAKI_LAKI"
                    ? "Laki-laki"
                    : skrining.user.jenisKelamin === "PEREMPUAN"
                    ? "Perempuan"
                    : "-"
                }`}
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

              {/* Alergi — highlight peringatan */}
              {hasAlergi ? (
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

        {/* Kolom Kanan: Form Aksi */}
        <div className="space-y-6">
          <Card className="rounded-2xl border border-border/50 shadow-sm lg:sticky lg:top-24">
            <CardHeader>
              <SectionHeader icon={Stethoscope} title="Tindakan Koas" />
            </CardHeader>
            <CardContent>
              {skrining.status === "SELESAI" ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                    <span>
                      Anda sudah meninjau dan mengirim edukasi untuk kasus ini.
                    </span>
                  </div>

                  <Field label="Kategori" value={skrining.kasus?.kategori} />
                  <div>
                    <span className="mb-1 block text-xs font-medium text-muted-foreground">
                      Status Potensial
                    </span>
                    {skrining.kasus?.isPotensial ? (
                      <Badge className="gap-1">
                        <Star size={12} /> Pasien Potensial
                      </Badge>
                    ) : (
                      <Badge variant="outline">Bukan Potensial</Badge>
                    )}
                  </div>
                  {skrining.kasus?.catatan && (
                    <div>
                      <span className="mb-1 block text-xs font-medium text-muted-foreground">
                        Catatan Internal
                      </span>
                      <p className="rounded-lg border border-border bg-background p-3 text-sm whitespace-pre-wrap text-foreground">
                        {skrining.kasus.catatan}
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="mb-1 block text-xs font-medium text-muted-foreground">
                      Pesan Edukasi
                    </span>
                    <p className="rounded-lg border border-border bg-background p-3 text-sm font-medium whitespace-pre-wrap text-foreground">
                      {skrining.edukasi?.konten}
                    </p>
                  </div>
                </div>
              ) : (
                <KasusActionForm skriningId={skrining.id} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
