import { getSkriningList, getSkriningStats } from "@/features/koas/actions";
import { auth } from "@/auth";
import { DashboardFilters } from "@/features/koas/components/dashboard-filters";
import { PaginationControls } from "@/features/koas/components/pagination-controls";
import { KasusTable, type KasusItem } from "@/features/koas/components/kasus-table";
import { EmptyState } from "@/components/empty-state";
import Link from "next/link";
import { SearchX, Clock, CheckCircle2, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Dashboard Koas | DentMul",
};

export const dynamic = "force-dynamic";

export default async function KoasDashboard({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    kategori?: string;
    status?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const [session, { skrinings, total, totalPages }, stats] = await Promise.all([
    auth(),
    getSkriningList({
      search: params.search,
      kategori: params.kategori,
      status: params.status,
      page,
    }),
    getSkriningStats(),
  ]);

  const hasFilter =
    Boolean(params.search) || Boolean(params.kategori) || Boolean(params.status);

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
  const activeStatus = params.status ?? null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Selamat datang, {firstName} 👋
        </h1>
        <p className="mt-1.5 text-muted-foreground">
          {stats.menunggu > 0
            ? `Ada ${stats.menunggu} pasien menunggu ditinjau hari ini.`
            : "Semua pasien sudah ditangani. Kerja bagus! 🎉"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {/* Perlu Ditinjau — primary emphasis */}
        <Link
          href="/koas/dashboard?status=MENUNGGU"
          className={cn(
            "group relative col-span-2 overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-[#23387e] p-5 text-primary-foreground shadow-md transition-transform hover:-translate-y-0.5 sm:col-span-1",
            activeStatus === "MENUNGGU" && "ring-2 ring-primary ring-offset-2 ring-offset-background"
          )}
        >
          <div
            aria-hidden
            className="absolute -top-8 -right-8 size-28 rounded-full bg-white/10 blur-xl"
          />
          <div className="relative flex items-center justify-between">
            <span className="flex size-11 items-center justify-center rounded-xl bg-white/15">
              <Clock size={22} />
            </span>
            {stats.mendesak > 0 && (
              <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold">
                {stats.mendesak} mendesak
              </span>
            )}
          </div>
          <p className="relative mt-4 text-sm font-medium text-primary-foreground/80">
            Perlu Ditinjau
          </p>
          <p className="relative text-4xl font-bold tabular-nums">{stats.menunggu}</p>
        </Link>

        <StatCard
          href="/koas/dashboard?status=SELESAI"
          label="Selesai"
          value={stats.selesai}
          icon={CheckCircle2}
          iconBg="bg-emerald-500/10"
          iconText="text-emerald-600 dark:text-emerald-400"
          active={activeStatus === "SELESAI"}
        />

        <StatCard
          href="/koas/dashboard"
          label="Total Pasien"
          value={stats.total}
          icon={Users}
          iconBg="bg-primary/10"
          iconText="text-primary"
          active={activeStatus === null && !hasFilter}
        />
      </div>

      <DashboardFilters />

      {items.length === 0 ? (
        hasFilter ? (
          <EmptyState
            icon={SearchX}
            title="Tidak ada hasil"
            description="Tidak ada pasien yang cocok dengan pencarian atau filter Anda. Coba ubah kata kunci atau hapus filter."
          />
        ) : (
          <EmptyState
            title="Belum ada pasien"
            description="Belum ada data skrining pasien yang masuk. Data akan muncul di sini saat pasien mengirim skrining baru."
          />
        )
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">
              Daftar Pasien
            </h2>
            <p className="text-sm text-muted-foreground">
              {items.length} dari {total}
            </p>
          </div>
          <KasusTable items={items} />
          {totalPages > 1 && (
            <PaginationControls page={page} totalPages={totalPages} />
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
  href: string;
  label: string;
  value: number;
  icon: typeof Clock;
  iconBg: string;
  iconText: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md",
        active && "border-primary/50 ring-2 ring-primary/30"
      )}
    >
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
    </Link>
  );
}
