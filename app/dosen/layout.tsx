import { requireUserOrRedirect } from "@/lib/auth-guard";
import { logoutUser } from "@/features/auth/actions";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function DosenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUserOrRedirect("DOSEN");

  return (
    <DashboardShell
      variant="dosen"
      subtitle="Portal Dosen Pembimbing"
      user={{ name: user.name ?? "Dosen", meta: "Dosen Pembimbing" }}
      logoutAction={logoutUser}
    >
      {children}
    </DashboardShell>
  );
}
