import { requireUserOrRedirect } from "@/lib/auth-guard";
import { logoutUser } from "@/features/auth/actions";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function KoasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUserOrRedirect("KOAS");

  return (
    <DashboardShell
      variant="koas"
      subtitle="Portal Koas Piket"
      user={{ name: user.name ?? "Koas", meta: "Koas Piket" }}
      logoutAction={logoutUser}
    >
      {children}
    </DashboardShell>
  );
}
