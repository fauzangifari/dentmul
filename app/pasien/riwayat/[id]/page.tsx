import { getSkriningDetail } from "@/features/skrining/actions";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/features/skrining/components/status-badge";
import { PhotoLightbox } from "@/features/skrining/components/photo-lightbox";
import { ChevronLeft, Calendar, User, MessageCircle, FileText } from "lucide-react";
import Link from "next/link";
import { toWhatsappLink } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DetailSkriningPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await getSkriningDetail(id);

  if (res.error || !res.skrining) {
    notFound();
  }

  const { skrining } = res;
  const dateFormatted = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(skrining.createdAt));

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header & Back button */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/pasien/riwayat"
          className="p-2 bg-card border border-border rounded-xl hover:bg-accent hover:text-primary transition-colors"
        >
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Detail Skrining</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
            <Calendar size={14} /> {dateFormatted}
          </p>
        </div>
      </div>

      <div className="bg-card p-6 md:p-8 rounded-2xl border border-border/50 shadow-sm space-y-8">
        
        {/* Status Area */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-border/50">
          <div>
            <h2 className="text-sm font-medium text-muted-foreground mb-1">Status Skrining</h2>
            <StatusBadge status={skrining.status} className="text-sm px-3 py-1" />
          </div>
          {skrining.status === "MENUNGGU" && (
            <p className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
              Data Anda sedang menunggu antrean untuk ditinjau oleh Koas.
            </p>
          )}
        </div>

        {/* Section Keluhan */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-primary flex items-center gap-2">
            <MessageCircle size={20} /> Data Keluhan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-background p-4 rounded-xl border border-border">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Keluhan Utama</p>
              <p className="font-medium text-foreground">{skrining.keluhanUtama}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Durasi</p>
              <p className="font-medium text-foreground">{skrining.durasiKeluhan}</p>
            </div>
            {skrining.lokasiSakit && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Lokasi Sakit</p>
                <p className="font-medium text-foreground">{skrining.lokasiSakit}</p>
              </div>
            )}
            {skrining.skalaNyeri && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Skala Nyeri (1-10)</p>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-foreground">{skrining.skalaNyeri}</span>
                  <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-destructive transition-all" 
                      style={{ width: `${(skrining.skalaNyeri / 10) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
            {skrining.keluhanTambahan && (
              <div className="col-span-1 md:col-span-2 mt-2 pt-2 border-t border-border/50">
                <p className="text-sm text-muted-foreground mb-1">Keluhan Tambahan</p>
                <p className="text-foreground">{skrining.keluhanTambahan}</p>
              </div>
            )}
          </div>
        </div>

        {/* Section Riwayat Medis */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-primary flex items-center gap-2">
            <FileText size={20} /> Riwayat Medis
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-background p-4 rounded-xl border border-border">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Penyakit Sistemik</p>
              <p className="text-foreground">{skrining.riwayatPenyakit || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Alergi</p>
              <p className="text-foreground">{skrining.alergiObat || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Obat Rutin</p>
              <p className="text-foreground">{skrining.obatRutin || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Kebiasaan Buruk</p>
              <p className="text-foreground">{skrining.kebiasaanBuruk || "-"}</p>
            </div>
          </div>
        </div>

        {/* Section Foto */}
        {skrining.foto && skrining.foto.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-primary">Foto Dilampirkan</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {skrining.foto.map((f, i) => (
                <PhotoLightbox key={f.id} src={f.url} alt={`Foto Skrining ${i + 1}`} />
              ))}
            </div>
          </div>
        )}

        {/* Section Edukasi dari Koas */}
        <div className="mt-8 pt-8 border-t border-border">
          <h3 className="text-xl font-bold text-foreground mb-4">Hasil & Rekomendasi</h3>
          {skrining.status === "SELESAI" && skrining.edukasi ? (
            <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <User size={100} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                    {skrining.edukasi.koas?.name?.trim().charAt(0).toUpperCase() || "K"}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {skrining.edukasi.koas?.name ?? "Tim Koas DentMul"}
                    </p>
                    <p className="text-xs text-muted-foreground">Koas DentMul · Menanggapi skrining Anda</p>
                  </div>
                </div>
                <div className="prose prose-sm max-w-none text-foreground bg-white/50 p-4 rounded-xl backdrop-blur-sm whitespace-pre-wrap">
                  {skrining.edukasi.konten}
                </div>
                {(() => {
                  const wa = toWhatsappLink(skrining.edukasi.koas?.noTelepon);
                  return wa ? (
                    <div className="mt-4 pt-4 border-t border-primary/20">
                      <p className="text-xs text-muted-foreground mb-2">Butuh konsultasi lanjut?</p>
                      <a
                        href={wa}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-95 transition"
                      >
                        <WhatsappIcon className="size-4" />
                        Chat WhatsApp Koas
                      </a>
                    </div>
                  ) : null;
                })()}
              </div>
            </div>
          ) : (
            <div className="bg-muted/50 p-8 rounded-2xl text-center border border-border/50 border-dashed">
              <User className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <h4 className="font-semibold text-foreground mb-1">Belum Ada Rekomendasi</h4>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Skrining Anda masih dalam proses. Tim koas kami akan memberikan edukasi dan rekomendasi tindakan secepatnya.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function WhatsappIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.892c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652a12.062 12.062 0 0 0 5.71 1.447h.006c6.585 0 11.946-5.335 11.949-11.896 0-3.176-1.24-6.165-3.495-8.411" />
    </svg>
  );
}
