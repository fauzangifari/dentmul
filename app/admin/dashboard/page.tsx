import { getUserStats } from "@/features/admin/actions";
import Link from "next/link";
import {
  Users,
  ShieldCheck,
  Stethoscope,
  GraduationCap,
  User,
  UserCheck,
  UserX,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Dashboard Admin | DentMul",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const stats = await getUserStats();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Dashboard Admin
        </h1>
        <p className="mt-1.5 text-muted-foreground">
          Kelola akun pengguna DentMul — pasien, koas, dosen, dan admin.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        <StatCard
          label="Total User"
          value={stats.total}
          icon={Users}
          iconBg="bg-primary/10"
          iconText="text-primary"
        />
        <StatCard
          label="Pasien"
          value={stats.pasien}
          icon={User}
          iconBg="bg-muted"
          iconText="text-muted-foreground"
        />
        <StatCard
          label="Koas"
          value={stats.koas}
          icon={Stethoscope}
          iconBg="bg-blue-500/10"
          iconText="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          label="Dosen"
          value={stats.dosen}
          icon={GraduationCap}
          iconBg="bg-violet-500/10"
          iconText="text-violet-600 dark:text-violet-400"
        />
        <StatCard
          label="Admin"
          value={stats.admin}
          icon={ShieldCheck}
          iconBg="bg-primary/10"
          iconText="text-primary"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <StatCard
          label="Akun Aktif"
          value={stats.active}
          icon={UserCheck}
          iconBg="bg-emerald-500/10"
          iconText="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          label="Akun Nonaktif"
          value={stats.inactive}
          icon={UserX}
          iconBg="bg-muted"
          iconText="text-muted-foreground"
        />
      </div>

      <Link
        href="/admin/users"
        className="group flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
      >
        <div className="flex items-center gap-4">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Users size={22} />
          </span>
          <div>
            <p className="font-semibold text-foreground">Kelola User</p>
            <p className="text-sm text-muted-foreground">
              Tambah, edit, reset password, dan aktif/nonaktifkan akun.
            </p>
          </div>
        </div>
        <ArrowRight
          size={20}
          className="text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
        />
      </Link>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconText,
}: {
  label: string;
  value: number;
  icon: typeof Users;
  iconBg: string;
  iconText: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <span
        className={cn(
          "flex size-11 items-center justify-center rounded-xl",
          iconBg,
          iconText
        )}
      >
        <Icon size={22} />
      </span>
      <p className="mt-4 text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-3xl font-bold tabular-nums text-foreground">{value}</p>
    </div>
  );
}
