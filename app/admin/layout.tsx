import { requireUserOrRedirect } from "@/lib/auth-guard";
import { logoutUser } from "@/features/auth/actions";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUserOrRedirect("ADMIN");

  return (
    <DashboardShell
      variant="admin"
      subtitle="Portal Admin"
      user={{ name: user.name ?? "Admin", meta: user.email ?? "" }}
      logoutAction={logoutUser}
    >
      {children}
    </DashboardShell>
  );
}
