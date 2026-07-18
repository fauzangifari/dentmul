import { auth } from "@/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { FileText, Clock, CheckCircle, ArrowRight } from "lucide-react";
import { StatusBadge } from "@/features/skrining/components/status-badge";
import { cn } from "@/lib/utils";

export default async function PasienDashboard() {
  const session = await auth();

  // Fetch stats and recent activity
  const [totalSkrining, menungguSkrining, selesaiSkrining, recentSkrinings] =
    await Promise.all([
      db.skrining.count({ where: { userId: session?.user?.id } }),
      db.skrining.count({
        where: {
          userId: session?.user?.id,
          status: { in: ["MENUNGGU", "DITINJAU", "MENUNGGU_ACC"] },
        },
      }),
      db.skrining.count({
        where: { userId: session?.user?.id, status: "SELESAI" },
      }),
      db.skrining.findMany({
        where: { userId: session?.user?.id },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
    ]);

  const firstName = session?.user?.name?.split(" ")[0];

  const stats = [
    {
      label: "Total Skrining",
      value: totalSkrining,
      icon: FileText,
      iconBg: "bg-primary/10",
      iconText: "text-primary",
    },
    {
      label: "Dalam Proses",
      value: menungguSkrining,
      icon: Clock,
      iconBg: "bg-amber-500/10",
      iconText: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Selesai",
      value: selesaiSkrining,
      icon: CheckCircle,
      iconBg: "bg-emerald-500/10",
      iconText: "text-emerald-600 dark:text-emerald-400",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Halo, {firstName}! 👋
        </h1>
        <p className="mt-1.5 text-muted-foreground">
          Selamat datang di portal skrining teledentistry DentMul.
        </p>
      </div>

      {/* Quick Action hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-[#23387e] p-6 text-primary-foreground shadow-md md:p-8">
        <div
          aria-hidden
          className="absolute -top-10 -right-6 size-40 rounded-full bg-white/10 blur-2xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-16 -left-8 size-40 rounded-full bg-white/5 blur-2xl"
        />
        <div className="relative flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between">
          <div className="max-w-md">
            <h2 className="text-xl font-bold md:text-2xl">Punya keluhan gigi?</h2>
            <p className="mt-2 text-sm text-primary-foreground/80 md:text-base">
              Mulai skrining awal sekarang untuk mendapatkan penanganan lebih
              cepat dari tim koas kami.
            </p>
          </div>
          <Link
            href="/pasien/skrining"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-primary shadow-sm transition-transform hover:-translate-y-0.5 md:w-auto"
          >
            Mulai Skrining
            <ArrowRight
              size={18}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-5"
            >
              <span
                className={cn(
                  "flex size-10 items-center justify-center rounded-xl md:size-11",
                  s.iconBg,
                  s.iconText
                )}
              >
                <Icon className="size-5 md:size-[22px]" />
              </span>
              <p className="mt-3 text-2xl font-bold tabular-nums text-foreground md:text-3xl">
                {s.value}
              </p>
              <p className="text-xs font-medium text-muted-foreground md:text-sm">
                {s.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            Aktivitas Terakhir
          </h2>
          {recentSkrinings.length > 0 && (
            <Link
              href="/pasien/riwayat"
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Lihat Semua <ArrowRight size={16} />
            </Link>
          )}
        </div>

        {recentSkrinings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <FileText size={22} />
            </div>
            <p className="font-medium text-foreground">Belum ada riwayat</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Skrining yang Anda kirim akan muncul di sini.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentSkrinings.map((skrining) => (
              <Link
                key={skrining.id}
                href={`/pasien/riwayat/${skrining.id}`}
                className="group flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-foreground">
                    {skrining.keluhanUtama}
                  </h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {new Intl.DateTimeFormat("id-ID", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(skrining.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <StatusBadge status={skrining.status} />
                  <ArrowRight
                    size={16}
                    className="text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
