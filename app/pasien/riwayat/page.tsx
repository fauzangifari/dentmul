import { getRiwayatSkrining } from "@/features/skrining/actions";
import { SkriningCard } from "@/features/skrining/components/skrining-card";
import { EmptyState } from "@/components/empty-state";
import { CheckCircle2, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RiwayatPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string }>;
}) {
  const res = await getRiwayatSkrining();
  const skrinings = res.skrinings ?? [];
  const loadFailed = Boolean(res.error);

  // Await the searchParams to extract values correctly in Next 15+
  const params = await searchParams;
  const isSuccess = params?.success === "1";

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Riwayat Skrining</h1>
        <p className="text-muted-foreground mt-2">
          Daftar semua riwayat skrining awal yang pernah Anda kirimkan.
        </p>
      </div>

      {isSuccess && (
        <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 font-medium text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
          <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
          <span>
            Skrining berhasil dikirim! Silakan tunggu koas piket untuk meninjau
            keluhan Anda.
          </span>
        </div>
      )}

      {loadFailed ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-destructive/30 bg-destructive/5 px-4 py-16 text-center">
          <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle size={32} />
          </div>
          <h3 className="mb-2 text-xl font-bold text-foreground">Gagal memuat riwayat</h3>
          <p className="max-w-sm text-muted-foreground">
            Terjadi gangguan saat mengambil data Anda. Silakan muat ulang halaman
            ini beberapa saat lagi.
          </p>
        </div>
      ) : skrinings.length === 0 ? (
        <EmptyState
          title="Belum ada riwayat"
          description="Anda belum pernah melakukan skrining awal. Silakan mulai skrining jika Anda memiliki keluhan pada gigi atau mulut."
          actionLabel="Mulai Skrining"
          actionHref="/pasien/skrining"
        />
      ) : (
        <div className="grid gap-4">
          {skrinings.map((skrining) => (
            <SkriningCard
              key={skrining.id}
              id={skrining.id}
              keluhanUtama={skrining.keluhanUtama}
              createdAt={skrining.createdAt}
              status={skrining.status}
            />
          ))}
        </div>
      )}
    </div>
  );
}
