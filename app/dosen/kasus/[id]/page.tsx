import { getKasusDetailForDosen } from "@/features/dosen/actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  KasusPatientInfo,
  KasusSummaryStrip,
} from "@/features/skrining/components/kasus-patient-info";
import { ApprovalPanel } from "@/features/dosen/components/approval-panel";
import {
  ArrowLeft,
  User,
  ShieldCheck,
  CheckCircle2,
  Info,
  Star,
} from "lucide-react";

export const metadata = {
  title: "Tinjau Edukasi | DentMul",
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

export default async function DosenKasusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const skrining = await getKasusDetailForDosen(id);

  if (!skrining) {
    notFound();
  }

  const isMenungguAcc = skrining.status === "MENUNGGU_ACC";
  const isSelesai = skrining.status === "SELESAI";
  const edukasi = skrining.edukasi;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dosen/dashboard"
          className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-card"
          aria-label="Kembali ke dashboard"
        >
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tinjau Edukasi</h1>
          <p className="mt-1 text-muted-foreground">
            Periksa tinjauan koas lalu setujui (ACC) atau tolak.
          </p>
        </div>
      </div>

      <KasusSummaryStrip skrining={skrining} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <KasusPatientInfo skrining={skrining} />

        {/* Kolom Kanan: Persetujuan dosen */}
        <div className="space-y-6">
          <Card className="rounded-2xl border border-border/50 shadow-sm lg:sticky lg:top-24">
            <CardHeader>
              <SectionHeader icon={ShieldCheck} title="Persetujuan Edukasi" />
            </CardHeader>
            <CardContent>
              {isMenungguAcc && edukasi ? (
                <ApprovalPanel
                  skriningId={skrining.id}
                  kategori={skrining.kasus?.kategori ?? "-"}
                  isPotensial={skrining.kasus?.isPotensial ?? false}
                  catatan={skrining.kasus?.catatan ?? null}
                  konten={edukasi.konten}
                  koasName={edukasi.koas?.name ?? null}
                />
              ) : isSelesai && edukasi ? (
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                    <span>
                      Edukasi ini sudah disetujui dan terlihat oleh pasien.
                    </span>
                  </div>
                  <Field label="Diajukan oleh" value={edukasi.koas?.name ?? "Koas"} />
                  <Field label="Kategori" value={skrining.kasus?.kategori ?? "-"} />
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
                  <div>
                    <span className="mb-1 block text-xs font-medium text-muted-foreground">
                      Pesan Edukasi
                    </span>
                    <p className="rounded-lg border border-border bg-background p-3 font-medium whitespace-pre-wrap text-foreground">
                      {edukasi.konten}
                    </p>
                  </div>
                  {edukasi.reviewedAt && (
                    <p className="text-xs text-muted-foreground">
                      Disetujui pada{" "}
                      {format(edukasi.reviewedAt, "dd MMMM yyyy, HH:mm", {
                        locale: localeId,
                      })}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-start gap-2 rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                  <Info size={18} className="mt-0.5 shrink-0" />
                  <span>
                    Belum ada edukasi yang perlu ditinjau untuk kasus ini. Kasus
                    ini sedang ditangani koas atau belum dikirim untuk di-ACC.
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
