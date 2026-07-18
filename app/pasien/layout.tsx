import { requireUserOrRedirect } from "@/lib/auth-guard";
import { logoutUser } from "@/features/auth/actions";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function PasienLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUserOrRedirect("PASIEN");

  return (
    <DashboardShell
      variant="pasien"
      subtitle="Portal Pasien"
      user={{ name: user.name ?? "Pasien", meta: user.email ?? "" }}
      logoutAction={logoutUser}
    >
      {children}
    </DashboardShell>
  );
}
