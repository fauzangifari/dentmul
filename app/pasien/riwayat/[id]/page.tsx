import { getSkriningDetail } from "@/features/skrining/actions";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/features/skrining/components/status-badge";
import { PhotoLightbox } from "@/features/skrining/components/photo-lightbox";
import { ChevronLeft, Calendar, User, MessageCircle, FileText } from "lucide-react";
import Link from "next/link";

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
          {skrining.edukasi ? (
            <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <User size={100} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                    K
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Tim Koas DentMul</p>
                    <p className="text-xs text-muted-foreground">Menanggapi skrining Anda</p>
                  </div>
                </div>
                <div className="prose prose-sm max-w-none text-foreground bg-white/50 p-4 rounded-xl backdrop-blur-sm whitespace-pre-wrap">
                  {skrining.edukasi.konten}
                </div>
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
