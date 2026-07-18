import { getKasusDetail } from "@/features/koas/actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { KasusActionForm } from "@/features/koas/components/kasus-action-form";
import { MulaiTinjauButton } from "@/features/koas/components/mulai-tinjau-button";
import {
  KasusPatientInfo,
  KasusSummaryStrip,
} from "@/features/skrining/components/kasus-patient-info";
import {
  ArrowLeft,
  User,
  Stethoscope,
  CheckCircle2,
  Hourglass,
  XCircle,
  Star,
} from "lucide-react";

export const metadata = {
  title: "Detail Kasus | DentMul",
};

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

/** Ringkasan tinjauan koas — dipakai di state read-only (menunggu ACC / selesai). */
function TinjauanRingkasan({
  kategori,
  isPotensial,
  catatan,
  konten,
}: {
  kategori?: string;
  isPotensial?: boolean;
  catatan?: string | null;
  konten?: string;
}) {
  return (
    <>
      <Field label="Kategori" value={kategori ?? "-"} />
      <div>
        <span className="mb-1 block text-xs font-medium text-muted-foreground">
          Status Potensial
        </span>
        {isPotensial ? (
          <Badge className="gap-1">
            <Star size={12} /> Pasien Potensial
          </Badge>
        ) : (
          <Badge variant="outline">Bukan Potensial</Badge>
        )}
      </div>
      {catatan && (
        <div>
          <span className="mb-1 block text-xs font-medium text-muted-foreground">
            Catatan Internal
          </span>
          <p className="rounded-lg border border-border bg-background p-3 text-sm whitespace-pre-wrap text-foreground">
            {catatan}
          </p>
        </div>
      )}
      <div>
        <span className="mb-1 block text-xs font-medium text-muted-foreground">
          Pesan Edukasi
        </span>
        <p className="rounded-lg border border-border bg-background p-3 text-sm font-medium whitespace-pre-wrap text-foreground">
          {konten}
        </p>
      </div>
    </>
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

  const isSelesai = skrining.status === "SELESAI";
  const isMenungguAcc = skrining.status === "MENUNGGU_ACC";
  const isMenunggu = skrining.status === "MENUNGGU";
  // Edukasi yang sudah pernah diproses dosen tapi status tidak SELESAI/MENUNGGU_ACC
  // berarti ditolak dan dikembalikan ke koas untuk direvisi.
  const ditolak =
    !isSelesai && !isMenungguAcc && Boolean(skrining.edukasi?.reviewedAt);

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

      <KasusSummaryStrip skrining={skrining} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <KasusPatientInfo skrining={skrining} />

        {/* Kolom Kanan: Aksi koas */}
        <div className="space-y-6">
          <Card className="rounded-2xl border border-border/50 shadow-sm lg:sticky lg:top-24">
            <CardHeader>
              <SectionHeader icon={Stethoscope} title="Tindakan Koas" />
            </CardHeader>
            <CardContent>
              {isSelesai ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                    <span>
                      Edukasi sudah disetujui (ACC) dosen dan terlihat oleh
                      pasien.
                    </span>
                  </div>
                  <TinjauanRingkasan
                    kategori={skrining.kasus?.kategori}
                    isPotensial={skrining.kasus?.isPotensial}
                    catatan={skrining.kasus?.catatan}
                    konten={skrining.edukasi?.konten}
                  />
                </div>
              ) : isMenungguAcc ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-2 rounded-xl border border-violet-200 bg-violet-50 p-4 text-sm text-violet-800 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-400">
                    <Hourglass size={18} className="mt-0.5 shrink-0" />
                    <span>
                      Edukasi sudah dikirim dan sedang menunggu persetujuan
                      (ACC) dosen. Pasien belum dapat melihatnya.
                    </span>
                  </div>
                  <TinjauanRingkasan
                    kategori={skrining.kasus?.kategori}
                    isPotensial={skrining.kasus?.isPotensial}
                    catatan={skrining.kasus?.catatan}
                    konten={skrining.edukasi?.konten}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {ditolak && (
                    <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                      <XCircle size={18} className="mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold">
                          Edukasi ditolak dosen — silakan revisi dan kirim ulang.
                        </p>
                        {skrining.edukasi?.catatanDosen && (
                          <p className="mt-1 whitespace-pre-wrap">
                            Alasan: {skrining.edukasi.catatanDosen}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  {isMenunggu ? (
                    <MulaiTinjauButton skriningId={skrining.id} />
                  ) : (
                    <KasusActionForm skriningId={skrining.id} />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
