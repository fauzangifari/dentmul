import { getEdukasiList, getDosenStats } from "@/features/dosen/actions";
import { auth } from "@/auth";
import { DosenFilters } from "@/features/dosen/components/dosen-filters";
import { PaginationControls } from "@/features/koas/components/pagination-controls";
import {
  KasusTable,
  type KasusItem,
} from "@/features/koas/components/kasus-table";
import { EmptyState } from "@/components/empty-state";
import Link from "next/link";
import { SearchX, Hourglass, CheckCircle2, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Dashboard Dosen | DentMul",
};

export const dynamic = "force-dynamic";

export default async function DosenDashboard({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    status?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const [session, list, stats] = await Promise.all([
    auth(),
    getEdukasiList({ search: params.search, status: params.status, page }),
    getDosenStats(),
  ]);

  const { skrinings, total, totalPages, status } = list;
  const hasSearch = Boolean(params.search);
  const isSelesaiView = status === "SELESAI";

  const items: KasusItem[] = skrinings.map((s) => ({
    id: s.id,
    name: s.user.name,
    tanggalLahir: s.user.tanggalLahir,
    jenisKelamin: s.user.jenisKelamin,
    keluhanUtama: s.keluhanUtama,
    createdAt: s.createdAt,
    status: s.status,
    kategori: s.kasus?.kategori ?? null,
    skalaNyeri: s.skalaNyeri,
  }));

  const firstName = session?.user?.name?.split(" ")[0] ?? "";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Selamat datang, {firstName} 👋
        </h1>
        <p className="mt-1.5 text-muted-foreground">
          {stats.menungguAcc > 0
            ? `Ada ${stats.menungguAcc} edukasi menunggu persetujuan (ACC) Anda.`
            : "Tidak ada edukasi yang menunggu ACC. Kerja bagus! 🎉"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {/* Menunggu ACC — primary */}
        <Link
          href="/dosen/dashboard"
          className={cn(
            "group relative col-span-2 overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-[#23387e] p-5 text-primary-foreground shadow-md transition-transform hover:-translate-y-0.5 sm:col-span-1",
            !isSelesaiView &&
              "ring-2 ring-primary ring-offset-2 ring-offset-background"
          )}
        >
          <div
            aria-hidden
            className="absolute -top-8 -right-8 size-28 rounded-full bg-white/10 blur-xl"
          />
          <div className="relative flex items-center justify-between">
            <span className="flex size-11 items-center justify-center rounded-xl bg-white/15">
              <Hourglass size={22} />
            </span>
          </div>
          <p className="relative mt-4 text-sm font-medium text-primary-foreground/80">
            Menunggu ACC
          </p>
          <p className="relative text-4xl font-bold tabular-nums">
            {stats.menungguAcc}
          </p>
        </Link>

        <StatCard
          href="/dosen/dashboard?status=SELESAI"
          label="Disetujui"
          value={stats.disetujui}
          icon={CheckCircle2}
          iconBg="bg-emerald-500/10"
          iconText="text-emerald-600 dark:text-emerald-400"
          active={isSelesaiView}
        />

        <StatCard
          label="Total Diproses"
          value={stats.total}
          icon={ClipboardList}
          iconBg="bg-primary/10"
          iconText="text-primary"
        />
      </div>

      <DosenFilters />

      {items.length === 0 ? (
        hasSearch ? (
          <EmptyState
            icon={SearchX}
            title="Tidak ada hasil"
            description="Tidak ada pasien yang cocok dengan pencarian Anda. Coba ubah kata kunci atau hapus pencarian."
          />
        ) : isSelesaiView ? (
          <EmptyState
            title="Belum ada yang disetujui"
            description="Edukasi yang sudah Anda atau dosen lain setujui akan muncul di sini."
          />
        ) : (
          <EmptyState
            title="Antrean kosong"
            description="Tidak ada edukasi yang menunggu persetujuan saat ini. Antrean akan terisi saat koas mengirim edukasi baru."
          />
        )
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">
              {isSelesaiView ? "Edukasi Disetujui" : "Antrean Persetujuan"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {items.length} dari {total}
            </p>
          </div>
          <KasusTable items={items} basePath="/dosen/kasus" />
          {totalPages > 1 && (
            <PaginationControls
              page={page}
              totalPages={totalPages}
              basePath="/dosen/dashboard"
            />
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({
  href,
  label,
  value,
  icon: Icon,
  iconBg,
  iconText,
  active,
}: {
  href?: string;
  label: string;
  value: number;
  icon: typeof Hourglass;
  iconBg: string;
  iconText: string;
  active?: boolean;
}) {
  const inner = (
    <>
      <span
        className={cn(
          "flex size-11 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
          iconBg,
          iconText
        )}
      >
        <Icon size={22} />
      </span>
      <p className="mt-4 text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-3xl font-bold tabular-nums text-foreground">{value}</p>
    </>
  );

  if (!href) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        {inner}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "group rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md",
        active && "border-primary/50 ring-2 ring-primary/30"
      )}
    >
      {inner}
    </Link>
  );
}
